const express = require('express');
const router = express.Router();
const Story = require('../models/Story');

// 1. Create a new story
router.post('/', async (req, res) => {
    try {
        const { userId, partnerId, mediaUrl, music, overlays, filter } = req.body;
        
        if (!userId || !mediaUrl) {
            return res.status(400).json({ error: 'User ID and Media URL are required' });
        }

        const newStory = new Story({
            userId,
            partnerId,
            mediaUrl,
            music,
            filter: filter || 'none',
            overlays: overlays || []
        });

        await newStory.save();
        res.status(201).json(newStory);
    } catch (err) {
        console.error("Error creating story:", err);
        res.status(500).json({ error: err.message });
    }
});

// 2. Get active stories for just a user (e.g. initial load before partner selected)
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const stories = await Story.find({
            userId: userId,
            createdAt: { $gte: twentyFourHoursAgo }
        })
        .sort({ createdAt: 1 })
        .populate('userId', 'username');

        const groupedStories = {};
        stories.forEach(story => {
            const uid = story.userId._id.toString();
            if (!groupedStories[uid]) {
                groupedStories[uid] = {
                    userId: uid,
                    username: story.userId.username,
                    stories: []
                };
            }
            groupedStories[uid].stories.push(story);
        });

        res.json(Object.values(groupedStories));
    } catch (err) {
        console.error("Error fetching stories:", err);
        res.status(500).json({ error: err.message });
    }
});

// 3. Get active stories for a user and their partner
router.get('/:userId/:partnerId', async (req, res) => {
    try {
        const { userId, partnerId } = req.params;
        const queryIds = [userId, partnerId];
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const stories = await Story.find({
            userId: { $in: queryIds },
            createdAt: { $gte: twentyFourHoursAgo }
        })
        .sort({ createdAt: 1 })
        .populate('userId', 'username');

        const groupedStories = {};
        stories.forEach(story => {
            const uid = story.userId._id.toString();
            if (!groupedStories[uid]) {
                groupedStories[uid] = {
                    userId: uid,
                    username: story.userId.username,
                    stories: []
                };
            }
            groupedStories[uid].stories.push(story);
        });

        res.json(Object.values(groupedStories));
    } catch (err) {
        console.error("Error fetching stories:", err);
        res.status(500).json({ error: err.message });
    }
});

// 4. Delete a story
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedStory = await Story.findByIdAndDelete(id);
        
        if (!deletedStory) {
            return res.status(404).json({ error: 'Story not found' });
        }
        
        res.json({ message: 'Story deleted successfully', id });
    } catch (err) {
        console.error("Error deleting story:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
