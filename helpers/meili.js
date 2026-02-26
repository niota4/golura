// Load environment variables
require('dotenv').config();

const { MeiliSearch } = require('meilisearch');

const meiliClient = new MeiliSearch({
  host: process.env.MEILI_HOST,
  apiKey: process.env.MEILI_API_KEY
});

// Map model keys to MeiliSearch index names
const MODEL_INDEXES = {
  Client: 'clients',
  ClientAddress: 'clientAddresses',
  Address: 'addresses',
  ClientEmail: 'clientEmails',
  ClientNote: 'clientNotes',
  ClientPhoneNumber: 'clientPhoneNumbers',
  EmailAddress: 'emailAddresses',
  Estimate: 'estimates',
  EstimateStatus: 'estimateStatuses',
  Event: 'events',
  EventStatus: 'eventStatuses',
  EventType: 'eventTypes',
  PhoneNumber: 'phoneNumbers',
  Group: 'groups',
  PurchaseOrder: 'purchaseOrders',
  Invoice: 'invoices',
  WorkOrder: 'workOrders',
  WorkOrderStatus: 'workOrderStatuses',
  User: 'users',
  Activity: 'activities',
};

async function bulkReindexAll(models) {
  for (const [modelKey, indexName] of Object.entries(MODEL_INDEXES)) {
    const model = models[modelKey];
    if (!model) continue;
    try {
      let records;
      // Add includes for related models for richer MeiliSearch documents
      if (modelKey === 'Client') {
        records = await model.findAll({
          include: [
            { model: models.ClientAddress, as: 'ClientAddresses' },
            { model: models.ClientEmail, as: 'ClientEmails' },
            { model: models.ClientNote, as: 'ClientNotes' },
            { model: models.ClientPhoneNumber, as: 'ClientPhoneNumbers' },
          ],
          raw: false
        });
        records = records.map(r => r.get({ plain: true }));
      } else if (modelKey === 'Event') {
        records = await model.findAll({
          include: [
            { model: models.EventStatus, as: 'EventStatus' },
            { model: models.EventType, as: 'EventType' },
            { model: models.Group, as: 'Group' },
            { model: models.User, as: 'Creator' },
          ],
          raw: false
        });
        records = records.map(r => r.get({ plain: true }));
      } else if (modelKey === 'Estimate') {
        records = await model.findAll({
          include: [
            { model: models.EstimateStatus, as: 'EstimateStatus' },
            { model: models.User, as: 'Creator' },
            { model: models.Client, as: 'Client' },
          ],
          raw: false
        });
        records = records.map(r => r.get({ plain: true }));
      } else if (modelKey === 'User') {
        records = await model.findAll({
          include: [
            { model: models.Role, as: 'Role' },
            { model: models.UserPreference, as: 'Preferences' },
          ],
          raw: false
        });
        records = records.map(r => r.get({ plain: true }));
      } else if (modelKey === 'Activity') {
        records = await model.findAll({
          include: [
            { model: models.User, as: 'User', attributes: ['id', 'firstName', 'lastName', 'email'] },
          ],
          raw: false
        });
        // Transform activities for better searchability
        records = records.map(activity => {
          const plainActivity = activity.get({ plain: true });
          const user = plainActivity.User;
          
          return {
            ...plainActivity,
            userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
            userEmail: user ? user.email : '',
            searchText: `${plainActivity.activityType} ${plainActivity.action} ${plainActivity.description || ''} ${user ? user.firstName + ' ' + user.lastName : ''}`.toLowerCase(),
            createdAtTimestamp: new Date(plainActivity.createdAt).getTime(),
            isVisible: plainActivity.isVisible !== false, // Default to true if not specified
            tags: plainActivity.tags || []
          };
        });
      } else {
        records = await model.findAll({ raw: true });
      }
      // Ensure index exists with primary key before adding documents
      try {
        await meiliClient.createIndex(indexName, { primaryKey: 'id' });
      } catch (e) {
        // Ignore error if index already exists
      }
      try {
        await meiliClient.index(indexName).updatePrimaryKey('id');
      } catch (e) {
        // Ignore error if primary key is already set
      }

      // Configure activities index with specific settings
      if (indexName === 'activities') {
        try {
          const activitiesIndex = meiliClient.index('activities');
          
          // Set searchable attributes
          await activitiesIndex.updateSearchableAttributes([
            'searchText',
            'description',
            'userName',
            'userEmail',
            'activityType',
            'action',
            'tags'
          ]);

          // Set filterable attributes
          await activitiesIndex.updateFilterableAttributes([
            'activityType',
            'action',
            'severity',
            'userId',
            'entityId',
            'isSystemGenerated',
            'isVisible',
            'createdAt',
            'createdAtTimestamp',
            'tags'
          ]);

          // Set sortable attributes
          await activitiesIndex.updateSortableAttributes([
            'createdAt',
            'createdAtTimestamp',
            'severity',
            'activityType'
          ]);

          // Configure faceting
          await activitiesIndex.updateFaceting({
            maxValuesPerFacet: 100
          });

          // Configure ranking rules
          await activitiesIndex.updateRankingRules([
            'words',
            'typo',
            'proximity',
            'attribute',
            'sort',
            'exactness'
          ]);

        } catch (configError) {
          console.error('Error configuring activities index:', configError);
        }
      }

      await meiliClient.index(indexName).addDocuments(records);
    } catch (err) {
      console.error(`Error indexing ${indexName}:`, err);
    }
  }
}

// Configure activities index settings
async function configureActivitiesIndex() {
  try {
    const activitiesIndex = meiliClient.index('activities');
    
    // Ensure the index exists
    try {
      await meiliClient.createIndex('activities', { primaryKey: 'id' });
    } catch (e) {
      // Index already exists
    }

    // Set searchable attributes for optimal search
    await activitiesIndex.updateSearchableAttributes([
      'searchText',
      'description',
      'userName',
      'userEmail',
      'activityType',
      'action',
      'tags'
    ]);

    // Set filterable attributes for the widget functions
    await activitiesIndex.updateFilterableAttributes([
      'activityType',
      'action',
      'severity',
      'userId',
      'entityId',
      'isSystemGenerated',
      'isVisible',
      'createdAt',
      'createdAtTimestamp',
      'tags'
    ]);

    // Set sortable attributes
    await activitiesIndex.updateSortableAttributes([
      'createdAt',
      'createdAtTimestamp',
      'severity',
      'activityType'
    ]);

    // Configure faceting for analytics
    await activitiesIndex.updateFaceting({
      maxValuesPerFacet: 100
    });

    // Configure ranking rules for relevant results
    await activitiesIndex.updateRankingRules([
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness'
    ]);

    // Activities index configured successfully
    return true;
    
  } catch (error) {
    console.error('❌ Error configuring activities index:', error);
    return false;
  }
}

// Index a single activity (for real-time indexing)
async function indexActivity(activity, user = null) {
  try {
    // Ensure we have the basic required fields
    if (!activity || !activity.id) {
      throw new Error('Activity must have an id');
    }

    const searchableActivity = {
      id: activity.id,
      userId: activity.userId,
      userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
      userEmail: user ? user.email : '',
      activityType: activity.activityType,
      entityId: activity.entityId,
      action: activity.action,
      description: activity.description || '',
      severity: activity.severity || 'low',
      tags: Array.isArray(activity.tags) ? activity.tags : [],
      isSystemGenerated: Boolean(activity.isSystemGenerated),
      isVisible: activity.isVisible !== false,
      metadata: activity.metadata || {},
      searchText: `${activity.activityType} ${activity.action} ${activity.description || ''} ${user ? user.firstName + ' ' + user.lastName : ''}`.toLowerCase()
    };

    // Only add date fields if createdAt exists and is valid
    if (activity.createdAt) {
      try {
        const date = new Date(activity.createdAt);
        if (!isNaN(date.getTime())) {
          searchableActivity.createdAt = date.toISOString();
          searchableActivity.createdAtTimestamp = date.getTime();
        }
      } catch (dateError) {
        // Error parsing createdAt date
      }
    }

    await meiliClient.index('activities').addDocuments([searchableActivity]);
    return true;
  } catch (error) {
    console.error('Error indexing activity in MeiliSearch:', error);
    return false;
  }
}

module.exports = { 
  bulkReindexAll, 
  configureActivitiesIndex, 
  indexActivity,
  meiliClient 
};
