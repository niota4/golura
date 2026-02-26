const _ = require('lodash');
const { 
    TextMessage,
    Email, 
    Client, 
    ClientEmail,
    ClientPhoneNumber,
    Estimate, 
    Event, 
    WorkOrder, 
    Invoice, 
    User,
    UserPreference,
    PhoneNumber,
    PhoneCall,
    Priority
} = require('../models');
const { getCommunicationNotificationUsers, sendNotificationsToUsers } = require('../helpers/notificationHelpers');
const { 
    sendSMS, 
    createConferenceCall, 
    getConferenceBySid, 
    getConferenceByName,
    endConferenceCall,
    muteConferenceParticipant,
    holdConferenceParticipant,
    sendDTMFToParticipant,
    getConferenceParticipants
} = require('../helpers/twilio');
const { sendEmail } = require('../helpers/mailGun');
const { mode } = require('mathjs');
const { event } = require('jquery');

const listTextMessages = async (req, res) => {
    const { clientId } = req.body;

    try {
        const textMessages = await TextMessage.findAll({
            where: { clientId },
            include: [
                { 
                    model: Client, 
                    as: 'Client',
                    include: [
                        {
                            model: ClientPhoneNumber,
                            as: 'ClientPhoneNumbers',
                            attributes: ['id', 'number', 'type', 'title', 'isPrimary']
                        }
                    ]
                },
                { model: Estimate, as: 'Estimate' },
                { model: Event, as: 'Event'},
                { model: WorkOrder, as: 'WorkOrder'},
                { model: Invoice, as: 'Invoice'},
                { 
                    model: User, 
                    as: 'Creator', 
                    attributes: ['id', 'email', 'firstName', 'lastName', 'roleId', 'profilePictureUrl', 'phoneNumber', 'lastSeen', 'isActive'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ]
                }
            ],
        });

        // Add the phone number information to each text message
        const enrichedTextMessages = await Promise.all(textMessages.map(async (textMessage) => {
            const textMessageData = textMessage.toJSON();
            
            // Find the phone number based on phoneNumberId
            if (textMessageData.clientId && textMessageData.Client && textMessageData.Client.ClientPhoneNumbers) {
                const phoneNumber = textMessageData.Client.ClientPhoneNumbers.find(pn => pn.id === textMessageData.phoneNumberId);
                textMessageData.PhoneNumber = phoneNumber || null;
            } else if (!textMessageData.clientId && textMessageData.phoneNumberId) {
                // Get phone number from global PhoneNumbers table
                const globalPhoneNumber = await PhoneNumber.findByPk(textMessageData.phoneNumberId, {
                    attributes: ['id', 'number', 'type', 'title']
                });
                textMessageData.PhoneNumber = globalPhoneNumber ? globalPhoneNumber.toJSON() : null;
            } else {
                textMessageData.PhoneNumber = null;
            }
            
            return textMessageData;
        }));

        res.status(200).json({
            err: false,
            msg: 'Text messages successfully retrieved',
            textMessages: enrichedTextMessages,
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message,
        });
    }
};
const listEmails = async (req, res) => {
    const { clientId } = req.body;
    try {
        const emails = await Email.findAll({
            where: { clientId },
            include: [
                { model: User, as: 'Creator', attributes: ['id', 'firstName', 'lastName'] },
            ],
        });
        res.status(200).json({
            err: false,
            msg: 'Emails successfully retrieved',
            emails,
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message,
        });
    }
};
const listPhoneCalls = async (req, res) => {
    const { clientId } = req.body;
    try {
        const calls = await PhoneCall.findAll({
            where: { clientId },
            include: [
                { model: Client, as: 'Client' },
                { model: User, as: 'Creator', attributes: ['id', 'firstName', 'lastName'] },
                { model: ClientPhoneNumber, as: 'PhoneNumber' }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({
            err: false,
            msg: 'Phone calls successfully retrieved',
            calls,
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message,
        });
    }
};
const getTextMessage = async (req, res) => {
    const { id } = req.body;

    try {
        const textMessage = await TextMessage.findByPk(id, {
            include: [
                { 
                    model: Client, 
                    as: 'Client',
                    include: [
                        {
                            model: ClientPhoneNumber,
                            as: 'ClientPhoneNumbers',
                            attributes: ['id', 'number', 'type', 'title', 'isPrimary']
                        }
                    ]
                },
                { model: Estimate, as: 'Estimate' },
                { model: Event, as: 'Event'},
                { model: WorkOrder, as: 'WorkOrder'},
                { model: Invoice, as: 'Invoice'},
                { 
                    model: User, 
                    as: 'Creator', 
                    attributes: ['id', 'email', 'firstName', 'lastName', 'roleId', 'profilePictureUrl', 'phoneNumber', 'lastSeen', 'isActive'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ]
                }
            ],
        });

        if (!textMessage) {
            return res.status(404).json({
                err: true,
                msg: 'Text message not found',
            });
        }

        const textMessageData = textMessage.toJSON();
        
        // Find the phone number based on phoneNumberId
        if (textMessageData.clientId && textMessageData.Client && textMessageData.Client.ClientPhoneNumbers) {
            const phoneNumber = textMessageData.Client.ClientPhoneNumbers.find(pn => pn.id === textMessageData.phoneNumberId);
            textMessageData.PhoneNumber = phoneNumber || null;
        } else if (!textMessageData.clientId && textMessageData.phoneNumberId) {
            // Get phone number from global PhoneNumbers table
            const globalPhoneNumber = await PhoneNumber.findByPk(textMessageData.phoneNumberId, {
                attributes: ['id', 'number', 'type', 'title']
            });
            textMessageData.PhoneNumber = globalPhoneNumber ? globalPhoneNumber.toJSON() : null;
        } else {
            textMessageData.PhoneNumber = null;
        }

        res.status(200).json({
            err: false,
            msg: 'Text message successfully retrieved',
            textMessage: textMessageData,
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message,
        });
    }
};
const getEmail = async (req, res) => {
    const { id } = req.body;
    try {
        const email = await Email.findByPk(id, {
            include: [
                { model: User, as: 'Creator', attributes: ['id', 'firstName', 'lastName'] },
            ],
        });
        if (!email) {
            return res.status(404).json({
                err: true,
                msg: 'Email not found',
            });
        }
        res.status(200).json({
            err: false,
            msg: 'Email successfully retrieved',
            email,
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message,
        });
    }
};
const createTextMessage = async (req, res) => {
    const { clientId, phoneNumberId, message, estimateId, eventId, workOrderId, invoiceId, mediaUrls } = req.body;

    try {

        let phoneNumber;

        if (!phoneNumberId) {
            return res.status(400).json({
                err: true,
                msg: 'Phone number is required',
            });
        }

        // Convert phoneNumberId to integer for proper comparison
        const parsedPhoneNumberId = parseInt(phoneNumberId);
        if (clientId) {
            const client = await Client.findByPk(clientId,
                {
                    model: Client,
                    include: [
                        {
                            model: ClientPhoneNumber,
                            as: 'ClientPhoneNumbers',
                            where: { id: parsedPhoneNumberId },
                            required: true,
                        },
                    ],
                }
            );
            if (!client) {
                return res.status(404).json({
                    err: true,
                    msg: 'Client not found',
                });
            }
            // find client's phone number by the id by searching through the client.PhoneNumbers
            const phoneNumbers = client.ClientPhoneNumbers;
            console.log('Client Phone Numbers:', phoneNumbers);
            console.log('Looking for phoneNumberId:', parsedPhoneNumberId, 'Type:', typeof parsedPhoneNumberId);
            phoneNumber = phoneNumbers.find(pn => pn.id === parsedPhoneNumberId)?.number;
            console.log('Phone number found:', phoneNumber);
            if (!phoneNumber) {
                return res.status(404).json({
                    err: true,
                    msg: 'Phone number not found for the client',
                });
            }
        } else {
            globalPhoneNumber = await PhoneNumber.findByPk(parsedPhoneNumberId);
            if (!globalPhoneNumber) {
                return res.status(404).json({
                    err: true,
                    msg: 'Phone number not found',
                });
            }
            phoneNumber = globalPhoneNumber.number;
        }

        const response = await sendSMS(phoneNumber, message, mediaUrls);
        if (!response || !response.sid) {
            return res.status(400).json({
                err: true,
                msg: 'Failed to send text message',
            });
        }
        const textMessage = await TextMessage.create({
            clientId,
            sid: response.sid,
            phoneNumberId: parsedPhoneNumberId,
            message,
            media: mediaUrls ? JSON.stringify(mediaUrls) : null,
            status: 'Pending',
            estimateId,
            eventId,
            workOrderId,
            invoiceId,
            createdBy: req.userId,
            createdAt: new Date(),
        });
        await textMessage.update({ status: 'Sent', sentAt: new Date() });

        // Create notifications for new text message from client
        try {
            if (clientId) {
                const usersToNotify = await getCommunicationNotificationUsers(req.companyId, clientId);
                const priority = await Priority.findOne({ where: { name: 'medium' } }) || { id: 2 };
                const client = await Client.findByPk(clientId);
                const clientName = client ? `${client.firstName} ${client.lastName}` : 'Client';
                
                // Only notify if this is an incoming message from a client (not outgoing from staff)
                const sender = await User.findByPk(req.userId);
                if (!sender || sender.companyId !== req.companyId) {
                    const messagePreview = message.length > 50 ? message.substring(0, 50) + '...' : message;
                    const notificationMessage = `New text message from ${clientName}: "${messagePreview}"`;
                    
                    await sendNotificationsToUsers(
                        usersToNotify,
                        {
                            userId: req.userId || null,
                            relatedModel: 'textMessages',
                            relatedModelId: textMessage.id,
                            priorityId: priority.id,
                            title: 'New Text Message',
                            message: notificationMessage,
                            type: 'general'
                        }
                    );
                }
            }
        } catch (notificationError) {
            console.error('Error creating text message notifications:', notificationError);
        }

        res.status(201).json({
            err: false,
            msg: 'Text message successfully sent',
            textMessage,
            twilioResponse: response,
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message,
        });
    }
};
const createEmail = async (req, res) => {
    const {
        clientId, 
        eventId,
        workOrderId,
        estimateId,
        invoiceId,
        emailId,  
        subject, 
        templateId,
        message
    } = req.body;    

    try {
        if (!emailId || !subject || !message.length) {
            return res.status(400).json({
                err: true,
                msg: 'Email, subject and body are required',
            });
        };
        if (clientId) {
            const client = await Client.findByPk(clientId,{
                include: [
                    {
                        model: ClientEmail,
                        as: 'ClientEmails',
                        where: { id: emailId },
                        required: true,
                    },
                ],
            });
            if (!client) {
                return res.status(404).json({
                    err: true,
                    msg: 'Client not found',
                });
            }
            // Ensure the email is associated with the client
            const clientEmail = client.ClientEmails.find(email => email.id === emailId);

            if (!clientEmail) {
                return res.status(404).json({
                    err: true,
                    msg: 'Email not found for the client',
                });
            }
            to = clientEmail.email;
        } else {
            const email = await Email.findByPk(emailId);
            if (!email) {
                return res.status(404).json({
                    err: true,
                    msg: 'Email not found',
                });
            }
            to = email.email;
        }
        await sendEmail('getgolura@gmail.com', subject, templateId, message);

        const email = await Email.create({
            clientId,
            subject,
            templateId,
            message,
            estimateId,
            eventId,
            workOrderId,
            invoiceId,
            to,
            emailId: emailId,
            sentAt: new Date(),
            createdBy: req.userId,
            createdAt: new Date(),
        });

        // Create notifications for new email from client
        try {
            if (clientId) {
                const usersToNotify = await getCommunicationNotificationUsers(req.companyId, clientId);
                const priority = await Priority.findOne({ where: { name: 'medium' } }) || { id: 2 };
                const client = await Client.findByPk(clientId);
                const clientName = client ? `${client.firstName} ${client.lastName}` : 'Client';
                
                // Only notify if this is an incoming email from a client (not outgoing from staff)
                const sender = await User.findByPk(req.userId);
                if (!sender || sender.companyId !== req.companyId) {
                    const notificationMessage = `New email from ${clientName}: "${subject}"`;
                    
                    await sendNotificationsToUsers(
                        usersToNotify,
                        {
                            userId: req.userId || null,
                            relatedModel: 'emails',
                            relatedModelId: email.id,
                            priorityId: priority.id,
                            title: 'New Email',
                            message: notificationMessage,
                            type: 'general'
                        }
                    );
                }
            }
        } catch (notificationError) {
            console.error('Error creating email notifications:', notificationError);
        }

        res.status(200).json({
            err: false,
            msg: 'Email successfully sent',
            email,
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message,
        });
    }
};
const createCall = async (req, res) => {
    const { 
        clientId, 
        phoneNumberId, 
        estimateId, 
        eventId, 
        workOrderId, 
        invoiceId 
    } = req.body;

    try {
        let phoneNumber = null;

        if (!phoneNumberId) {
            return res.status(400).json({
                err: true,
                msg: 'Phone number is required',
            });
        }

        if (clientId) {
            const client = await Client.findByPk(clientId, {
                include: [
                    {
                        model: ClientPhoneNumber,
                        as: 'ClientPhoneNumbers',
                        where: { id: phoneNumberId },
                        required: true,
                    },
                ],
            });

            if (!client) {
                return res.status(404).json({
                    err: true,
                    msg: 'Client not found',
                });
            }

            const phoneNumbers = client.ClientPhoneNumbers;
            phoneNumber = phoneNumbers.find(pn => pn.id === phoneNumberId)?.number;

            if (!phoneNumber) {
                return res.status(404).json({
                    err: true,
                    msg: 'Phone number not found for the client',
                });
            }
        } else {
            const globalPhoneNumber = await PhoneNumber.findByPk(phoneNumberId);

            if (!globalPhoneNumber) {
                return res.status(404).json({
                    err: true,
                    msg: 'Phone number not found',
                });
            }

            phoneNumber = globalPhoneNumber.number;
        }

        const user = await User.findByPk(req.userId);

        if (!user || !user.phoneNumber) {
            return res.status(400).json({
                err: true,
                msg: 'User does not have a valid phone number',
            });
        }

        // Make the call using Twilio
        const twilioResponse = await createConferenceCall(phoneNumber, user.phoneNumber, `CONF-${Date.now()}`);

        console.log('Twilio Response:', twilioResponse);
        // Check if the call was successfully initiated
        if (!twilioResponse || !twilioResponse.clientCall || !twilioResponse.userCall) {
            return res.status(400).json({
                err: true,
                msg: 'Failed to call',
            });
        }
        // Create new PhoneCall records in for the client and the userthe database
        const call = await PhoneCall.create({
            clientId,
            sid: twilioResponse.clientCall.sid,
            phoneNumberId,
            userPhoneNumber: user.phoneNumber,
            conferenceName: twilioResponse.conferenceName,
            status: 'In Progress',
            estimateId,
            eventId,
            workOrderId,
            invoiceId,
            duration: null, // Duration will be updated when the call ends
            startedAt: new Date(),
            createdBy: req.userId,
        });

        res.status(201).json({
            err: false,
            msg: 'Call successfully created. Please wait for the call to connect.',
            call,
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message,
        });
    }
};
const updateCall = async (req, res) => {
    const { CallSid, CallStatus } = req.body;

    try {
        const call = await PhoneCall.findOne({ where: { sid: CallSid } });

        if (!call) {
            return res.status(404).json({
                err: true,
                msg: 'Call not found'
            });
        }

        await call.update({ status: CallStatus });

        res.status(200).json({
            err: false,
            msg: 'Call status successfully updated',
            call
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const updateCallRecording = async (req, res) => {
    const { 
        ConferenceSid, 
        RecordingSid, 
        RecordingUrl, 
        RecordingDuration,
        CallSid 
    } = req.body;

    console.log('Recording webhook received:', { ConferenceSid, RecordingSid, RecordingUrl, RecordingDuration, CallSid });

    try {
        // Find the call by call SID first
        let call = await PhoneCall.findOne({ 
            where: { 
                sid: CallSid 
            } 
        });

        // If not found by CallSid, try to find by conference SID or name
        if (!call && ConferenceSid) {
            // Try to get conference details by SID
            const conference = await getConferenceBySid(ConferenceSid);
            if (conference && conference.friendlyName) {
                console.log('Found conference by SID:', conference.friendlyName);
                call = await PhoneCall.findOne({
                    where: {
                        conferenceName: conference.friendlyName
                    }
                });
            }
            
            // If still not found, try to find by conference SID directly
            if (!call) {
                call = await PhoneCall.findOne({
                    where: {
                        conferenceSid: ConferenceSid
                    }
                });
            }
        }

        if (!call) {
            console.log('Call not found for recording webhook. CallSid:', CallSid, 'ConferenceSid:', ConferenceSid);
            return res.status(404).json({
                err: true,
                msg: 'Call not found'
            });
        }

        // Update call with recording information
        await call.update({ 
            conferenceSid: ConferenceSid,
            recordingSid: RecordingSid,
            recordingUrl: RecordingUrl,
            duration: RecordingDuration ? parseInt(RecordingDuration) : null,
            endedAt: new Date()
        });

        console.log(`Call recording completed for call ${call.id}: ${RecordingUrl}`);

        res.status(200).json({
            err: false,
            msg: 'Call recording information updated successfully',
            call
        });
    } catch (err) {
        console.error('Error updating call recording:', err);
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const updateConferenceStatus = async (req, res) => {
    const { 
        ConferenceSid, 
        ConferenceFriendlyName,
        StatusCallbackEvent,
        Timestamp
    } = req.body;

    console.log('Conference webhook received:', { ConferenceSid, ConferenceFriendlyName, StatusCallbackEvent, Timestamp });

    try {
        if (StatusCallbackEvent === 'conference-start' && ConferenceSid && ConferenceFriendlyName) {
            // Update all calls in this conference with the ConferenceSid
            await PhoneCall.update(
                { conferenceSid: ConferenceSid },
                { 
                    where: { 
                        conferenceName: ConferenceFriendlyName,
                        conferenceSid: null
                    } 
                }
            );
        }

        res.status(200).json({
            err: false,
            msg: 'Conference status updated successfully'
        });
    } catch (err) {
        console.error('Error updating conference status:', err);
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};

const endCall = async (req, res) => {
    const { callId } = req.body;

    try {
        const call = await PhoneCall.findByPk(callId);
        if (!call) {
            return res.status(404).json({
                err: true,
                msg: 'Call not found'
            });
        }

        // End the conference call
        if (call.conferenceSid) {
            await endConferenceCall(call.conferenceSid);
        }

        // Update call status
        await call.update({ 
            status: 'Completed',
            endedAt: new Date()
        });

        res.status(200).json({
            err: false,
            msg: 'Call ended successfully',
            call
        });
    } catch (err) {
        console.error('Error ending call:', err);
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};

const muteCall = async (req, res) => {
    const { callId, muted } = req.body;

    try {
        const call = await PhoneCall.findByPk(callId);
        if (!call) {
            return res.status(404).json({
                err: true,
                msg: 'Call not found'
            });
        }

        if (!call.conferenceSid) {
            return res.status(400).json({
                err: true,
                msg: 'No active conference for this call'
            });
        }

        // Get conference participants
        const participants = await getConferenceParticipants(call.conferenceSid);
        
        // Find the user's participant (the one that's not the client)
        // This is a simplification - in production you'd want to track participant SIDs
        const userParticipant = participants.find(p => p.callSid !== call.sid);
        
        if (userParticipant) {
            await muteConferenceParticipant(call.conferenceSid, userParticipant.callSid, muted);
        }

        res.status(200).json({
            err: false,
            msg: muted ? 'Call muted successfully' : 'Call unmuted successfully'
        });
    } catch (err) {
        console.error('Error muting call:', err);
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};

const holdCall = async (req, res) => {
    const { callId, onHold } = req.body;

    try {
        const call = await PhoneCall.findByPk(callId);
        if (!call) {
            return res.status(404).json({
                err: true,
                msg: 'Call not found'
            });
        }

        if (!call.conferenceSid) {
            return res.status(400).json({
                err: true,
                msg: 'No active conference for this call'
            });
        }

        // Get conference participants
        const participants = await getConferenceParticipants(call.conferenceSid);
        
        // Find the client's participant
        const clientParticipant = participants.find(p => p.callSid === call.sid);
        
        if (clientParticipant) {
            await holdConferenceParticipant(call.conferenceSid, clientParticipant.callSid, onHold);
        }

        res.status(200).json({
            err: false,
            msg: onHold ? 'Call placed on hold' : 'Call resumed from hold'
        });
    } catch (err) {
        console.error('Error holding call:', err);
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};

const sendDTMF = async (req, res) => {
    const { callId, digit } = req.body;

    try {
        const call = await PhoneCall.findByPk(callId);
        if (!call) {
            return res.status(404).json({
                err: true,
                msg: 'Call not found'
            });
        }

        if (!call.conferenceSid) {
            return res.status(400).json({
                err: true,
                msg: 'No active conference for this call'
            });
        }

        // Get conference participants
        const participants = await getConferenceParticipants(call.conferenceSid);
        
        // Find the client's participant to send DTMF to
        const clientParticipant = participants.find(p => p.callSid === call.sid);
        
        if (clientParticipant) {
            await sendDTMFToParticipant(call.conferenceSid, clientParticipant.callSid, digit);
        }

        res.status(200).json({
            err: false,
            msg: `DTMF digit ${digit} sent successfully`
        });
    } catch (err) {
        console.error('Error sending DTMF:', err);
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};

const getCallStatus = async (req, res) => {
    const { callId } = req.body;

    try {
        const call = await PhoneCall.findByPk(callId, {
            include: [
                { model: Client, as: 'Client' },
                { model: User, as: 'Creator' }
            ]
        });

        if (!call) {
            return res.status(404).json({
                err: true,
                msg: 'Call not found'
            });
        }

        res.status(200).json({
            err: false,
            msg: 'Call status retrieved successfully',
            call
        });
    } catch (err) {
        console.error('Error getting call status:', err);
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};

module.exports = {
    getTextMessage,
    getEmail,
    listTextMessages,
    listEmails,
    listPhoneCalls,
    createTextMessage,
    createEmail,
    createCall,
    updateCall,
    updateCallRecording,
    updateConferenceStatus,
    endCall,
    muteCall,
    holdCall,
    sendDTMF,
    getCallStatus,
};
