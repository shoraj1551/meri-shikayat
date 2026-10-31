import Complaint from '../models/Complaint.js';
import mongoose from 'mongoose';
import { unlink } from 'node:fs/promises';
import Category from '../models/Category.js';
import { persistComplaintSubmission } from '../services/complaint-persistence.service.js';
import { enrichComplaintWithML } from '../services/complaint-enrichment.service.js';
import { emitNewComplaint } from '../services/complaint-events.service.js';
import { resolveComplaintCategoryLabel } from '../config/complaintTaxonomy.js';

const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const NEARBY_RADIUS_METRES = 25000;
const EARTH_RADIUS_METRES = 6371000;

class ComplaintInputError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 400;
    }
}

async function removeUploadedFile(file) {
    if (!file?.path) return;
    try {
        await unlink(file.path);
    } catch (error) {
        if (error.code !== 'ENOENT') console.error('Complaint upload cleanup failed:', error);
    }
}

export const getCanonicalCoordinates = location => {
    const coordinates = location?.coordinates;
    const lat = Number(coordinates?.lat ?? coordinates?.latitude);
    const lng = Number(coordinates?.lng ?? coordinates?.longitude);
    return Number.isFinite(lat) && lat >= -90 && lat <= 90 &&
        Number.isFinite(lng) && lng >= -180 && lng <= 180
        ? { lat, lng }
        : null;
};

export const buildNearbyComplaintPipeline = (coordinates, userId) => {
    const latitudeDelta = NEARBY_RADIUS_METRES / 111320;
    const longitudeScale = Math.max(Math.cos(coordinates.lat * Math.PI / 180), 0.01);
    const longitudeDelta = NEARBY_RADIUS_METRES / (111320 * longitudeScale);
    const latRadians = coordinates.lat * Math.PI / 180;
    const lngRadians = coordinates.lng * Math.PI / 180;
    const candidateCosine = {
        $add: [
            {
                $multiply: [
                    Math.sin(latRadians),
                    { $sin: { $degreesToRadians: '$location.coordinates.lat' } }
                ]
            },
            {
                $multiply: [
                    Math.cos(latRadians),
                    { $cos: { $degreesToRadians: '$location.coordinates.lat' } },
                    {
                        $cos: {
                            $subtract: [
                                { $degreesToRadians: '$location.coordinates.lng' },
                                lngRadians
                            ]
                        }
                    }
                ]
            }
        ]
    };

    return [
        {
            $match: {
                user: { $exists: true, $ne: userId },
                isGuest: { $ne: true },
                'location.coordinates.lat': {
                    $gte: Math.max(-90, coordinates.lat - latitudeDelta),
                    $lte: Math.min(90, coordinates.lat + latitudeDelta)
                },
                'location.coordinates.lng': {
                    $gte: Math.max(-180, coordinates.lng - longitudeDelta),
                    $lte: Math.min(180, coordinates.lng + longitudeDelta)
                }
            }
        },
        {
            $set: {
                distanceMetres: {
                    $multiply: [
                        EARTH_RADIUS_METRES,
                        { $acos: { $max: [-1, { $min: [1, candidateCosine] }] } }
                    ]
                }
            }
        },
        { $match: { distanceMetres: { $lte: NEARBY_RADIUS_METRES } } },
        { $sort: { distanceMetres: 1, createdAt: -1 } },
        { $limit: 5 }
    ];
};

async function resolveMLCategory(name) {
    const taxonomyCategory = resolveComplaintCategoryLabel(name);
    if (!taxonomyCategory) return null;
    return Category.findOne({
        name: { $regex: `^${escapeRegex(taxonomyCategory.name)}$`, $options: 'i' },
        isActive: { $ne: false }
    });
}

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (User)
export const createComplaint = async (req, res) => {
    let complaint;
    try {
        const { title, description, category, customCategory, type, location } = req.body;

        // Parse location if it's sent as a string (from FormData)
        let parsedLocation = location;
        if (typeof location === 'string') {
            try {
                parsedLocation = JSON.parse(location);
            } catch (e) {
                throw new ComplaintInputError('Invalid location data');
            }
        }

        const normalizedCustomCategory = customCategory?.trim();
        if (!title?.trim() || !description?.trim()) {
            throw new ComplaintInputError('Title and description are required');
        }
        if (!['text', 'image', 'audio', 'video'].includes(type)) {
            throw new ComplaintInputError('Invalid complaint type');
        }
        if (category && normalizedCustomCategory) {
            throw new ComplaintInputError('Choose either a category or a custom category');
        }
        if (normalizedCustomCategory?.length > 50) {
            throw new ComplaintInputError('Custom category cannot exceed 50 characters');
        }
        const complaintCoordinates = getCanonicalCoordinates(parsedLocation);
        if (!parsedLocation?.address || !complaintCoordinates) {
            throw new ComplaintInputError('A valid location with coordinates is required');
        }
        parsedLocation.coordinates = complaintCoordinates;

        // ML is optional and failure-safe; submission continues if the service is unavailable.
        const enrichment = await enrichComplaintWithML({
            description,
            imagePath: req.file?.path,
            imageMimeType: req.file?.mimetype
        });
        let resolvedCategory = category;
        if (resolvedCategory && !mongoose.Types.ObjectId.isValid(resolvedCategory)) {
            throw new ComplaintInputError('Invalid category');
        }
        if (resolvedCategory) {
            const activeCategory = await Category.exists({ _id: resolvedCategory, isActive: { $ne: false } });
            if (!activeCategory) {
                throw new ComplaintInputError('Invalid or inactive category');
            }
        }
        if (!resolvedCategory && !normalizedCustomCategory && enrichment?.suggestedCategory) {
            const matchedCategory = await resolveMLCategory(enrichment.suggestedCategory);
            resolvedCategory = matchedCategory?._id;
        }

        let mediaData;
        if (req.file) {
            // Determine media type from MIME type
            let mediaType = 'document';
            if (req.file.mimetype.startsWith('image')) {
                mediaType = 'image';
            } else if (req.file.mimetype.startsWith('video')) {
                mediaType = 'video';
            } else if (req.file.mimetype.startsWith('audio')) {
                mediaType = 'audio';
            }

            mediaData = {
                uploadedBy: req.user.id,
                type: mediaType,
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size,
                url: `/uploads/${req.file.filename}`
            };
        }

        complaint = await persistComplaintSubmission({
            complaintData: {
                user: req.user.id,
                type,
                title,
                description,
                category: resolvedCategory,
                customCategory: normalizedCustomCategory || undefined,
                media: [],
                location: parsedLocation,
                priority: enrichment?.suggestedPriority || undefined,
                mlAnalysis: enrichment?.analysis
            },
            mediaData,
            userId: req.user.id,
            userModel: req.user.constructor
        });
    } catch (error) {
        await removeUploadedFile(req.file);
        if (error.statusCode === 400) {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error('Create Complaint Error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Server error while creating complaint'
        });
    }

    // External side effects occur only after the transaction has committed.
    emitNewComplaint(req, complaint);
    return res.status(201).json({ success: true, data: complaint });
};

export const getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ user: req.user.id })
            .populate({
                path: 'category',
                select: 'name icon color',
                options: { strictPopulate: false }
            })
            .populate({
                path: 'department',
                select: 'name',
                options: { strictPopulate: false }
            })
            .populate({
                path: 'media',
                select: 'url type filename',
                options: { strictPopulate: false }
            })
            .sort({ createdAt: -1 })
            .lean(); // Use lean for better performance

        res.json({
            success: true,
            count: complaints.length,
            data: complaints
        });
    } catch (error) {
        console.error('Get My Complaints Error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching complaints',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
// @desc    Get nearby complaints based on user's location
// @route   GET /api/complaints/nearby
// @access  Private (User)
export const getNearbyComplaints = async (req, res) => {
    try {
        const user = req.user;
        const coordinates = getCanonicalCoordinates(user.location);

        // A city label is not a reliable distance measure; coordinates are required.
        if (!coordinates) {
            return res.json({
                success: true,
                count: 0,
                data: []
            });
        }

        const userId = user._id || user.id;
        const complaints = await Complaint.aggregate(buildNearbyComplaintPipeline(coordinates, userId));
        await Complaint.populate(complaints, [
            { path: 'category' },
            { path: 'department' },
            { path: 'media' },
            { path: 'user', select: 'firstName lastName' }
        ]);

        res.json({
            success: true,
            count: complaints.length,
            data: complaints
        });
    } catch (error) {
        console.error('Get Nearby Complaints Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching nearby complaints'
        });
    }
};
