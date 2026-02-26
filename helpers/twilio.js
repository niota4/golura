const twilio = require('twilio');
const VoiceResponse = require('twilio').twiml.VoiceResponse;

const env = process.env;

const client = new twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

const sendSMS = (to, body, mediaUrls) => {
  if (!mediaUrls || !Array.isArray(mediaUrls)) {
    mediaUrls = [];
  }
  return client.messages.create({
    body: body,
    from: env.TWILIO_COMPANY_NUMBER,
    to: to,
    mediaUrl: mediaUrls
  });
};

const createConferenceCall = async (to, caller, conferenceName) => {
  try {
    // Add the first participant (e.g., the client) to the conference with recording
    const clientCall = await client.calls.create({
      to: to,
      from: env.TWILIO_COMPANY_NUMBER,
      twiml: `<Response><Dial><Conference record="record-from-start" recordingStatusCallback="${env.DOMAIN_URL}/communications/calls/recording/complete" statusCallback="${env.DOMAIN_URL}/communications/calls/conference/status">${conferenceName}</Conference></Dial></Response>`,
      statusCallback: `${env.DOMAIN_URL}/communications/calls/call/update`,
      statusCallbackEvent: ['completed']
    });

    // Add the second participant (e.g., the user) to the conference
    const userCall = await client.calls.create({
      to: caller,
      from: env.TWILIO_COMPANY_NUMBER,
      twiml: `<Response><Dial><Conference record="record-from-start" statusCallback="${env.DOMAIN_URL}/communications/calls/conference/status">${conferenceName}</Conference></Dial></Response>`,
      statusCallback: `${env.DOMAIN_URL}/communications/calls/call/update`,
      statusCallbackEvent: ['completed']
    });

    // Return the call information and conference name
    // The actual conference will be created when calls connect
    return {
      conferenceName: conferenceName,
      clientCall,
      userCall
    };
  } catch (error) {
    console.error('Error creating conference call:', error);
    throw error;
  }
};

const getConferenceBySid = async (conferenceSid) => {
  try {
    const conference = await client.conferences(conferenceSid).fetch();
    return conference;
  } catch (error) {
    console.error('Error getting conference by SID:', error);
    return null;
  }
};

const getConferenceByName = async (conferenceName) => {
  try {
    const conferences = await client.conferences.list({
      friendlyName: conferenceName,
      limit: 1
    });
    return conferences[0] || null;
  } catch (error) {
    console.error('Error getting conference by name:', error);
    return null;
  }
};

const endConferenceCall = async (conferenceSid) => {
  try {
    const conference = await client.conferences(conferenceSid).update({
      status: 'completed'
    });
    return conference;
  } catch (error) {
    console.error('Error ending conference call:', error);
    throw error;
  }
};

const muteConferenceParticipant = async (conferenceSid, participantSid, muted) => {
  try {
    const participant = await client.conferences(conferenceSid)
      .participants(participantSid)
      .update({ muted: muted });
    return participant;
  } catch (error) {
    console.error('Error muting participant:', error);
    throw error;
  }
};

const holdConferenceParticipant = async (conferenceSid, participantSid, onHold) => {
  try {
    const participant = await client.conferences(conferenceSid)
      .participants(participantSid)
      .update({ hold: onHold });
    return participant;
  } catch (error) {
    console.error('Error holding participant:', error);
    throw error;
  }
};

const sendDTMFToParticipant = async (conferenceSid, participantSid, digit) => {
  try {
    const result = await client.conferences(conferenceSid)
      .participants(participantSid)
      .update({ digits: digit });
    return result;
  } catch (error) {
    console.error('Error sending DTMF:', error);
    throw error;
  }
};

const getConferenceParticipants = async (conferenceSid) => {
  try {
    const participants = await client.conferences(conferenceSid)
      .participants
      .list();
    return participants;
  } catch (error) {
    console.error('Error getting conference participants:', error);
    throw error;
  }
};

// Phone Number Management Functions
const searchAvailablePhoneNumbers = async (options = {}) => {
  try {
    const {
      areaCode,
      contains,
      nearLatLong,
      nearNumber,
      distance = 25,
      inRegion,
      inPostalCode,
      inLocality,
      inLata,
      inRateCenter,
      limit = 20
    } = options;

    const searchParams = {
      limit,
      voiceEnabled: true,
      smsEnabled: true,
      mmsEnabled: true,
      faxEnabled: true
    };

    // Add optional search parameters
    if (areaCode) searchParams.areaCode = areaCode;
    if (contains) searchParams.contains = contains;
    if (nearLatLong) searchParams.nearLatLong = nearLatLong;
    if (nearNumber) searchParams.nearNumber = nearNumber;
    if (distance !== 25) searchParams.distance = distance;
    if (inRegion) searchParams.inRegion = inRegion;
    if (inPostalCode) searchParams.inPostalCode = inPostalCode;
    if (inLocality) searchParams.inLocality = inLocality;
    if (inLata) searchParams.inLata = inLata;
    if (inRateCenter) searchParams.inRateCenter = inRateCenter;

    const phoneNumbers = await client.availablePhoneNumbers('US')
      .local
      .list(searchParams);

    return phoneNumbers.map(number => ({
      phoneNumber: number.phoneNumber,
      friendlyName: number.friendlyName,
      locality: number.locality,
      region: number.region,
      postalCode: number.postalCode,
      isoCountry: number.isoCountry,
      capabilities: {
        voice: number.capabilities.voice,
        sms: number.capabilities.sms,
        mms: number.capabilities.mms,
        fax: number.capabilities.fax
      }
    }));
  } catch (error) {
    console.error('Error searching available phone numbers:', error);
    throw error;
  }
};

const purchasePhoneNumber = async (phoneNumber, options = {}) => {
  try {
    const {
      friendlyName,
      voiceUrl,
      voiceMethod = 'POST',
      smsUrl,
      smsMethod = 'POST',
      statusCallback,
      statusCallbackMethod = 'POST'
    } = options;

    const purchaseParams = {
      phoneNumber,
      voiceUrl: voiceUrl || `${env.DOMAIN_URL}/communications/voice/incoming`,
      voiceMethod,
      smsUrl: smsUrl || `${env.DOMAIN_URL}/communications/sms/incoming`,
      smsMethod,
      statusCallback: statusCallback || `${env.DOMAIN_URL}/communications/phone/status`,
      statusCallbackMethod
    };

    if (friendlyName) purchaseParams.friendlyName = friendlyName;

    const purchasedNumber = await client.incomingPhoneNumbers.create(purchaseParams);

    return {
      sid: purchasedNumber.sid,
      phoneNumber: purchasedNumber.phoneNumber,
      friendlyName: purchasedNumber.friendlyName,
      capabilities: {
        voice: purchasedNumber.capabilities.voice,
        sms: purchasedNumber.capabilities.sms,
        mms: purchasedNumber.capabilities.mms,
        fax: purchasedNumber.capabilities.fax
      },
      voiceUrl: purchasedNumber.voiceUrl,
      smsUrl: purchasedNumber.smsUrl,
      statusCallback: purchasedNumber.statusCallback
    };
  } catch (error) {
    console.error('Error purchasing phone number:', error);
    throw error;
  }
};

const releasePhoneNumber = async (phoneNumberSid) => {
  try {
    const result = await client.incomingPhoneNumbers(phoneNumberSid).remove();
    return result;
  } catch (error) {
    console.error('Error releasing phone number:', error);
    throw error;
  }
};

const updatePhoneNumber = async (phoneNumberSid, options = {}) => {
  try {
    const {
      friendlyName,
      voiceUrl,
      voiceMethod,
      smsUrl,
      smsMethod,
      statusCallback,
      statusCallbackMethod
    } = options;

    const updateParams = {};
    if (friendlyName !== undefined) updateParams.friendlyName = friendlyName;
    if (voiceUrl !== undefined) updateParams.voiceUrl = voiceUrl;
    if (voiceMethod !== undefined) updateParams.voiceMethod = voiceMethod;
    if (smsUrl !== undefined) updateParams.smsUrl = smsUrl;
    if (smsMethod !== undefined) updateParams.smsMethod = smsMethod;
    if (statusCallback !== undefined) updateParams.statusCallback = statusCallback;
    if (statusCallbackMethod !== undefined) updateParams.statusCallbackMethod = statusCallbackMethod;

    const updatedNumber = await client.incomingPhoneNumbers(phoneNumberSid).update(updateParams);
    return updatedNumber;
  } catch (error) {
    console.error('Error updating phone number:', error);
    throw error;
  }
};

const getPhoneNumber = async (phoneNumberSid) => {
  try {
    const phoneNumber = await client.incomingPhoneNumbers(phoneNumberSid).fetch();
    return {
      sid: phoneNumber.sid,
      phoneNumber: phoneNumber.phoneNumber,
      friendlyName: phoneNumber.friendlyName,
      capabilities: phoneNumber.capabilities,
      voiceUrl: phoneNumber.voiceUrl,
      smsUrl: phoneNumber.smsUrl,
      statusCallback: phoneNumber.statusCallback
    };
  } catch (error) {
    console.error('Error getting phone number:', error);
    throw error;
  }
};

const listOwnedPhoneNumbers = async () => {
  try {
    const phoneNumbers = await client.incomingPhoneNumbers.list();
    return phoneNumbers.map(number => ({
      sid: number.sid,
      phoneNumber: number.phoneNumber,
      friendlyName: number.friendlyName,
      capabilities: number.capabilities,
      voiceUrl: number.voiceUrl,
      smsUrl: number.smsUrl,
      statusCallback: number.statusCallback
    }));
  } catch (error) {
    console.error('Error listing owned phone numbers:', error);
    throw error;
  }
};

module.exports = {
  sendSMS,
  createConferenceCall,
  getConferenceBySid,
  getConferenceByName,
  endConferenceCall,
  muteConferenceParticipant,
  holdConferenceParticipant,
  sendDTMFToParticipant,
  getConferenceParticipants,
  searchAvailablePhoneNumbers,
  purchasePhoneNumber,
  releasePhoneNumber,
  updatePhoneNumber,
  getPhoneNumber,
  listOwnedPhoneNumbers
};