module.exports = app => {
  const { 
      authenticate, 
      aiAuthenticate,
      checkPermission, 
      checkSubPermission,
      validateGolura,
      validateUser,
      validateEmail,
      validateCompanySecurityToken,
      validateSecurityToken,
      validateUrl
  } = require('./helpers/validate');
  const { handleFineUploaderUpload, upload } = require('./helpers/upload');

  // AI Functions
  const aiEstimates = require('./ai/estimates');
  const aiEstimators = require('./ai/estimators');

  // External Functions
  const api = require('./functions/api');

  // Server Functions
  const activities = require('./functions/activities');
  const admin = require('./functions/admin');
  const chats = require('./functions/chats');
  const calendar = require('./functions/calendar');
  const clients = require('./functions/clients');
  const communications = require('./functions/communications');
  const comments = require('./functions/comments');
  const estimates = require('./functions/estimates'); 
  const estimators = require('./functions/estimators');
  const events = require('./functions/events');
  const forms = require('./functions/forms');
  const inventory = require('./functions/inventory');
  const invoices = require('./functions/invoices');
  const media = require('./functions/media');
  const notifications = require('./functions/notifications');
  const pages = require('./functions/pages');
  const payments = require('./functions/payments');
  const payrolls = require('./functions/payrolls');
  const reports = require('./functions/reports');
  const settings = require('./functions/settings');
  const toDos = require('./functions/toDos');
  const users = require('./functions/users');
  const workOrders = require('./functions/workOrders');
  const widgets = require('./functions/widgets');
  const subscriptions = require('./functions/subscriptions');

  // AI
  app.post('/ai/estimates/estimate/analyze', authenticate, aiAuthenticate, aiEstimates.analyzeEstimate);
  app.post('/ai/estimates/estimate/optimization', authenticate, aiEstimates.getEstimateOptimizationSuggestions);
  app.post('/ai/estimates/estimate/generate', authenticate, aiEstimates.generateEstimate);
  app.post('/ai/estimates/estimate/chat', authenticate, aiAuthenticate, aiEstimates.estimateChatbot);
  app.post('/ai/estimators/analyze-requirements', authenticate, aiEstimators.analyzeEstimatorRequirements);

  // API
  app.post('/api/company', validateGolura, api.handleCompanyCreation);

  // Activities
  app.post('/activities/clients/client', authenticate, checkPermission('clients', 'view'), activities.getClientActivities);
  app.post('/activities/events/event', authenticate, checkPermission('events', 'view'), activities.getEventActivities);
  app.post('/activities/estimates/estimate', authenticate, checkPermission('estimates', 'view'), activities.getEstimateActivities);
  app.post('/activities/work-orders/work-order', authenticate, checkPermission('work orders', 'view'), activities.getWorkOrderActivities);
  app.post('/activities/invoices/invoice', authenticate, checkPermission('invoices', 'view'), activities.getInvoiceActivities);

  // Admin
  app.post('/admin/widget/get', authenticate, checkPermission('admin settings', 'view'), admin.getWidget);
  app.post('/admin/roles/widget/get', authenticate, checkPermission('admin settings', 'view'), admin.getRoleWidget);
  app.post('/admin/templates/template/get', authenticate, checkPermission('admin settings', 'view'), admin.getTemplate);
  app.post('/admin/integrations/integration/get', authenticate, checkPermission('admin settings', 'view'), admin.getIntegration);
  app.post('/admin/labor/get', authenticate, checkPermission('admin settings', 'view'), admin.getLabor);
  app.post('/admin/labor/list', authenticate, checkPermission('admin settings', 'view'), admin.listLabor);
  app.post('/admin/groups', authenticate, admin.listGroups);
  app.post('/admin/roles', authenticate, admin.listRoles);
  app.post('/admin/role-permissions', authenticate, admin.listRolePermissions);
  app.post('/admin/permissions', authenticate, admin.listPermissions);
  app.post('/admin/event-types', authenticate, checkPermission('admin settings', 'view'), admin.listEventTypes);
  app.post('/admin/widgets', authenticate, checkPermission('admin settings', 'view'), admin.listWidgets);
  app.post('/admin/short-codes', authenticate, checkPermission('admin settings', 'view'), admin.listShortCodes);
  app.post('/admin/roles/widgets', authenticate, checkPermission('admin settings', 'view'), admin.listRoleWidgets);
  app.post('/admin/templates', authenticate, checkPermission('admin settings', 'view'), admin.listTemplates);
  app.post('/admin/variables', authenticate, checkPermission('admin settings', 'view'), admin.listVariables);
  app.post('/admin/archived/clients', authenticate, checkPermission('admin settings', 'view'), admin.listArchivedEstimates);
  app.post('/admin/archived/estimates', authenticate, checkPermission('admin settings', 'view'), admin.listArchivedClients);
  app.post('/admin/archived/events', authenticate, checkPermission('admin settings', 'view'), admin.listArchivedEvents);
  app.post('/admin/archived/users', authenticate, checkPermission('admin settings', 'view'), admin.listArchivedUsers);
  app.post('/admin/integrations', authenticate, checkPermission('admin settings', 'view'), admin.listIntegrations);
  app.put('/admin/labor', authenticate, checkPermission('admin settings', 'edit'), admin.updateLabor);
  app.post('/admin/groups/group', authenticate, checkPermission('admin settings', 'create'), admin.createGroup);
  app.post('/admin/role', authenticate, checkPermission('admin settings', 'create'), admin.createRole);
  app.post('/admin/event-type', authenticate, checkPermission('admin settings', 'create'), admin.createEventType);
  app.post('/admin/template', authenticate, checkPermission('admin settings', 'create'), admin.createTemplate);
  app.post('/admin/variables/variable', authenticate, checkPermission('admin settings', 'create'), admin.createVariable);
  app.post('/admin/stripe', authenticate, checkPermission('admin settings', 'create'), admin.createStripeConnectedAccount);
  app.post('/admin/stripe/account', authenticate, checkPermission('admin settings', 'view'), admin.getStripeAccount);
  app.post('/admin/stripe/settings', authenticate, checkPermission('admin settings', 'view'), admin.getStripeSettings);
  app.post('/admin/stripe/onboarding', authenticate, checkPermission('admin settings', 'create'), admin.createStripeOnboardingLink);
  app.post('/admin/stripe/ach/settings', authenticate, checkPermission('admin settings', 'edit'), admin.updateStripeACHSettings);
  app.post('/admin/stripe/payment-method/enable', authenticate, checkPermission('admin settings', 'create'), admin.enableStripePaymentMethod);
  app.post('/admin/stripe/payment-method/disable', authenticate, checkPermission('admin settings', 'archive'), admin.disableStripePaymentMethod);
  app.post('/admin/stripe/test-payment', authenticate, checkPermission('admin settings', 'create'), admin.createStripeTestPayment);
  // Communications
  app.post('/admin/communications/settings', authenticate, checkPermission('admin settings', 'view'), admin.getCommunicationsSettings);
  app.put('/admin/communications/settings', authenticate, checkPermission('admin settings', 'edit'), admin.updateCommunicationsSettings);
  app.post('/admin/communications/phone-number/add', authenticate, checkPermission('admin settings', 'create'), admin.addCompanyPhoneNumber);
  app.post('/admin/communications/phone-number/remove', authenticate, checkPermission('admin settings', 'archive'), admin.removeCompanyPhoneNumber);
  app.post('/admin/communications/setup/complete', authenticate, checkPermission('admin settings', 'edit'), admin.completeCommunicationsSetup);
  // Twilio phone number management
  app.post('/admin/communications/twilio/search', authenticate, checkPermission('admin settings', 'view'), admin.searchTwilioPhoneNumbers);
  app.post('/admin/communications/twilio/purchase', authenticate, checkPermission('admin settings', 'create'), admin.purchaseTwilioPhoneNumber);
  app.post('/admin/communications/twilio/release', authenticate, checkPermission('admin settings', 'archive'), admin.releaseTwilioPhoneNumber);
  app.put('/admin/role', authenticate, checkPermission('admin settings', 'edit'), admin.updateRole);
  app.put('/admin/groups/group', authenticate, checkPermission('admin settings', 'edit'), admin.updateGroup);
  app.put('/admin/event-type', authenticate, checkPermission('admin settings', 'edit'), admin.updateEventType);
  app.put('/admin/company', authenticate, checkPermission('admin settings', 'edit'), admin.updateCompany);
  app.put('/admin/template', authenticate, checkPermission('admin settings', 'edit'), admin.updateTemplate);
  app.put('/admin/variables/variable', authenticate, checkPermission('admin settings', 'edit'), admin.updateVariable);
  app.post ('/admin/integrations/integration/add', authenticate, checkPermission('admin settings', 'create'), admin.addIntegration);
  app.post('/admin/labor', authenticate, checkPermission('admin settings', 'create'), admin.addLabor);
  app.post('/admin/groups/group/delete', authenticate, checkPermission('admin settings', 'archive'), admin.deleteGroup);
  app.post('/admin/event-types/event-type/delete', authenticate, checkPermission('admin settings', 'archive'), admin.deleteEventType);
  app.post('/admin/templates/template/delete', authenticate, checkPermission('admin settings', 'archive'), admin.deleteTemplate);
  app.post('/admin/variables/variable/delete', authenticate, checkPermission('admin settings', 'archive'), admin.deleteVariable);
  app.post('/admin/labor/delete', authenticate, checkPermission('admin settings', 'archive'), admin.removeLabor);
  app.post('/admin/integrations/integration/remove', authenticate, checkPermission('admin settings', 'archive'), admin.removeIntegration);

  // Chat
  app.post('/chats/messages', authenticate, checkPermission('chats', 'view'), chats.listChatMessages);
  app.post('/chats/room', authenticate, checkPermission('chats', 'create'), chats.createChatRoom);
  app.post('/chats/message/message', authenticate, checkPermission('chats', 'create'), chats.createChatMessage);
  app.put('/chats/rooms/room', authenticate, checkPermission('chats', 'edit'), chats.updateChatRoom);
  app.put('/chats/messages/message', authenticate, checkPermission('chats', 'edit'), chats.updateChatMessage);
  app.put('/chats/messages/message/like', authenticate, checkPermission('chats', 'view'), chats.updateChatMessageLike);
  app.post('/chats/rooms/room/delete', authenticate, checkPermission('chats', 'delete'), chats.deleteChatRoom);
  app.post('/chats/messages/message/delete', authenticate, checkPermission('chats', 'delete'), chats.deleteChatMessage);

  // Calendar Sync
  app.post('/calendar-sync/user/data', authenticate, calendar.getUserCalendarSyncData);
  app.post('/calendar-sync/user/status', authenticate, calendar.reportSyncStatus);
  app.post('/calendar-sync/user/trigger', authenticate, calendar.triggerUserSync);

  // Clients
  app.post('/clients/client/get', authenticate, checkPermission('clients', 'view'), clients.get);
  app.post('/clients', authenticate, checkPermission('clients', 'view'), clients.list);
  app.post('/clients/client/photos', authenticate, checkPermission('clients', 'view'), clients.listPhotos);
  app.post('/clients/client/documents', authenticate, checkPermission('clients', 'view'), clients.listDocuments);
  app.post('/clients/client/videos', authenticate, checkPermission('clients', 'view'), clients.listVideos);
  app.post('/clients/client/events', authenticate, checkPermission('events', 'view'), clients.listEvents);
  app.post('/clients/client/estimates', authenticate, checkPermission('estimates', 'view'), clients.listEstimates);
  app.post('/clients/client/work-orders', authenticate, checkPermission('work orders', 'view'), clients.listWorkOrders);
  app.post('/clients/client/invoices', authenticate, checkPermission('invoices', 'view'), clients.listInvoices);
  app.post('/clients/client/addresses', authenticate, checkPermission('clients', 'view'), clients.listClientAddresses);
  app.post('/clients/client/emails', authenticate, checkPermission('clients', 'view'), clients.listClientEmails);
  app.post('/clients/client/notes', authenticate, checkPermission('clients', 'view'), clients.listClientNotes);
  app.post('/clients/client/phone-numbers', authenticate, checkPermission('clients', 'view'), clients.listClientPhoneNumbers);
  app.post('/clients/client/emails/list', authenticate, checkPermission('clients', 'view'), clients.listEmails);
  app.post('/clients/client/calls', authenticate, checkPermission('clients', 'view'), clients.listPhoneCalls);
  app.post('/clients/archived', authenticate, checkPermission('clients', 'view'), clients.listArchived);
  app.post('/clients/archived/client/events', authenticate, checkPermission('clients', 'view'), clients.listArchivedEvents);
  app.post('/clients/archived/client/estimates', authenticate, checkPermission('clients', 'view'), clients.listArchivedEstimates);
  app.post('/clients/archived/client/photos', authenticate, checkPermission('clients', 'view'), clients.listArchivedPhotos);
  app.post('/clients/archived/client/documents', authenticate, checkPermission('clients', 'view'), clients.listArchivedDocuments);
  app.post('/clients/archived/client/videos', authenticate, checkPermission('clients', 'view'), clients.listArchivedVideos);
  app.post('/clients/archived/client/workorders', authenticate, checkPermission('clients', 'view'), clients.listArchivedWorkOrders);
  app.post('/clients/archived/client/invoices', authenticate, checkPermission('clients', 'view'), clients.listArchivedInvoices);
  app.post('/clients/archived/client/addresses', authenticate, checkPermission('clients', 'view'), clients.listArchivedClientAddresses);
  app.post('/clients/archived/client/emails', authenticate, checkPermission('clients', 'view'), clients.listArchivedClientEmails);
  app.post('/clients/archived/client/notes', authenticate, checkPermission('clients', 'view'), clients.listArchivedClientNotes);
  app.post('/clients/archived/client/phone-numbers', authenticate, checkPermission('clients', 'view'), clients.listArchivedClientPhoneNumbers);
  app.post('/clients/client', authenticate, checkPermission('clients', 'create'), clients.create);
  app.post('/clients/client/addresses/address', authenticate, checkPermission('clients', 'create'), clients.createClientAddress);
  app.post('/clients/client/emails/email', authenticate, checkPermission('clients', 'create'), clients.createClientEmail);
  app.post('/clients/client/notes/note', authenticate, checkPermission('clients', 'create'), clients.createClientNote);
  app.post('/clients/client/phone-numbers/phone-number', authenticate, checkPermission('clients', 'create'), clients.createClientPhoneNumber);
  app.put('/clients/client', authenticate, checkPermission('clients', 'edit'), clients.update);
  app.put('/clients/client/addresses/address', authenticate, checkPermission('clients', 'edit'), clients.updateClientAddress);
  app.put('/clients/client/emails/email', authenticate, checkPermission('clients', 'edit'), clients.updateClientEmail);
  app.put('/clients/client/notes/note', authenticate, checkPermission('clients', 'edit'), clients.updateClientNote);
  app.put('/clients/client/phone-numbers/phone-number', authenticate, checkPermission('clients', 'edit'), clients.updateClientPhoneNumber);
  app.post('/clients/client/delete', authenticate, checkPermission('clients', 'delete'), clients.deleteClient);
  app.post('/clients/client/addresses/address/delete', authenticate, checkPermission('clients', 'archive'), clients.deleteClientAddress);
  app.post('/clients/client/emails/email/delete', authenticate, checkPermission('clients', 'archive'), clients.deleteClientEmail);
  app.post('/clients/client/notes/note/delete', authenticate, checkPermission('clients', 'archive'), clients.deleteClientNote);
  app.post('/clients/client/phone-numbers/phone-number/delete', authenticate, checkPermission('clients', 'archive'), clients.deleteClientPhoneNumber);

  // Comments
  app.post('/comments/events/get', authenticate, checkPermission('events', 'view'), comments.getEventComments);
  app.post('/comments/events', authenticate, checkPermission('events', 'view'), comments.createEventComment);
  app.put('/comments/events/update', authenticate, checkPermission('events', 'view'), comments.updateEventComment);
  app.put('/comments/events/like', authenticate, checkPermission('events', 'view'), comments.updateEventCommentLike);
  app.post('/comments/events/archive', authenticate, checkPermission('events', 'view'), comments.archiveEventComment);

  // Company
  app.post('/company', settings.getCompanyByName);
  app.post('/company/get', authenticate, admin.getCompany);
  app.post('/company/validate', validateCompanySecurityToken);
  app.post('/company/validate/email', admin.sendVerificationEmail);
  app.post('/company/setup', admin.setupCompany);

  // Communications
  app.post('/communications/text-messages/text-message/get', authenticate, communications.getTextMessage); 
  app.post('/communications/emails/email/get', authenticate, communications.getEmail);
  app.post('/communications/text-messages', authenticate, communications.listTextMessages);
  app.post('/communications/emails', authenticate, communications.listEmails);
  app.post('/communications/calls', authenticate, communications.listPhoneCalls);
  app.post('/communications/text-messages/text-message', authenticate, communications.createTextMessage);
  app.post('/communications/emails/email', authenticate, communications.createEmail);
  app.post('/communications/calls/call', authenticate, communications.createCall);
  app.post('/communications/calls/call/update', communications.updateCall);
  app.post('/communications/calls/recording/complete', communications.updateCallRecording);
  app.post('/communications/calls/conference/status', communications.updateConferenceStatus);
  
  // Call control endpoints
  app.post('/communications/calls/end', authenticate, communications.endCall);
  app.post('/communications/calls/mute', authenticate, communications.muteCall);
  app.post('/communications/calls/hold', authenticate, communications.holdCall);
  app.post('/communications/calls/dtmf', authenticate, communications.sendDTMF);
  app.post('/communications/calls/status', authenticate, communications.getCallStatus);

  // Events
  app.post('/events/event', authenticate, checkPermission('events', 'create'), events.create);
  app.post('/events', authenticate, checkPermission('events', 'view'), events.list);
  app.post('/events/event-types', authenticate, events.listTypes);
  app.post('/events/event/get', authenticate, checkPermission('events', 'view'), events.get);
  app.post('/events/event/work-order', authenticate, checkPermission('work orders', 'view'), events.getWorkOrder);
  app.post('/events/event/to-dos', authenticate, checkPermission('events', 'view'), events.listToDos);
  app.post('/events/event/categories', authenticate, checkPermission('events', 'view'), events.listCategories);
  app.post('/events/event/photos', authenticate, checkPermission('events', 'view'), events.listPhotos);
  app.post('/events/event/documents', authenticate, checkPermission('events', 'view'), events.listDocuments);
  app.post('/events/event/videos', authenticate, checkPermission('events', 'view'), events.listVideos);
  app.post('/events/event/estimates', authenticate, checkPermission('estimates', 'view'), events.listEstimates);
  app.post('/events/event/checklist', authenticate, checkPermission('events', 'view'), events.listChecklist);
  app.post('/events/event/checklist/submissions', authenticate, checkPermission('events', 'edit'), events.listChecklistSubmissions);
  app.post('/events/event/checkins', authenticate, checkPermission('events', 'edit'), events.listEventCheckIns);
  app.put('/events/event', authenticate, checkPermission('events', 'edit'), events.update);
  app.put('/events/event/reminders', authenticate, checkPermission('events', 'edit'), events.updateEventReminders);
  app.put('/events/event/checkins', authenticate, checkPermission('events', 'edit'), events.updateCheckIns);
  app.post('/events/event/participants/add', authenticate, checkPermission('events', 'edit'), events.addEventParticipant);
  app.post('/events/event/participants/remove', authenticate, checkPermission('events', 'edit'), events.removeEventParticipant);
  app.post('/events/event/complete', authenticate, checkPermission('events', 'edit'), events.complete);
  app.post('/events/event/delete', authenticate, checkPermission('events', 'archive'), events.archive);
  app.post('/events/event/checkins/delete', authenticate, checkPermission('events', 'edit'), events.archiveCheckIns);
  app.post('/events/event/restore', authenticate, checkPermission('events', 'archive'), events.unArchive);
  app.post('/events/event/checkin', authenticate, events.checkIn);
  app.post('/events/event/checkout', authenticate, events.checkOut);
  app.post('/events/calendar-sync', authenticate, events.getEventsForCalendarSync);

  // Estimates
  app.post('/estimates/estimate/get', authenticate, checkPermission('estimates', 'view'), estimates.get);
  app.post('/estimates/estimate/template/get', authenticate, checkPermission('estimates', 'view'), estimates.getEstimateTemplate);
  app.post('/estimates/estimate/photos', authenticate, checkPermission('estimates', 'view'), estimates.getEstimatePhotos);
  app.post('/estimates/estimate/videos', authenticate, checkPermission('estimates', 'view'), estimates.getEstimateVideos);
  app.post('/estimates/line-items/line-item/get', authenticate, checkPermission('estimates', 'view'), estimates.getLineItem);
  app.post('/estimates/estimate', authenticate, checkPermission('estimates', 'create'), estimates.create);
  app.post('/estimates/line-items/line-item', authenticate, checkPermission('estimates', 'create'), estimates.createLineItem);
  app.post('/estimates/estimate/line-item', authenticate, checkPermission('estimates', 'create'), estimates.createEstimateLineItem);
  app.post('/estimates/estimate/follow-up', authenticate, checkPermission('estimates', 'create'), estimates.createEstimateFollowUp);
  app.post('/estimates/estimate/template', authenticate, checkPermission('estimates', 'create'), estimates.createEstimateTemplate);
  app.post('/estimates/estimate/pdf', authenticate, checkPermission('estimates', 'view'), estimates.createEstimatePdf);
  app.post('/estimates/items', authenticate, checkPermission('estimates', 'view'), estimates.listItems);
  app.post('/estimates/line-items', authenticate, checkPermission('estimates', 'view'), estimates.listLineItems);
  app.post('/estimates/line-items/adhoc', authenticate, checkPermission('estimates', 'view'), estimates.listAdHocLineItems);
  app.post('/estimates/statuses', authenticate, checkPermission('estimates', 'view'), estimates.listEstimateStatuses);
  app.post('/estimates/estimate/templates', authenticate, checkPermission('estimates', 'view'), estimates.listEstimateTemplates);
  app.post('/estimates/estimate/follow-ups', authenticate, checkPermission('estimates', 'view'), estimates.listEstimateFollowUps);
  app.put('/estimates/estimate', authenticate, checkPermission('estimates', 'edit'), estimates.update);
  app.put('/estimates/line-items/line-item', authenticate, checkPermission('estimates', 'edit'), estimates.updateLineItem);
  app.put('/estimates/estimate/line-items/line-item', authenticate, checkPermission('estimates', 'edit'), estimates.updateEstimateLineItem);
  app.put('/estimates/line-items/line-item/item/quantity', authenticate, checkPermission('estimates', 'edit'), estimates.updateLineItemItemQuantity);
  app.put('/estimates/estimate/line-items/line-item/add', authenticate, checkPermission('estimates', 'edit'), estimates.addEstimateLineItemtoEstimate);
  app.put('/estimates/estimate/template', authenticate, checkPermission('estimates', 'edit'), estimates.updateEstimateTemplate);
  app.put('/estimates/line-items/item/add', authenticate, checkPermission('estimates', 'edit'), estimates.addItemToLineItem);
  app.post('/estimates/estimate/line-items/line-item/remove', authenticate, checkPermission('estimates', 'edit'), estimates.removeEstimateLineItemFromEstimate);
  app.post('/estimates/line-items/item/remove', authenticate, checkPermission('estimates', 'edit'), estimates.removeItemFromLineItem);
  app.post('/estimates/estimate/sign', authenticate, checkPermission('estimates', 'edit'), estimates.signEstimate);
  app.post('/estimates/estimate/convert', authenticate, checkPermission('estimates', 'edit'), estimates.convertEstimateToInvoice);
  app.post('/estimates/estimate/delete', authenticate, checkPermission('estimates', 'archive'), estimates.archive)
  app.post('/estimates/estimate/template/delete', authenticate, checkPermission('estimates', 'archive'), estimates.archiveEstimateTemplate);
  app.post('/estimates/estimate/restore', authenticate, checkPermission('estimates', 'archive'), estimates.unArchive);

  // Estimators
  app.post('/estimators/estimator/get', authenticate, checkPermission('estimates', 'view'), estimators.getEstimator);
  app.post('/estimators/estimate/cost/get', authenticate, checkPermission('estimates', 'view'), estimators.getFinalEstimateCost);
  app.post('/estimators/estimate/version/get', authenticate, checkPermission('estimates', 'view'), estimators.getEstimateVersion);
  app.post('/estimators/question-container/get', authenticate, checkPermission('estimates', 'view'), estimators.getQuestionContainer);
  app.post('/estimators/line-item/delete', authenticate, checkPermission('admin settings', 'archive'), estimators.removeLineItem);
  app.post('/estimators/formula/get', authenticate, checkPermission('estimates', 'view'), estimators.getFormula);
  app.post('/estimators/estimators', authenticate, checkPermission('estimates', 'view'), estimators.listEstimators);
  app.post('/estimators/line-items', authenticate, checkPermission('estimates', 'view'), estimators.listLineItems);
  app.post('/estimators/estimate/versions', authenticate, checkPermission('estimates', 'view'), estimators.listEstimateVersions);
  app.post('/estimators/formula/evaluate', authenticate, checkPermission('estimates', 'view'), estimators.evaluateFormula);
  app.post('/estimators/estimator', authenticate, checkPermission('admin settings', 'create'), estimators.createEstimator);
  app.post('/estimators/question-container', authenticate, checkPermission('admin settings', 'create'), estimators.createQuestionContainer);
  app.post('/estimators/question', authenticate, checkPermission('admin settings', 'create'), estimators.createQuestion);
  app.post('/estimators/formula', authenticate, checkPermission('admin settings', 'create'), estimators.createFormula);
  app.post('/estimators/estimate/version', authenticate, checkPermission('estimates', 'create'), estimators.createEstimateVersion);
  app.post('/estimators/estimate/total', authenticate, checkPermission('estimates', 'view'), estimators.calculateEstimateTotal);
  app.post('/estimators/estimate/create', authenticate, checkPermission('estimates', 'create'), estimators.createEstimateFromEstimator);
  app.post('/estimators/estimator/generate', authenticate, checkPermission('estimates', 'create'), estimators.generateEstimator);
  app.put('/estimators/estimator', authenticate, checkPermission('admin settings', 'edit'), estimators.updateEstimator);
  app.put('/estimators/line-item', authenticate, checkPermission('estimates', 'edit'), estimators.updateLineItem);
  app.put('/estimators/question-container', authenticate, checkPermission('admin settings', 'edit'), estimators.updateQuestionContainer);
  app.put('/estimators/question', authenticate, checkPermission('admin settings', 'edit'), estimators.updateQuestion);
  app.put('/estimators/formula', authenticate, checkPermission('admin settings', 'edit'), estimators.updateFormula);
  app.put('/estimators/user', authenticate, checkPermission('admin settings', 'edit'), estimators.updateUserPermission);
  app.post('/estimators/estimator/delete', authenticate, checkPermission('admin settings', 'archive'), estimators.archiveEstimator);
  app.post('/estimators/question-container/delete', authenticate, checkPermission('admin settings', 'archive'), estimators.archiveQuestionContainer);
  app.post('/estimators/question/delete', authenticate, checkPermission('admin settings', 'archive'), estimators.archiveQuestion);
  app.post('/estimators/line-item', authenticate, checkPermission('admin settings', 'create'), estimators.addLineItem);
  app.post('/estimators/question', authenticate, checkPermission('admin settings', 'create'), estimators.addQuestion);
  app.post('/estimators/adjustment', authenticate, checkPermission('admin settings', 'create'), estimators.addAdjustment);
  app.post('/estimators/user', authenticate, checkPermission('admin settings', 'create'), estimators.addUserToEstimator);
  app.post('/estimators/adjustment/delete', authenticate, checkPermission('admin settings', 'archive'), estimators.removeAdjustment);
  app.post('/estimators/user/delete', authenticate, checkPermission('admin settings', 'archive'), estimators.removeUserFromEstimator);
  app.post('/estimators/line-item/total', authenticate, checkPermission('estimates', 'view'), estimators.calculateLineItemTotal);

  //Forms
  app.post('/forms/form/get', authenticate, forms.get);
  app.post('/forms/folders/folder/get', authenticate, checkPermission('admin settings', 'view'), forms.getFolder);
  app.post('/forms', authenticate, checkPermission('admin settings', 'view'), forms.list);
  app.post('/forms/folders', authenticate, checkPermission('admin settings', 'view'), forms.listFolders);
  app.post('/forms/form', authenticate, checkPermission('admin settings', 'create'), forms.create);
  app.post('/forms/form/submit', authenticate, forms.submitForm);
  app.post('/forms/folders/folder', authenticate, checkPermission('admin settings', 'create'), forms.createFolder);
  app.put('/forms/form/update', authenticate, checkPermission('admin settings', 'view'), forms.update);
  app.put('/forms/folders/folder/update', authenticate, checkPermission('admin settings', 'view'), forms.updateFolder);
  app.post('/forms/form/delete', authenticate, checkPermission('admin settings', 'view'), forms.archive);
  app.post('/forms/folders/folder/delete', authenticate, checkPermission('admin settings', 'view'), forms.archiveFolder);

  // Inventory
  app.post('/item/get', authenticate, checkPermission('inventory', 'view'), inventory.getItem);
  app.post('/inventory/aisle/get', authenticate, checkPermission('inventory', 'view'), inventory.getInventoryAisle);
  app.post('/inventory/row/get', authenticate, checkPermission('inventory', 'view'), inventory.getInventoryRow);
  app.post('/inventory/shelf/get', authenticate, checkPermission('inventory', 'view'), inventory.getInventoryShelf);
  app.post('/inventory/rack/get', authenticate, checkPermission('inventory', 'view'), inventory.getInventoryRack);
  app.post('/inventory/section/get', authenticate, checkPermission('inventory', 'view'), inventory.getInventorySection);
  app.post('/inventory-item/get', authenticate, checkPermission('inventory', 'view'), inventory.getInventoryItem);
  app.post('/inventory/label/get', authenticate, checkPermission('inventory', 'view'), inventory.getInventoryLabel);
  app.post('/inventory/area/get', authenticate, checkPermission('inventory', 'view'), inventory.getInventoryArea);
  app.post('/inventory/warehouse/get', authenticate, checkPermission('inventory', 'view'), inventory.getWarehouse);
  app.post('/items', authenticate, checkPermission('inventory', 'view'), inventory.listItems);
  app.post('/inventory/aisles', authenticate, checkPermission('inventory', 'view'), inventory.listInventoryAisles);
  app.post('/inventory/rows', authenticate, checkPermission('inventory', 'view'), inventory.listInventoryRows);
  app.post('/inventory/shelves', authenticate, checkPermission('inventory', 'view'), inventory.listInventoryShelves);
  app.post('/inventory/racks', authenticate, checkPermission('inventory', 'view'), inventory.listInventoryRacks);
  app.post('/inventory/sections', authenticate, checkPermission('inventory', 'view'), inventory.listInventorySections);
  app.post('/inventory-items', authenticate, checkPermission('inventory', 'view'), inventory.listInventoryItems);
  app.post('/inventory/labels', authenticate, checkPermission('inventory', 'view'), inventory.listInventoryLabels);
  app.post('/inventory/areas', authenticate, checkPermission('inventory', 'view'), inventory.listInventoryAreas);
  app.post('/inventory/warehouses', authenticate, checkPermission('inventory', 'view'), inventory.listWarehouses);
  app.post('/inventory/purchase-orders', authenticate, checkPermission('inventory', 'view'), inventory.listPurchaseOrders);
  app.post('/item', authenticate, checkPermission('inventory', 'create'), inventory.createItem);
  app.post('/inventory/aisle', authenticate, checkPermission('inventory', 'create'), inventory.createInventoryAisle);
  app.post('/inventory/row', authenticate, checkPermission('inventory', 'create'), inventory.createInventoryRow);
  app.post('/inventory/shelf', authenticate, checkPermission('inventory', 'create'), inventory.createInventoryShelf);
  app.post('/inventory/rack', authenticate, checkPermission('inventory', 'create'), inventory.createInventoryRack);
  app.post('/inventory/section', authenticate, checkPermission('inventory', 'create'), inventory.createInventorySection);
  app.post('/inventory-item', authenticate, checkPermission('inventory', 'create'), inventory.createInventoryItem);
  app.post('/inventory/label', authenticate, checkPermission('inventory', 'create'), inventory.createInventoryLabel);
  app.post('/inventory/area', authenticate, checkPermission('inventory', 'create'), inventory.createInventoryArea);
  app.post('/warehouse', authenticate, checkPermission('inventory', 'create'), inventory.createWarehouse);
  app.post('/warehouse-type', authenticate, checkPermission('inventory', 'create'), inventory.createWarehouseType);
  app.post('/inventory-area-type', authenticate, checkPermission('inventory', 'create'), inventory.createInventoryAreaType);
  app.put('/item/update', authenticate, checkPermission('inventory', 'edit'), inventory.updateItem);
  app.put('/inventory/aisle/update', authenticate, checkPermission('inventory', 'edit'), inventory.updateInventoryAisle);
  app.put('/inventory/row/update', authenticate, checkPermission('inventory', 'edit'), inventory.updateInventoryRow);
  app.put('/inventory/shelf/update', authenticate, checkPermission('inventory', 'edit'), inventory.updateInventoryShelf);
  app.put('/inventory/rack/update', authenticate, checkPermission('inventory', 'edit'), inventory.updateInventoryRack);
  app.put('/inventory/section/update', authenticate, checkPermission('inventory', 'edit'), inventory.updateInventorySection);
  app.put('/inventory-item/update', authenticate, checkPermission('inventory', 'edit'), inventory.updateInventoryItem);
  app.put('/inventory/label/update', authenticate, checkPermission('inventory', 'edit'), inventory.updateInventoryLabel);
  app.put('/inventory/area/update', authenticate, checkPermission('inventory', 'edit'), inventory.updateInventoryArea);
  app.put('/warehouse/update', authenticate, checkPermission('inventory', 'edit'), inventory.updateWarehouse);
  app.put('/warehouse-type/update', authenticate, checkPermission('inventory', 'edit'), inventory.updateWarehouseType);
  app.put('/inventory-area-type/update', authenticate, checkPermission('inventory', 'edit'), inventory.updateInventoryAreaType);
  app.post('/inventory/aisle/delete', authenticate, checkPermission('inventory', 'archive'), inventory.archiveInventoryAisle);
  app.post('/inventory/row/delete', authenticate, checkPermission('inventory', 'archive'), inventory.archiveInventoryRow);
  app.post('/inventory/shelf/delete', authenticate, checkPermission('inventory', 'archive'), inventory.archiveInventoryShelf);
  app.post('/inventory/rack/delete', authenticate, checkPermission('inventory', 'archive'), inventory.archiveInventoryRack);
  app.post('/inventory/section/delete', authenticate, checkPermission('inventory', 'archive'), inventory.archiveInventorySection);
  app.post('/inventory-item/delete', authenticate, checkPermission('inventory', 'archive'), inventory.archiveInventoryItem);
  app.post('/inventory/label/delete', authenticate, checkPermission('inventory', 'archive'), inventory.archiveInventoryLabel);
  app.post('/inventory/area/delete', authenticate, checkPermission('inventory', 'archive'), inventory.archiveInventoryArea);
  app.post('/warehouse/delete', authenticate, checkPermission('inventory', 'archive'), inventory.archiveWarehouse);
  app.post('/warehouse-type/delete', authenticate, checkPermission('inventory', 'archive'), inventory.archiveWarehouseType);
  app.post('/inventory-area-type/delete', authenticate, checkPermission('inventory', 'archive'), inventory.archiveInventoryAreaType);

  // Vendor
  app.post('/inventory/vendors/vendor/get', authenticate, checkPermission('inventory', 'view'), inventory.getVendor);
  app.post('/inventory/vendors', authenticate, checkPermission('inventory', 'view'), inventory.listVendors);
  app.post('/inventory/vendors/vendor', authenticate, checkPermission('inventory', 'create'), inventory.createVendor);
  app.put('/inventory/vendors/vendor/update', authenticate, checkPermission('inventory', 'update'), inventory.updateVendor);
  app.post('/inventory/vendors/vendor/delete', authenticate, checkPermission('inventory', 'archive'), inventory.archiveVendor);

  // Vendor Items
  app.post('/inventory/vendors/vendor/items', authenticate, checkPermission('inventory', 'view'), inventory.listVendorItems);
  app.post('/inventory/vendors/vendor/items/item', authenticate, checkPermission('inventory', 'create'), inventory.createVendorItem);
  app.put('/inventory/vendors/vendor/items/item/update', authenticate, checkPermission('inventory', 'update'), inventory.updateVendorItem);
  app.post('/inventory/vendors/vendor/items/item/delete', authenticate, checkPermission('inventory', 'archive'), inventory.archiveVendorItem);

  // Invoices
  app.post('/invoices/invoice/get', authenticate, checkPermission('invoices', 'view'), invoices.getInvoice);
  app.post('/invoices/line-items/line-item/get', authenticate, checkPermission('invoices', 'view'), invoices.getInvoiceLineItem);
  app.post('/invoices', authenticate, checkPermission('invoices', 'view'), invoices.listInvoices);
  app.post('/invoices/invoice', authenticate, checkPermission('invoices', 'create'), invoices.createInvoice);
  app.post('/invoices/line-items/line-item', authenticate, checkPermission('invoices', 'create'), invoices.createInvoiceLineItem);
  app.post('/invoices/invoice/pdf', authenticate, checkPermission('invoices', 'view'), invoices.createInvoicePdf);
  app.put('/invoices/invoice', authenticate, checkPermission('invoices', 'edit'), invoices.updateInvoice);
  app.put('/invoices/invoice/total/update', authenticate, checkPermission('invoices', 'edit'), invoices.updateInvoiceTotal);
  app.put('/invoices/line-items/line-item', authenticate, checkPermission('invoices', 'edit'), invoices.updateInvoiceLineItem);
  app.post('/invoices/line-items/line-item', authenticate, checkPermission('invoices', 'create'), invoices.addInvoiceLineItemToInvoice);
  app.post('/invoices/line-items/line-item/remove', authenticate, checkPermission('invoices', 'archive'), invoices.removeInvoiceLineItemFromInvoice);
  app.post('/invoices/invoice/search', authenticate, checkPermission('invoices', 'view'), invoices.searchInvoices);
  app.put('/invoices/invoice/bulk-update', authenticate, checkPermission('invoices', 'edit'), invoices.bulkUpdateInvoices);
  app.post('/invoices/invoice/clone', authenticate, checkPermission('invoices', 'create'), invoices.cloneInvoice);

  // Media
  app.post('/media/photos/photo', authenticate, media.getPhoto);
  app.post('/media/photos/photo/url', authenticate, media.getPhotoByUrl);
  app.post('/media/videos/video', authenticate, media.getVideo);
  app.post('/media/documents/document', authenticate, media.getDocuments);
  app.post('/media/associate/photo', authenticate, media.associatePhoto);
  app.post('/media/associate/video', authenticate, media.associateVideo);
  app.post('/media/associate/document', authenticate, media.associateDocument);
  app.post('/media/photos/photo/delete', authenticate, media.deletePhoto);
  app.post('/media/photos/delete', authenticate, media.deletePhotos);
  app.post('/media/videos/video/delete', authenticate, media.deleteVideo);
  app.post('/media/videos/delete', authenticate, media.deleteVideos);
  app.post('/media/documents/document/delete', media.deleteDocument);
  app.post('/media/documents/delete', authenticate, media.deleteDocuments);

  // Notifications
  app.post('/notifications/notification/read', authenticate, notifications.readNotification);

  // Reports
  app.post('/reports/report/get', authenticate, checkPermission('reports', 'view'), reports.get);
  app.post('/reports', authenticate, checkPermission('reports', 'view'), reports.list);
  app.post('/reports/types', authenticate, checkPermission('reports', 'view'), reports.listTypes);
  app.post('/reports/generate', authenticate, checkPermission('reports', 'view'), reports.generate);

  // Payrolls
  app.post('/payrolls/payroll/get', authenticate, checkPermission('payroll', 'view'), payrolls.get);
  app.post('/payrolls/payroll/user/hours', authenticate, checkPermission('payroll', 'edit'), payrolls.getUserHoursFromCheckIns);
  app.post('/payrolls/payroll/user/pay-stub', authenticate, checkPermission('payroll', 'view'), payrolls.getUserPayStub);
  app.post('/payrolls', authenticate, checkPermission('payroll', 'view'), payrolls.list);
  app.post('/payrolls/payroll/deductions', authenticate, checkPermission('payroll', 'view'), payrolls.listDeductions);
  app.post('/payrolls/user/checkins', authenticate, checkPermission('payroll', 'view'), payrolls.listUserCheckInsForPeriod);
  app.post('/payrolls/checkins', authenticate, checkPermission('payroll', 'view'), payrolls.listCheckInsForPeriod);
  app.post('/payrolls/payroll/pay-stubs', authenticate, checkPermission('payroll', 'view'), payrolls.listPayStubsForPayroll);
  app.post('/payrolls/payroll', authenticate, checkPermission('payroll', 'create'), payrolls.create);
  app.put('/payrolls/payroll/update', authenticate, checkPermission('payroll', 'edit'), payrolls.update);
  app.put('/payrolls/payroll-item/update', authenticate, checkPermission('payroll', 'edit'), payrolls.updatePayrollItem);
  app.put('/payrolls/payroll-deduction/update', authenticate, checkPermission('payroll', 'edit'), payrolls.updatePayrollDeduction);
  app.post('/payrolls/payroll/delete', authenticate, checkPermission('payroll', 'archive'), payrolls.archive);
  app.post('/payrolls/payroll-item', authenticate, checkPermission('payroll', 'create'), payrolls.addPayrollItem);
  app.post('/payrolls/payroll-deduction', authenticate, checkPermission('payroll', 'edit'), payrolls.addPayrollDeduction);
  app.post('/payrolls/payroll-item/delete', authenticate, checkPermission('payroll', 'edit'), payrolls.removePayrollItem);
  app.post('/payrolls/payroll-deduction/delete', authenticate, checkPermission('payroll', 'edit'), payrolls.removePayrollDeduction);
  app.post('/payrolls/payroll/calculate-totals', authenticate, checkPermission('payroll', 'edit'), payrolls.calculateTotals);
  app.post('/payrolls/payroll/approve', authenticate, checkPermission('payroll', 'edit'), checkSubPermission('payroll', 'approve'), payrolls.approvePayroll);
  app.post('/payrolls/payroll/process', authenticate, checkPermission('payroll', 'edit'), checkSubPermission('payroll', 'process'), payrolls.processPayroll);
  app.post('/payrolls/payroll/revert', authenticate, checkPermission('payroll', 'edit'), payrolls.revertPayrollApproval);

  // Pages
  app.post('/pages', authenticate, pages.getPages);
  app.post('/pages/url', authenticate, validateUrl);

  // Stripe Payments 
  app.post('/payments/get', authenticate, payments.getPayment);
  app.post('/payments/list', authenticate, payments.listPayments);
  app.post('/payments/methods/list', authenticate, payments.listPaymentMethods);
  app.post('/payments/stripe/account', authenticate, payments.createStripeConnectedAccount);
  app.post('/payments/stripe/payment', authenticate, payments.createStripePaymentIntent);
  app.post('/payments/method/add', authenticate, payments.addPaymentMethod);
  app.post('/payments/method/remove', authenticate, payments.removePaymentMethod);
  app.post('/payments/save', authenticate, payments.savePayment);
  app.post('/payments/ach/setup-intent', authenticate, payments.createACHSetupIntentForPayment);
  app.post('/payments/ach/payment-intent', authenticate, payments.createACHPaymentIntentForPayment);
  app.post('/payments/ach/verify-bank-account', authenticate, payments.verifyACHBankAccount);
  app.post('/payments/ach/payment-methods', authenticate, payments.getCustomerACHPaymentMethods);
  app.post('/payments/ach/payment-method/attach', authenticate, payments.attachACHPaymentMethod);
  app.post('/payments/ach/payment-method/attach-verified', authenticate, payments.attachVerifiedACHPaymentMethod);
  app.post('/payments/ach/payment-method/remove', authenticate, payments.removeACHPaymentMethod);
  app.post('/payments/ach/payment/save', authenticate, payments.saveACHPayment);
  app.post('/payments/ach/payment/status', authenticate, payments.getACHPaymentStatusEndpoint);
  app.post('/payments/ach/webhook', payments.handleStripeACHWebhook);

  // Settings 
  app.get('/settings/company-types', settings.getCompanyTypes);
  app.get('/settings/states', settings.getStates);
  app.get('/settings/days', settings.getDays);
  app.get('/settings/priorities', settings.getPriorities);
  app.get('/settings/reminder-types', authenticate, settings.getReminderTypes);
  app.get('/settings/company', authenticate, settings.getCompany);
  app.post('/settings/location', authenticate, settings.getLocation);
  app.post('/settings/weather', authenticate, settings.getWeather);
  app.post('/settings/event-statuses', authenticate, settings.getEventStatuses);
  app.post('/settings/addresses', authenticate, settings.getAddresses);
  app.post('/settings/emails', authenticate, settings.getEmails);
  app.post('/settings/phone-numbers', authenticate, settings.getPhoneNumbers);
  app.post('/settings/search/address', authenticate, settings.getAddressByName);
  app.post('/settings/search/address/details', settings.getAddressDetails);
  app.post('/settings/address', authenticate, settings.createAddress);
  app.post('/settings/email', authenticate, settings.createEmail);
  app.post('/settings/phone-number', authenticate, settings.createPhoneNumber);
  app.put('/settings/address', authenticate, settings.updateAddress);
  app.put('/settings/email', authenticate, settings.updateEmail);
  app.put('/settings/reminder', authenticate, settings.updateReminder);
  app.put('/settings/phone-number', authenticate, settings.updatePhoneNumber);
  app.post('/settings/address/delete', authenticate, settings.deleteAddress);
  app.post('/settings/email/delete', authenticate, settings.deleteEmail);
  app.post('/settings/phone-number/delete', authenticate, settings.deletePhoneNumber);
  app.post('/settings/look-up/address', settings.lookUpAddress);

  // Subscriptions
  app.post('/subscriptions/subscription', authenticate, subscriptions.get);
  app.post('/subscriptions/usage', authenticate, subscriptions.getUsage);
  app.post('/subscriptions', authenticate, subscriptions.list);

  // ToDos
  app.post('/to-dos/to-do/get', authenticate, toDos.get);
  app.post('/to-dos', authenticate, toDos.list);
  app.post('/to-dos/to-do', authenticate, toDos.create);
  app.put('/to-dos/to-do/update', authenticate, toDos.update);
  app.post('/to-dos/to-do/delete', authenticate, toDos.archive);
  app.post('/to-dos/to-do/complete', authenticate, toDos.complete);
  app.post('/to-dos/to-do/item/toggle', authenticate, toDos.toggleToDoItem);
  
  // Uploads
  app.post('/uploads/client', authenticate, upload.single('qqfile'), handleFineUploaderUpload);
  app.post('/uploads/user', authenticate, upload.single('qqfile'), handleFineUploaderUpload);
  app.post('/uploads/company', authenticate, upload.single('qqfile'), handleFineUploaderUpload);
  app.post('/uploads/template', authenticate, upload.single('qqfile'), handleFineUploaderUpload);
  app.post('/uploads/import', authenticate, upload.single('qqfile'), handleFineUploaderUpload);
  app.post('/uploads/comment', authenticate, upload.single('qqfile'), handleFineUploaderUpload);
  app.post('/uploads/message', authenticate, upload.single('qqfile'), handleFineUploaderUpload);
  app.post('/uploads/text-message', authenticate, upload.single('qqfile'), handleFineUploaderUpload);
  app.post('/uploads/event', authenticate, upload.single('qqfile'), handleFineUploaderUpload);

  // Users
  app.post('/users/user/get', authenticate, checkPermission('users', 'view'), users.get);
  app.post('/users/user/reminders/reminder/get', authenticate, users.getReminder);
  app.post('/users/user/folders/folder/get', authenticate, users.getUserFolder);
  app.post('/users/user/documents/document/get', authenticate, users.getUserDocument);
  app.post('/users/user/weather/get', authenticate, users.getUserWeather);
  app.post('/users/user/pay-stub/get', authenticate, users.getUserPayStub);
  app.post('/users/user/statistics', authenticate, checkPermission('users', 'view'), users.getUserStatistics);
  app.post('/users/user/credentials/get', authenticate, users.getUserCredentials);
  app.post('/users/user/validate', validateSecurityToken);
  app.post('/users/user/password/reset', validateUser, users.resetPassword);
  app.post('/users/user/validate/email', users.sendVericationEmail);
  app.post('/users/user/password/reset/email', users.sendPasswordResetEmail);
  app.post('/users/user', authenticate, validateEmail, checkPermission('users', 'create'), users.create);
  app.post('/users/user/reminders/reminder/create', authenticate, users.createUserReminder);
  app.post('/users/user/folders/folder/create', authenticate, users.createUserFolder);
  app.post('/users/user/documents/document/create', authenticate, users.createUserDocument);
  app.post('/users/user/devices/device/token', authenticate, users.createUserDeviceToken);
  app.post('/users/user/login', users.login);
  app.post('/users/user/logout', authenticate, users.logout);
  app.post('/users', authenticate, users.list);
  app.post('/users/user/pages', authenticate, users.listPages);
  app.post('/users/user/notifications', authenticate, users.listNotifications);
  app.post('/users/user/notifications/read-notifications', authenticate, users.listReadNotifications);
  app.post('/users/user/chats/rooms', authenticate, users.listChatRooms);
  app.post('/users/user/permissions', authenticate, users.listPermissions);
  app.post('/users/user/preferences', authenticate, users.listPreferences);
  app.post('/users/user/onboarding', authenticate, users.listOnboarding);
  app.post('/users/user/groups', authenticate, users.listGroups);
  app.post('/users/user/event-types', authenticate, users.listEventTypes);
  app.post('/users/user/widgets', authenticate, users.listWidgets);
  app.post('/users/user/counts', authenticate, users.listUserCounts);
  app.post('/users/user/devices', authenticate, users.listUserDevices);
  app.post('/users/user/pay-stubs', authenticate, users.listUserPayStubs);
  app.post('/users/user/estimates', authenticate,  checkPermission('estimates', 'view'),  users.listUserEstimates);
  app.post('/users/user/estimators', authenticate,  checkPermission('estimates', 'view'),  users.listUserEstimators);
  app.post('/users/user/events', authenticate, checkPermission('events', 'view'), users.listUserEvents);
  app.post('/users/user/pay-rates', authenticate, checkPermission('payroll', 'view'), users.listUserPayRates);
  app.post('/users/user/reminders', authenticate, users.listUserReminders);
  app.post('/users/user/folders', authenticate, users.listUserFolders);
  app.post('/users/user/documents', authenticate, users.listUserDocuments);
  app.post('/users/user/restore', authenticate, checkPermission('users', 'archive'), users.restore);
  app.put('/users/user/setup', authenticate, users.setup);
  app.put('/users/user', authenticate, checkPermission('users', 'edit'),  users.update);
  app.put('/users/user/credentials/update', authenticate, users.updateUserCredentials);
  app.put('/users/user/preferences', authenticate, users.updatePreferences);
  app.put('/users/user/onboard', authenticate, users.updateOnboard);
  app.put('/users/user/permissions', authenticate, users.updateUserPermissions);
  app.put('/users/user/pay-rates/update', authenticate, checkPermission('payroll', 'edit'), users.updateUserPayRate);
  app.put('/users/user/widget', authenticate, users.updateWidget);
  app.put('/users/user/folders/folder/update', authenticate, users.updateUserFolder);
  app.put('/users/user/documents/document/update', authenticate, users.updateUserDocument);
  app.put('/users/user/widget/add', authenticate, users.addWidget);
  app.put('/users/user/pay-rates/add', authenticate, checkPermission('payroll', 'edit'), users.addUserPayRate);
  app.put('/users/user/notifications/read', authenticate, users.readNotifications);
  app.put('/users/user/notifications/notification/read', authenticate, users.readNotification);
  app.post('/users/user/delete', authenticate, checkPermission('users', 'archive'), users.deleteUser);
  app.post('/users/user/reminders/delete', authenticate, users.deleteUserReminders);
  app.post('/users/user/reminders/reminder/delete', authenticate, users.deleteUserReminder);
  app.post('/users/user/folders/folder/delete', authenticate, users.deleteUserFolder);
  app.post('/users/user/documents/document/delete', authenticate, users.deleteUserDocument);
  app.post('/users/user/widget/remove', authenticate, users.removeWidget);
  app.post('/users/user/device/remove', authenticate, users.removeDevice);
  app.post('/users/user/profile-picture/remove', authenticate, users.removeProfilePicture);
  app.post('/users/user/pay-rates/remove', authenticate, checkPermission('payroll', 'edit'), users.removeUserPayRate);
  app.post('/users/user/roles/assign', authenticate, users.assignRole);
  app.post('/users/user/permissions/assign', authenticate, users.assignPermission);

  // Widgets
  app.post('/widgets/widget/get', authenticate, widgets.getWidget);
  app.post('/widgets/widget/estimate-data', authenticate, widgets.getWidgetEstimateData);
  app.post('/widgets', authenticate, widgets.listWidgets);
  app.post('/widgets/roles', authenticate, widgets.listRoleWidgets);
  app.post('/widgets/widget/general-search', authenticate, widgets.generalSearch);
  app.post('/widgets/widget/activities', authenticate, widgets.getActivityTimeline);
  app.post('/widgets/widget/activities/activity/summary', authenticate, widgets.getActivitySummaryWidget);
  app.post('/widgets/widget/sales-overview', authenticate, widgets.getSalesOverviewWidget);
  app.post('/widgets/widget/work-orders-summary', authenticate, widgets.getWorkOrdersSummaryWidget);
  app.post('/widgets/widget/client-insights', authenticate, widgets.getClientInsightsWidget);
  app.post('/widgets/widget/upcoming-events', authenticate, widgets.getUpcomingEventsWidget);
  app.post('/widgets/widget/invoice-status', authenticate, widgets.getInvoiceStatusWidget);
  app.post('/widgets/widget/estimate-analytics', authenticate, widgets.getEstimateAnalyticsWidget);
  app.post('/widgets/widget/payroll-monthly', authenticate, widgets.getPayrollMonthlyWidget);
  app.post('/widgets/widget/payroll-monthly-expenses', authenticate, widgets.getPayrollMonthlyExpensesWidget);

  // Work Orders
  app.post('/work-orders/work-order/get', authenticate, checkPermission('work orders', 'view'), workOrders.get);
  app.post('/work-orders/work-order/purchase-orders/purchase-order/get', authenticate, checkPermission('work orders', 'view'), workOrders.getPurchaseOrder);
  app.post('/work-orders/items/item/get', authenticate, checkPermission('work orders', 'view'), workOrders.getWorkOrderLineItem);
  app.post('/work-orders', authenticate, checkPermission('work orders', 'view'), workOrders.list);
  app.post('/work-orders/work-order/purchase-orders', authenticate, checkPermission('work orders', 'view'), workOrders.listPurchaseOrders);
  app.post('/work-orders/work-order/purchase-orders/statuses', authenticate, checkPermission('work orders', 'view'), workOrders.listPurchaseOrderStatuses);
  app.post('/work-orders/statuses', authenticate, checkPermission('work orders', 'view'), workOrders.listWorkOrderStatuses);
  app.post('/work-orders/work-order/purchase-orders/purchase-order', authenticate, checkPermission('work orders', 'create'), workOrders.createPurchaseOrder);
  app.put('/work-orders/work-order', authenticate, checkPermission('work orders', 'edit'), workOrders.update);
  app.put('/work-orders/priorities', authenticate, checkPermission('work orders', 'edit'), workOrders.updateWorkOrdersPriorities);
  app.put('/work-orders/work-order/status/update', authenticate, checkPermission('work orders', 'edit'), workOrders.updateWorkOrderStatus);
  app.put('/work-orders/items/item', authenticate, checkPermission('work orders', 'edit'), workOrders.updateWorkOrderLineItem);
  app.put('/work-orders/work-order/assign', authenticate, checkPermission('work orders', 'edit'), workOrders.assignUserToWorkOrder);
  app.put('/work-orders/work-order/bulk-update', authenticate, checkPermission('work orders', 'edit'), workOrders.bulkUpdateWorkOrders);
  app.post('/work-orders/work-order/approve', authenticate, checkPermission('work orders', 'edit'), workOrders.approvePurchaseOrder);
  app.post('/work-orders/work-order/generate', authenticate, checkPermission('work orders', 'create'), workOrders.generateWorkOrder);
  app.post('/work-orders/work-order/clone', authenticate, checkPermission('work orders', 'create'), workOrders.cloneWorkOrder);
  app.post('/work-orders/work-order/delete', authenticate, checkPermission('work orders', 'archive'), workOrders.archive);
  app.post('/work-orders/items/item', authenticate, checkPermission('work orders', 'create'), workOrders.addWorkOrderLineItem);
  app.post('/work-orders/work-order/purchase-orders/items/item/add', authenticate, checkPermission('work orders', 'create'), workOrders.addItemToPurchaseOrder);
  app.post('/work-orders/work-order/purchase-orders/items/item/remove', authenticate, checkPermission('work orders', 'archive'), workOrders.removeItemFromPurchaseOrder);
  app.post('/work-orders/items/item/remove', authenticate, checkPermission('work orders', 'archive'), workOrders.removeWorkOrderLineItem);
  app.post('/work-orders/work-order/search', authenticate, checkPermission('work orders', 'view'), workOrders.searchWorkOrders);

};
