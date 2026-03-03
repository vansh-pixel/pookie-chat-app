const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mediaUrl: { type: String, required: true },
  type: { type: String, enum: ['image', 'video', 'reel'], required: true },
  caption: { type: String, default: '' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  commentsCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 }, // specifically for reels
  createdAt: { type: Date, default: Date.now },
  // External context (e.g. if we fetched this from a scraper API)
  externalSource: { type: String, enum: ['internal', 'tiktok', 'instagram'], default: 'internal' },
  externalId: { type: String, default: null }
});

module.exports = mongoose.model('Post', postSchema);
