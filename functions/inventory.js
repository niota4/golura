const env = process.env;
const _ = require('lodash');
const { 
    InventoryAisle, 
    InventoryRow, 
    InventoryShelf, 
    InventoryRack, 
    InventorySection, 
    InventoryItem, 
    InventoryLabel, 
    InventoryArea, 
    Item,
    Vendor,
    VendorItem,
    Warehouse,
    WarehouseType,
    InventoryAreaType,
    User,
    Priority,
    PurchaseOrder,
    PurchaseOrderStatus
} = require('../models');

const { Op } = require('sequelize');
const { getInventoryNotificationUsers, sendNotificationsToUsers } = require('../helpers/notificationHelpers');
const { stat } = require('fs');

const getItem = async (req, res) => {
    try {
        const includeInactive = req.body.includeInactive || false;
        const item = await Item.findOne({ 
            where: { 
                id: req.body.id, 
                ...(includeInactive ? {} : { isActive: true }) 
            } 
        });
        if (item) {
            res.status(200).json({
                err: false,
                msg: 'Item retrieved successfully',
                item
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'Item not found'
            });
        }
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const getInventoryAisle = async (req, res) => {
    try {
        const includeInactive = req.body.includeInactive || false;
        const aisle = await InventoryAisle.findOne({ 
            where: { 
                id: req.body.id, 
                ...(includeInactive ? {} : { isActive: true }) 
            } 
        });
        if (aisle) {
            res.status(200).json({
                err: false,
                msg: 'Inventory Aisle retrieved successfully',
                aisle
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'Inventory Aisle not found'
            });
        }
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const getInventoryRow = async (req, res) => {
    try {
        const includeInactive = req.body.includeInactive || false;
        const row = await InventoryRow.findOne({ 
            where: { 
                id: req.body.id, 
                ...(includeInactive ? {} : { isActive: true }) 
            } 
        });
        if (row) {
            res.status(200).json({
                err: false,
                msg: 'Inventory Row retrieved successfully',
                row
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'Inventory Row not found'
            });
        }
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const getInventoryShelf = async (req, res) => {
    try {
        const includeInactive = req.body.includeInactive || false;
        const shelf = await InventoryShelf.findOne({ 
            where: { 
                id: req.body.id, 
                ...(includeInactive ? {} : { isActive: true }) 
            } 
        });
        if (shelf) {
            res.status(200).json({
                err: false,
                msg: 'Inventory Shelf retrieved successfully',
                shelf
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'Inventory Shelf not found'
            });
        }
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const getInventoryRack = async (req, res) => {
    try {
        const includeInactive = req.body.includeInactive || false;
        const rack = await InventoryRack.findOne({ 
            where: { 
                id: req.body.id, 
                ...(includeInactive ? {} : { isActive: true }) 
            } 
        });
        if (rack) {
            res.status(200).json({
                err: false,
                msg: 'Inventory Rack retrieved successfully',
                rack
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'Inventory Rack not found'
            });
        }
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const getInventorySection = async (req, res) => {
    try {
        const includeInactive = req.body.includeInactive || false;
        const section = await InventorySection.findOne({ 
            where: { 
                id: req.body.id, 
                ...(includeInactive ? {} : { isActive: true }) 
            } 
        });
        if (section) {
            res.status(200).json({
                err: false,
                msg: 'Inventory Section retrieved successfully',
                section
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'Inventory Section not found'
            });
        }
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const getInventoryItem = async (req, res) => {
    try {
        const includeInactive = req.body.includeInactive || false;
        const item = await InventoryItem.findOne({ 
            where: { 
                id: req.body.id, 
                ...(includeInactive ? {} : { isActive: true }) 
            } 
        });
        if (item) {
            res.status(200).json({
                err: false,
                msg: 'Inventory Item retrieved successfully',
                item
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'Inventory Item not found'
            });
        }
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const getInventoryLabel = async (req, res) => {
    try {
        const includeInactive = req.body.includeInactive || false;
        const label = await InventoryLabel.findOne({ 
            where: { 
                id: req.body.id, 
                ...(includeInactive ? {} : { isActive: true }) 
            } 
        });
        if (label) {
            res.status(200).json({
                err: false,
                msg: 'Inventory Label retrieved successfully',
                label
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'Inventory Label not found'
            });
        }
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const getInventoryArea = async (req, res) => {
    try {
        const includeInactive = req.body.includeInactive || false;
        const area = await InventoryArea.findOne({ 
            where: { 
                id: req.body.id, 
                ...(includeInactive ? {} : { isActive: true }) 
            } 
        });
        if (area) {
            res.status(200).json({
                err: false,
                msg: 'Inventory Area retrieved successfully',
                area
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'Inventory Area not found'
            });
        }
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const getWarehouse = async (req, res) => {
    try {
        const includeInactive = req.body.includeInactive || false;
        const warehouse = await Warehouse.findOne({ 
            where: { 
                id: req.body.id, 
                ...(includeInactive ? {} : { isActive: true }) 
            },
            include: [
                {
                    model: InventoryArea,
                    as: 'InventoryAreas',
                    include: [
                        {
                            model: InventoryAreaType,
                            as: 'Type'
                        },
                        {
                            model: InventoryAisle,
                            as: 'Aisles',
                            include: [
                                {
                                    model: InventoryRow,
                                    as: 'Rows',
                                    include: [
                                        {
                                            model: InventoryShelf,
                                            as: 'Shelves',
                                            include: [
                                                {
                                                    model: InventoryRack,
                                                    as: 'Racks',
                                                    include: [
                                                        {
                                                            model: InventorySection,
                                                            as: 'Sections',
                                                            include: [
                                                                {
                                                                    model: InventoryItem,
                                                                    as: 'Items',
                                                                    include: [
                                                                        {
                                                                            model: Item,
                                                                            as: 'Item'
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (warehouse) {
            res.status(200).json({
                err: false,
                msg: 'Warehouse retrieved successfully',
                warehouse
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'Warehouse not found'
            });
        }
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const getVendor = async (req, res) => {
    try {
        const includeInactive = req.body.includeInactive || false;
        const vendor = await Vendor.findOne({ 
            where: { 
                id: req.body.id, 
                ...(includeInactive ? {} : { isActive: true }) 
            } 
        });
        if (vendor) {
            res.status(200).json({
                err: false,
                msg: 'Vendor retrieved successfully',
                vendor
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'Vendor not found'
            });
        }
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const getVendorItem = async (req, res) => {
    try {
        const includeInactive = req.body.includeInactive || false;
        const vendorItem = await VendorItem.findOne({ 
            where: { 
                id: req.body.id, 
                ...(includeInactive ? {} : { isActive: true }) 
            } 
        });
        if (vendorItem) {
            res.status(200).json({
                err: false,
                msg: 'Vendor Item retrieved successfully',
                vendorItem
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'Vendor Item not found'
            });
        }
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const listItems = async (req, res) => {
    const query = req.body.query || '';
    const page = req.body.page || 1;
    const limit = req.body.limit || 100;
    const offset = (page - 1) * limit;
    const includeInactive = req.body.includeInactive || false;

    try {
        const items = await Item.findAndCountAll({
            where: {
                ...(includeInactive ? {} : { isActive: true }),
                [Op.or]: [
                    {
                        name: {
                            [Op.like]: `%${query}%`
                        }
                    },
                    {
                        description: {
                            [Op.like]: `%${query}%`
                        }
                    }
                ]
            },
            include: [
                {
                    model: VendorItem,
                    as: 'VendorItems',
                    include: [
                        {
                            model: Vendor,
                            as: 'Vendor'
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        // Ensure VendorItems are included in the response
        const itemsWithVendorItems = items.rows.map(item => ({
            ...item.toJSON(),
            VendorItems: item.VendorItems || []
        }));

        res.status(201).json({
            err: false,
            msg: 'Items successfully retrieved',
            total: items.count,
            pages: Math.ceil(items.count / limit),
            items: itemsWithVendorItems
        });
    } catch (err) {
        res.json({
            err: true,
            msg: err.message
        });
    }
};
const listInventoryAisles = async (req, res) => {
    const includeInactive = req.body.includeInactive || false;
    try {
        const aisles = await InventoryAisle.findAll({ where: { ...(includeInactive ? {} : { isActive: true }) } });
        res.status(200).json({
            err: false,
            msg: 'Inventory Aisles successfully retrieved',
            aisles
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const listInventoryRows = async (req, res) => {
    const includeInactive = req.body.includeInactive || false;
    try {
        const rows = await InventoryRow.findAll({ where: { ...(includeInactive ? {} : { isActive: true }) } });
        res.status(200).json({
            err: false,
            msg: 'Inventory Rows successfully retrieved',
            rows
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const listInventoryShelves = async (req, res) => {
    const includeInactive = req.body.includeInactive || false;
    try {
        const shelves = await InventoryShelf.findAll({ where: { ...(includeInactive ? {} : { isActive: true }) } });
        res.status(200).json({
            err: false,
            msg: 'Inventory Shelves successfully retrieved',
            shelves
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const listInventoryRacks = async (req, res) => {
    const includeInactive = req.body.includeInactive || false;
    try {
        const racks = await InventoryRack.findAll({ where: { ...(includeInactive ? {} : { isActive: true }) } });
        res.status(200).json({
            err: false,
            msg: 'Inventory Racks successfully retrieved',
            racks
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const listInventorySections = async (req, res) => {
    const includeInactive = req.body.includeInactive || false;
    try {
        const sections = await InventorySection.findAll({ where: { ...(includeInactive ? {} : { isActive: true }) } });
        res.status(200).json({
            err: false,
            msg: 'Inventory Sections successfully retrieved',
            sections
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const listInventoryItems = async (req, res) => {
    const includeInactive = req.body.includeInactive || false;
    try {
        const items = await InventoryItem.findAll({ where: { ...(includeInactive ? {} : { isActive: true }) } });
        res.status(200).json({
            err: false,
            msg: 'Inventory Items successfully retrieved',
            items
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const listInventoryLabels = async (req, res) => {
    const includeInactive = req.body.includeInactive || false;
    try {
        const labels = await InventoryLabel.findAll({ where: { ...(includeInactive ? {} : { isActive: true }) } });
        res.status(200).json({
            err: false,
            msg: 'Inventory Labels successfully retrieved',
            labels
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const listInventoryAreas = async (req, res) => {
    const includeInactive = req.body.includeInactive || false;
    try {
        const areas = await InventoryArea.findAll({ where: { ...(includeInactive ? {} : { isActive: true }) } });
        res.status(200).json({
            err: false,
            msg: 'Inventory Areas successfully retrieved',
            areas
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const listWarehouses = async (req, res) => {
    const includeInactive = req.body.includeInactive || false;
    try {
        const warehouses = await Warehouse.findAll({ where: { ...(includeInactive ? {} : { isActive: true }) } });
        res.status(200).json({
            err: false,
            msg: 'Warehouses successfully retrieved',
            warehouses
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const listVendors = async (req, res) => {
    const includeInactive = req.body.includeInactive || false;
    try {
        const vendors = await Vendor.findAll({ where: { ...(includeInactive ? {} : { isActive: true }) } });
        res.status(200).json({
            err: false,
            msg: 'Vendors successfully retrieved',
            vendors
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const listVendorItems = async (req, res) => {
    const vendorId = req.body.id;
    const query = req.body.query || '';
    const page = req.body.page || 1;
    const limit = req.body.limit || 100;
    const offset = (page - 1) * limit;
    const includeInactive = req.body.includeInactive || false;

    try {
        const vendorItems = await VendorItem.findAndCountAll({
            where: {
                vendorId: vendorId,
                ...(includeInactive ? {} : { isActive: true }),
                [Op.or]: [
                    {
                        '$Item.name$': {
                            [Op.like]: `%${query}%`
                        }
                    },
                    {
                        '$Item.description$': {
                            [Op.like]: `%${query}%`
                        }
                    }
                ]
            },
            include: [
                {
                    model: Item,
                    as: 'Item'
                }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        res.status(201).json({
            err: false,
            msg: 'Vendor Items successfully retrieved',
            total: vendorItems.count,
            pages: Math.ceil(vendorItems.count / limit),
            items: vendorItems.rows
        });
    } catch (err) {
        res.json({
            err: true,
            msg: err.message
        });
    }
};
const listPurchaseOrders = async (req, res) => {
    try {
        const fulfilledStatus = await PurchaseOrderStatus.findOne({ where: { name: 'fulfilled' } });

        if (!fulfilledStatus) {
            return res.status(500).json({
                err: true,
                msg: 'Purchase Order Status "fulfilled" not found in the system.'
            });
        }
        // get purchase orders that dont have the fulfilled status
        const purchaseOrders = await PurchaseOrder.findAll({
            include: [
                {
                    model: Vendor,
                    as: 'Vendor'
                },
                {
                    model: PurchaseOrderStatus,
                    as: 'PurchaseOrderStatus'
                },
                {
                    model: User,
                    as: 'Creator',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            err: false,
            msg: 'Purchase Orders successfully retrieved',
            purchaseOrders
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const createItem = async (req, res) => {
    try {
        const { name, description, isActive } = req.body;
        const item = await Item.create({ name, description, isActive });
        res.status(201).json({
            err: false,
            msg: 'Item created successfully',
            item
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const createInventoryAisle = async (req, res) => {
    try {
        const { name, isActive } = req.body;
        const aisle = await InventoryAisle.create({ name, isActive });
        res.status(201).json({
            err: false,
            msg: 'Inventory Aisle created successfully',
            aisle
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const createInventoryRow = async (req, res) => {
    try {
        const { name, isActive } = req.body;
        const row = await InventoryRow.create({ name, isActive });
        res.status(201).json({
            err: false,
            msg: 'Inventory Row created successfully',
            row
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const createInventoryShelf = async (req, res) => {
    try {
        const { name, isActive } = req.body;
        const shelf = await InventoryShelf.create({ name, isActive });
        res.status(201).json({
            err: false,
            msg: 'Inventory Shelf created successfully',
            shelf
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const createInventoryRack = async (req, res) => {
    try {
        const { name, isActive } = req.body;
        const rack = await InventoryRack.create({ name, isActive });
        res.status(201).json({
            err: false,
            msg: 'Inventory Rack created successfully',
            rack
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const createInventorySection = async (req, res) => {
    try {
        const { name, isActive } = req.body;
        const section = await InventorySection.create({ name, isActive });
        res.status(201).json({
            err: false,
            msg: 'Inventory Section created successfully',
            section
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const createInventoryItem = async (req, res) => {
    try {
        const { inventorySectionId, itemId, quantity, unitOfMeasure } = req.body;
        const item = await InventoryItem.create({ inventorySectionId, itemId, quantity, unitOfMeasure });

        // Check for low stock alert
        try {
            const itemDetails = await Item.findByPk(itemId);
            const lowStockThreshold = itemDetails?.lowStockThreshold || 10; // Default threshold
            
            if (quantity <= lowStockThreshold) {
                const usersToNotify = await getInventoryNotificationUsers(req.companyId);
                const priority = await Priority.findOne({ where: { name: 'medium' } }) || { id: 2 };
                
                const message = `Low stock alert: ${itemDetails ? itemDetails.name : `Item ID ${itemId}`} (Current: ${quantity}, Threshold: ${lowStockThreshold})`;
                
                await sendNotificationsToUsers(
                    usersToNotify,
                    {
                        userId: req.userId,
                        relatedModel: 'inventoryItems',
                        relatedModelId: item.id,
                        priorityId: priority.id,
                        title: 'Low Stock Alert',
                        message: message,
                        type: 'general'
                    },
                    req.userId // Don't notify the person who created the item
                );
            }
        } catch (notificationError) {
            console.error('Error creating inventory low stock notifications:', notificationError);
        }
        res.status(201).json({
            err: false,
            msg: 'Inventory Item created successfully',
            item
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const createInventoryLabel = async (req, res) => {
    try {
        const { name, isActive } = req.body;
        const label = await InventoryLabel.create({ name, isActive });
        res.status(201).json({
            err: false,
            msg: 'Inventory Label created successfully',
            label
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const createInventoryArea = async (req, res) => {
    try {
        const { name, isActive } = req.body;
        const area = await InventoryArea.create({ name, isActive });
        res.status(201).json({
            err: false,
            msg: 'Inventory Area created successfully',
            area
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const createWarehouse = async (req, res) => {
    try {
        const { name, isActive } = req.body;
        const warehouse = await Warehouse.create({ name, isActive });
        res.status(201).json({
            err: false,
            msg: 'Warehouse created successfully',
            warehouse
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const createWarehouseType = async (req, res) => {
    try {
        const { name, isActive } = req.body;
        const type = await WarehouseType.create({ name, isActive });
        res.status(201).json({
            err: false,
            msg: 'Warehouse Type created successfully',
            type
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const createInventoryAreaType = async (req, res) => {
    try {
        const { name, isActive } = req.body;
        const type = await InventoryAreaType.create({ name, isActive });
        res.status(201).json({
            err: false,
            msg: 'Inventory Area Type created successfully',
            type
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const createVendor = async (req, res) => {
    try {
        const { name, isActive } = req.body;
        const vendor = await Vendor.create({ name, isActive });
        res.status(201).json({
            err: false,
            msg: 'Vendor created successfully',
            vendor
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const createVendorItem = async (req, res) => {
    try {
        const { vendorId, itemId, price } = req.body;
        const vendorItem = await VendorItem.create({ vendorId, itemId, price });
        res.status(201).json({
            err: false,
            msg: 'Vendor Item created successfully',
            vendorItem
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const updateItem = async (req, res) => {
    try {
        const { id, name, description, isActive } = req.body;

        const item = await Item.findByPk(id);
        if (!item) {
            return res.status(404).json({ err: true, msg: 'Item not found' });
        }

        item.name = name !== undefined ? name : item.name;
        item.description = description !== undefined ? description : item.description;
        item.isActive = isActive !== undefined ? isActive : item.isActive;

        await item.save();

        res.status(200).json({
            err: false,
            msg: 'Item updated successfully',
            item
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const updateInventoryAisle = async (req, res) => {
    try {
        const { id, name, isActive } = req.body;

        const aisle = await InventoryAisle.findByPk(id);
        if (!aisle) {
            return res.status(404).json({ err: true, msg: 'Inventory Aisle not found' });
        }

        aisle.name = name !== undefined ? name : aisle.name;
        aisle.isActive = isActive !== undefined ? isActive : aisle.isActive;

        await aisle.save();

        res.status(200).json({
            err: false,
            msg: 'Inventory Aisle updated successfully',
            aisle
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const updateInventoryRow = async (req, res) => {
    try {
        const { id, name, isActive } = req.body;

        const row = await InventoryRow.findByPk(id);
        if (!row) {
            return res.status(404).json({ err: true, msg: 'Inventory Row not found' });
        }

        row.name = name !== undefined ? name : row.name;
        row.isActive = isActive !== undefined ? isActive : row.isActive;

        await row.save();

        res.status(200).json({
            err: false,
            msg: 'Inventory Row updated successfully',
            row
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const updateInventoryShelf = async (req, res) => {
    try {
        const { id, name, isActive } = req.body;

        const shelf = await InventoryShelf.findByPk(id);
        if (!shelf) {
            return res.status(404).json({ err: true, msg: 'Inventory Shelf not found' });
        }

        shelf.name = name !== undefined ? name : shelf.name;
        shelf.isActive = isActive !== undefined ? isActive : shelf.isActive;

        await shelf.save();

        res.status(200).json({
            err: false,
            msg: 'Inventory Shelf updated successfully',
            shelf
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const updateInventoryRack = async (req, res) => {
    try {
        const { id, name, isActive } = req.body;

        const rack = await InventoryRack.findByPk(id);
        if (!rack) {
            return res.status(404).json({ err: true, msg: 'Inventory Rack not found' });
        }

        rack.name = name !== undefined ? name : rack.name;
        rack.isActive = isActive !== undefined ? isActive : rack.isActive;

        await rack.save();

        res.status(200).json({
            err: false,
            msg: 'Inventory Rack updated successfully',
            rack
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const updateInventorySection = async (req, res) => {
    try {
        const { id, name, isActive } = req.body;

        const section = await InventorySection.findByPk(id);
        if (!section) {
            return res.status(404).json({ err: true, msg: 'Inventory Section not found' });
        }

        section.name = name !== undefined ? name : section.name;
        section.isActive = isActive !== undefined ? isActive : section.isActive;

        await section.save();

        res.status(200).json({
            err: false,
            msg: 'Inventory Section updated successfully',
            section
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const updateInventoryItem = async (req, res) => {
    try {
        const { id, quantity, unitOfMeasure } = req.body;

        const item = await InventoryItem.findByPk(id);
        if (!item) {
            return res.status(404).json({ err: true, msg: 'Inventory Item not found' });
        }

        // Store original quantity for comparison
        const originalQuantity = item.quantity;

        item.quantity = quantity !== undefined ? quantity : item.quantity;
        item.unitOfMeasure = unitOfMeasure !== undefined ? unitOfMeasure : item.unitOfMeasure;

        await item.save();

        // Check for critical inventory changes and low stock
        try {
            const itemDetails = await Item.findByPk(item.itemId);
            const lowStockThreshold = itemDetails?.lowStockThreshold || 10; // Default threshold
            const criticalThreshold = itemDetails?.criticalThreshold || 5; // Default critical threshold
            
            let shouldNotify = false;
            let notificationMessage = '';
            let priorityLevel = 'medium';
            
            // Check if quantity went below critical threshold
            if (quantity <= criticalThreshold && originalQuantity > criticalThreshold) {
                shouldNotify = true;
                priorityLevel = 'high';
                notificationMessage = `CRITICAL: ${itemDetails ? itemDetails.name : `Item ID ${item.itemId}`} stock critically low (${quantity} remaining)`;
            }
            // Check if quantity went below low stock threshold
            else if (quantity <= lowStockThreshold && originalQuantity > lowStockThreshold) {
                shouldNotify = true;
                notificationMessage = `Low stock alert: ${itemDetails ? itemDetails.name : `Item ID ${item.itemId}`} (${quantity} remaining)`;
            }
            // Check for significant quantity changes (decrease of 50% or more)
            else if (quantity < originalQuantity && ((originalQuantity - quantity) / originalQuantity) >= 0.5) {
                shouldNotify = true;
                notificationMessage = `Significant inventory change: ${itemDetails ? itemDetails.name : `Item ID ${item.itemId}`} quantity reduced from ${originalQuantity} to ${quantity}`;
            }
            
            if (shouldNotify) {
                const usersToNotify = await getInventoryNotificationUsers(req.companyId);
                const priority = await Priority.findOne({ where: { name: priorityLevel } }) || { id: 2 };
                
                await sendNotificationsToUsers(
                    usersToNotify,
                    {
                        userId: req.userId,
                        relatedModel: 'inventoryItems',
                        relatedModelId: item.id,
                        priorityId: priority.id,
                        title: 'Inventory Update',
                        message: notificationMessage,
                        type: 'general'
                    },
                    req.userId // Don't notify the person who updated it
                );
            }
        } catch (notificationError) {
            console.error('Error creating inventory update notifications:', notificationError);
        }

        res.status(200).json({
            err: false,
            msg: 'Inventory Item updated successfully',
            item
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const updateInventoryLabel = async (req, res) => {
    try {
        const { id, name, isActive } = req.body;

        const label = await InventoryLabel.findByPk(id);
        if (!label) {
            return res.status(404).json({ err: true, msg: 'Inventory Label not found' });
        }

        label.name = name !== undefined ? name : label.name;
        label.isActive = isActive !== undefined ? isActive : label.isActive;

        await label.save();

        res.status(200).json({
            err: false,
            msg: 'Inventory Label updated successfully',
            label
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const updateInventoryArea = async (req, res) => {
    try {
        const { id, name, isActive } = req.body;

        const area = await InventoryArea.findByPk(id);
        if (!area) {
            return res.status(404).json({ err: true, msg: 'Inventory Area not found' });
        }

        area.name = name !== undefined ? name : area.name;
        area.isActive = isActive !== undefined ? isActive : area.isActive;

        await area.save();

        res.status(200).json({
            err: false,
            msg: 'Inventory Area updated successfully',
            area
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const updateWarehouse = async (req, res) => {
    try {
        const { id, name, isActive } = req.body;

        const warehouse = await Warehouse.findByPk(id);
        if (!warehouse) {
            return res.status(404).json({ err: true, msg: 'Warehouse not found' });
        }

        warehouse.name = name !== undefined ? name : warehouse.name;
        warehouse.isActive = isActive !== undefined ? isActive : warehouse.isActive;

        await warehouse.save();

        res.status(200).json({
            err: false,
            msg: 'Warehouse updated successfully',
            warehouse
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const updateWarehouseType = async (req, res) => {
    try {
        const { id, name, isActive } = req.body;

        const type = await WarehouseType.findByPk(id);
        if (!type) {
            return res.status(404).json({ err: true, msg: 'Warehouse Type not found' });
        }

        type.name = name !== undefined ? name : type.name;
        type.isActive = isActive !== undefined ? isActive : type.isActive;

        await type.save();

        res.status(200).json({
            err: false,
            msg: 'Warehouse Type updated successfully',
            type
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const updateInventoryAreaType = async (req, res) => {
    try {
        const { id, name, isActive } = req.body;

        const type = await InventoryAreaType.findByPk(id);
        if (!type) {
            return res.status(404).json({ err: true, msg: 'Inventory Area Type not found' });
        }

        type.name = name !== undefined ? name : type.name;
        type.isActive = isActive !== undefined ? isActive : type.isActive;

        await type.save();

        res.status(200).json({
            err: false,
            msg: 'Inventory Area Type updated successfully',
            type
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const updateVendor = async (req, res) => {
    try {
        const { id, name, isActive } = req.body;

        const vendor = await Vendor.findByPk(id);
        if (!vendor) {
            return res.status(404).json({ err: true, msg: 'Vendor not found' });
        }

        vendor.name = name !== undefined ? name : vendor.name;
        vendor.isActive = isActive !== undefined ? isActive : vendor.isActive;

        await vendor.save();

        res.status(200).json({
            err: false,
            msg: 'Vendor updated successfully',
            vendor
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const updateVendorItem = async (req, res) => {
    try {
        const { id, price } = req.body;

        const vendorItem = await VendorItem.findByPk(id);
        if (!vendorItem) {
            return res.status(404).json({ err: true, msg: 'Vendor Item not found' });
        }

        vendorItem.price = price !== undefined ? price : vendorItem.price;

        await vendorItem.save();

        res.status(200).json({
            err: false,
            msg: 'Vendor Item updated successfully',
            vendorItem
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const archiveInventoryAisle = async (req, res) => {
    try {
        const deleted = await InventoryAisle.update({ isActive: false }, { where: { id: req.body.id } });
        if (deleted) {
            res.status(200).json({
                err: false,
                msg: 'Inventory Aisle deleted successfully'
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'Inventory Aisle not found'
            });
        }
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const archiveInventoryRow = async (req, res) => {
    try {
        const deleted = await InventoryRow.update({ isActive: false }, { where: { id: req.body.id } });
        if (deleted) {
            res.status(200).json({
                err: false,
                msg: 'Inventory Row deleted successfully'
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'Inventory Row not found'
            });
        }
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const archiveInventoryShelf = async (req, res) => {
    try {
        const deleted = await InventoryShelf.update({ isActive: false }, { where: { id: req.body.id } });
        if (deleted) {
            res.status(200).json({
                err: false,
                msg: 'Inventory Shelf deleted successfully'
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'Inventory Shelf not found'
            });
        }
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const archiveInventoryRack = async (req, res) => {
    try {
        const deleted = await InventoryRack.update({ isActive: false }, { where: { id: req.body.id } });
        if (deleted) {
            res.status(200).json({
                err: false,
                msg: 'Inventory Rack deleted successfully'
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'Inventory Rack not found'
            });
        }
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const archiveInventorySection = async (req, res) => {
    try {
        const deleted = await InventorySection.update({ isActive: false }, { where: { id: req.body.id } });
        if (deleted) {
            res.status(200).json({
                err: false,
                msg: 'Inventory Section deleted successfully'
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'Inventory Section not found'
            });
        }
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const archiveInventoryItem = async (req, res) => {
    try {
        const deleted = await InventoryItem.update({ isActive: false }, { where: { id: req.body.id } });
        if (deleted) {
            res.status(200).json({
                err: false,
                msg: 'Inventory Item deleted successfully'
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'Inventory Item not found'
            });
        }
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const archiveInventoryLabel = async (req, res) => {
    try {
        const deleted = await InventoryLabel.update({ isActive: false }, { where: { id: req.body.id } });
        if (deleted) {
            res.status(200).json({
                err: false,
                msg: 'Inventory Label deleted successfully'
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'Inventory Label not found'
            });
        }
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const archiveInventoryArea = async (req, res) => {
    try {
        const deleted = await InventoryArea.update({ isActive: false }, { where: { id: req.body.id } });
        if (deleted) {
            res.status(200).json({
                err: false,
                msg: 'Inventory Area deleted successfully'
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'Inventory Area not found'
            });
        }
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const archiveWarehouse = async (req, res) => {
    try {
        const deleted = await Warehouse.update({ isActive: false }, { where: { id: req.body.id } });
        if (deleted) {
            res.status(200).json({
                err: false,
                msg: 'Warehouse deleted successfully'
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'Warehouse not found'
            });
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const archiveWarehouseType = async (req, res) => {
    try {
        const deleted = await WarehouseType.update({ isActive: false }, { where: { id: req.body.id } });
        if (deleted) {
            res.status(200).json({
                err: false,
                msg: 'Warehouse Type deleted successfully'
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'Warehouse Type not found'
            });
        }
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const archiveInventoryAreaType = async (req, res) => {
    try {
        const deleted = await InventoryAreaType.update({ isActive: false }, { where: { id: req.body.id } });
        if (deleted) {
            res.status(200).json({
                err: false,
                msg: 'Inventory Area Type deleted successfully'
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'Inventory Area Type not found'
            });
        }
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const archiveVendor = async (req, res) => {
    try {
        const deleted = await Vendor.update({ isActive: false }, { where: { id: req.body.id } });
        if (deleted) {
            res.status(200).json({
                err: false,
                msg: 'Vendor deleted successfully'
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'Vendor not found'
            });
        }
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const archiveVendorItem = async (req, res) => {
    try {
        const deleted = await VendorItem.update({ isActive: false }, { where: { id: req.body.id } });
        if (deleted) {
            res.status(200).json({
                err: false,
                msg: 'Vendor Item deleted successfully'
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'Vendor Item not found'
            });
        }
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
module.exports = {
    getItem,
    getInventoryAisle,
    getInventoryRow,
    getInventoryShelf,
    getInventoryRack,
    getInventorySection,
    getInventoryItem,
    getInventoryLabel,
    getInventoryArea,
    getWarehouse,
    getVendor,
    getVendorItem,
    listItems,
    listInventoryAisles,
    listInventoryRows,
    listInventoryShelves,
    listInventoryRacks,
    listInventorySections,
    listInventoryItems,
    listInventoryLabels,
    listInventoryAreas,
    listWarehouses,
    listVendors,
    listVendorItems,
    listPurchaseOrders,
    createItem,
    createInventoryAisle,
    createInventoryRow,
    createInventoryShelf,
    createInventoryRack,
    createInventorySection,
    createInventoryItem,
    createInventoryLabel,
    createInventoryArea,
    createWarehouse,
    createWarehouseType,
    createInventoryAreaType,
    createVendor,
    createVendorItem,
    updateItem,
    updateInventoryAisle,
    updateInventoryRow,
    updateInventoryShelf,
    updateInventoryRack,
    updateInventorySection,
    updateInventoryItem,
    updateInventoryLabel,
    updateInventoryArea,
    updateWarehouse,
    updateWarehouseType,
    updateInventoryAreaType,
    updateVendor,
    updateVendorItem,
    archiveInventoryAisle,
    archiveInventoryRow,
    archiveInventoryShelf,
    archiveInventoryRack,
    archiveInventorySection,
    archiveInventoryItem,
    archiveInventoryLabel,
    archiveInventoryArea,
    archiveWarehouse,
    archiveWarehouseType,
    archiveInventoryAreaType,
    archiveVendor,
    archiveVendorItem
};