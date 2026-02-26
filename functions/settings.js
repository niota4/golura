const {
    State,
    Day,
    Priority,
    Address,
    Email,
    EmailAddress,
    PhoneNumber,
    ReminderType,
    Reminder,
    EventStatus,
    Client,
    ClientAddress,
    ClientEmail,
    ClientNote,
    ClientPhoneNumber,
    Company,
    CompanyType,
    Image,
    Video,
    Document,
    Event,
    Estimate,
    Marketing

} = require('../models');
const env = process.env;
const IP_API_URL = 'http://ip-api.com/json';
const GOOGLE_GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const GOOGLE_PLACES_AUTOCOMPLETE_API_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';

const { getWeatherByIP, getWeatherByLatLong } = require('../helpers/weather');
const { MeiliSearch } = require('meilisearch');
const meiliClient = new MeiliSearch({
  host: env.MEILI_HOST,
  apiKey: env.MEILI_API_KEY
});
const { Op } = require('sequelize');

const getCompany = async (req, res) => {
    try {
        const company = await Company.findByPk(res.companyId, {
            attributes: ['name', 'street1', 'street2', 'city', 'stateId', 'zipCode', 'latitude', 'longitude', 'logoUrl', 'primaryColor', 'secondaryColor', 'tertiaryColor', 'timezone', 'goEsti'],
        });

        if (!company) {
            return res.status(404).json({
                err: true,
                msg: 'Company not found'
            });
        }

        return res.status(200).json({
            err: false,
            msg: 'Company retrieved successfully',
            company
        });
    } catch (err) {
        console.error('Error fetching company:', err.message);
        return res.status(500).json({
            err: true,
            msg: 'Failed to retrieve company'
        });
    }
}
const getWeather = async (req, res) => {
    try {
        const { ip, latitude, longitude } = req.body;

        if (ip) {
            const weatherData = await getWeatherByIP(ip);
            return res.status(200).json({
                err: false,
                msg: 'Weather data successfully retrieved by IP',
                weather: weatherData
            });
        } else if (latitude && longitude) {
            const weatherData = await getWeatherByLatLong(latitude, longitude);
            return res.status(200).json({
                err: false,
                msg: 'Weather data successfully retrieved by latitude and longitude',
                weather: weatherData
            });
        } else {
            return res.status(400).json({
                err: true,
                msg: 'Please provide either an IP address or latitude and longitude'
            });
        }
    } catch (err) {
        console.error('Error fetching weather data:', err.message);
        return res.status(500).json({
            err: true,
            msg: 'Failed to retrieve weather data'
        });
    }
}
const getLocation = async (req, res) => {
    const { ip, latitude, longitude } = req.body;
    let lat = latitude;
    let lon = longitude;

    try {
        // If latitude and longitude are not provided, fetch them using the IP address
        if (!lat || !lon) {
            const ipAddress = ip || req.ip || req.connection.remoteAddress;
            const ipResponse = await fetch(`${IP_API_URL}/${ipAddress}`);
            if (!ipResponse.ok) {
                console.error('Failed to fetch location data from IP address:', ipResponse.statusText);
                return res.status(400).json({
                    err: true,
                    msg: 'Failed to fetch location data from IP address'
                });
            }
            const ipData = await ipResponse.json();
            lat = ipData.lat;
            lon = ipData.lon;

            if (!lat || !lon) {
                return res.status(400).json({
                    err: true,
                    msg: 'Failed to retrieve latitude and longitude from IP address'
                });
            }
        }

        // Fetch location details using Google Geocoding API
        const locationResponse = await fetch(`${GOOGLE_GEOCODING_API_URL}?latlng=${lat},${lon}&key=${env.GOOGLE_API_KEY}`);
        if (!locationResponse.ok) {
            return res.status(400).json({
                err: true,
                msg: 'Failed to fetch location details from Google Places'
            });
        }
        const locationData = await locationResponse.json();

        // Check if location data is available
        if (!locationData.results || locationData.results.length === 0) {
            return res.status(400).json({
                err: true,
                msg: 'No location data found for the provided latitude and longitude'
            });
        }
        const states = await State.findAll();

        // Extract all address components
        const location = {};
        locationData.results[0].address_components.forEach(component => {
            component.types.forEach(type => {
                switch (type) {
                    case 'street_number':
                        location.street1 = component.long_name;
                        break;
                    case 'route':
                        location.street1 += ' ' +  component.long_name;
                        break;
                    case 'locality':
                        location.city = component.long_name;
                        break;
                    case 'administrative_area_level_1':
                        const state = states.find(s => s.abbreviation === component.short_name);
                        if (state) {
                            location.State = state;
                            location.stateId = state.id;
                        } else {
                            location.state = component.short_name;
                        }
                        break;
                    case 'administrative_area_level_2':
                    case 'postal_code':
                        location.zipCode = component.long_name;
                        break;
                    case 'country':
                        location.country = component.long_name;
                        location.countryAbbreviation = component.short_name;
                        break;
                }
            });
        });

        location.latitude = lat;
        location.longitude = lon;

        // Construct the response
        return res.status(200).json({
            err: false,
            msg: 'Location successfully retrieved',
            location
        });
    } catch (error) {
        console.error('Error fetching location:', error.message);
        return res.status(500).json({
            err: true,
            msg: 'Failed to retrieve location data'
        });
    }
};
const getStates = async (req, res) => {
    try {
        const states = await State.findAll();
        if (states) {
            res.status(201)
                .json({
                    err: false,
                    msg: 'States successfully retrieved',
                    states: states
                });
        }
        else {
            res.json({
                err: true,
                msg: 'States not found'
            });
        }
    }
    catch (err) {
        res.json({
            err: true,
            msg: err.message
        });
    }
};
const getDays = async (req, res) => {
    try {
        const days = await Day.findAll();
        if (days) {
            res.status(201)
                .json({
                    err: false,
                    msg: 'Days successfully retrieved',
                    days: days
                });
        }
        else {
            res.json({
                err: true,
                msg: 'Days not found'
            });
        }
    }
    catch (err) {
        res.json({
            err: true,
            msg: err.message
        });
    }
};
const getPriorities = async (req, res) => {
    try {
        const priorities = await Priority.findAll();
        if (priorities) {
            res.status(201)
                .json({
                    err: false,
                    msg: 'Priorities successfully retrieved',
                    priorities: priorities
                });
        }
        else {
            res.json({
                err: true,
                msg: 'Priorities not found'
            });
        }
    }
    catch (err) {
        res.json({
            err: true,
            msg: err.message
        });
    }
};
const getReminderTypes = async (req, res) => {
    try {
        // Fetch all reminder types from the 'reminderTypes' table
        const reminderTypes = await ReminderType.findAll();
        
        if (!reminderTypes || reminderTypes.length === 0) {
            return res.status(404).json({
                err: true,
                msg: 'No reminder types found'
            });
        }

        return res.status(200).json({
            err: false,
            msg: 'Reminder types successfully retrieved',
            reminderTypes
        });
    } catch (error) {
        console.error('Error fetching reminder types:', error);
        return res.status(500).json({
            err: true,
            msg: 'Failed to retrieve reminder types'
        });
    }
};
const getCompanyTypes = async (req, res) => {
    try {
        const companyTypes = await CompanyType.findAll({
            where: { isActive: true },
            order: [['name', 'ASC']],
        });
        res.status(200).json({
            err: false,
            msg: 'Company types successfully retrieved',
            companyTypes: companyTypes
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message
        });
    }
};
const getEventStatuses = async (req, res) => {
    try {
        // Fetch all reminder types from the 'reminderTypes' table
        const eventStatuses = await EventStatus.findAll();
        
        if (!eventStatuses || eventStatuses.length === 0) {
            return res.status(404).json({
                err: true,
                msg: 'No Event statuses found'
            });
        }

        return res.status(200).json({
            err: false,
            msg: 'Event statuses successfully retrieved',
            eventStatuses
        });
    } catch (error) {
        console.error('Error fetching Event statuses:', error);
        return res.status(500).json({
            err: true,
            msg: 'Failed to retrieve Event statuses'
        });
    }
};
const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.findAll({
            where: { isActive: true },
            include: [{ model: State, as: 'State' }]
        });
        res.status(200).json({
            err: false,
            msg: 'Addresses successfully retrieved',
            addresses: addresses
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message
        });
    }
};
const getEmails = async (req, res) => {
    try {
        const emails = await EmailAddress.findAll({
            where: { isActive: true }
        });
        res.status(200).json({
            err: false,
            msg: 'Emails successfully retrieved',
            emails: emails
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message
        });
    }
};
const getPhoneNumbers = async (req, res) => {
    try {
        const phoneNumbers = await PhoneNumber.findAll({
            where: { isActive: true }
        });
        res.status(200).json({
            err: false,
            msg: 'Phone numbers successfully retrieved',
            phoneNumbers: phoneNumbers
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message
        });
    }
};
const getAddressByName = async (req, res) => {
    const query = req.body.query || req.body.address || '';
    const page = req.body.page || 1;
    const limit = req.body.limit || 100;
    const offset = (page - 1) * limit;
    const clientsFlag = req.body.clients !== undefined ? req.body.clients : req.body.client;
    if (!query) {
        return res.status(400).json({ err: true, msg: 'Address or query string is required' });
    }
    try {
        if (clientsFlag) {
            // Use MeiliSearch to search clientAddresses
            const searchRes = await meiliClient.index('clientAddresses').search(query, { limit, offset });
            const ids = searchRes.hits.map(hit => hit.id);
            let addresses = [];
            if (ids.length > 0) {
                addresses = await ClientAddress.findAll({
                    where: { id: ids },
                    include: [{ model: State, as: 'State' }]
                });
                addresses = ids.map(id => addresses.find(a => a.id === id)).filter(Boolean);
            }
            // Fetch full client data for each address
            const clients = await Promise.all(addresses.map(async (addr) => {
                const clientRecord = await Client.findOne({
                    where: { id: addr.clientId },
                    include: [
                        {
                            model: ClientAddress,
                            as: 'ClientAddresses',
                            include: [{ model: State, as: 'State' }]
                        },
                        { model: ClientEmail, as: 'ClientEmails' },
                        { model: ClientNote, as: 'ClientNotes' },
                        { model: ClientPhoneNumber, as: 'ClientPhoneNumbers' },
                        { model: Priority, as: 'Priority' }
                    ]
                });
                return { client: clientRecord, searchedAddress: addr };
            }));
            return res.status(200).json({
                err: false,
                msg: 'Clients found by address',
                total: searchRes.estimatedTotalHits,
                pages: Math.ceil(searchRes.estimatedTotalHits / limit),
                results: clients
            });
        } else {
            // Use MeiliSearch to search addresses
            const searchRes = await meiliClient.index('addresses').search(query, { limit, offset });
            const ids = searchRes.hits.map(hit => hit.id);
            let addresses = [];
            if (ids.length > 0) {
                addresses = await Address.findAll({
                    where: { id: ids },
                    include: [{ model: State, as: 'State' }]
                });
                addresses = ids.map(id => addresses.find(a => a.id === id)).filter(Boolean);
            }
            return res.status(200).json({
                err: false,
                msg: 'Addresses found',
                total: searchRes.estimatedTotalHits,
                pages: Math.ceil(searchRes.estimatedTotalHits / limit),
                results: addresses
            });
        }
    } catch (err) {
        return res.status(500).json({ err: true, msg: err.message });
    }
};
const getCompanyByName = async (req, res) => {
    const { subDomain, name } = req.body;
    
    if (!subDomain) {
        return res.status(400).json({ err: true, msg: 'Subdomain is required' });
    }
    try {
        // find company by subdomain or name
        const company = await Company.findOne({
            where: {
                [Op.or]: [
                    { subDomain },
                    { name }
                ]
            }
        });
        if (!company) {
            return res.status(404).json({ err: true, msg: 'Company not found' });
        }
        return res.status(200).json({
            err: false,
            msg: 'Company found',
            company
        });
    } catch (err) {
        return res.status(500).json({ err: true, msg: err.message });
    }
};
const getAddressDetails = async (req, res) => {
    const { address } = req.body;
    if (!address) {
        return res.status(400).json({ err: true, msg: 'Address is required' });
    }
    try {
        // Use Google Geocoding API to look up address
        const response = await fetch(`${GOOGLE_GEOCODING_API_URL}?address=${encodeURIComponent(address)}&key=${env.GOOGLE_API_KEY}`);
        if (!response.ok) {
            return res.status(400).json({
                err: true,
                msg: 'Failed to look up address'
            });
        }
        const data = await response.json();
        if (data.status !== 'OK' || !data.results || data.results.length === 0) {
            return res.status(404).json({
                err: true,
                msg: 'Address not found'
            });
        }
        const result = data.results[0];
        const components = result.address_components;
        let street1 = '', street2 = '', city = '', state = '', stateAbbr = '', zipCode = '', latitude = '', longitude = '';
        components.forEach(component => {
            if (component.types.includes('street_number')) {
                street1 = component.long_name;
            }
            if (component.types.includes('route')) {
                street1 = street1 ? `${street1} ${component.long_name}` : component.long_name;
            }
            if (component.types.includes('subpremise')) {
                street2 = component.long_name;
            }
            if (component.types.includes('locality')) {
                city = component.long_name;
            }
            if (component.types.includes('administrative_area_level_1')) {
                state = component.long_name;
                stateAbbr = component.short_name;
            }
            if (component.types.includes('postal_code')) {
                zipCode = component.long_name;
            }
        });
        latitude = result.geometry.location.lat;
        longitude = result.geometry.location.lng;
        // Try to resolve stateId from abbreviation
        let stateId = null;
        if (stateAbbr) {
            const foundState = await State.findOne({ where: { abbreviation: stateAbbr } });
            if (foundState) stateId = foundState.id;
        }
        return res.status(200).json({
            err: false,
            msg: 'Address successfully looked up',
            address: {
                street1,
                street2: street2 || null,
                city,
                stateId,
                state: stateAbbr || state,
                zipCode,
                latitude,
                longitude
            }
        });
    } catch (err) {
        return res.status(500).json({ err: true, msg: err.message });
    }
};
const createAddress = async (req, res) => {
    try {
        const address = await Address.create({
            street1: req.body.street1,
            street2: req.body.street2 || null,
            city: req.body.city,
            stateId: req.body.stateId,
            zipCode: req.body.zipCode,
            latitude: req.body.latitude || null,
            longitude: req.body.longitude || null,
            isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        });
        res.status(201).json({
            err: false,
            msg: 'Address successfully created',
            address: address
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message
        });
    }
};
const createEmail = async (req, res) => {
    try {
        const email = await Email.create({
            email: req.body.email,
            type: req.body.type || 'Personal',
            isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        });
        res.status(201).json({
            err: false,
            msg: 'Email successfully created',
            email: email
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message
        });
    }
};
const createPhoneNumber = async (req, res) => {
    try {
        const phoneNumber = await PhoneNumber.create({
            number: req.body.number,
            type: req.body.type || 'Mobile',
            isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        });
        res.status(201).json({
            err: false,
            msg: 'Phone number successfully created',
            phoneNumber: phoneNumber
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message
        });
    }
};
const updateAddress = async (req, res) => {
    try {
        const address = await Address.update({
            street1: req.body.street1,
            street2: req.body.street2 || null,
            city: req.body.city,
            stateId: req.body.stateId,
            zipCode: req.body.zipCode,
            latitude: req.body.latitude || null,
            longitude: req.body.longitude || null,
            isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        }, {
            where: { id: req.body.id }
        });
        res.status(200).json({
            err: false,
            msg: 'Address successfully updated',
            address: address
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message
        });
    }
};
const updateEmail = async (req, res) => {
    try {
        const email = await Email.update({
            email: req.body.email,
            type: req.body.type || 'Personal',
            isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        }, {
            where: { id: req.body.id }
        });
        res.status(200).json({
            err: false,
            msg: 'Email successfully updated',
            email: email
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message
        });
    }
};
const updatePhoneNumber = async (req, res) => {
    try {
        const phoneNumber = await PhoneNumber.update({
            number: req.body.number,
            type: req.body.type || 'Mobile',
            isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        }, {
            where: { id: req.body.id }
        });
        res.status(200).json({
            err: false,
            msg: 'Phone number successfully updated',
            phoneNumber: phoneNumber
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message
        });
    }
};
const updateReminder = async (req, res) => {
    try {
        const { id, userId, clientId, reminderTypeId, eventId, addressId, emailId, phoneNumberId } = req.body;

        // If an `id` is provided, delete the reminder directly
        if (id) {
            const deleted = await Reminder.destroy({ where: { id } });
            if (deleted) {
                return res.status(200).json({
                    err: false,
                    msg: 'Reminder successfully removed',
                });
            } else {
                return res.status(404).json({
                    err: true,
                    msg: 'Reminder not found for deletion',
                });
            }
        } else {
            // Check if an existing reminder matches the criteria to avoid duplicates
            const existingReminder = await Reminder.findOne({
                where: {
                    reminderTypeId,
                    eventId: eventId || null,
                    userId: userId || null,
                    clientId: clientId || null,
                }
            });

            if (existingReminder) {
                // If an existing reminder is found, delete it
                await existingReminder.destroy();
                return res.status(200).json({
                    err: false,
                    msg: 'Existing reminder was found and removed',
                });
            }

            // Create a new reminder if none exists
            const reminderData = {
                reminderTypeId,
                eventId: eventId || null,
                userId: userId || null,
                clientId: clientId || null,
                addressId: addressId || null,
                emailId: emailId || null,
                phoneNumberId: phoneNumberId || null,
                completedAt: null
            };

            const reminder = await Reminder.create(reminderData);
            return res.status(201).json({
                err: false,
                msg: 'Reminder successfully added',
                reminder,
            });
        }
    } catch (error) {
        console.error('Error updating reminder:', error);
        return res.status(500).json({
            err: true,
            msg: 'Failed to update reminder',
        });
    }
};
const deleteAddress = async (req, res) => {
    try {
        await Address.update({ isActive: false }, { where: { id: req.body.id } });
        res.status(200).json({
            err: false,
            msg: 'Address successfully deactivated'
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message
        });
    }
};
const deleteEmail = async (req, res) => {
    try {
        await Email.update({ isActive: false }, { where: { id: req.body.id } });
        res.status(200).json({
            err: false,
            msg: 'Email successfully deactivated'
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message
        });
    }
};
const deletePhoneNumber = async (req, res) => {
    try {
        await PhoneNumber.update({ isActive: false }, { where: { id: req.body.id } });
        res.status(200).json({
            err: false,
            msg: 'Phone number successfully deactivated'
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message
        });
    }
};
const lookUpAddress = async (req, res) => {
    const { address } = req.body;
    if (!address) {
        return res.status(400).json({ err: true, msg: 'Address is required' });
    }
    try {
        // Use Google Places Autocomplete API to look up address predictions
        const url = `${GOOGLE_PLACES_AUTOCOMPLETE_API_URL}?input=${encodeURIComponent(address)}&types=address&key=${env.GOOGLE_API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) {
            return res.status(400).json({
                err: true,
                msg: 'Failed to look up address (autocomplete)'
            });
        }
        const data = await response.json();
        if (data.status !== 'OK' || !data.predictions || data.predictions.length === 0) {
            return res.status(404).json({
                err: true,
                msg: 'No address predictions found'
            });
        }
        // Return the predictions array
        return res.status(200).json({
            err: false,
            msg: 'Address predictions found',
            predictions: data.predictions
        });
    } catch (err) {
        return res.status(500).json({ err: true, msg: err.message });
    }
};
module.exports = {
    getCompany,
    getWeather,
    getLocation,
    getStates,
    getDays,
    getPriorities,
    getReminderTypes,
    getCompanyTypes,
    getAddresses,
    getEventStatuses,
    getEmails,
    getPhoneNumbers,
    getAddressByName,
    getAddressDetails,
    getCompanyByName,
    createEmail,
    createPhoneNumber,
    createAddress,
    updateEmail,
    updatePhoneNumber,
    updateAddress,
    deleteEmail,
    deletePhoneNumber,
    deleteAddress,
    updateReminder,
    lookUpAddress,
};