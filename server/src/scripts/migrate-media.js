import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Complaint from '../models/Complaint.js';
import Media from '../models/Media.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const migrateMedia = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // Find complaints with mediaUrl (using lean to get fields not in schema)
        // Note: If mediaUrl was removed from schema, we need to be careful.
        // But we can try to find documents where media is empty and we suspect old data.
        // Or better, use the raw collection.

        const collection = mongoose.connection.db.collection('complaints');
        const legacyComplaints = await collection.find({
            mediaUrl: { $exists: true, $ne: null },
            $or: [{ media: { $exists: false } }, { media: { $size: 0 } }]
        }).toArray();

        console.log(`Found ${legacyComplaints.length} complaints with legacy mediaUrl.`);

        let migratedCount = 0;

        for (const comp of legacyComplaints) {
            if (!comp.mediaUrl) continue;

            console.log(`Migrating complaint ${comp._id}...`);

            // Determine type
            let type = 'image';
            const lowerUrl = comp.mediaUrl.toLowerCase();
            if (lowerUrl.match(/\.(mp4|webm|ogg)$/)) type = 'video';
            if (lowerUrl.match(/\.(mp3|wav)$/)) type = 'audio';
            if (lowerUrl.match(/\.(pdf|doc|docx)$/)) type = 'document';

            // Create Media document
            const media = await Media.create({
                complaint: comp._id,
                uploadedBy: comp.user, // Assuming user field exists
                type: type,
                url: comp.mediaUrl,
                filename: path.basename(comp.mediaUrl),
                originalName: path.basename(comp.mediaUrl),
                mimeType: type === 'image' ? 'image/jpeg' : 'application/octet-stream', // Fallback
                size: 0 // Unknown size
            });

            // Update Complaint
            await Complaint.updateOne(
                { _id: comp._id },
                {
                    $push: { media: media._id },
                    $unset: { mediaUrl: "" }
                }
            );

            migratedCount++;
        }

        console.log(`Migration completed. Migrated ${migratedCount} complaints.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateMedia();
