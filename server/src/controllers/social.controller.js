/**
 * Social Controller
 * Handles user search, connections, and messaging
 */

import User from '../models/User.js';
import Connection from '../models/Connection.js';
import Message from '../models/Message.js';

// --- User Search & Discovery ---

export const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters' });
        }

        // Case-insensitive search by name
        const users = await User.find({
            $or: [
                { firstName: { $regex: q, $options: 'i' } },
                { lastName: { $regex: q, $options: 'i' } }
            ],
            _id: { $ne: req.user._id } // Exclude self
        }).select('firstName lastName email role location createdAt');

        res.json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getRecommendedUsers = async (req, res) => {
    try {
        // Simple recommendation: Users in same city
        const currentUser = await User.findById(req.user._id);
        const city = currentUser.location?.city;

        let query = { _id: { $ne: req.user._id } };
        if (city) {
            query['location.city'] = { $regex: city, $options: 'i' };
        }

        const users = await User.find(query)
            .limit(5)
            .select('firstName lastName location');

        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Connections ---

export const sendConnectionRequest = async (req, res) => {
    try {
        const { recipientId, type } = req.body; // type: 'friend' or 'follow'

        if (recipientId === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Cannot connect with yourself' });
        }

        const existing = await Connection.findOne({
            requester: req.user._id,
            recipient: recipientId
        });

        if (existing) {
            return res.status(400).json({ success: false, message: 'Connection already exists' });
        }

        const status = type === 'follow' ? 'following' : 'pending';

        const connection = await Connection.create({
            requester: req.user._id,
            recipient: recipientId,
            type,
            status
        });

        res.status(201).json({ success: true, data: connection });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const respondToRequest = async (req, res) => {
    try {
        const { connectionId, action } = req.body; // action: 'accept' or 'reject'

        const connection = await Connection.findOne({
            _id: connectionId,
            recipient: req.user._id,
            status: 'pending'
        });

        if (!connection) {
            return res.status(404).json({ success: false, message: 'Connection request not found' });
        }

        if (action === 'accept') {
            connection.status = 'accepted';
        } else {
            connection.status = 'rejected';
        }

        await connection.save();

        res.json({ success: true, data: connection });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMyNetwork = async (req, res) => {
    try {
        // Get friends (accepted) and following
        const connections = await Connection.find({
            $or: [
                { requester: req.user._id },
                { recipient: req.user._id, status: 'accepted' }
            ]
        }).populate('requester recipient', 'firstName lastName location');

        res.json({ success: true, data: connections });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Messaging ---

export const sendMessage = async (req, res) => {
    try {
        const { recipientId, content } = req.body;

        const message = await Message.create({
            sender: req.user._id,
            recipient: recipientId,
            content
        });

        res.status(201).json({ success: true, data: message });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getConversation = async (req, res) => {
    try {
        const { userId } = req.params;

        const messages = await Message.find({
            $or: [
                { sender: req.user._id, recipient: userId },
                { sender: userId, recipient: req.user._id }
            ]
        })
            .sort({ createdAt: 1 }) // Chronological order
            .populate('sender', 'firstName lastName');

        res.json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getInbox = async (req, res) => {
    try {
        // Get list of users heavily chatted with (distinct)
        // Note: MongoDB aggregation is best here, simplifying for MVP
        const messages = await Message.find({
            $or: [{ sender: req.user._id }, { recipient: req.user._id }]
        }).sort({ createdAt: -1 });

        const uniqueContacts = new Set();
        const inbox = [];

        for (const msg of messages) {
            const otherId = msg.sender.toString() === req.user._id.toString()
                ? msg.recipient.toString()
                : msg.sender.toString();

            if (!uniqueContacts.has(otherId)) {
                uniqueContacts.add(otherId);
                // In a real app, populate user details here efficiently
                inbox.push({
                    userId: otherId,
                    lastMessage: msg.content,
                    timestamp: msg.createdAt
                });
            }
        }

        res.json({ success: true, data: inbox });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
