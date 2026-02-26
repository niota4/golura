const _ = require('lodash');
const { Sequelize, Op } = require('sequelize');
const {
    Image,
    Video,
    Document,
    Event,
    Estimate,
    EventActivity,
    User,
    UserPreference,
    Marketing

} = require('../models');

const getPhoto = async (req, res) => {
    try {
        const { id } = req.body;
        const image = await Image.findOne({
            where: { id, isActive: true },
            include: [
                {
                    model: Event,
                    as: 'Event',
                },
                {
                    model: Estimate,
                    as: 'Estimate',
                },
                {
                    model: Image,
                    as: 'OriginalImage',
                },
                {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'email', 'firstName', 'lastName', 'roleId', 'isActive'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ]
                },
            ],
        });

        if (!image) {
            return res.status(404).json({ err: true, msg: 'Image not found' });
        }

        const childImages = await Image.findAll({
            where: { originalImageId: id, isActive: true },
        });

        res.status(200).json({
            err: false,
            msg: 'Image successfully retrieved',
            image: image,
            childImages: childImages,
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message,
        });
    }
};
const getPhotoByUrl = async (req, res) => {
    try {
        const { url } = req.body;
        const image = await Image.findOne({
            where: { url, isActive: true },
            include: [
                {
                    model: Event,
                    as: 'Event',
                },
                {
                    model: Estimate,
                    as: 'Estimate',
                },
                {
                    model: Image,
                    as: 'OriginalImage',
                },
                {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'email', 'firstName', 'lastName', 'roleId', 'isActive'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ]
                },
            ],
        });

        if (!image) {
            return res.status(404).json({ err: true, msg: 'Image not found' });
        }

        const childImages = await Image.findAll({
            where: { originalImageId: image.id, isActive: true },
        });

        res.status(200).json({
            err: false,
            msg: 'Image successfully retrieved',
            image: image,
            childImages: childImages,
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message,
        });
    }
};
const getVideo = async (req, res) => {
    try {
        const { id } = req.body;
        const video = await Video.findOne({
            where: { id, isActive: true },
            include: [
                {
                    model: Event,
                    as: 'Event',
                },
                {
                    model: Estimate,
                    as: 'Estimate',
                },
                {
                    model: Video,
                    as: 'OriginalVideo',
                },
                {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'email', 'firstName', 'lastName', 'roleId', 'isActive'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ]
                },
            ],
        });

        if (!video) {
            return res.status(404).json({ err: true, msg: 'Video not found' });
        }

        const childVideos = await Video.findAll({
            where: { originalVideoId: id, isActive: true },
        });

        res.status(200).json({
            err: false,
            msg: 'Video successfully retrieved',
            video: video,
            childVideos: childVideos,
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message,
        });
    }
};
const getDocuments = async (req, res) => {
    try {
        const { id } = req.body;
        const document = await Document.findOne({
            where: { id, isActive: true },
            include: [
                {
                    model: Event,
                    as: 'Event',
                },
                {
                    model: Estimate,
                    as: 'Estimate',
                },
                {
                    model: Document,
                    as: 'OriginalDocument',
                },
                {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'email', 'firstName', 'lastName', 'roleId', 'isActive'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ]
                },
            ],
        });

        if (!document) {
            return res.status(404).json({ err: true, msg: 'Document not found' });
        }

        const childDocuments = await Document.findAll({
            where: { originalDocumentId: id, isActive: true },
        });

        res.status(200).json({
            err: false,
            msg: 'Document successfully retrieved',
            document: document,
            childDocuments: childDocuments,
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message,
        });
    }
};
const associatePhoto = async (req, res) => {
    try {
        const { type, associations } = req.body;

        if (!type || !associations || !Array.isArray(associations)) {
            return res.status(400).json({ message: 'Invalid request format. "type" and "associations" array are required.' });
        }

        const validTypes = ['events', 'estimates', 'marketing'];
        if (!validTypes.includes(type.toLowerCase())) {
            return res.status(400).json({ message: `Invalid type. Expected one of: ${validTypes.join(', ')}` });
        }

        const associationField = `${type.slice(0, -1)}Id`; // eventId, estimateId, marketingId
        const createdRecords = [];

        // Iterate over the provided associations
        for (const association of associations) {
            const id = association.id; // Event/Estimate/Marketing ID
            const imageId = association.imageId; // Supplied imageId to be copied

            // Remove all existing images for the current association ID
            const existingImages = await Image.findAll({
                where: {
                    [associationField]: id,
                },
            });

            for (const existing of existingImages) {
                await existing.destroy();

                // Log removal activity
                await logActivity(
                    type,
                    'Image',
                    existing.id,
                    id,
                    'DELETE',
                    req.userId,
                    `Unassociated a Image. <a href="${existing.url}" target="_blank">Click here to view image</a>`
                );
            }

            // Copy the supplied image
            const originalImage = await Image.findOne({ where: { id: imageId } });
            if (!originalImage) {
                return res.status(404).json({ message: `Image with id ${imageId} not found.` });
            }

            const newImageData = {
                ...originalImage.toJSON(),
                [associationField]: id,
                originalImageId: imageId,
                id: undefined, // Ensure a new record is created
            };

            const newImage = await Image.create(newImageData);
            createdRecords.push(newImage);

            // Log creation activity
            await logActivity(
                type,
                'Image',
                newImage.id,
                id,
                'CREATE',
                req.userId,
                `Associated a Image. <a href="${newImage.url}" target="_blank">Click here to view image</a>`
            );
        }

        return res.status(201).json({
            err: false,
            msg: `Images successfully associated with the ${type}`,
            associations: createdRecords,
        });
    } catch (error) {
        console.error('Error associating images:', error);
        return res.status(500).json({ message: 'An error occurred.', error: error.message });
    }
};
const associateVideo = async (req, res) => {
    try {
        const { type, associations } = req.body;

        if (!type || !associations || !Array.isArray(associations)) {
            return res.status(400).json({ message: 'Invalid request format. "type" and "associations" array are required.' });
        }

        const validTypes = ['events', 'estimates', 'marketing'];
        if (!validTypes.includes(type.toLowerCase())) {
            return res.status(400).json({ message: `Invalid type. Expected one of: ${validTypes.join(', ')}` });
        }

        const associationField = `${type.slice(0, -1)}Id`; // eventId, estimateId, marketingId
        const createdRecords = [];

        // Iterate over the provided associations
        for (const association of associations) {
            const id = association.id; // Event/Estimate/Marketing ID
            const videoId = association.videoId; // Supplied videoId to be copied

            // Remove all existing videos for the current association ID
            const existingVideos = await Video.findAll({
                where: {
                    [associationField]: id,
                },
            });

            for (const existing of existingVideos) {
                await existing.destroy();

                // Log removal activity
                await logActivity(
                    type,
                    'Video',
                    existing.id,
                    id,
                    'DELETE',
                    req.userId,
                    `Unassociated a Video. <a href="${existing.url}" target="_blank">Click here to view video</a>`
                );
            }

            // Copy the supplied video
            const originalVideo = await Video.findOne({ where: { id: videoId } });
            if (!originalVideo) {
                return res.status(404).json({ message: `Video with id ${videoId} not found.` });
            }

            const newVideoData = {
                ...originalVideo.toJSON(),
                [associationField]: id,
                originalVideoId: videoId,
                id: undefined, // Ensure a new record is created
            };

            const newVideo = await Video.create(newVideoData);
            createdRecords.push(newVideo);

            // Log creation activity
            await logActivity(
                type,
                'Video',
                newVideo.id,
                id,
                'CREATE',
                req.userId,
                `Associated a Video. <a href="${newVideo.url}" target="_blank">Click here to view video</a>`
            );
        }

        return res.status(201).json({
            err: false,
            msg: `Videos successfully associated with the ${type}`,
            associations: createdRecords,
        });
    } catch (error) {
        console.error('Error associating videos:', error);
        return res.status(500).json({ message: 'An error occurred.', error: error.message });
    }
};
const associateDocument = async (req, res) => {
    try {
        const { type, associations } = req.body;

        if (!type || !associations || !Array.isArray(associations)) {
            return res.status(400).json({ message: 'Invalid request format. "type" and "associations" array are required.' });
        }

        const validTypes = ['events', 'estimates', 'marketing'];
        if (!validTypes.includes(type.toLowerCase())) {
            return res.status(400).json({ message: `Invalid type. Expected one of: ${validTypes.join(', ')}` });
        }

        const associationField = `${type.slice(0, -1)}Id`; // eventId, estimateId, marketingId
        const createdRecords = [];

        // Iterate over the provided associations
        for (const association of associations) {
            const id = association.id; // Event/Estimate/Marketing ID
            const documentId = association.documentId; // Supplied documentId to be copied

            // Remove all existing documents for the current association ID
            const existingDocuments = await Document.findAll({
                where: {
                    [associationField]: id,
                },
            });

            for (const existing of existingDocuments) {
                await existing.destroy();

                // Log removal activity
                await logActivity(
                    type,
                    'Document',
                    existing.id,
                    id,
                    'DELETE',
                    req.userId,
                    `Unassociated a Document. <a href="${existing.url}" target="_blank">Click here to view document</a>`
                );
            }

            // Copy the supplied document
            const originalDocument = await Document.findOne({ where: { id: documentId } });
            if (!originalDocument) {
                return res.status(404).json({ message: `Document with id ${documentId} not found.` });
            }

            const newDocumentData = {
                ...originalDocument.toJSON(),
                [associationField]: id,
                originalDocumentId: documentId,
                id: undefined, // Ensure a new record is created
            };

            const newDocument = await Document.create(newDocumentData);
            createdRecords.push(newDocument);

            // Log creation activity
            await logActivity(
                type,
                'Document',
                newDocument.id,
                id,
                'CREATE',
                req.userId,
                `Associated a Document. <a href="${newDocument.url}" target="_blank">Click here to view document</a>`
            );
        }

        return res.status(201).json({
            err: false,
            msg: `Documents successfully associated with the ${type}`,
            associations: createdRecords,
        });
    } catch (error) {
        console.error('Error associating documents:', error);
        return res.status(500).json({ message: 'An error occurred.', error: error.message });
    }
};
const deletePhoto = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ err: true, msg: 'Photo ID is required.' });
        }

        await Image.update({ isActive: false }, { where: { id } });

        res.status(200).json({
            err: false,
            msg: 'Photo deleted successfully.',
        });
    } catch (err) {
        console.error('Error deleting photo:', err);
        res.status(500).json({
            err: true,
            msg: 'Failed to delete photo.',
            details: err.message,
        });
    }
};
const deletePhotos = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !ids.length) {
            return res.status(400).json({ err: true, msg: 'Photo IDs are required.' });
        }

        await Image.update({ isActive: false }, { where: { id: ids } });

        res.status(200).json({
            err: false,
            msg: 'Photos deleted successfully.',
        });
    } catch (err) {
        console.error('Error deleting photos:', err);
        res.status(500).json({
            err: true,
            msg: 'Failed to delete photos.',
            details: err.message,
        });
    }
};
const deleteVideo = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ err: true, msg: 'Video ID is required.' });
        }

        await Video.update({ isActive: false }, { where: { id } });

        res.status(200).json({
            err: false,
            msg: 'Video deleted successfully.',
        });
    } catch (err) {
        console.error('Error deleting video:', err);
        res.status(500).json({
            err: true,
            msg: 'Failed to delete video.',
            details: err.message,
        });
    }
};
const deleteVideos = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !ids.length) {
            return res.status(400).json({ err: true, msg: 'Video IDs are required.' });
        }

        await Video.update({ isActive: false }, { where: { id: ids } });

        res.status(200).json({
            err: false,
            msg: 'Videos deleted successfully.',
        });
    } catch (err) {
        console.error('Error deleting videos:', err);
        res.status(500).json({
            err: true,
            msg: 'Failed to delete videos.',
            details: err.message,
        });
    }
};
const deleteDocument = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ err: true, msg: 'Document ID is required.' });
        }

        await Document.update({ isActive: false }, { where: { id } });

        res.status(200).json({
            err: false,
            msg: 'Document deleted successfully.',
        });
    } catch (err) {
        console.error('Error deleting document:', err);
        res.status(500).json({
            err: true,
            msg: 'Failed to delete document.',
            details: err.message,
        });
    }
};
const deleteDocuments = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !ids.length) {
            return res.status(400).json({ err: true, msg: 'Document IDs are required.' });
        }

        await Document.update({ isActive: false }, { where: { id: ids } });

        res.status(200).json({
            err: false,
            msg: 'Documents deleted successfully.',
        });
    } catch (err) {
        console.error('Error deleting documents:', err);
        res.status(500).json({
            err: true,
            msg: 'Failed to delete documents.',
            details: err.message,
        });
    }
};
const logActivity = async (type, relatedModel, relatedModelId, associationId, action, userId, description) => {
    const activityData = {
        [`${type.slice(0, -1)}Id`]: associationId,
        relatedModel,
        relatedModelId,
        changedBy: userId,
        action,
        description,
    };
    console.log(activityData)
    if (type === 'events') {
        await EventActivity.create(activityData);
    } else if (type === 'estimates') {
        await EstimateActivity.create(activityData);
    }
};

module.exports = {
    getPhoto,
    getPhotoByUrl,
    getVideo,
    getDocuments,
    associatePhoto,
    associateVideo,
    associateDocument,
    deletePhoto,
    deletePhotos,
    deleteVideo,
    deleteVideos,
    deleteDocument,
    deleteDocuments,

};