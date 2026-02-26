const env = process.env;
const { DataTypes } = require("sequelize");
const { MeiliSearch } = require('meilisearch');

// Initialize MeiliSearch client only if environment variables are available
let meiliClient = null;
if (env.MEILI_HOST && env.MEILI_API_KEY) {
  try {
    meiliClient = new MeiliSearch({
      host: env.MEILI_HOST,
      apiKey: env.MEILI_API_KEY
    });
  } catch (error) {
    console.warn('Failed to initialize MeiliSearch client:', error.message);
  }
}

const SequelizeMeta = require("./SequelizeMeta");
const Company = require("./companies");
const SubscriptionPlan = require("./subscriptionPlans");
const CompanySubscription = require("./companySubscriptions");
const Address = require("./addresses");
const Email = require("./emails");
const EmailAddress = require("./emailAddresses");
const PhoneNumber = require("./phoneNumbers");
const ClientAddress = require("./clientAddresses");
const ClientEmail = require("./clientEmails");
const ClientNote = require("./clientNotes");
const ClientPhoneNumber = require("./clientPhoneNumbers");
const Client = require("./clients");
const Day = require("./days");
const EventParticipant = require("./eventParticipants");
const EventStatus = require('./eventStatuses');
const EventType = require("./eventTypes");
const ReminderType = require('./reminderTypes');
const Event = require("./events");
const GroupEventType = require("./groupEventType");
const EventCategory = require('./eventCategories');
const EventReminderType = require('./eventReminderTypes');
const Group = require("./groups");
const Image = require("./images");
const Document = require("./documents");
const Video = require("./videos");
const Marketing = require("./marketing");
const Page = require("./pages");
const Permission = require("./permissions");
const Priority = require("./priorities");
const RolePermission = require("./rolePermissions");
const Role = require("./roles");
const RoleGroup = require("./roleGroups");
const RecurrencePattern = require('./recurrencePatterns');
const State = require("./states");
const UserGroup = require("./userGroups");
const UserPermission = require("./userPermissions");
const UserPreference = require("./userPreferences");
const User = require("./users");
const UserCredentials = require("./userCredentials");
const EstimateLineItem = require('./estimateLineItems');
const EstimateLineItemImage = require('./estimateLineItemImages');
const LineItem = require("./lineItems");
const Item = require("./items");
const Estimate = require("./estimates");
const LineItemItem = require('./lineItemItem');
const EstimateHistory = require('./estimateHistory');
const EstimateStatus = require("./estimateStatuses");
const EstimatePreference = require("./estimatePreferences");
const EstimateLineItemItem = require('./estimateLineItemItems');
const EstimateSignature = require("./estimateSignatures");
const Payment = require('./payments');
const PaymentMethod = require('./paymentMethods');
const WorkOrder = require("./workOrders");
const WorkOrderLineItem = require("./workOrderLineItems");
const WorkOrderStatus = require("./workOrderStatuses");
const PurchaseOrderStatus = require("./purchaseOrderStatuses");
const PurchaseOrder = require("./purchaseOrders");
const PurchaseOrderItem = require("./purchaseOrderItems");
const Vendor = require("./vendors");
const VendorItem = require("./vendorItems");
const Invoice = require("./invoices");
const InvoiceLineItem = require("./invoiceLineItems");
const InvoiceHistory = require("./invoiceHistory");
const InvoicePreferences = require("./invoicePreferences");
const InventoryAisle = require("./inventoryAisles");
const InventoryRow = require("./inventoryRows");
const InventoryShelf = require("./inventoryShelves");
const InventoryRack = require("./inventoryRacks");
const InventorySection = require("./inventorySections");
const InventoryItem = require("./inventoryItems");
const InventoryLabel = require("./inventoryLabels");
const InventoryArea = require("./inventoryAreas");
const InventoryAreaType = require("./inventoryAreaTypes");
const Warehouse = require("./warehouses");
const WarehouseType = require("./warehouseTypes");
const Widgets = require('./widgets');
const UserWidgets = require('./userWidgets');
const RoleWidgets = require('./roleWidgets');
const Reminder = require('./reminders');
const EventActivity = require('./eventActivities');
const EstimateActivity = require('./estimateActivities');
const ClientActivity = require("./clientActivities");
const EventComment = require('./eventComments');
const Notification = require("./notifications");
const FormFolder = require('./formFolders');
const Form = require('./forms');
const Template = require('./templates');
const FormSubmission = require('./formSubmissions');
const WorkOrderActivity = require("./workOrderActivities");
const ShortCode = require("./shortCodes");
const Integration = require("./integrations");
const CompanyIntegration = require("./companyIntegrations");
const UserDevice = require("./userDevices");
const BlacklistedToken = require("./blacklistedTokens");
const UserRemindersType = require("./userRemindersTypes");
const UserReminder = require("./userReminders");
const UserFolder = require("./userFolders");
const UserDocument = require("./userDocuments");
const UserPayRate = require("./userPayRates");
const Estimator = require("./estimators");
const Labor = require("./labor");
const QuestionContainer = require("./questionContainers");
const Question = require("./questions");
const Formula = require("./formulas");
const EstimateAdjustment = require("./estimateAdjustments");
const PricingAPI = require("./pricingApi");
const EstimateVersioning = require("./estimateVersioning");
const EstimateFollowUp = require("./estimateFollowUps");
const EstimateFeedback = require("./estimateFeedback");
const EstimatorUser = require("./estimatorUsers");
const EventCheckin = require("./eventCheckins");
const ChatRoom = require("./chatRooms");
const ChatParticipant = require("./chatParticipants");
const ChatType = require("./chatTypes");
const ChatPermission = require("./chatPermissions");
const ChatMessage = require("./chatMessage");
const UserLastReadChats = require("./userLastReadChats");
const Variables = require("./variables");
const TextMessages = require("./textMessages");
const PhoneCalls = require("./phoneCalls");
const ToDos = require("./toDos");
const Activity = require("./activities");
const Payroll = require("./payrolls");
const PayrollItem = require("./payrollItems");
const PayrollDeduction = require("./payrollDeductions");
const UserCheckIns = require("./userCheckIns");
const ReportType = require("./reportTypes");
const Report = require("./reports");
const EstimateTemplate = require("./estimateTemplates");
const CompanyType = require("./companyTypes");
const UserOnboard = require("./userOnboards");

function addMeiliHooks(model, indexName, idField = 'id') {
  // Skip MeiliSearch hooks if disabled or client not available
  if (process.env.DISABLE_MEILI === 'true' || !meiliClient) {
    console.log(`Skipping MeiliSearch hooks for ${indexName} - disabled or client not available`);
    return;
  }
  
  const index = meiliClient.index(indexName);
  model.afterCreate(async (instance) => {
    await index.addDocuments([instance.get({ plain: true })]);
  });
  model.afterUpdate(async (instance) => {
    await index.addDocuments([instance.get({ plain: true })]);
  });
  model.afterDestroy(async (instance) => {
    await index.deleteDocument(instance[idField]);
  });
}

// Custom MeiliSearch transform for Activity model
function addActivityMeiliHooks(model, indexName, idField = 'id') {
  const index = meiliClient.index(indexName);
  
  const transformActivity = async (instance) => {
    try {
      // Get the raw activity data
      const activity = instance.get({ plain: true });
      
      // Try to get associated user data if available
      let user = null;
      if (instance.User) {
        user = instance.User.get({ plain: true });
      } else if (activity.userId) {
        // Fallback: try to load user if not included
        const { User } = require('./init-models')();
        const userData = await User.findByPk(activity.userId, {
          attributes: ['firstName', 'lastName', 'email']
        });
        if (userData) user = userData.get({ plain: true });
      }
      
      // Create searchable document
      const searchableActivity = {
        id: activity.id,
        userId: activity.userId,
        userName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unknown User',
        userEmail: user ? user.email : '',
        activityType: activity.activityType,
        entityId: activity.entityId,
        action: activity.action,
        description: activity.description || '',
        severity: activity.severity,
        tags: activity.tags || [],
        isSystemGenerated: activity.isSystemGenerated,
        isVisible: activity.isVisible,
        metadata: activity.metadata || {},
        ipAddress: activity.ipAddress || '',
        userAgent: activity.userAgent || '',
        createdAt: activity.createdAt ? new Date(activity.createdAt).getTime() : Date.now(),
        updatedAt: activity.updatedAt ? new Date(activity.updatedAt).getTime() : Date.now(),
        searchText: `${activity.activityType} ${activity.action} ${activity.description || ''} ${user ? user.firstName + ' ' + user.lastName : ''}`.toLowerCase()
      };
      
      return searchableActivity;
    } catch (error) {
      console.error('Error transforming activity for MeiliSearch:', error);
      // Fallback to basic transformation
      return instance.get({ plain: true });
    }
  };
  
  model.afterCreate(async (instance) => {
    try {
      const transformed = await transformActivity(instance);
      await index.addDocuments([transformed]);
    } catch (error) {
      console.error('Error indexing activity in MeiliSearch:', error);
    }
  });
  
  model.afterUpdate(async (instance) => {
    try {
      const transformed = await transformActivity(instance);
      await index.addDocuments([transformed]);
    } catch (error) {
      console.error('Error updating activity in MeiliSearch:', error);
    }
  });
  
  model.afterDestroy(async (instance) => {
    try {
      await index.deleteDocument(instance[idField]);
    } catch (error) {
      console.error('Error deleting activity from MeiliSearch:', error);
    }
  });
}

function initModels(sequelize) {
    const SequelizeMetaModel = SequelizeMeta(sequelize, DataTypes);
    const AddressModel = Address(sequelize, DataTypes);
    const EmailModel = Email(sequelize, DataTypes);
    const EmailAddressModel = EmailAddress(sequelize, DataTypes);
    const PhoneNumberModel = PhoneNumber(sequelize, DataTypes);
    const ClientAddressModel = ClientAddress(sequelize, DataTypes);
    const ClientEmailModel = ClientEmail(sequelize, DataTypes);
    const ClientNoteModel = ClientNote(sequelize, DataTypes);
    const ClientPhoneNumberModel = ClientPhoneNumber(sequelize, DataTypes);
    const ClientModel = Client(sequelize, DataTypes);
    const ReminderModel = Reminder(sequelize, DataTypes);
    const TemplateModel = Template(sequelize, DataTypes);
    const ShortCodeModel = ShortCode(sequelize, DataTypes);
    const FormFolderModel = FormFolder(sequelize, DataTypes);
    const FormModel = Form(sequelize, DataTypes);
    const CompanyModel = Company(sequelize, DataTypes);
    const SubscriptionPlanModel = SubscriptionPlan(sequelize, DataTypes);
    const CompanySubscriptionModel = CompanySubscription(sequelize, DataTypes);
    const DayModel = Day(sequelize, DataTypes);
    const EventModel = Event(sequelize, DataTypes);
    const EventParticipantModel = EventParticipant(sequelize, DataTypes);
    const EventTypeModel = EventType(sequelize, DataTypes);
    const EventStatusModel = EventStatus(sequelize, DataTypes);
    const EventReminderTypeModel = EventReminderType(sequelize, DataTypes);
    const ReminderTypeModel = ReminderType(sequelize, DataTypes);
    const EventCategoryModel = EventCategory(sequelize, DataTypes);
    const GroupModel = Group(sequelize, DataTypes);
    const GroupEventTypeModel = GroupEventType(sequelize, DataTypes);
    const ImageModel = Image(sequelize, DataTypes);
    const DocumentModel = Document(sequelize, DataTypes);
    const VideoModel = Video(sequelize, DataTypes);
    const MarketingModel = Marketing(sequelize, DataTypes);
    const PageModel = Page(sequelize, DataTypes);
    const PermissionModel = Permission(sequelize, DataTypes);
    const PriorityModel = Priority(sequelize, DataTypes);
    const RecurrencePatternModel = RecurrencePattern(sequelize, DataTypes);
    const RolePermissionModel = RolePermission(sequelize, DataTypes);
    const RoleModel = Role(sequelize, DataTypes);
    const RoleGroupModel = RoleGroup(sequelize, DataTypes);
    const StateModel = State(sequelize, DataTypes);
    const UserGroupModel = UserGroup(sequelize, DataTypes);
    const UserPermissionModel = UserPermission(sequelize, DataTypes);
    const UserPreferenceModel = UserPreference(sequelize, DataTypes);
    const UserModel = User(sequelize, DataTypes);
    const UserCredentialsModel = UserCredentials(sequelize, DataTypes);
    const LineItemModel = LineItem(sequelize, DataTypes);
    const ItemModel = Item(sequelize, DataTypes);
    const LineItemItemModel = LineItemItem(sequelize, DataTypes);
    const EstimateSignatureModel = EstimateSignature(sequelize, DataTypes);
    const EstimateModel = Estimate(sequelize, DataTypes);
    const EstimateHistoryModel = EstimateHistory(sequelize, DataTypes);
    const EstimateStatusModel = EstimateStatus(sequelize, DataTypes);
    const EstimatePreferenceModel = EstimatePreference(sequelize, DataTypes);
    const EstimateLineItemModel = EstimateLineItem(sequelize, DataTypes);
    const EstimateLineItemImageModel = EstimateLineItemImage(sequelize, DataTypes);
    const PaymentModel = Payment(sequelize, DataTypes);
    const PaymentMethodModel = PaymentMethod(sequelize, DataTypes);
    const WorkOrderModel = WorkOrder(sequelize, DataTypes);
    const WorkOrderLineItemModel = WorkOrderLineItem(sequelize, DataTypes);
    const WorkOrderStatusModel = WorkOrderStatus(sequelize, DataTypes);
    const PurchaseOrderStatusModel = PurchaseOrderStatus(sequelize, DataTypes);
    const PurchaseOrderModel = PurchaseOrder(sequelize, DataTypes);
    const PurchaseOrderItemModel = PurchaseOrderItem(sequelize, DataTypes);
    const VendorModel = Vendor(sequelize, DataTypes);
    const VendorItemModel = VendorItem(sequelize, DataTypes);
    const InvoiceModel = Invoice(sequelize, DataTypes);
    const InvoiceLineItemModel = InvoiceLineItem(sequelize, DataTypes);
    const InvoiceHistoryModel = InvoiceHistory(sequelize, DataTypes);
    const InvoicePreferencesModel = InvoicePreferences(sequelize, DataTypes);
    const InventoryAisleModel = InventoryAisle(sequelize, DataTypes);
    const InventoryAreaTypeModel = InventoryAreaType(sequelize, DataTypes);
    const InventoryRowModel = InventoryRow(sequelize, DataTypes);
    const InventoryShelfModel = InventoryShelf(sequelize, DataTypes);
    const InventoryRackModel = InventoryRack(sequelize, DataTypes);
    const InventorySectionModel = InventorySection(sequelize, DataTypes);
    const InventoryItemModel = InventoryItem(sequelize, DataTypes);
    const InventoryLabelModel = InventoryLabel(sequelize, DataTypes);
    const InventoryAreaModel = InventoryArea(sequelize, DataTypes);
    const WarehouseModel = Warehouse(sequelize, DataTypes);
    const WarehouseTypeModel = WarehouseType(sequelize, DataTypes);
    const EstimateLineItemItemModel = EstimateLineItemItem(sequelize, DataTypes);
    const WidgetModel = Widgets(sequelize, DataTypes);
    const UserWidgetModel = UserWidgets(sequelize, DataTypes);
    const RoleWidgetModel = RoleWidgets(sequelize, DataTypes);
    const EventActivityModel = EventActivity(sequelize, DataTypes);
    const EstimateActivityModel = EstimateActivity(sequelize, DataTypes);
    const ClientActivityModel = ClientActivity(sequelize, DataTypes);
    const EventCommentModel = EventComment(sequelize, DataTypes);
    const NotificationModel = Notification(sequelize, DataTypes);
    const FormSubmissionModel = FormSubmission(sequelize, DataTypes);
    const WorkOrderActivityModel = WorkOrderActivity(sequelize, DataTypes);
    const IntegrationModel = Integration(sequelize, DataTypes);
    const CompanyIntegrationModel = CompanyIntegration(sequelize, DataTypes);
    const UserDeviceModel = UserDevice(sequelize, DataTypes);
    const BlacklistedTokenModel = BlacklistedToken(sequelize, DataTypes);
    const UserReminderTypeModel = UserRemindersType(sequelize, DataTypes);
    const UserReminderModel = UserReminder(sequelize, DataTypes);
    const UserFolderModel = UserFolder(sequelize, DataTypes);
    const UserDocumentModel = UserDocument(sequelize, DataTypes);
    const UserPayRateModel = UserPayRate(sequelize, DataTypes);
    const EstimatorModel = Estimator(sequelize, DataTypes);
    const LaborModel = Labor(sequelize, DataTypes);
    const QuestionContainerModel = QuestionContainer(sequelize, DataTypes);
    const QuestionModel = Question(sequelize, DataTypes);
    const FormulaModel = Formula(sequelize, DataTypes);
    const EstimateAdjustmentModel = EstimateAdjustment(sequelize, DataTypes);
    const PricingAPIModel = PricingAPI(sequelize, DataTypes);
    const EstimateVersioningModel = EstimateVersioning(sequelize, DataTypes);
    const EstimateFollowUpModel = EstimateFollowUp(sequelize, DataTypes);
    const EstimateFeedbackModel = EstimateFeedback(sequelize, DataTypes);
    const EstimatorUserModel = EstimatorUser(sequelize, DataTypes);
    const EventCheckinModel = EventCheckin(sequelize, DataTypes);
    const ChatRoomModel = ChatRoom(sequelize, DataTypes);
    const ChatParticipantModel = ChatParticipant(sequelize, DataTypes);
    const ChatTypeModel = ChatType(sequelize, DataTypes);
    const ChatPermissionModel = ChatPermission(sequelize, DataTypes);
    const ChatMessageModel = ChatMessage(sequelize, DataTypes);
    const UserLastReadChatModel = UserLastReadChats(sequelize, DataTypes);
    const VariableModel = Variables(sequelize, DataTypes);
    const TextMessageModel = TextMessages(sequelize, DataTypes);
    const PhoneCallModel = PhoneCalls(sequelize, DataTypes);
    const ToDoModel = ToDos(sequelize, DataTypes);
    const ActivityModel = Activity(sequelize, DataTypes);
    const PayrollModel = Payroll(sequelize, DataTypes);
    const PayrollItemModel = PayrollItem(sequelize, DataTypes);
    const PayrollDeductionModel = PayrollDeduction(sequelize, DataTypes);
    const UserCheckInModel = UserCheckIns(sequelize, DataTypes);
    const ReportTypeModel = ReportType(sequelize, DataTypes);
    const ReportModel = Report(sequelize, DataTypes);
    const EstimateTemplateModel = EstimateTemplate(sequelize, DataTypes);
    const CompanyTypeModel = CompanyType(sequelize, DataTypes);
    const UserOnboardModel = UserOnboard(sequelize, DataTypes);

    // Define associations
    AddressModel.belongsTo(ClientModel, {
        as: "Client",
        foreignKey: "clientId"
    });
    ClientModel.hasMany(AddressModel, {
        as: "Addresses",
        foreignKey: "clientId"
    });
    EmailModel.belongsTo(ClientModel, {
        as: "Client",
        foreignKey: "clientId"
    });
    ClientModel.hasMany(EmailModel, {
        as: "Emails",
        foreignKey: "clientId"
    });
    PhoneNumberModel.belongsTo(ClientModel, {
        as: "Client",
        foreignKey: "clientId"
    });
    ClientModel.hasMany(PhoneNumberModel, {
        as: "PhoneNumbers",
        foreignKey: "clientId"
    });
    EventTypeModel.belongsToMany(GroupModel, {
        through: GroupEventTypeModel,
        foreignKey: "eventTypeId",
        otherKey: "groupId",
        as: 'Groups'
    });
    EventModel.belongsTo(EventCategoryModel, {
        as: "EventCategory",
        foreignKey: "eventCategoryId",
    });
    EventModel.belongsTo(EventStatusModel, {
        as: 'EventStatus',
        foreignKey: 'statusId'
    });
    EventModel.belongsTo(ReminderTypeModel, {
        as: 'ReminderType',
        foreignKey: 'reminderTypeId',
    });
    ReminderTypeModel.hasMany(EventModel, {
        as: 'Events',
        foreignKey: 'reminderTypeId',
    });
    EventStatusModel.hasMany(EventModel, {
        as: 'Events',
        foreignKey: 'statusId'
    });
    EventCategoryModel.hasMany(EventModel, {
        as: "Events",
        foreignKey: "eventCategoryId",
    });    
    EventModel.belongsTo(RecurrencePatternModel, {
        foreignKey: 'recurrencePatternId',
        as: 'RecurrencePattern',
    });
    RecurrencePatternModel.hasMany(EventModel, {
        foreignKey: 'recurrencePatternId',
        as: 'Events',
    });
    GroupModel.belongsToMany(EventTypeModel, {
        through: GroupEventTypeModel,
        foreignKey: "groupId",
        otherKey: "eventTypeId",
        as: 'EventTypes'
    });
    EventModel.belongsToMany(UserModel, {
        through: EventParticipantModel,
        foreignKey: "eventId",
        otherKey: "userId",
        as: 'Users'
    });
    UserModel.belongsToMany(EventModel, {
        through: EventParticipantModel,
        foreignKey: "userId",
        otherKey: "eventId",
        as: 'Events'
    });
    GroupModel.belongsToMany(UserModel, {
        through: UserGroupModel,
        foreignKey: "groupId",
        otherKey: "userId",
        as: 'Users'
    });
    UserModel.belongsToMany(GroupModel, {
        through: UserGroupModel,
        foreignKey: "userId",
        otherKey: "groupId",
        as: 'Groups'
    });
    PermissionModel.belongsToMany(RoleModel, {
        through: RolePermissionModel,
        foreignKey: "permissionId",
        otherKey: "roleId",
        as: 'Roles'
    });
    RoleModel.belongsToMany(PermissionModel, {
        through: RolePermissionModel,
        foreignKey: "roleId",
        otherKey: "permissionId",
        as: 'Permissions'
    });
    GroupModel.hasMany(RoleGroupModel, {
        as: 'RoleGroups',
        foreignKey: 'groupId'
    });
    RoleGroupModel.belongsTo(GroupModel, {
        as: 'Group',
        foreignKey: 'groupId'
    });
    
    RoleModel.hasMany(RoleGroupModel, {
        as: 'RoleGroups',
        foreignKey: 'roleId'
    });
    RoleGroupModel.belongsTo(RoleModel, {
        as: 'Role',
        foreignKey: 'roleId'
    });
    GroupModel.belongsToMany(RoleModel, {
        through: RoleGroupModel,
        as: 'roles',
        foreignKey: 'groupId',
        otherKey: 'roleId'
    });    
    RoleModel.belongsToMany(GroupModel, {
        through: RoleGroupModel,
        as: 'groups',
        foreignKey: 'roleId',
        otherKey: 'groupId'
    });
    PermissionModel.belongsToMany(UserModel, {
        through: UserPermissionModel,
        foreignKey: "permissionId",
        otherKey: "userId",
        as: 'Users'
    });
    UserModel.belongsToMany(PermissionModel, {
        through: UserPermissionModel,
        foreignKey: "userId",
        otherKey: "permissionId",
        as: 'Permissions'
    });
    CompanyModel.belongsTo(StateModel, {
        as: "State",
        foreignKey: "stateId"
    });
    CompanyModel.belongsTo(RoleModel, {
        foreignKey: 'defaultRoleId',
        as: 'defaultRole'
    });
    StateModel.hasMany(CompanyModel, {
        as: "Companies",
        foreignKey: "stateId"
    });
    ClientAddressModel.belongsTo(ClientModel, {
        as: "Client",
        foreignKey: "clientId"
    });
    ClientModel.hasMany(ClientAddressModel, {
        as: "ClientAddresses",
        foreignKey: "clientId"
    });
    ClientEmailModel.belongsTo(ClientModel, {
        as: "Client",
        foreignKey: "clientId"
    });
    ClientModel.hasMany(ClientEmailModel, {
        as: "ClientEmails",
        foreignKey: "clientId"
    });
    ClientNoteModel.belongsTo(ClientModel, {
        as: "Client",
        foreignKey: "clientId"
    });
    ClientModel.hasMany(ClientNoteModel, {
        as: "ClientNotes",
        foreignKey: "clientId"
    });
    ClientPhoneNumberModel.belongsTo(ClientModel, {
        as: "Client",
        foreignKey: "clientId"
    });
    ClientModel.hasMany(ClientPhoneNumberModel, {
        as: "ClientPhoneNumbers",
        foreignKey: "clientId"
    });
    ClientModel.hasMany(ImageModel, {
        as: 'Images',
        foreignKey: 'clientId'
    });
    ImageModel.belongsTo(ClientModel, {
        as: 'Client',
        foreignKey: 'clientId'
    });
    ClientModel.hasMany(DocumentModel, {
        as: 'documents',
        foreignKey: 'clientId'
    });
    DocumentModel.belongsTo(ClientModel, {
        as: 'client',
        foreignKey: 'clientId'
    });
    ClientModel.hasMany(VideoModel, {
        as: 'Videos',
        foreignKey: 'clientId'
    });
    VideoModel.belongsTo(ClientModel, {
        as: 'client',
        foreignKey: 'clientId'
    });
    EventModel.belongsTo(GroupModel, {
        as: "Group",
        foreignKey: "groupId"
    });
    EventModel.belongsToMany(ReminderTypeModel, {
        through: EventReminderTypeModel,
        foreignKey: 'eventId',
        otherKey: 'reminderTypeId',
        as: 'AssociatedReminderTypes', // Unique alias
    });
    ReminderTypeModel.belongsToMany(EventModel, {
        through: EventReminderTypeModel,
        foreignKey: 'reminderTypeId',
        otherKey: 'eventId',
        as: 'AssociatedEvents', // Unique alias
    });
    EventModel.hasMany(EventReminderTypeModel, {
        foreignKey: 'eventId',
        as: 'EventReminderTypes', // Unique alias
    });
    EventReminderTypeModel.belongsTo(EventModel, {
        foreignKey: 'eventId',
        as: 'ParentEvent', // Unique alias
    });
    GroupModel.hasMany(EventModel, {
        as: "Events",
        foreignKey: "groupId"
    });
    EventModel.belongsTo(EventTypeModel, {
        as: "EventType",
        foreignKey: "eventTypeId"
    });
    EventTypeModel.hasMany(EventModel, {
        as: "EventTypeEvents",
        foreignKey: "eventTypeId"
    });
    EventParticipantModel.belongsTo(EventModel, {
        as: "Event",
        foreignKey: "eventId"
    });
    EventModel.hasMany(EventParticipantModel, {
        as: "EventParticipants",
        foreignKey: "eventId"
    });
    GroupEventTypeModel.belongsTo(EventTypeModel, {
        as: "EventType",
        foreignKey: "eventTypeId"
    });
    EventTypeModel.hasMany(GroupEventTypeModel, {
        as: "GroupEventTypes",
        foreignKey: "eventTypeId"
    });
    GroupEventTypeModel.belongsTo(GroupModel, {
        as: "Group",
        foreignKey: "groupId"
    });
    GroupModel.hasMany(GroupEventTypeModel, {
        as: "GroupEventTypes",
        foreignKey: "groupId"
    });
    ImageModel.belongsTo(EventModel, {
        as: 'Event',
        foreignKey: 'eventId'
    });
    EventModel.hasMany(ImageModel, {
        as: 'Images',
        foreignKey: 'eventId'
    });
    DocumentModel.belongsTo(EventModel, {
        as: 'Event',
        foreignKey: 'eventId'
    });
    EventModel.hasMany(DocumentModel, {
        as: 'Documents',
        foreignKey: 'eventId'
    });
    VideoModel.belongsTo(EventModel, {
        as: 'Event',
        foreignKey: 'eventId'
    });
    EventModel.hasMany(VideoModel, {
        as: 'Videos',
        foreignKey: 'eventId'
    });
    ImageModel.belongsTo(MarketingModel, {
        as: 'Marketing',
        foreignKey: 'marketingId'
    });
    DocumentModel.belongsTo(MarketingModel, {
        as: 'Marketing',
        foreignKey: 'marketingId'
    });
    MarketingModel.hasMany(ImageModel, {
        as: 'Images',
        foreignKey: 'marketingId'
    });
    MarketingModel.hasMany(DocumentModel, {
        as: 'Documents',
        foreignKey: 'marketingId'
    });
    VideoModel.belongsTo(MarketingModel, {
        as: 'Marketing',
        foreignKey: 'marketingId'
    });
    MarketingModel.hasMany(VideoModel, {
        as: 'Videos',
        foreignKey: 'marketingId'
    });
    ImageModel.belongsTo(EstimateModel, {
        as: 'Estimate',
        foreignKey: 'estimateId'
    });
    EstimateModel.hasMany(ImageModel, {
        as: 'Images',
        foreignKey: 'estimateId'
    });
    DocumentModel.belongsTo(EstimateModel, {
        as: 'Estimate',
        foreignKey: 'estimateId'
    });
    EstimateModel.hasMany(DocumentModel, {
        as: 'Documents',
        foreignKey: 'estimateId'
    });
    VideoModel.belongsTo(EstimateModel, {
        as: 'Estimate',
        foreignKey: 'estimateId'
    });
    EstimateModel.hasMany(VideoModel, {
        as: 'Videos',
        foreignKey: 'estimateId'
    });
    UserGroupModel.belongsTo(GroupModel, {
        as: "Group",
        foreignKey: "groupId"
    });
    GroupModel.hasMany(UserGroupModel, {
        as: "UserGroups",
        foreignKey: "groupId"
    });
    PermissionModel.belongsTo(PageModel, {
        as: "Page",
        foreignKey: "pageId"
    });
    PageModel.hasMany(PermissionModel, {
        as: "Permissions",
        foreignKey: "pageId"
    });
    RolePermissionModel.belongsTo(PermissionModel, {
        as: "Permission",
        foreignKey: "permissionId"
    });
    PermissionModel.hasMany(RolePermissionModel, {
        as: "RolePermissions",
        foreignKey: "permissionId"
    });
    UserPermissionModel.belongsTo(PermissionModel, {
        as: "Permission",
        foreignKey: "permissionId"
    });
    PermissionModel.hasMany(UserPermissionModel, {
        as: "UserPermissions",
        foreignKey: "permissionId"
    });
    ClientModel.belongsTo(PriorityModel, {
        as: "Priority",
        foreignKey: "priorityId"
    });
    PriorityModel.hasMany(ClientModel, {
        as: "Clients",
        foreignKey: "priorityId"
    });
    RolePermissionModel.belongsTo(RoleModel, {
        as: "Role",
        foreignKey: "roleId"
    });
    RoleModel.hasMany(RolePermissionModel, {
        as: "RolePermissions",
        foreignKey: "roleId"
    });
    UserModel.belongsTo(RoleModel, {
        as: 'Role',
        foreignKey: 'roleId'
    });
    RoleModel.hasMany(UserModel, {
        as: "Users",
        foreignKey: "roleId"
    });
    ClientAddressModel.belongsTo(StateModel, {
        as: "State",
        foreignKey: "stateId"
    });
    AddressModel.belongsTo(StateModel, {
        as: "State",
        foreignKey: "stateId"
    });
    StateModel.hasMany(ClientAddressModel, {
        as: "ClientAddresses",
        foreignKey: "stateId"
    });
    EventParticipantModel.belongsTo(UserModel, {
        as: "User",
        foreignKey: "userId"
    });
    UserModel.hasMany(EventParticipantModel, {
        as: "EventParticipants",
        foreignKey: "userId"
    });
    EventModel.belongsTo(UserModel, {
        as: "Creator",
        foreignKey: "creatorId"
    });
    UserModel.hasMany(EventModel, {
        as: "UserEvents",
        foreignKey: "creatorId"
    });
    EventModel.belongsTo(UserModel, {
        as: "Completer",
        foreignKey: "completedBy"
    });
    UserModel.hasMany(EventModel, {
        as: "CompletedEvents",
        foreignKey: "completedBy"
    });
    UserGroupModel.belongsTo(UserModel, {
        as: "User",
        foreignKey: "userId"
    });
    UserModel.hasMany(UserGroupModel, {
        as: "UserGroups",
        foreignKey: "userId"
    });
    UserPermissionModel.belongsTo(UserModel, {
        as: "User",
        foreignKey: "userId"
    });
    UserModel.hasMany(UserPermissionModel, {
        as: "UserPermissions",
        foreignKey: "userId"
    });
    UserPreferenceModel.belongsTo(UserModel, {
        as: "User",
        foreignKey: "userId"
    });
    UserModel.hasOne(UserPreferenceModel, {
        as: "Preferences",
        foreignKey: "userId"
    });
    LineItemModel.belongsTo(UserModel, {
        as: "User",
        foreignKey: "userId"
    });
    UserModel.hasMany(LineItemModel, {
        as: "LineItems",
        foreignKey: "userId"
    });
    EstimateModel.belongsTo(ClientModel, {
        as: "Client",
        foreignKey: "clientId"
    });
    ClientModel.hasMany(EstimateModel, {
        as: "Estimates",
        foreignKey: "clientId"
    });
    EstimateModel.belongsTo(EstimateStatusModel, {
        as: "EstimateStatus",
        foreignKey: "statusId"
    });
    EstimateStatusModel.hasMany(EstimateModel, {
        as: "Estimates",
        foreignKey: "statusId"
    });
    EstimateModel.belongsTo(EstimatePreferenceModel, {
        as: "EstimatePreference",
        foreignKey: "estimatePreferenceId"
    });
    EstimatePreferenceModel.hasMany(EstimateModel, {
        as: "Estimates",
        foreignKey: "estimatePreferenceId"
    });
    LineItemModel.belongsToMany(ItemModel, {
        through: LineItemItemModel,
        as: 'Items',
        foreignKey: 'lineItemId',
        otherKey: 'itemId',
    });
    LineItemModel.belongsToMany(LineItemItemModel, {
        through: LineItemItemModel,
        as: 'AssociatedItems',
        foreignKey: 'lineItemId',
        otherKey: 'itemId',
    });
    CompanyModel.belongsTo(EstimateStatusModel, {
        foreignKey: 'estimateDefaultStatusId',
        as: 'DefaultEstimateStatus'
    });
    EstimateStatusModel.hasMany(CompanyModel, {
        as: "Companies",
        foreignKey: "estimateDefaultStatusId"
    });
    CompanyModel.belongsTo(FormFolderModel, {
        foreignKey: 'eventChecklistFolderId',
        as: 'EventChecklist'
    });
    FormFolderModel.hasMany(CompanyModel, {
        as: "Companies",
        foreignKey: "eventChecklistFolderId"
    });
    ItemModel.belongsToMany(LineItemModel, {
        through: LineItemItemModel,
        as: 'LineItems',
        foreignKey: 'itemId',
        otherKey: 'lineItemId',
    });
    LineItemItemModel.belongsTo(LineItemModel, {
        as: 'LineItem',
        foreignKey: 'lineItemId',
    });
    LineItemItemModel.belongsTo(ItemModel, {
        as: 'Item',
        foreignKey: 'itemId',
    });
    LineItemModel.belongsToMany(EstimateModel, {
        through: EstimateLineItemModel,
        as: 'AssociatedEstimates',
        foreignKey: 'lineItemId'
    });
    EstimateModel.belongsToMany(LineItemModel, {
        through: EstimateLineItemModel,
        as: 'AssociatedLineItems',
        foreignKey: 'estimateId'
    });
    EstimateLineItemModel.belongsTo(EstimateModel, {
        as: 'Estimate',
        foreignKey: 'estimateId'
    });
    EstimateLineItemModel.belongsTo(LineItemModel, {
        as: 'LineItem',
        foreignKey: 'lineItemId'
    });
    EstimateLineItemModel.belongsTo(ItemModel, {
        as: 'Item',
        foreignKey: 'itemId'
    });
    EstimateLineItemModel.belongsTo(LaborModel, {
        as: 'Labor',
        foreignKey: 'laborId'
    });
    EstimateLineItemModel.belongsTo(FormulaModel, {
        as: 'Formula',
        foreignKey: 'formulaId'
    });
    EstimateLineItemModel.belongsTo(QuestionModel, {
        as: 'Question',
        foreignKey: 'questionId'
    });
    FormulaModel.hasMany(EstimateLineItemModel, {
        as: 'EstimateLineItems',
        foreignKey: 'formulaId'
    });
    QuestionModel.hasMany(EstimateLineItemModel, {
        as: 'EstimateLineItems',
        foreignKey: 'questionId'
    });
    EstimateModel.belongsTo(EventModel, { 
        as: "Event",
        foreignKey: "eventId"
    });
    EstimateModel.hasMany(EstimateLineItemModel, {
        as: "EstimateLineItems",
        foreignKey: "estimateId"
    });
    EventModel.hasMany(EstimateModel, {
        as: "Estimates",
        foreignKey: "eventId"
    });
    EstimateModel.belongsTo(UserModel, {
        as: 'AssignedUser',
        foreignKey: 'assignedUserId'
    });
    UserModel.hasMany(EstimateModel, {
        as: 'AssignedEstimates',
        foreignKey: 'assignedUserId'
    });
    EstimateLineItemModel.belongsTo(UserModel, {
        as: 'User',
        foreignKey: 'userId'
    });
    EstimateLineItemModel.belongsToMany(ImageModel, {
        through: EstimateLineItemImageModel,
        as: 'Images',
        foreignKey: 'estimateLineItemId'
    });
    ImageModel.belongsToMany(EstimateLineItemModel, {
        through: EstimateLineItemImageModel,
        as: 'estimateLineItems',
        foreignKey: 'imageId'
    });
    EstimateModel.belongsTo(EstimateSignatureModel, {
        as: 'EstimateSignature',
        foreignKey: 'estimateSignatureId'
    });
    PaymentModel.belongsTo(ClientModel, {
        as: 'Client',
        foreignKey: 'clientId'
    });
    ClientModel.hasMany(PaymentModel, {
        as: 'Payments',
        foreignKey: 'clientId'
    });
    PaymentModel.belongsTo(EstimateModel, {
        as: 'Estimate',
        foreignKey: 'estimateId'
    });
    EstimateModel.hasMany(PaymentModel, {
        as: 'Payments',
        foreignKey: 'estimateId'
    });
    PaymentModel.belongsTo(ItemModel, {
        as: 'Item',
        foreignKey: 'itemId'
    });
    ItemModel.hasMany(PaymentModel, {
        as: 'Payments',
        foreignKey: 'itemId'
    });
    PaymentModel.belongsTo(InvoiceModel, {
        as: 'Invoice',
        foreignKey: 'invoiceId'
    });
    InvoiceModel.hasMany(PaymentModel, {
        as: 'Payments',
        foreignKey: 'invoiceId'
    });
    PaymentModel.belongsTo(CompanyModel, {
        as: 'Company',
        foreignKey: 'companyId'
    });
    CompanyModel.hasMany(PaymentModel, {
        as: 'Payments',
        foreignKey: 'companyId'
    });
    PaymentModel.belongsTo(PaymentMethodModel, {
        as: 'PaymentMethod',
        foreignKey: 'paymentMethodId'
    });
    VendorModel.belongsTo(StateModel, {
        as: "State",
        foreignKey: "stateId"
    });
    StateModel.hasMany(VendorModel, {
        as: "Vendors",
        foreignKey: "stateId"
    });
    VendorModel.hasMany(PurchaseOrderModel, {
        foreignKey: 'vendorId',
        as: 'PurchaseOrders'
    });
    VendorModel.hasMany(VendorItemModel, {
        foreignKey: 'vendorId',
        as: 'VendorItems'
    });
    VendorItemModel.belongsTo(VendorModel, {
        foreignKey: 'vendorId',
        as: 'Vendor'
    });
    VendorItemModel.belongsTo(ItemModel, {
        foreignKey: 'itemId',
        as: 'Item'
    });
    ItemModel.hasMany(VendorItemModel, {
        foreignKey: 'itemId',
        as: 'VendorItems'
    });
    PurchaseOrderModel.belongsTo(VendorModel, {
        foreignKey: 'vendorId',
        as: 'Vendor'
    });
    PurchaseOrderModel.belongsTo(WorkOrderModel, {
        foreignKey: 'workOrderId',
        as: 'WorkOrder'
    });
    PurchaseOrderModel.hasMany(PurchaseOrderItemModel, {
        foreignKey: 'purchaseOrderId',
        as: 'PurchaseOrderItems'
    });
    PurchaseOrderItemModel.belongsTo(PurchaseOrderModel, {
        foreignKey: 'purchaseOrderId',
        as: 'PurchaseOrder'
    });
    PurchaseOrderItemModel.belongsTo(WorkOrderLineItemModel, {
        foreignKey: 'lineItemId',
        as: 'WorkOrderLineItem'
      });
    PurchaseOrderItemModel.belongsTo(ItemModel, {
        foreignKey: 'itemId',
        as: 'Item'
    });
    WorkOrderModel.hasMany(PurchaseOrderModel, {
        foreignKey: 'workOrderId',
        as: 'PurchaseOrders'
    });
    WorkOrderModel.hasMany(WorkOrderLineItemModel, {
        foreignKey: 'workOrderId',
        as: 'LineItems'
    });
    WorkOrderLineItemModel.belongsTo(WorkOrderModel, {
        foreignKey: 'workOrderId',
        as: 'WorkOrder'
    });
    WorkOrderLineItemModel.belongsTo(ItemModel, {
        foreignKey: 'itemId',
        as: 'Item'
    });
    WorkOrderModel.belongsTo(ClientModel, {
        foreignKey: 'clientId',
        as: 'Client'
    });
    WorkOrderModel.belongsTo(EstimateModel, {
        foreignKey: 'estimateId',
        as: 'Estimate'
    });
    WorkOrderModel.belongsTo(EventModel, {
        foreignKey: 'eventId',
        as: 'Event'
    });
    WorkOrderModel.belongsTo(UserModel, {
        foreignKey: 'assignedUserId',
        as: 'AssignedUser'
    });
    WorkOrderModel.belongsTo(UserModel, {
        foreignKey: 'createdBy',
        as: 'Creator'
    });
    WorkOrderModel.belongsTo(UserModel, {
        foreignKey: 'completedBy',
        as: 'Completer'
    });
    WorkOrderModel.belongsTo(WorkOrderStatusModel, {
        foreignKey: 'statusId',
        as: 'WorkOrderStatus'
    });
    PurchaseOrderModel.belongsTo(PurchaseOrderStatusModel, {
        foreignKey: 'statusId',
        as: 'PurchaseOrderStatus'
    });
    PurchaseOrderStatusModel.hasMany(PurchaseOrderModel, {
        foreignKey: 'statusId',
        as: 'PurchaseOrders'
    });
    WorkOrderModel.belongsTo(PriorityModel, {
        foreignKey: 'priorityId',
        as: 'Priority'
    });
    PriorityModel.hasMany(WorkOrderModel, {
        foreignKey: 'priorityId',
        as: 'WorkOrders'
    });
    InvoiceModel.belongsTo(WorkOrderModel, {
        foreignKey: 'workOrderId',
        as: 'WorkOrder'
    });
    InvoiceModel.belongsTo(EstimateModel, {
        foreignKey: 'estimateId',
        as: 'Estimate'
    });
    InvoiceModel.belongsTo(ClientModel, {
        foreignKey: 'clientId',
        as: 'Client'
    });
    ClientModel.hasMany(InvoiceModel, {
        foreignKey: 'Invoices',
        as: 'Invoices'
    });
    ClientModel.hasMany(WorkOrderModel, {
        foreignKey: 'WorkOrders',
        as: 'WorkOrders'
    });
    InvoiceModel.hasMany(InvoiceLineItemModel, {
        foreignKey: 'invoiceId',
        as: 'InvoiceLineItems'
    });
    InvoiceLineItemModel.belongsTo(InvoiceModel, {
        foreignKey: 'invoiceId',
        as: 'Invoice'
    });
    InvoiceLineItemModel.belongsTo(LineItemModel, {
        foreignKey: 'lineItemId',
        as: 'LineItem'
    });
    InvoiceModel.belongsTo(UserModel, {
        foreignKey: 'createdBy',
        as: 'Creator'
    });
    InvoiceModel.belongsTo(InvoicePreferencesModel, {
        foreignKey: 'invoicePreferenceId',
        as: 'InvoicePreference'
    });
    InvoicePreferencesModel.hasMany(InvoiceModel, {
        foreignKey: 'invoicePreferenceId',
        as: 'Invoices'
    });
    InvoiceHistoryModel.belongsTo(InvoiceModel, {
        foreignKey: 'invoiceId',
        as: 'Invoice'
    });
    InvoiceModel.hasMany(InvoiceHistoryModel, {
        foreignKey: 'invoiceId',
        as: 'InvoiceHistories'
    });
    InventoryAreaModel.belongsTo(WarehouseModel, {
        as: 'Warehouse',
        foreignKey: 'warehouseId'
    });
    InventoryAreaModel.belongsTo(InventoryAreaTypeModel, {
        as: 'Type',
        foreignKey: 'typeId'
    });
    InventoryAreaModel.hasMany(InventoryAisleModel, {
        as: 'Aisles',
        foreignKey: 'inventoryAreaId'
    });
    InventoryAisleModel.belongsTo(InventoryAreaModel, {
        as: 'Area',
        foreignKey: 'inventoryAreaId'
    });
    InventoryAisleModel.hasMany(InventoryRowModel, {
        as: 'Rows',
        foreignKey: 'inventoryAisleId'
    });
    InventoryRowModel.belongsTo(InventoryAisleModel, {
        as: 'Aisle',
        foreignKey: 'inventoryAisleId'
    });
    InventoryRowModel.hasMany(InventoryShelfModel, {
        as: 'Shelves',
        foreignKey: 'inventoryRowId'
    });
    InventoryShelfModel.belongsTo(InventoryRowModel, {
        as: 'Row',
        foreignKey: 'inventoryRowId'
    });
    InventoryShelfModel.hasMany(InventoryRackModel, {
        as: 'Racks',
        foreignKey: 'inventoryShelfId'
    });
    InventoryRackModel.belongsTo(InventoryShelfModel, {
        as: 'Shelf',
        foreignKey: 'inventoryShelfId'
    });
    InventoryRackModel.hasMany(InventorySectionModel, {
        as: 'Sections',
        foreignKey: 'inventoryRackId'
    });
    InventorySectionModel.belongsTo(InventoryRackModel, {
        as: 'Rack',
        foreignKey: 'inventoryRackId'
    });
    InventorySectionModel.hasMany(InventoryItemModel, {
        as: 'Items',
        foreignKey: 'inventorySectionId'
    });
    InventoryItemModel.belongsTo(InventorySectionModel, {
        as: 'Section',
        foreignKey: 'inventorySectionId'
    });
    InventoryItemModel.belongsTo(ItemModel, {
        as: 'Item',
        foreignKey: 'itemId'
    });
    WarehouseModel.belongsTo(WarehouseTypeModel, { 
        foreignKey: 'warehouseTypeId', 
        as: 'Type' 
    });
    WarehouseModel.hasMany(InventoryAreaModel, { 
        foreignKey: 'warehouseId', 
        as: 'InventoryAreas' 
    });
    WarehouseTypeModel.hasMany(WarehouseModel, { 
        foreignKey: 'warehouseTypeId', 
        as: 'Warehouses' 
    });
    EstimateLineItemItemModel.belongsTo(EstimateLineItemModel, {
        foreignKey: 'estimateLineItemId', 
        as: 'EstimateLineItem' 
    });
    EstimateLineItemItemModel.belongsTo(ItemModel, { 
        foreignKey: 'itemId', 
        as: 'Item' 
    });
    WidgetModel.hasMany(UserWidgetModel, { 
        foreignKey: 'widgetId', 
        as: 'UserWidgets' 
    });
    WidgetModel.hasMany(RoleWidgetModel, { 
        foreignKey: 'widgetId', 
        as: 'RoleWidgets' 
    });
    UserWidgetModel.belongsTo(UserModel, { 
        foreignKey: 'userId', 
        as: 'User' 
    });
    UserWidgetModel.belongsTo(WidgetModel, { 
        foreignKey: 'widgetId', 
        as: 'Widget' 
    });
    RoleWidgetModel.belongsTo(RoleModel, { 
        foreignKey: 'roleId', 
        as: 'Role' 
    });
    RoleWidgetModel.belongsTo(WidgetModel, { 
        foreignKey: 'widgetId', 
        as: 'Widget' 
    });
    EstimateModel.hasMany(EstimateHistoryModel, { 
        as: 'Histories', 
        foreignKey: 'estimateId' 
    });
    EventModel.hasMany(ReminderModel, {
        foreignKey: 'eventId',
        as: 'Reminders',
    });
    ReminderModel.belongsTo(EventModel, {
        foreignKey: 'eventId',
        as: 'Event',
    });
    ReminderModel.belongsTo(ReminderTypeModel, {
        foreignKey: 'reminderTypeId',
        as: 'ReminderType',
    });
    ReminderModel.belongsTo(UserModel, {
        foreignKey: 'userId',
        as: 'User'
    });
    ReminderModel.belongsTo(UserModel, {
        foreignKey: 'creatorId',
        as: 'Creator'
    });
    ReminderTypeModel.hasMany(ReminderModel, {
        foreignKey: 'reminderTypeId',
        as: 'Reminders',
    });
    EventModel.belongsTo(ClientModel, {
        as: 'Client',
        foreignKey: 'clientId',
    });
    ClientModel.hasMany(EventModel, {
        as: 'Events',
        foreignKey: 'clientId',
    });
    EventModel.belongsTo(UserModel, {
        as: 'TargetUser',
        foreignKey: 'targetUserId',
    });
    UserModel.hasMany(EventModel, {
        as: 'TargetUserEvents',
        foreignKey: 'targetUserId',
    });
    EventModel.hasMany(EventActivityModel, {
        as: 'EventActivities',
        foreignKey: 'eventId',
    });
    EventActivityModel.belongsTo(EventModel, {
        as: 'Event',
        foreignKey: 'eventId',
    });
    UserModel.hasMany(EventActivityModel, {
        as: 'UserActivities',
        foreignKey: 'changedBy',
    });
    EventActivityModel.belongsTo(UserModel, {
        as: 'ChangedBy',
        foreignKey: 'changedBy',
    });
    EventCommentModel.belongsTo(EventCommentModel, {
        as: 'ParentComment',
        foreignKey: 'parentNoteId',
    });
    EventCommentModel.hasMany(EventCommentModel, {
        as: 'Replies',
        foreignKey: 'parentNoteId',
    });
    EventModel.hasMany(EventCommentModel, {
        as: 'EventComments',
        foreignKey: 'eventId',
    });
    EventCommentModel.belongsTo(EventModel, {
        as: 'Event',
        foreignKey: 'eventId',
    });
    UserModel.hasMany(EventCommentModel, {
        as: 'UserComments',
        foreignKey: 'userId',
    });
    EventCommentModel.belongsTo(UserModel, {
        as: 'User',
        foreignKey: 'userId',
    });
    NotificationModel.belongsTo(UserModel, {
        as: 'User',
        foreignKey: 'userId',
    });
    NotificationModel.belongsTo(PriorityModel, {
        as: 'Priority',
        foreignKey: 'priorityId',
    });
    UserModel.hasMany(NotificationModel, {
        as: 'Notifications',
        foreignKey: 'userId',
    });
    PriorityModel.hasMany(NotificationModel, {
        as: 'Notifications',
        foreignKey: 'priorityId',
    });
    EstimateModel.hasMany(EstimateActivityModel, {
        as: 'EstimateActivities',
        foreignKey: 'estimateId',
    });
    EstimateActivityModel.belongsTo(EstimateModel, {
        as: 'Estimate',
        foreignKey: 'estimateId',
    });
    UserModel.hasMany(EstimateActivityModel, {
        as: 'UserEstimateActivities',
        foreignKey: 'changedBy',
    });
    EstimateActivityModel.belongsTo(UserModel, {
        as: 'ChangedBy',
        foreignKey: 'changedBy',
    });
    ClientModel.hasMany(ClientActivityModel, {
        as: 'Activities',
        foreignKey: 'clientId',
    });
    ClientActivityModel.belongsTo(ClientModel, {
        as: 'Client',
        foreignKey: 'clientId',
    });
    ClientActivityModel.belongsTo(UserModel, {
        as: 'ChangedBy',
        foreignKey: 'changedBy',
    });
    ClientActivityModel.belongsTo(ClientAddressModel, {
        as: 'Address',
        foreignKey: 'relatedModelId',
        constraints: false,
    });
    ClientActivityModel.belongsTo(ClientEmailModel, {
        as: 'Email',
        foreignKey: 'relatedModelId',
        constraints: false,
    });
    ClientActivityModel.belongsTo(ClientNoteModel, {
        as: 'Note',
        foreignKey: 'relatedModelId',
        constraints: false,
    });
    ClientActivityModel.belongsTo(ClientPhoneNumberModel, {
        as: 'PhoneNumber',
        foreignKey: 'relatedModelId',
        constraints: false,
    });
    DocumentModel.belongsTo(UserModel, {
        as: 'User',
        foreignKey: 'userId'
    });
    ImageModel.belongsTo(UserModel, {
        as: 'User',
        foreignKey: 'userId'
    });
    VideoModel.belongsTo(UserModel, {
        as: 'User',
        foreignKey: 'userId'
    });
    ImageModel.belongsTo(ImageModel, {
        as: 'OriginalImage',
        foreignKey: 'originalImageId'
    });
    VideoModel.belongsTo(VideoModel, {
        as: 'OriginalVideo',
        foreignKey: 'originalVideoId'
    });
    DocumentModel.belongsTo(DocumentModel, {
        as: 'OriginalDocument',
        foreignKey: 'originalDocumentId'
    });
    FormFolderModel.belongsTo(FormFolderModel, { 
        as: 'ParentFolder', 
        foreignKey: 'parentFolderId' 
    });
    FormFolderModel.hasMany(FormFolderModel, { 
        as: 'ChildFolders', 
        foreignKey: 'parentFolderId' 
    });
    FormModel.belongsTo(FormFolderModel, { 
        foreignKey: 'folderId',
        as: 'Folder'
    });
    FormFolderModel.hasMany(FormModel, { 
        foreignKey: 'parentFolderId',
        as: 'Forms'
    });
    FormFolderModel.belongsTo(UserModel, {
        as: 'User',
        foreignKey: 'userId',
    });
    UserModel.hasMany(FormFolderModel, {
        as: 'FormFolders',
        foreignKey: 'userId',
    });
    FormModel.belongsTo(UserModel, {
        as: 'User',
        foreignKey: 'userId',
    });
    UserModel.hasMany(FormModel, {
        as: 'Forms',
        foreignKey: 'userId',
    });
    FormSubmissionModel.belongsTo(UserModel, {
        as: 'User',
        foreignKey: 'userId',
    });
    UserModel.hasMany(FormSubmissionModel, {
        as: 'FormSubmissions',
        foreignKey: 'userId',
    });
    FormSubmissionModel.belongsTo(FormModel, {
        as: 'Form',
        foreignKey: 'formId',
    });
    FormModel.hasMany(FormSubmissionModel, {
        as: 'FormSubmissions',
        foreignKey: 'formId',
    });
    FormSubmissionModel.belongsTo(EventModel, {
        as: 'Event',
        foreignKey: 'eventId',
    });
    EventModel.hasMany(FormSubmissionModel, {
        as: 'FormSubmissions',
        foreignKey: 'eventId',
    });
    FormSubmissionModel.belongsTo(EstimateModel, {
        as: 'Estimate',
        foreignKey: 'estimateId',
    });
    EstimateModel.hasMany(FormSubmissionModel, {
        as: 'FormSubmissions',
        foreignKey: 'estimateId',
    });
    FormSubmissionModel.belongsTo(WorkOrderModel, {
        as: 'WorkOrder',
        foreignKey: 'workOrderId',
    });
    WorkOrderModel.hasMany(FormSubmissionModel, {
        as: 'FormSubmissions',
        foreignKey: 'workOrderId',
    });
    FormSubmissionModel.belongsTo(InvoiceModel, {
        as: 'Invoice',
        foreignKey: 'invoiceId',
    });
    InvoiceModel.hasMany(FormSubmissionModel, {
        as: 'FormSubmissions',
        foreignKey: 'invoiceId',
    });
    FormSubmissionModel.belongsTo(MarketingModel, {
        as: 'Marketing',
        foreignKey: 'marketingId',
    });
    MarketingModel.hasMany(FormSubmissionModel, {
        as: 'FormSubmissions',
        foreignKey: 'marketingId',
    });
    WorkOrderModel.hasMany(WorkOrderActivityModel, {
        foreignKey: 'workOrderId',
        as: 'WorkOrderActivities',
    });
    WorkOrderActivityModel.belongsTo(WorkOrderModel, {
        foreignKey: 'workOrderId',
        as: 'WorkOrder',
    });
    UserModel.hasMany(WorkOrderActivityModel, {
        foreignKey: 'changedBy',
        as: 'WorkOrderActivities',
    });
    WorkOrderActivityModel.belongsTo(UserModel, {
        foreignKey: 'changedBy',
        as: 'ChangedBy',
    });
    PurchaseOrderModel.belongsTo(UserModel, {
        foreignKey: 'createdBy',
        as: 'Creator'
    });
    UserModel.hasMany(PurchaseOrderModel, {
        foreignKey: 'createdBy',
        as: 'PurchaseOrders'
    });
    CompanyIntegrationModel.belongsTo(CompanyModel, {
        as: "Company",
        foreignKey: "companyId"
    });
    CompanyModel.hasMany(CompanyIntegrationModel, {
        as: "Integrations",
        foreignKey: "companyId"
    });
    CompanyIntegrationModel.belongsTo(IntegrationModel, {
        as: "Integration",
        foreignKey: "integrationId"
    });
    IntegrationModel.hasMany(CompanyIntegrationModel, {
        as: "Integrations",
        foreignKey: "integrationId"
    });
    CompanyModel.belongsTo(TemplateModel, {
        as: 'EstimateEmailTemplate',
        foreignKey: 'estimateEmailTemplateId'
    });
    CompanyModel.belongsTo(TemplateModel, {
        as: 'EstimatePdfTemplate',
        foreignKey: 'estimatePdfTemplateId'
    });
    CompanyModel.belongsTo(TemplateModel, {
        as: 'EstimateSmsTemplate',
        foreignKey: 'estimateSmsTemplateId'
    });
    CompanyModel.belongsTo(TemplateModel, {
        as: 'EventEmailTemplate',
        foreignKey: 'eventEmailTemplateId'
    });
    CompanyModel.belongsTo(TemplateModel, {
        as: 'EventPdfTemplate',
        foreignKey: 'eventPdfTemplateId'
    });
    CompanyModel.belongsTo(TemplateModel, {
        as: 'EventSmsTemplate',
        foreignKey: 'eventSmsTemplateId'
    });
    CompanyModel.belongsTo(TemplateModel, {
        as: 'WorkOrderEmailTemplate',
        foreignKey: 'workOrderEmailTemplateId'
    });
    CompanyModel.belongsTo(TemplateModel, {
        as: 'WorkOrderPdfTemplate',
        foreignKey: 'workOrderPdfTemplateId'
    });
    CompanyModel.belongsTo(TemplateModel, {
        as: 'WorkOrderSmsTemplate',
        foreignKey: 'workOrderSmsTemplateId'
    });
    CompanyModel.belongsTo(TemplateModel, {
        as: 'InvoiceEmailTemplate',
        foreignKey: 'invoiceEmailTemplateId'
    });
    CompanyModel.belongsTo(TemplateModel, {
        as: 'InvoicePdfTemplate',
        foreignKey: 'invoicePdfTemplateId'
    });
    CompanyModel.belongsTo(TemplateModel, {
        as: 'InvoiceSmsTemplate',
        foreignKey: 'invoiceSmsTemplateId'
    });
    CompanyModel.belongsTo(TemplateModel, {
        as: 'PurchaseOrderEmailTemplate',
        foreignKey: 'purchaseOrderEmailTemplateId'
    });
    CompanyModel.belongsTo(TemplateModel, {
        as: 'PurchaseOrderPdfTemplate',
        foreignKey: 'purchaseOrderPdfTemplateId'
    });
    CompanyModel.belongsTo(TemplateModel, {
        as: 'PurchaseOrderSmsTemplate',
        foreignKey: 'purchaseOrderSmsTemplateId'
    });
    CompanyModel.belongsTo(TemplateModel, {
        as: 'CompanyDefaultEmailTemplate',
        foreignKey: 'companyDefaultEmailTemplateId'
    });
    CompanyModel.belongsTo(TemplateModel, {
        as: 'CompanyDefaultPdfTemplate',
        foreignKey: 'companyDefaultPdfTemplateId'
    });
    CompanyModel.belongsTo(TemplateModel, {
        as: 'CompanyDefaultSmsTemplate',
        foreignKey: 'companyDefaultSmsTemplateId'
    });
    TemplateModel.hasMany(CompanyModel, {
        as: 'EstimateEmailTemplateCompanies',
        foreignKey: 'estimateEmailTemplateId'
    });
    TemplateModel.hasMany(CompanyModel, {
        as: 'EstimatePdfTemplateCompanies',
        foreignKey: 'estimatePdfTemplateId'
    });
    TemplateModel.hasMany(CompanyModel, {
        as: 'EstimateSmsTemplateCompanies',
        foreignKey: 'estimateSmsTemplateId'
    });
    TemplateModel.hasMany(CompanyModel, {
        as: 'EventEmailTemplateCompanies',
        foreignKey: 'eventEmailTemplateId'
    });
    TemplateModel.hasMany(CompanyModel, {
        as: 'EventPdfTemplateCompanies',
        foreignKey: 'eventPdfTemplateId'
    });
    TemplateModel.hasMany(CompanyModel, {
        as: 'EventSmsTemplateCompanies',
        foreignKey: 'eventSmsTemplateId'
    });
    TemplateModel.hasMany(CompanyModel, {
        as: 'WorkOrderEmailTemplateCompanies',
        foreignKey: 'workOrderEmailTemplateId'
    });
    TemplateModel.hasMany(CompanyModel, {
        as: 'WorkOrderPdfTemplateCompanies',
        foreignKey: 'workOrderPdfTemplateId'
    });
    TemplateModel.hasMany(CompanyModel, {
        as: 'WorkOrderSmsTemplateCompanies',
        foreignKey: 'workOrderSmsTemplateId'
    });
    TemplateModel.hasMany(CompanyModel, {
        as: 'InvoiceEmailTemplateCompanies',
        foreignKey: 'invoiceEmailTemplateId'
    });
    TemplateModel.hasMany(CompanyModel, {
        as: 'InvoicePdfTemplateCompanies',
        foreignKey: 'invoicePdfTemplateId'
    });
    TemplateModel.hasMany(CompanyModel, {
        as: 'InvoiceSmsTemplateCompanies',
        foreignKey: 'invoiceSmsTemplateId'
    });
    TemplateModel.hasMany(CompanyModel, {
        as: 'PurchaseOrderEmailTemplateCompanies',
        foreignKey: 'purchaseOrderEmailTemplateId'
    });
    TemplateModel.hasMany(CompanyModel, {
        as: 'PurchaseOrderPdfTemplateCompanies',
        foreignKey: 'purchaseOrderPdfTemplateId'
    });
    TemplateModel.hasMany(CompanyModel, {
        as: 'PurchaseOrderSmsTemplateCompanies',
        foreignKey: 'purchaseOrderSmsTemplateId'
    });
    TemplateModel.hasMany(CompanyModel, {
        as: 'CompanyDefaultEmailTemplateCompanies',
        foreignKey: 'companyDefaultEmailTemplateId'
    });
    TemplateModel.hasMany(CompanyModel, {
        as: 'CompanyDefaultPdfTemplateCompanies',
        foreignKey: 'companyDefaultPdfTemplateId'
    });
    TemplateModel.hasMany(CompanyModel, {
        as: 'CompanyDefaultSmsTemplateCompanies',
        foreignKey: 'companyDefaultSmsTemplateId'
    });
    CompanyModel.hasMany(CompanySubscriptionModel, {
        foreignKey: 'companyId',
        as: 'subscriptions'
    });
    CompanySubscriptionModel.belongsTo(CompanyModel, {
        foreignKey: 'companyId',
        as: 'company'
    });
    SubscriptionPlanModel.hasMany(CompanySubscriptionModel, {
        foreignKey: 'subscriptionPlanId', 
        as: 'companySubscriptions'
    });
    CompanySubscriptionModel.belongsTo(SubscriptionPlanModel, {
        foreignKey: 'subscriptionPlanId',
        as: 'SubscriptionPlan'
    });
    UserDeviceModel.belongsTo(UserModel, {
        foreignKey: 'userId',
        as: 'User'
    });
    UserModel.hasMany(UserDeviceModel, {
        foreignKey: 'userId',
        as: 'Devices'
    });
    UserModel.belongsTo(ClientAddressModel, {
        foreignKey: 'userId',
        as: 'AddressCreator'
    });
    ClientAddressModel.hasMany(UserModel, {
        foreignKey: 'userId',
        as: 'CreatedClientAddresses'
    });
    UserModel.belongsTo(ClientEmailModel, {
        foreignKey: 'userId',
        as: 'EmailCreator'
    });
    ClientEmailModel.hasMany(UserModel, {
        foreignKey: 'userId',
        as: 'CreatedClientEmails'
    });
    UserModel.belongsTo(ClientNoteModel, {
        foreignKey: 'userId',
        as: 'NoteCreator'
    });
    ClientNoteModel.hasMany(UserModel, {
        foreignKey: 'userId',
        as: 'CreatedClientNotes'
    });
    UserModel.belongsTo(ClientPhoneNumberModel, {
        foreignKey: 'userId',
        as: 'PhoneNumberCreator'
    });
    ClientPhoneNumberModel.hasMany(UserModel, {
        foreignKey: 'userId',
        as: 'CreatedClientPhoneNumbers'
    });
    UserReminderTypeModel.belongsTo(ReminderTypeModel, {
        foreignKey: 'reminderTypeId',
        as: 'ReminderType'
    });
    ReminderTypeModel.hasMany(UserReminderTypeModel, {
        foreignKey: 'reminderTypeId',
        as: 'UserReminderTypes'
    });
    UserReminderTypeModel.belongsTo(UserModel, {
        foreignKey: 'userId',
        as: 'User'
    });
    UserModel.hasMany(UserReminderTypeModel, {
        foreignKey: 'userId',
        as: 'UserReminderTypes'
    });
    UserReminderModel.belongsTo(UserModel, {
        foreignKey: 'userId',
        as: 'User'
    });
    UserModel.hasMany(UserReminderModel, {
        foreignKey: 'userId',
        as: 'UserReminders'
    });
    ReminderModel.belongsTo(UserReminderModel, {
        foreignKey: 'userReminderId',
        as: 'UserReminder'
    });
    UserReminderModel.hasMany(ReminderModel, {
        foreignKey: 'userReminderId',
        as: 'Reminders'
    });
    ClientModel.hasMany(ReminderModel, {
        foreignKey: 'clientId',
        as: 'Reminders'
    });
    ReminderModel.belongsTo(ClientModel, {
        foreignKey: 'clientId',
        as: 'Client'
    });
    ClientModel.belongsTo(UserModel, {
        foreignKey: 'createdBy',
        as: 'Creator'
    });
    UserModel.hasMany(ClientModel, {
        foreignKey: 'createdBy',
        as: 'CreatedClients'
    });
    UserFolderModel.belongsTo(UserFolderModel, { 
        as: 'ParentFolder', 
        foreignKey: 'parentFolderId' 
    });
    UserFolderModel.hasMany(UserFolderModel, { 
        as: 'ChildFolders', 
        foreignKey: 'parentFolderId' 
    });
    UserFolderModel.belongsTo(UserModel, {
        as: 'User',
        foreignKey: 'userId',
    });
    UserModel.hasMany(UserFolderModel, {
        as: 'UserFolders',
        foreignKey: 'userId',
    });
    UserDocumentModel.belongsTo(UserFolderModel, {
        as: 'Folder',
        foreignKey: 'folderId',
    });
    UserFolderModel.hasMany(UserDocumentModel, {
        as: 'UserDocuments',
        foreignKey: 'folderId',
    });
    UserDocumentModel.belongsTo(UserModel, {
        as: 'User',
        foreignKey: 'userId',
    });
    UserModel.hasMany(UserDocumentModel, {
        as: 'UserDocuments',
        foreignKey: 'userId',
    });
    UserPayRateModel.belongsTo(UserModel, {
        as: 'User',
        foreignKey: 'userId'
    });
    UserModel.hasMany(UserPayRateModel, {
        as: 'PayRates',
        foreignKey: 'userId'
    });
    UserPayRateModel.belongsTo(PayrollItemModel, {
        as: 'PayrollItem',
        foreignKey: 'payrollItemId'
    });
    PayrollItemModel.hasMany(UserPayRateModel, {
        as: 'UserPayRates',
        foreignKey: 'payrollItemId'
    });
    UserPayRateModel.belongsTo(UserModel, {
        as: 'Creator',
        foreignKey: 'creatorId'
    });
    UserModel.hasMany(UserPayRateModel, {
        as: 'CreatedPayRates',
        foreignKey: 'creatorId'
    });
    UserPayRateModel.belongsTo(UserModel, {
        as: 'Updater',
        foreignKey: 'updatedBy'
    });
    UserModel.hasMany(UserPayRateModel, {
        as: 'UpdatedPayRates',
        foreignKey: 'updatedBy'
    });
    UserModel.hasMany(EstimatorModel, {
        as: 'Estimators',
        foreignKey: 'createdBy'
    });
    EstimatorModel.belongsTo(UserModel, {
        as: 'Creator',
        foreignKey: 'createdBy'
    });
    EstimatorModel.hasMany(EstimateLineItemModel, {
        as: 'EstimateLineItems',
        foreignKey: 'estimatorId'
    });
    EstimatorModel.belongsTo(EventTypeModel, {
        as: 'EventType',
        foreignKey: 'eventTypeId'
    });
    EventTypeModel.hasMany(EstimatorModel, {
        as: 'Estimators',
        foreignKey: 'eventTypeId'
    });
    ItemModel.hasMany(EstimateLineItemModel, {
        as: 'EstimateLineItems',
        foreignKey: 'itemId'
    });
    LaborModel.hasMany(EstimateLineItemModel, {
        as: 'EstimateLineItems',
        foreignKey: 'laborId'
    });
    EstimatorModel.hasMany(QuestionContainerModel, {
        as: 'QuestionContainers',
        foreignKey: 'estimatorId'
    });
    QuestionContainerModel.belongsTo(EstimatorModel, {
        as: 'Estimator',
        foreignKey: 'estimatorId'
    });
    QuestionContainerModel.hasMany(QuestionModel, {
        as: 'Questions',
        foreignKey: 'containerId'
    });
    UserModel.hasMany(QuestionModel, {
        as: 'CreatedQuestions',
        foreignKey: 'createdBy'
    });
    QuestionContainerModel.hasMany(FormulaModel, {
        as: 'Formulas',
        foreignKey: 'containerId'
    });
    FormulaModel.belongsTo(QuestionContainerModel, {
        as: 'Container',
        foreignKey: 'containerId'
    });
    FormulaModel.belongsTo(UserModel, {
        as: 'Creator',
        foreignKey: 'createdBy'
    });
    UserModel.hasMany(FormulaModel, {
        as: 'Formulas',
        foreignKey: 'createdBy'
    });
    EstimatorModel.hasMany(EstimateAdjustmentModel, {
        as: 'EstimateAdjustments',
        foreignKey: 'estimatorId'
    });
    UserModel.hasMany(EstimateAdjustmentModel, {
        as: 'CreatedEstimateAdjustments',
        foreignKey: 'createdBy'
    });
    EstimateVersioningModel.hasMany(EstimateAdjustmentModel, {
        as: 'EstimateAdjustments',
        foreignKey: 'estimatorId'
    });
    ItemModel.hasMany(PricingAPIModel, {
        as: 'PricingAPIs',
        foreignKey: 'itemId'
    });
    VendorModel.hasMany(PricingAPIModel, {
        as: 'PricingAPIs',
        foreignKey: 'vendorId'
    });
    EstimatorModel.hasMany(EstimateVersioningModel, {
        as: 'EstimateVersionings',
        foreignKey: 'estimatorId'
    });
    UserModel.hasMany(EstimateVersioningModel, {
        as: 'CreatedEstimateVersionings',
        foreignKey: 'createdBy'
    });
    EstimateAdjustmentModel.hasMany(EstimateVersioningModel, {
        as: 'EstimateVersionings',
        foreignKey: 'estimatorId'
    });
    EstimatorUserModel.belongsTo(UserModel, {
        foreignKey: 'userId',
        as: 'User'
    });
    UserModel.hasMany(EstimatorUserModel, {
        foreignKey: 'userId',
        as: 'EstimatorUsers'
    });
    EstimatorUserModel.belongsTo(EstimatorModel, {
        foreignKey: 'estimatorId',
        as: 'Estimator'
    });
    EstimatorModel.hasMany(EstimatorUserModel, {
        foreignKey: 'estimatorId',
        as: 'EstimatorUsers'
    });
    EstimateModel.belongsTo(UserModel, {
        foreignKey: 'creatorId',
        as: 'Creator'
    });
    UserModel.hasMany(EstimateModel, {
        foreignKey: 'creatorId',
        as: 'CreatedEstimates'
    });
    ChatRoomModel.belongsTo(UserModel, {
        as: "Creator",
        foreignKey: "createdBy",
    });
    UserModel.hasMany(ChatRoomModel, {
        as: "CreatedChatRooms",
        foreignKey: "createdBy",
    });
    ChatParticipantModel.belongsTo(ChatRoomModel, {
        as: "ParticipantChatRoom",
        foreignKey: "chatRoomId",
    });
    ChatRoomModel.hasMany(ChatParticipantModel, {
        as: "ChatParticipants",
        foreignKey: "chatRoomId",
    });
    ChatParticipantModel.belongsTo(UserModel, {
        as: "User",
        foreignKey: "userId",
    });
    UserModel.hasMany(ChatParticipantModel, {
        as: "ChatParticipants",
        foreignKey: "userId",
    });
    ChatMessageModel.belongsTo(ChatRoomModel, {
        as: "MessageChatRoom",
        foreignKey: "chatRoomId",
    });
    ChatMessageModel.belongsTo(UserModel, {
        as: "User",
        foreignKey: "userId",
    });
    UserModel.hasMany(ChatMessageModel, {
        as: "ChatMessages",
        foreignKey: "userId",
    });
    ChatMessageModel.belongsTo(ChatMessageModel, {
        as: "ParentMessage",
        foreignKey: "parentMessageId",
    });
    ChatMessageModel.hasMany(ChatMessageModel, {
        as: "Replies",
        foreignKey: "parentMessageId",
    });
    ChatPermissionModel.belongsTo(ChatRoomModel, {
        as: "PermissionChatRoom",
        foreignKey: "chatRoomId",
    });
    ChatRoomModel.hasMany(ChatPermissionModel, {
        as: "ChatPermissions",
        foreignKey: "chatRoomId",
    });
    ChatPermissionModel.belongsTo(UserModel, {
        as: "User",
        foreignKey: "userId",
    });
    UserModel.hasMany(ChatPermissionModel, {
        as: "ChatPermissions",
        foreignKey: "userId",
    });
    ChatTypeModel.hasMany(ChatRoomModel, {
        as: "ChatRooms",
        foreignKey: "typeId",
    });
    ChatRoomModel.belongsTo(ChatTypeModel, {
        as: "ChatType",
        foreignKey: "typeId",
    });
    UserLastReadChatModel.belongsTo(UserModel, {
        foreignKey: 'userId',
        as: 'User'
    });
    UserModel.hasMany(UserLastReadChatModel, {
        foreignKey: 'userId',
        as: 'UserLastReadChats'
    });
    UserLastReadChatModel.belongsTo(ChatRoomModel, {
        foreignKey: 'chatRoomId',
        as: 'ChatRoom'
    });
    ChatRoomModel.hasMany(UserLastReadChatModel, {
        foreignKey: 'chatRoomId',
        as: 'UserLastReadChats'
    });
    UserLastReadChatModel.belongsTo(ChatMessageModel, {
        foreignKey: 'lastReadMessageId',
        as: 'LastReadMessage'
    });
    ChatMessageModel.hasMany(UserLastReadChatModel, {
        foreignKey: 'lastReadMessageId',
        as: 'UserLastReadChats'
    });
    ChatRoomModel.belongsTo(ChatMessageModel, {
        as: 'LastMessage',
        foreignKey: 'lastMessageId'
    });
    ChatMessageModel.hasOne(ChatRoomModel, {
        as: 'ChatRoom',
        foreignKey: 'lastMessageId'
    });
    ChatMessageModel.hasMany((ImageModel), {
        foreignKey: 'messageId',
        as: 'Images'
    });
    ImageModel.belongsToMany(ChatMessageModel, {
        through: 'ChatMessageImages',
        foreignKey: 'imageId',
        otherKey: 'messageId',
        as: 'ChatMessages'
    });
    EventCommentModel.hasMany((ImageModel), {
        foreignKey: 'commentId',
        as: 'Images'
    });
    ImageModel.belongsTo(EventCommentModel, {
        foreignKey: 'commentId',
        as: 'EventComment'
    });
    LineItemModel.belongsTo(QuestionModel, {
        foreignKey: 'questionId',
        as: 'Question'
    });
    QuestionModel.hasMany(LineItemModel, {
        foreignKey: 'questionId',
        as: 'LineItems'
    });
    LineItemModel.belongsTo(FormulaModel, {
        foreignKey: 'formulaId',
        as: 'Formula'
    });
    FormulaModel.hasMany(LineItemModel, {
        foreignKey: 'formulaId',
        as: 'LineItems'
    });
    EstimateFollowUpModel.belongsTo(EstimateModel, {
        foreignKey: 'estimateId',
        as: 'Estimate'
    });
    EstimateModel.hasMany(EstimateFollowUpModel, {
        foreignKey: 'estimateId',
        as: 'EstimateFollowUps'
    });
    EstimateFeedbackModel.belongsTo(EstimateModel, {
        foreignKey: 'estimateId',
        as: 'Estimate'
    });
    EstimateModel.hasMany(EstimateFeedbackModel, {
        foreignKey: 'estimateId',
        as: 'EstimateFeedbacks'
    });
    EstimateFollowUpModel.belongsTo(UserModel, {
        foreignKey: 'userId',
        as: 'User'
    });
    UserModel.hasMany(EstimateFollowUpModel, {
        foreignKey: 'userId',
        as: 'EstimateFollowUps'
    });
    EstimateFollowUpModel.belongsTo(ClientModel, {
        foreignKey: 'clientId',
        as: 'Client'
    });
    ClientModel.hasMany(EstimateFollowUpModel, {
        foreignKey: 'clientId',
        as: 'EstimateFollowUps'
    });
    EstimateFollowUpModel.belongsTo(UserModel, {
        foreignKey: 'createdBy',
        as: 'Creator'
    });
    UserModel.hasMany(EstimateFollowUpModel, {
        foreignKey: 'createdBy',
        as: 'CreatedEstimateFollowUps'
    });
    EstimateFollowUpModel.belongsTo(UserModel, {
        foreignKey: 'completedBy',
        as: 'CompletedBy'
    });
    UserModel.hasMany(EstimateFollowUpModel, {
        foreignKey: 'completedBy',
        as: 'CompletedEstimateFollowUps'
    });
    TextMessageModel.belongsTo(UserModel, {
        foreignKey: 'createdBy',
        as: 'Creator'
    });
    UserModel.hasMany(TextMessageModel, {
        foreignKey: 'createdBy',
        as: 'TextMessages'
    });
    TextMessageModel.belongsTo(EventModel, {
        foreignKey: 'eventId',
        as: 'Event'
    });
    EventModel.hasMany(TextMessageModel, {
        foreignKey: 'eventId',
        as: 'TextMessages'
    });
    TextMessageModel.belongsTo(ClientModel, {
        foreignKey: 'clientId',
        as: 'Client'
    });
    ClientModel.hasMany(TextMessageModel, {
        foreignKey: 'clientId',
        as: 'TextMessages'
    });
    TextMessageModel.belongsTo(EstimateModel, {
        foreignKey: 'estimateId',
        as: 'Estimate'
    });
    EstimateModel.hasMany(TextMessageModel, {
        foreignKey: 'estimateId',
        as: 'TextMessages'
    });
    TextMessageModel.belongsTo(WorkOrderModel, {
        foreignKey: 'workOrderId',
        as: 'WorkOrder'
    });
    WorkOrderModel.hasMany(TextMessageModel, {
        foreignKey: 'workOrderId',
        as: 'TextMessages'
    });
    TextMessageModel.belongsTo(InvoiceModel, {
        foreignKey: 'invoiceId',
        as: 'Invoice'
    });
    InvoiceModel.hasMany(TextMessageModel, {
        foreignKey: 'invoiceId',
        as: 'TextMessages'
    });
    EmailModel.belongsTo(UserModel, {
        foreignKey: 'createdBy',
        as: 'Creator'
    });
    UserModel.hasMany(EmailModel, {
        foreignKey: 'createdBy',
        as: 'Emails'
    });
    EmailModel.belongsTo(EventModel, {
        foreignKey: 'eventId',
        as: 'Event'
    });
    EventModel.hasMany(EmailModel, {
        foreignKey: 'eventId',
        as: 'Emails'
    });
    EventModel.belongsTo(EventModel, {
        foreignKey: 'parentEventId',
        as: 'ParentEvent'
    });
    EventModel.hasMany(EventModel, {
        foreignKey: 'parentEventId',
        as: 'ChildEvents'
    });
    EmailModel.belongsTo(EstimateModel, {
        foreignKey: 'estimateId',
        as: 'Estimate'
    });
    EstimateModel.hasMany(EmailModel, {
        foreignKey: 'estimateId',
        as: 'Emails'
    });
    EmailModel.belongsTo(WorkOrderModel, {
        foreignKey: 'workOrderId',
        as: 'WorkOrder'
    });
    WorkOrderModel.hasMany(EmailModel, {
        foreignKey: 'workOrderId',
        as: 'Emails'
    });
    EmailModel.belongsTo(InvoiceModel, {
        foreignKey: 'invoiceId',
        as: 'Invoice'
    });
    InvoiceModel.hasMany(EmailModel, {
        foreignKey: 'invoiceId',
        as: 'Emails'
    });
    EstimateModel.hasMany(EventModel, {
        foreignKey: 'parentEventId',
        as: 'Events'
    });
    EventModel.belongsTo(EstimateModel, {
        foreignKey: 'parentEventId',
        as: 'Estimate'
    });
    EstimateFollowUpModel.belongsTo(EventModel, {
        foreignKey: 'eventId',
        as: 'Event'
    });
    EventModel.hasMany(EstimateFollowUpModel, {
        foreignKey: 'eventId',
        as: 'EstimateFollowUps'
    });
    PhoneCallModel.belongsTo(UserModel, {
        foreignKey: 'createdBy',
        as: 'Creator'
    });
    UserModel.hasMany(PhoneCallModel, {
        foreignKey: 'createdBy',
        as: 'PhoneCalls'
    });
    PhoneCallModel.belongsTo(EventModel, {
        foreignKey: 'eventId',
        as: 'Event'
    });
    EventModel.hasMany(PhoneCallModel, {
        foreignKey: 'eventId',
        as: 'PhoneCalls'
    });
    PhoneCallModel.belongsTo(ClientModel, {
        foreignKey: 'clientId',
        as: 'Client'
    });
    ClientModel.hasMany(PhoneCallModel, {
        foreignKey: 'clientId',
        as: 'PhoneCalls'
    });
    PhoneCallModel.belongsTo(EstimateModel, {
        foreignKey: 'estimateId',
        as: 'Estimate'
    });
    EstimateModel.hasMany(PhoneCallModel, {
        foreignKey: 'estimateId',
        as: 'PhoneCalls'
    });
    PhoneCallModel.belongsTo(WorkOrderModel, {
        foreignKey: 'workOrderId',
        as: 'WorkOrder'
    });
    WorkOrderModel.hasMany(PhoneCallModel, {
        foreignKey: 'workOrderId',
        as: 'PhoneCalls'
    });
    PhoneCallModel.belongsTo(InvoiceModel, {
        foreignKey: 'invoiceId',
        as: 'Invoice'
    });
    InvoiceModel.hasMany(PhoneCallModel, {
        foreignKey: 'invoiceId',
        as: 'PhoneCalls'
    });
    EventCheckinModel.belongsTo(EventModel, {
        foreignKey: 'eventId',
        as: 'Event'
    });
    EventModel.hasMany(EventCheckinModel, {
        foreignKey: 'eventId',
        as: 'EventCheckins'
    });
    EventCheckinModel.belongsTo(UserModel, {
        foreignKey: 'userId',
        as: 'User'
    });
    UserModel.hasMany(EventCheckinModel, {
        foreignKey: 'userId',
        as: 'EventCheckins'
    });
    ToDoModel.belongsTo(UserModel, {
        foreignKey: 'userId',
        as: 'User'
    });
    UserModel.hasMany(ToDoModel, {
        foreignKey: 'userId',
        as: 'ToDos'
    });
    ToDoModel.belongsTo(EventModel, {
        foreignKey: 'eventId',
        as: 'Event'
    });
    EventModel.hasMany(ToDoModel, {
        foreignKey: 'eventId',
        as: 'ToDos'
    });
    ToDoModel.belongsTo(ClientModel, {
        foreignKey: 'clientId',
        as: 'Client'
    });
    ClientModel.hasMany(ToDoModel, {
        foreignKey: 'clientId',
        as: 'ToDos'
    });
    ToDoModel.belongsTo(WorkOrderModel, {
        foreignKey: 'workOrderId',
        as: 'WorkOrder'
    });
    WorkOrderModel.hasMany(ToDoModel, {
        foreignKey: 'workOrderId',
        as: 'ToDos'
    });
    ToDoModel.belongsTo(InvoiceModel, {
        foreignKey: 'invoiceId',
        as: 'Invoice'
    });
    InvoiceModel.hasMany(ToDoModel, {
        foreignKey: 'invoiceId',
        as: 'ToDos'
    });
    ToDoModel.belongsTo(UserModel, {
        foreignKey: 'completedBy',
        as: 'CompletedBy'
    });
    UserModel.hasMany(ToDoModel, {
        foreignKey: 'completedBy',
        as: 'CompletedToDos'
    });
    ToDoModel.belongsTo(UserModel, {
        foreignKey: 'assignedUserId',
        as: 'AssignedUser'
    });
    UserModel.hasMany(ToDoModel, {
        foreignKey: 'assignedUserId',
        as: 'AssignedToDos' 
    });
    UserModel.hasMany(ActivityModel, {
        as: "Activities",
        foreignKey: "userId"
    });
    ActivityModel.belongsTo(UserModel, {
        as: "User",
        foreignKey: "userId"
    });
    PayrollModel.belongsTo(UserModel, {
        as: "Creator",
        foreignKey: "creatorId"
    });
    UserModel.hasMany(PayrollModel, {
        as: "CreatedPayrolls",
        foreignKey: "creatorId"
    });
    PayrollModel.belongsTo(UserModel, {
        as: "ApprovedBy",
        foreignKey: "approvedBy"
    });
    UserModel.hasMany(PayrollModel, {
        as: "ApprovedPayrolls",
        foreignKey: "approvedBy"
    });
    PayrollModel.belongsTo(UserModel, {
        as: "ProcessedBy",
        foreignKey: "processedBy"
    });
    UserModel.hasMany(PayrollModel, {
        as: "ProcessedPayrolls",
        foreignKey: "processedBy"
    });
    PayrollItemModel.belongsTo(PayrollModel, {
        as: "Payroll",
        foreignKey: "payrollId"
    });
    PayrollModel.hasMany(PayrollItemModel, {
        as: "PayrollItems",
        foreignKey: "payrollId"
    });
    PayrollItemModel.belongsTo(UserModel, {
        as: "Employee",
        foreignKey: "employeeId"
    });
    UserModel.hasMany(PayrollItemModel, {
        as: "PayrollItems",
        foreignKey: "employeeId"
    });
    PayrollItemModel.belongsTo(UserModel, {
        as: "Creator",
        foreignKey: "creatorId"
    });
    UserModel.hasMany(PayrollItemModel, {
        as: "CreatedPayrollItems",
        foreignKey: "creatorId"
    });
    PayrollDeductionModel.belongsTo(UserModel, {
        as: "Creator",
        foreignKey: "creatorId"
    });
    UserModel.hasMany(PayrollDeductionModel, {
        as: "CreatedPayrollDeductions",
        foreignKey: "creatorId"
    });
    PayrollDeductionModel.belongsTo(UserModel, {
        as: "Employee",
        foreignKey: "employeeId"
    });
    UserModel.hasMany(PayrollDeductionModel, {
        as: "PayrollDeductions",
        foreignKey: "employeeId"
    });
    UserCheckInModel.belongsTo(UserModel, {
        foreignKey: 'userId',
        as: 'User'
    });
    UserModel.hasMany(UserCheckInModel, {
        foreignKey: 'userId',
        as: 'UserCheckIns'
    });
    UserCredentialsModel.belongsTo(UserModel, {
        foreignKey: 'userId',
        as: 'User'
    });
    UserModel.hasOne(UserCredentialsModel, {
        foreignKey: 'userId',
        as: 'Credentials'
    });
    UserCredentialsModel.belongsTo(StateModel, {
        as: "State",
        foreignKey: "stateId"
    });
    UserCredentialsModel.belongsTo(StateModel, {
        as: "DriverLicenseState",
        foreignKey: "driverLicenseStateId"
    });
    StateModel.hasMany(UserCredentialsModel, {
        as: "UserCredentials",
        foreignKey: "stateId"
    });
    StateModel.hasMany(UserCredentialsModel, {
        as: "DriverLicenseCredentials",
        foreignKey: "driverLicenseStateId"
    });
    ReportTypeModel.belongsTo(ReportModel, {
        foreignKey: "typeId",
        as: "Report",
    });
    ReportModel.belongsTo(ReportTypeModel, {
        foreignKey: "typeId",
        as: "ReportType",
    });
    EstimateTemplateModel.belongsTo(CompanyModel, {
      as: 'Company',
      foreignKey: 'companyId'
    });
    CompanyModel.hasMany(EstimateTemplateModel, {
      as: 'EstimateTemplates',
      foreignKey: 'companyId'
    });
    EstimateTemplateModel.belongsTo(UserModel, {
      as: 'Creator',
      foreignKey: 'creatorId'
    });
    UserModel.hasMany(EstimateTemplateModel, {
      as: 'EstimateTemplates',
      foreignKey: 'creatorId'
    });
    EstimateTemplateModel.hasMany(EstimateModel, {
      as: 'GeneratedEstimates',
      foreignKey: 'templateId'
    });
    EstimateModel.belongsTo(EstimateTemplateModel, {
      as: 'Template',
      foreignKey: 'templateId'
    });
    CompanyTypeModel.hasMany(CompanyModel, {
        foreignKey: 'typeId',
        as: 'Companies'
    });
    CompanyModel.belongsTo(CompanyTypeModel, {
        foreignKey: 'typeId',
        as: 'CompanyType'
    });
    UserOnboardModel.belongsTo(UserModel, {
        foreignKey: 'userId',
        as: 'User'
    });
    UserModel.hasMany(UserOnboardModel, {
        foreignKey: 'userId',
        as: 'Onboard'
    });
    UserOnboardModel.belongsTo(PageModel, {
        foreignKey: 'pageId',
        as: 'Page'
    });
    PageModel.hasMany(UserOnboardModel, {
        foreignKey: 'pageId',
        as: 'UserOnboards'
    });

    addMeiliHooks(ClientModel, 'clients');
    addMeiliHooks(ClientAddressModel, 'clientAddresses');
    addMeiliHooks(ClientEmailModel, 'clientEmails');
    addMeiliHooks(ClientNoteModel, 'clientNotes');
    addMeiliHooks(ClientPhoneNumberModel, 'clientPhoneNumbers');
    addMeiliHooks(EstimateModel, 'estimates');
    addMeiliHooks(EstimateStatusModel, 'estimateStatuses');
    addMeiliHooks(EventModel, 'events');
    addMeiliHooks(EventStatusModel, 'eventStatuses');
    addMeiliHooks(EventTypeModel, 'eventTypes');
    addMeiliHooks(AddressModel, 'addresses');
    addMeiliHooks(PhoneNumberModel, 'phoneNumbers');
    addMeiliHooks(EmailAddressModel, 'emailAddresses');
    addMeiliHooks(GroupModel, 'groups');
    addMeiliHooks(PurchaseOrderModel, 'purchaseOrders');
    addMeiliHooks(InvoiceModel, 'invoices');
    addMeiliHooks(UserModel, 'users');
    addMeiliHooks(WorkOrderModel, 'workOrders');
    addMeiliHooks(WorkOrderStatusModel, 'workOrderStatuses');

    return {
        SequelizeMeta: SequelizeMetaModel,
        Address: AddressModel,
        Email: EmailModel,
        EmailAddress: EmailAddressModel,
        PhoneNumber: PhoneNumberModel,
        Client: ClientModel,
        ClientAddress: ClientAddressModel,
        ClientEmail: ClientEmailModel,
        ClientNote: ClientNoteModel,
        ClientPhoneNumber: ClientPhoneNumberModel,
        Client: ClientModel,
        Company: CompanyModel,
        SubscriptionPlan: SubscriptionPlanModel,
        CompanySubscription: CompanySubscriptionModel,
        Day: DayModel,
        EventParticipant: EventParticipantModel,
        EventType: EventTypeModel,
        EventCategory: EventCategoryModel,
        Event: EventModel,
        EventStatus: EventStatusModel,
        ReminderType: ReminderTypeModel,
        GroupEventType: GroupEventTypeModel,
        Group: GroupModel,
        Image: ImageModel,
        Document: DocumentModel,
        Video: VideoModel,
        Page: PageModel,
        Permission: PermissionModel,
        RecurrencePattern: RecurrencePatternModel,
        Priority: PriorityModel,
        RolePermission: RolePermissionModel,
        Role: RoleModel,
        RoleGroup: RoleGroupModel,
        State: StateModel,
        UserGroup: UserGroupModel,
        UserPermission: UserPermissionModel,
        UserPreference: UserPreferenceModel,
        User: UserModel,
        UserCredentials: UserCredentialsModel,
        EstimateLineItem: EstimateLineItemModel,
        EstimateLineItemItem: EstimateLineItemItemModel,
        EstimateLineItemImage: EstimateLineItemImageModel,
        LineItem: LineItemModel,
        LineItemItem: LineItemItemModel,
        Item: ItemModel,
        Estimate: EstimateModel,
        EstimateHistory: EstimateHistoryModel,
        EstimateStatus: EstimateStatusModel,
        EstimatePreference: EstimatePreferenceModel,
        EventReminderType: EventReminderTypeModel,
        EstimateSignature: EstimateSignatureModel,
        Payment: PaymentModel,
        PaymentMethod: PaymentMethodModel,
        WorkOrder: WorkOrderModel,
        WorkOrderLineItem: WorkOrderLineItemModel,
        WorkOrderStatus: WorkOrderStatusModel,
        PurchaseOrder: PurchaseOrderModel,
        PurchaseOrderItem: PurchaseOrderItemModel,
        PurchaseOrderStatus: PurchaseOrderStatusModel,
        Vendor: VendorModel,
        VendorItem: VendorItemModel,
        Invoice: InvoiceModel,
        InvoiceLineItem: InvoiceLineItemModel,
        InvoiceHistory: InvoiceHistoryModel,
        InvoicePreferences: InvoicePreferencesModel,
        InventoryAisle: InventoryAisleModel,
        InventoryAreaType: InventoryAreaTypeModel,
        InventoryRow: InventoryRowModel,
        InventoryShelf: InventoryShelfModel,
        InventoryRack: InventoryRackModel,
        InventorySection: InventorySectionModel,
        InventoryItem: InventoryItemModel,
        InventoryLabel: InventoryLabelModel,
        InventoryArea: InventoryAreaModel,
        Warehouse: WarehouseModel,
        WarehouseType: WarehouseTypeModel,
        Widget: WidgetModel,
        UserWidget: UserWidgetModel,
        RoleWidget: RoleWidgetModel,
        Reminder: ReminderModel,
        EventActivity: EventActivityModel,
        EstimateActivity: EstimateActivityModel,
        ClientActivity: ClientActivityModel,
        EventComment: EventCommentModel,
        Notification: NotificationModel,
        FormFolder: FormFolderModel,
        Form: FormModel,
        FormSubmission: FormSubmissionModel,
        WorkOrderActivity: WorkOrderActivityModel,
        Template: TemplateModel,
        ShortCode: ShortCodeModel,
        Integration: IntegrationModel,
        CompanyIntegration: CompanyIntegrationModel,
        UserDevice: UserDeviceModel,
        BlacklistedToken: BlacklistedTokenModel,
        UserReminder: UserReminderModel,
        UserReminderType: UserReminderTypeModel,
        UserFolder: UserFolderModel,
        UserDocument: UserDocumentModel,
        UserPayRate: UserPayRateModel,
        Estimator: EstimatorModel,
        EstimateFollowUp: EstimateFollowUpModel,
        Labor: LaborModel,
        QuestionContainer: QuestionContainerModel,
        Question: QuestionModel,
        Formula: FormulaModel,
        EstimateAdjustment: EstimateAdjustmentModel,
        PricingAPI: PricingAPIModel,
        EstimateVersioning: EstimateVersioningModel,
        EstimateFollowUp: EstimateFollowUpModel,
        EstimateFeedback: EstimateFeedbackModel,
        EstimatorUser: EstimatorUserModel,
        EventCheckin: EventCheckinModel,
        ChatRoom: ChatRoomModel,
        ChatParticipant: ChatParticipantModel,
        ChatType: ChatTypeModel,
        ChatPermission: ChatPermissionModel,
        ChatMessage: ChatMessageModel,
        UserLastReadChat: UserLastReadChatModel,
        Variable: VariableModel,
        TextMessage: TextMessageModel,
        PhoneCall: PhoneCallModel,
        ToDo: ToDoModel,
        Activity: ActivityModel,
        Payroll: PayrollModel,
        PayrollItem: PayrollItemModel,
        PayrollDeduction: PayrollDeductionModel,
        UserCheckIn: UserCheckInModel,
        ReportType: ReportTypeModel,
        Report: ReportModel,
        EstimateTemplate: EstimateTemplateModel,
        CompanyType: CompanyTypeModel,
        UserOnboard: UserOnboardModel
    }
}

module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
