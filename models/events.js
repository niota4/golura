const Sequelize = require('sequelize');
const { check } = require('yargs');

module.exports = function (sequelize, DataTypes) {
  // Lazy-load to avoid circular dependency
  const { createActivityHooks } = require('../helpers/activityHooks');
  const EventActivity = sequelize.models.EventActivity; // Ensure the EventActivity model is loaded

  const Event = sequelize.define(
    'events',
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      recurring: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      recurrencePatternId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'recurrencePatterns',
          key: 'id',
        },
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      priorityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'priorities',
          key: 'id',
        },
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'companies',
          key: 'id',
        },
      },
      reminderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'reminders',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      statusId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'eventStatuses',
          key: 'id',
        },
      },
      isActive: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      details: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      checkInDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      checkOutDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      addressId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      emailId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      phoneNumberId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      targetUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      clientId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'clients',
          key: 'id',
        },
      },
      eventTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'eventTypes',
          key: 'id',
        },
      },
      groupId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'groups',
          key: 'id',
        },
      },
      eventCategoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'eventCategories',
          key: 'id',
        },
      },
      completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      parentEventId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'events',
          key: 'id',
        },
      },
      completedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      completedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      creatorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      tableName: 'events',
      timestamps: true,
      indexes: [
        {
          name: 'PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'id' }],
        },
        {
          name: 'eventTypeId',
          using: 'BTREE',
          fields: [{ name: 'eventTypeId' }],
        },
        {
          name: 'groupId',
          using: 'BTREE',
          fields: [{ name: 'groupId' }],
        },
        {
          name: 'creatorId',
          using: 'BTREE',
          fields: [{ name: 'creatorId' }],
        },
      ],
      hooks: {
        // Use new unified activity hooks
        ...createActivityHooks('event', {
          getDescription: {
            created: (event) => `Event "${event.title || 'Untitled'}" was created`,
            updated: (event, changes) => {
              const fieldDescriptions = {
                title: 'title',
                startDate: 'start date',
                endDate: 'end date',
                addressId: 'address',
                clientId: 'client',
                statusId: 'status',
                eventTypeId: 'event type',
                priorityId: 'priority'
              };
              
              const changedFields = Object.keys(changes)
                .map(field => fieldDescriptions[field] || field)
                .join(', ');
              
              return `Event "${event.title || 'Untitled'}" ${changedFields} was updated`;
            },
            deleted: (event) => `Event "${event.title || 'Untitled'}" was deleted`
          },
          trackFields: ['title', 'startDate', 'endDate', 'addressId', 'clientId', 'statusId', 'eventTypeId', 'priorityId']
        }),
        
        // Keep existing EventActivity hooks for backward compatibility
        afterCreate: async (event, options) => {
          try {
            await EventActivity.create({
              eventId: event.id,
              relatedModel: 'Event',
              relatedModelId: event.id,
              action: 'CREATE',
              description: `Event was created.`,
              changedBy: options.userId || null,
              stateAfter: event.toJSON(),
            });
          } catch (error) {
            console.error('Error creating EventActivity:', error);
          }
        },
      },
    }
  );

  Event.associate = models => {
    // Add new unified Activity association
    Event.hasMany(models.Activity, {
      as: 'UnifiedActivities',
      foreignKey: 'entityId',
      scope: {
        activityType: 'event'
      }
    });
  };

  return Event;
};
