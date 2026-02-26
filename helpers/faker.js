const {
    faker
} = require('@faker-js/faker');
const {
    User,
    Group,
    Event,
    EventType,
    EventStatus,
    EventParticipant,
    Estimate,
    EstimateActivity,
    EstimateStatus,
    EstimatePreference,
    EstimateLineItem,
    EstimateLineItemItem,
    EstimatePreferences,
    Estimator,
    Client,
    ClientPhoneNumber,
    Address,
    Email,
    PhoneNumber,
    ClientEmail,
    ClientAddress,
    ClientNote,
    UserGroup,
    LineItem, 
    LineItemItem,
    Warehouse,
    WarehouseType,
    InventoryArea,
    InventoryAreaType,
    InventoryAisle,
    InventoryRow,
    InventoryShelf,
    InventoryRack,
    InventorySection,
    InventoryItem,
    Item,
    Vendor,
    VendorItem,
    Role,
    UserPreference, // Add UserPreferences model
    sequelize
} = require('../models');
const randomColor = require('randomcolor');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

const getRandomItems = (min, max, generator) => {
    const count = Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
    return Array.from({
            length: count
        },
        generator
    );
}
const getRandomElements = (array, count) => {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};
function getRandomDateInYear() {
    const start = new Date(new Date().getFullYear(), 0, 1);
    const end = new Date(new Date().getFullYear(), 11, 31);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
function getRandomDatesWithinSameWeek() {
    // Get a random year: last 5 years or next year, but not this year
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear - 5; y < currentYear; y++) years.push(y);
    years.push(currentYear + 1);
    const year = faker.helpers.arrayElement(years);
    // Get a random week in that year
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);
    const randomDay = new Date(startOfYear.getTime() + Math.random() * (endOfYear.getTime() - startOfYear.getTime()));
    // Set startDate to a random day in the week
    const startDate = new Date(randomDay);
    // Event duration: min 1 hour, max 8 hours
    const durationHours = faker.number.int({ min: 1, max: 8 });
    const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);
    return { startDate, endDate };
}
// Function to create users
const createUsers = async () => {
    const roles = await Role.findAll({
        where: {
            name: {
                [Op.ne]: 'administrator'
            }
        }
    });

    const users = [];
    for (let i = 0; i < 75; i++) {
        const randomNumber = Math.floor(Math.random() * 900000) + 100000;
        const pwdChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const pwdLen = 18;
        const randPassword = Array.from({ length: pwdLen }, () => pwdChars.charAt(Math.floor(Math.random() * pwdChars.length))).join('');

        // Hash the generated password
        const hashedPassword = await bcrypt.hash(randPassword, 10);

        users.push({
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            password: hashedPassword,
            roleId: faker.helpers.arrayElement(roles).id,
            isActive: 1
        });
    }
    const createdUsers = await User.bulkCreate(users, { individualHooks: true });

    // Create user preferences for each user
    const userPreferences = createdUsers.map(user => ({
        userId: user.id,
        notifyByEmail: faker.datatype.boolean(),
        notifyByText: faker.datatype.boolean(),
        minimizeSidebar: faker.datatype.boolean(),
        eventSchedulerGroups: JSON.stringify([]),
        eventCategory: faker.number.int({ min: 1, max: 10 }),
        eventMap: faker.helpers.arrayElement(['unit', 'day', 'week', 'month']),
        darkMode: faker.datatype.boolean(),
        backgroundColor: randomColor()
    }));

    await UserPreference.bulkCreate(userPreferences);
};
// Function to create groups
const createGroups = async () => {
    const groups = [];
    for (let i = 0; i < 10; i++) {
        groups.push({
            name: faker.company.name()
        });
    }
    return await Group.bulkCreate(groups);
};
// Function to create event types
const createEventTypes = async () => {
    const eventTypes = [{
            name: 'Chimney Inspection',
            backgroundColor: randomColor(),
            map: faker.number.int({
                min: 0,
                max: 1
            }),
            tags: faker.helpers.uniqueArray(
                faker.lorem.words,
                10
            ),
            isActive: 1
        },
        {
            name: 'Chimney Cleaning',
            backgroundColor: randomColor(),
            map: faker.number.int({
                min: 0,
                max: 1
            }),
            tags: faker.helpers.uniqueArray(
                faker.lorem.words,
                10
            ),
            isActive: 1
        },
        {
            name: 'Chimney Installation',
            backgroundColor: randomColor(),
            map: faker.number.int({
                min: 0,
                max: 1
            }),
            tags: faker.helpers.uniqueArray(
                faker.lorem.words,
                10
            ),
            isActive: 1
        },
        {
            name: 'Fireplace Inspection',
            backgroundColor: randomColor(),
            map: faker.number.int({
                min: 0,
                max: 1
            }),
            tags: faker.helpers.uniqueArray(
                faker.lorem.words,
                10
            ),
            isActive: 1
        },
        {
            name: 'Fireplace Cleaning',
            backgroundColor: randomColor(),
            map: faker.number.int({
                min: 0,
                max: 1
            }),
            tags: faker.helpers.uniqueArray(
                faker.lorem.words,
                10
            ),
            isActive: 1
        },
        {
            name: 'Fireplace Repair',
            backgroundColor: randomColor(),
            map: faker.number.int({
                min: 0,
                max: 1
            }),
            tags: faker.helpers.uniqueArray(
                faker.lorem.words,
                10
            ),
            isActive: 1
        },
        {
            name: 'Fireplace Installation',
            backgroundColor: randomColor(),
            map: faker.number.int({
                min: 0,
                max: 1
            }),
            tags: faker.helpers.uniqueArray(
                faker.lorem.words,
                10
            ),
            isActive: 1
        },
        {
            name: 'Smoke Chamber Inspection',
            backgroundColor: randomColor(),
            map: faker.number.int({
                min: 0,
                max: 1
            }),
            tags: faker.helpers.uniqueArray(
                faker.lorem.words,
                10
            ),
            isActive: 1
        },
        {
            name: 'Smoke Chamber Repair',
            backgroundColor: randomColor(),
            map: faker.number.int({
                min: 0,
                max: 1
            }),
            tags: faker.helpers.uniqueArray(
                faker.lorem.words,
                10
            ),
            isActive: 1
        }
    ];

    return await EventType.bulkCreate(eventTypes);
};
// Function to create events
const createEvents = async () => {
    const users = await User.findAll();
    const groups = await Group.findAll();
    const eventTypes = await EventType.findAll();
    const statuses = await EventStatus.findAll();
    const clients = await Client.findAll();
    const eventCategories = ['client', 'group', 'user', 'company'];

    // Fetch users with roleId of 4
    const creators = await User.findAll({ where: { roleId: 4 } });

    if (users.length === 0 || groups.length === 0 || eventTypes.length === 0 || statuses.length === 0 || creators.length === 0) {
        throw new Error('Missing required data in the database');
    }

    for (let i = 0; i < 500; i++) {
        // Generate random dates within the same week
        const { startDate, endDate } = getRandomDatesWithinSameWeek();

        // Randomly select related data
        const user = faker.helpers.arrayElement(users);
        const group = faker.helpers.arrayElement(groups);
        const eventType = faker.helpers.arrayElement(eventTypes);
        const status = faker.helpers.arrayElement(statuses);
        const eventCategory = faker.helpers.arrayElement(eventCategories);
        const creator = faker.helpers.arrayElement(creators);

        let client = null;
        let participants = [];
        let addressId = null;
        let phoneNumber = null;

        switch (eventCategory) {
            case 'client':
                client = faker.helpers.arrayElement(clients);
                participants = [user];

                // Get random addressId from ClientAddresses
                const clientAddresses = await ClientAddress.findAll({ where: { clientId: client.id } });
                addressId = clientAddresses[Math.floor(Math.random() * clientAddresses.length)].id;

                // Get random phoneNumber from ClientPhoneNumbers
                const clientPhoneNumbers = await ClientPhoneNumber.findAll({ where: { clientId: client.id } });
                phoneNumber = clientPhoneNumbers[Math.floor(Math.random() * clientPhoneNumbers.length)].id;
                break;
            case 'group':
                participants = faker.helpers.arrayElements(users, faker.number.int({ min: 2, max: users.length }));
                break;
            case 'user':
                participants = [user];
                break;
            case 'company':
                participants = faker.helpers.arrayElements(users, faker.number.int({ min: 2, max: users.length }));
                break;
        }

        if (eventCategory !== 'client') {
            // Get addressId from Address
            const addresses = await Address.findAll();
            addressId = addresses[Math.floor(Math.random() * addresses.length)].id;
        }

        // Create a new event
        const newEvent = await Event.create({
            title: faker.company.catchPhrase(),
            startDate: startDate,
            endDate: endDate,
            priorityId: faker.number.int({ min: 1, max: 2 }), // Assuming priorityId ranges from 1 to 5
            statusId: status.id,
            isActive: 1,
            userId: user.id,
            details: faker.lorem.paragraph(),
            addressId: addressId,
            emailId: faker.number.int({ min: 1, max: 100 }), // Assuming emailId ranges from 1 to 100
            phoneNumberId: phoneNumber,
            targetUserId: faker.helpers.arrayElement(users).id,
            clientId: client ? client.id : null,
            eventTypeId: eventType.id,
            groupId: group.id,
            creatorId: creator.id, // Set creatorId to a user with roleId of 4
            eventCategoryId: eventCategories.indexOf(eventCategory) + 1 // Assuming eventCategoryId ranges from 1 to 4
        });

        // Create event participants
        for (const participant of participants) {
            await EventParticipant.create({
                userId: participant.id,
                eventId: newEvent.id
            });
        }
    }
};
const createClients = async () => {
    for (let i = 0; i < 15000; i++) {

        // Create client
        const client = await Client.create({
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            priorityId: 1,
            isActive: 1
        });
        // Generate and associate addresses
        const addresses = getRandomItems(1, 5, async () => {
            const address = await ClientAddress.create({
                street1: faker.location.streetAddress(),
                city: faker.location.city(),
                stateId: faker.number.int({
                    min: 1,
                    max: 51
                }),
                zipCode: faker.location.zipCode(),
                latitude: faker.location.latitude(),
                longitude: faker.location.longitude(),
                isPrimary: 0,
                isActive: 1,
                clientId: client.dataValues.id
            });
            console.log(address);
    
            return address;
        });
        // Generate and associate phone numbers
        const phoneNumbers = getRandomItems(
            1, 5, async () => {
                const phoneNumber = await ClientPhoneNumber.create({
                    number: faker.string.numeric(10),
                    type: faker.helpers.arrayElement(
                        [
                            'Home',
                            'Mobile',
                            'Work',
                            'Other'
                        ]
                    ),
                    isPrimary: 0,
                    isActive: 1,
                    clientId: client.dataValues.id,
                });
                return phoneNumber;
            }
        );

        // Generate and associate emails
        const emails = getRandomItems(
            1, 5, async () => {
                const email = await ClientEmail.create({
                    email: faker.internet.email(),
                    type: faker.helpers.arrayElement(
                        [
                            'Personal',
                            'Work',
                            'Other'
                        ]
                    ),
                    isPrimary: 0,
                    isActive: 1,
                    clientId: client.dataValues.id,
                });
                return email;
            }
        );

        // Generate and associate notes
        const notes = getRandomItems(
            1, 5, async () => {
                const note = await ClientNote.create({
                    content: faker.lorem.paragraph(),
                    isImportant: 0,
                    clientId: client.dataValues.id,
                });
                return note;
            }
        );
    };
};
// Function to create estimates
const createEstimates = async () => {
    const users = await User.findAll();
    const clients = await Client.findAll();
    const statuses = await EstimateStatus.findAll();
    const preferences = await EstimatePreference.findAll();
    const estimators = await Estimator.findAll();

    for (let i = 0; i < 500; i++) {
        const user = faker.helpers.arrayElement(users);
        const client = faker.helpers.arrayElement(clients);
        const status = faker.helpers.arrayElement(statuses);
        const preference = faker.helpers.arrayElement(preferences);
        const estimator = faker.helpers.arrayElement(estimators);

        // Create estimate
        const estimate = await Estimate.create({
            title: faker.commerce.productName(),
            description: faker.lorem.paragraph(),
            clientId: client.id,
            userId: user.id,
            statusId: status.id,
            preferenceId: preference.id,
            estimatorId: estimator.id,
            estimateNumber: `EST-${Date.now()}${faker.string.numeric(3)}`,
            isActive: 1
        });

        // Create estimate activities
        await EstimateActivity.create({
            estimateId: estimate.id,
            action: 'CREATE',
            description: `Estimate created by ${user.firstName} ${user.lastName}`,
            userId: user.id
        });

        // Create estimate line items
        for (let j = 0; j < 10; j++) {
            // Find a random item to associate with the line item
            const items = await Item.findAll();
            const lineItems = await LineItem.findAll();

            const lineItem = await EstimateLineItem.create({
                estimateId: estimate.id,
                lineItemId: faker.helpers.arrayElement(lineItems).id,
                name: faker.commerce.productName(),
                description: faker.lorem.sentence(),
                quantity: faker.number.int({ min: 1, max: 10 }),
                unitPrice: parseFloat(faker.commerce.price()),
                totalPrice: parseFloat(faker.commerce.price()),
                category: faker.helpers.arrayElement(['Material', 'Labor', 'Equipment', 'Miscellaneous']),
                rate: parseFloat(faker.commerce.price()),
                total: parseFloat(faker.commerce.price()),
                isTaxable: faker.datatype.boolean()
            });
            const randomItems = faker.helpers.arrayElements(items, faker.number.int({ min: 1, max: 3 }));
            for (const item of randomItems) {
                await EstimateLineItemItem.create({
                    estimateLineItemId: lineItem.id,
                    estimateId: estimate.id,
                    subTotal: parseFloat(faker.commerce.price()),
                    salesTaxRate: faker.number.float({ min: 0, max: 0.1 }),
                    salesTaxTotal: parseFloat(faker.commerce.price()),
                    description: faker.lorem.sentence(),
                    itemId: item.id,
                    quantity: faker.number.int({ min: 1, max: 5 }),
                    rate: parseFloat(faker.commerce.price()),
                    total: parseFloat(faker.commerce.price())
                });
            }
        }
    }
};
// function to assign estimates to users
const assignEstimatesToUsers = async () => {
    const users = await User.findAll();
    const estimates = await Estimate.findAll();

    for (const estimate of estimates) {
        // Randomly select a user to assign the estimate to
        const user = faker.helpers.arrayElement(users);
        await estimate.update({ assignedUserId: user.id });
    }
};
// function to give prices to estimates line items and update the estimate total
const updateEstimateLineItemsAndTotal = async () => {
    const estimates = await Estimate.findAll({
        include: [{
            model: EstimateLineItem,
            as: 'EstimateLineItems'
        }]
    });

    for (const estimate of estimates) {
        let total = 0;
        let estimateSubTotal = 0;

        for (const lineItem of estimate.EstimateLineItems) {
            // Generate random price and quantity
            const price = parseFloat(faker.commerce.price());
            const quantity = faker.number.int({ min: 1, max: 10 });
            const subTotal = price * quantity;

            // Update line item with new price and quantity
            await lineItem.update({
                unitPrice: price,
                quantity: quantity,
                totalPrice: subTotal
            });
            // Calculate sub total and total for the estimate
            const estimateLineItems = await EstimateLineItemItem.findAll({
                where: { estimateLineItemId: lineItem.id }
            });
            for (const item of estimateLineItems) {
                estimateSubTotal += item.total;
            }
            total += subTotal;
        }

        // Update estimate total
        await estimate.update({ subtotal: total, total: total });
    }
};
// Function to create items
const createItems = async () => {
    const items = [];

    for (let i = 0; i < 1024; i++) {
        items.push({
            name: faker.commerce.productName(),
            partNumber: faker.string.alphanumeric(10),
            manufacturerId: faker.number.int({ min: 1, max: 100 }),
            rate: faker.commerce.price(),
            unitId: faker.number.int({ min: 1, max: 10 }),
            taxable: faker.datatype.boolean(),
            description: faker.lorem.sentence(),
            imageName: faker.image.urlLoremFlickr(),
            userId: faker.number.int({ min: 1, max: 100 }),
            itemTypeId: faker.number.int({ min: 1, max: 10 }),
            reorderPoint: faker.number.int({ min: 1, max: 50 }), 
            quantity: faker.number.int({ min: 1, max: 100 }),
            cost: faker.commerce.price(),
            markUpRate: faker.number.float({ min: 0, max: 1 }),
            isActive: faker.datatype.boolean(),
            salesTaxRateId: faker.number.int({ min: 1, max: 10 }),
            businessUnitId: faker.number.int({ min: 1, max: 10 }),
            created: faker.date.past(),
            modified: faker.date.recent(),
            minimumOrderAmount: faker.number.int({ min: 1, max: 100 }),
            parentManufacturerPartNumber: faker.string.alphanumeric(10),
        });

        // Insert items in batches of 1000
        if (items.length === 1000) {
            await Item.bulkCreate(items);
            items.length = 0; // Clear the array for the next batch
        }
    }

    // Insert any remaining items
    if (items.length > 0) {
        await Item.bulkCreate(items);
    }
};
const createLineItems = async () => {
    const users = await User.findAll();
    const user = faker.helpers.arrayElement(users); 
    const lineItems = [];

    // Function to create line items in batches

    for (let i = 0; i < 20; i++) {
        const quantity = faker.number.int({ min: 1, max: 100 });
        const rate = faker.commerce.price();
        const subTotal = quantity * rate;
        const markup = faker.number.float({ min: 0, max: 1 }) * subTotal;
        const total = subTotal + markup;
        const salesTaxRate = faker.number.float({ min: 0, max: 0.1 });
        const salesTaxTotal = total * salesTaxRate;
        var lineItem = {
            quantity: quantity,
            rate: rate,
            unit: faker.helpers.arrayElement(['hour', 'foot', 'each', 'portion']),
            subTotal: subTotal,
            total: total,
            taxable: faker.datatype.boolean(),
            markup: markup, 
            name: faker.commerce.productName(),
            description: faker.lorem.sentence(),
            userId: user.id,
            salesTaxRate: salesTaxRate,
            salesTaxTotal: salesTaxTotal,
            moduleDescription: faker.lorem.paragraph(),
            instructions: faker.lorem.paragraph(),
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent(),
        }
        lineItems.push(lineItem);
        // Insert line items in batches of 20
        if (lineItems.length === 20) {
            await LineItem.bulkCreate(lineItems);
            lineItems.length = 0; // Clear the array for the next batch
        }
    }

    // Insert any remaining line items
    if (lineItems.length > 0) {
        await LineItem.bulkCreate(lineItems);
    }
};

const associateItemsWithLineItems = async () => {
    const items = await Item.findAll();
    const lineItems = await LineItem.findAll();

    const associations = [];

    for (const lineItem of lineItems) {
        // Randomly associate 1 to 5 items with each line item
        const numberOfItems = faker.number.int({ min: 1, max: 5 });
        const selectedItems = faker.helpers.arrayElements(items, numberOfItems);

        selectedItems.forEach(item => {
            associations.push({
                lineItemId: lineItem.id,
                itemId: item.id,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        });
    }

    // Insert associations in batches
    if (associations.length > 0) {
        await LineItemItem.bulkCreate(associations);
    }
};
// Function to associate event types with groups
const associateEventTypesWithGroups = async (groups, eventTypes) => {
    console.log(groups);
    for (const group of groups) {
        const randomEventTypes = faker.helpers.shuffle(eventTypes)
            .slice(
                0,
                faker.number.int({
                    min: 0,
                    max: 1
                })
            );
        await group.addEventTypes(randomEventTypes);
    }
};

// Function to associate user with ID 1 to all groups
const associateUserWithGroups = async (userId, groups) => {
    const userGroups = groups.map(
        group => ({
            userId: userId,
            groupId: group.id
        })
    );
    console.log(userGroups)
    await UserGroup.bulkCreate(userGroups);
};

// Function to create warehouses and their associated items

const warehouseNames = [
    'Blue Collar Distribution Center',
    'Industrial Storage Solutions',
    'Worker’s Warehouse'
];

const generateWarehouses = async () => {
    try {
        const warehouseType = await WarehouseType.create({ name: 'Main Warehouse' });

        for (let i = 0; i < 3; i++) {
            await Warehouse.create({
                name: warehouseNames[i],
                warehouseTypeId: warehouseType.id
            });
        }

        console.log('Warehouses generated successfully!');
    } catch (error) {
        console.error('Error generating warehouses:', error);
    }
};

const generateInventoryAreas = async () => {
    try {
        const areaType = await InventoryAreaType.create({ name: 'General Storage' });
        const warehouses = await Warehouse.findAll();

        for (const warehouse of warehouses) {
            for (let j = 0; j < 2; j++) {
                await InventoryArea.create({
                    name: faker.location.street(),
                    typeId: areaType.id,
                    warehouseId: warehouse.id
                });
            }
        }

        console.log('Inventory areas generated successfully!');
    } catch (error) {
        console.error('Error generating inventory areas:', error);
    }
};

const generateInventoryAisles = async () => {
    try {
        const areas = await InventoryArea.findAll();

        for (const area of areas) {
            for (let k = 0; k < 2; k++) {
                await InventoryAisle.create({
                    name: `Aisle ${k + 1}`,
                    inventoryAreaId: area.id
                });
            }
        }

        console.log('Inventory aisles generated successfully!');
    } catch (error) {
        console.error('Error generating inventory aisles:', error);
    }
};

const generateInventoryRows = async () => {
    try {
        const aisles = await InventoryAisle.findAll();

        for (const aisle of aisles) {
            for (let l = 0; l < 2; l++) {
                await InventoryRow.create({
                    name: `Row ${l + 1}`,
                    inventoryAisleId: aisle.id
                });
            }
        }

        console.log('Inventory rows generated successfully!');
    } catch (error) {
        console.error('Error generating inventory rows:', error);
    }
};

const generateInventoryShelves = async () => {
    try {
        const rows = await InventoryRow.findAll();

        for (const row of rows) {
            for (let m = 0; m < 2; m++) {
                await InventoryShelf.create({
                    name: `Shelf ${m + 1}`,
                    inventoryRowId: row.id
                });
            }
        }

        console.log('Inventory shelves generated successfully!');
    } catch (error) {
        console.error('Error generating inventory shelves:', error);
    }
};

const generateInventoryRacks = async () => {
    try {
        const shelves = await InventoryShelf.findAll();

        for (const shelf of shelves) {
            for (let n = 0; n < 2; n++) {
                await InventoryRack.create({
                    name: `Rack ${n + 1}`,
                    inventoryShelfId: shelf.id
                });
            }
        }

        console.log('Inventory racks generated successfully!');
    } catch (error) {
        console.error('Error generating inventory racks:', error);
    }
};

const generateInventorySections = async () => {
    try {
        const racks = await InventoryRack.findAll();

        for (const rack of racks) {
            for (let o = 0; o < 2; o++) {
                await InventorySection.create({
                    name: `Section ${o + 1}`,
                    inventoryRackId: rack.id
                });
            }
        }

        console.log('Inventory sections generated successfully!');
    } catch (error) {
        console.error('Error generating inventory sections:', error);
    }
};

const generateInventoryItems = async () => {
    try {
        const sections = await InventorySection.findAll();

        for (const section of sections) {
            for (let p = 0; p < 3; p++) {
                const itemId = faker.number.int({ min: 1, max: 2000 });
                await InventoryItem.create({
                    name: `Item ${p + 1}`,
                    inventorySectionId: section.id,
                    itemId: itemId,
                    quantity: faker.number.in({ min: 1, max: 100 }),
                    unitOfMeasure: 'pcs'
                });
            }
        }

        console.log('Inventory items generated successfully!');
    } catch (error) {
        console.error('Error generating inventory items:', error);
    }
};

async function createVendorsAndVendorItems() {
    try {
        // Fetch all existing items
        const items = await Item.findAll();
        if (items.length === 0) {
            throw new Error('No items found in the database.');
        }

        // Create 20 vendors
        for (let i = 0; i < 20; i++) {
            const vendor = await Vendor.create({
                name: faker.company.name(),
                contactName: faker.person.fullName(),
                contactEmail: faker.internet.email(),
                contactPhone: faker.phone.number(),
                address: faker.location.street(),
                city: faker.location.city(),
                state: faker.location.state(),
                zipCode: faker.location.zipCode(),
                createdAt: new Date(),
                updatedAt: new Date()
            });

            // Create a random number of vendor items for each vendor
            const numberOfVendorItems = faker.number.int({ min: 500, max: 1000 });
            for (let j = 0; j < numberOfVendorItems; j++) {
                const randomItem = faker.helpers.arrayElement(items);
                await VendorItem.create({
                    vendorId: vendor.id,
                    itemId: randomItem.id,
                    price: faker.commerce.price(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        }
    } catch (error) {
        console.error('Error creating vendors and vendor items:', error);
    }
};

const generateFakerData = async () => {
    await createClients();

    console.log('Faker successfully ran!');
};

generateFakerData()
    .catch( 
        error => {
            console.error(
                'Faker failed:',
                error
            );
        }
    );