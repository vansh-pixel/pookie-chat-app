const mongoose = require('mongoose');

const overlaySchema = new mongoose.Schema({
    id: { type: String, required: true },
    type: { type: String, enum: ['text', 'sticker', 'gif', 'lyrics'], required: true },
    content: { type: String, required: true }, // Text, emoji, or GIF URL
    x: { type: Number, required: true }, // Percentage (0-100)
    y: { type: Number, required: true }, // Percentage (0-100)
    scale: { type: Number, default: 1 },
    rotation: { type: Number, default: 0 },
    color: { type: String }, // For text
    fontFamily: { type: String } // For text
});

const storySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, to specifically target
    mediaUrl: { type: String, required: true }, // Background image/video
    filter: { type: String, default: 'none' }, // CSS filter for background
    music: {
        url: { type: String }, // iTunes preview URL or similar
        title: { type: String },
        artist: { type: String },
        startTime: { type: Number, default: 0 }
    },
    overlays: [overlaySchema],
    createdAt: { type: Date, default: Date.now, expires: 86400 } // TTL index: 86400 seconds = 24 hours
});

module.exports = mongoose.model('Story', storySchema);
