const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

// Middleware to verify token (you likely have this in your auth middleware, adjust path if needed)
// Assuming we have some basic verification or we just use userId from body for simplicity in this app
// For a production app, use proper JWT middleware

// GET /api/feed/posts
// Fetch mixed feed (images & videos) with algorithm sorting
router.get('/posts/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Fetch all posts (in a real app, you'd filter by following, but here we just get all or partner's)
        const posts = await Post.find({ type: { $in: ['image', 'video'] } })
            .populate('userId', 'username profilePic')
            .lean();

        // Algorithm Scoring: (Likes * 10) + (Comments * 20) / (Hours_Since_Posted + 2)^1.5
        const now = new Date();
        
        const scoredPosts = posts.map(post => {
            const hoursSincePosted = Math.max(0, (now - new Date(post.createdAt)) / (1000 * 60 * 60));
            
            let score = 0;
            const engagement = (post.likes.length * 10) + (post.commentsCount * 20);
            
            if (engagement > 0) {
                // Decay engagement over time
                score = engagement / Math.pow(hoursSincePosted + 2, 1.5);
            } else {
                // If no engagement, just sort purely by recency (newer is better)
                score = 100 / Math.pow(hoursSincePosted + 2, 1.5);
            }

            return { ...post, score };
        });

        // Sort by score descending
        scoredPosts.sort((a, b) => b.score - a.score);

        // Paginate
        const paginatedPosts = scoredPosts.slice(skip, skip + limit);

        res.json(paginatedPosts);
    } catch (err) {
        console.error("Error fetching feed", err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/feed/reels
// Fetch only vertical videos (reels), optimized for infinite scroll and view counting
router.get('/reels/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const reels = await Post.find({ type: 'reel' })
            .populate('userId', 'username profilePic')
            .lean();

        const now = new Date();
        
        const scoredReels = reels.map(reel => {
            const hoursSincePosted = Math.max(0, (now - new Date(reel.createdAt)) / (1000 * 60 * 60));
            // Reels algorithm slightly favors raw views over just likes
            const engagement = (reel.likes.length * 10) + (reel.views * 1) + (reel.commentsCount * 20);
            
            let score = 0;
            if (engagement > 0) {
                score = engagement / Math.pow(hoursSincePosted + 2, 1.2); // Slower decay for reels
            } else {
                score = 100 / Math.pow(hoursSincePosted + 2, 1.2);
            }

            return { ...reel, score };
        });

        scoredReels.sort((a, b) => b.score - a.score);
        const paginatedReels = scoredReels.slice(skip, skip + limit);

        res.json(paginatedReels);
    } catch (err) {
        console.error("Error fetching reels", err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/feed/create
// Create a new post/reel manually (User Generated Content)
router.post('/create', async (req, res) => {
    try {
        const { userId, mediaUrl, type, caption } = req.body;
        
        const newPost = new Post({
            userId,
            mediaUrl,
            type,
            caption,
            externalSource: 'internal'
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (err) {
        console.error("Error creating post", err);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// POST /api/feed/:postId/interact
// Handle likes and views
router.post('/:postId/interact', async (req, res) => {
    try {
        const { postId } = req.params;
        const { action, userId } = req.body; // action: 'like', 'unlike', 'view'

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        if (action === 'like') {
            if (!post.likes.includes(userId)) {
                post.likes.push(userId);
            }
        } else if (action === 'unlike') {
            post.likes = post.likes.filter(id => id.toString() !== userId);
        } else if (action === 'view') {
            post.views += 1;
        }

        await post.save();
        res.json(post);
    } catch (err) {
        console.error("Error interacting with post", err);
        res.status(500).json({ error: 'Interaction failed' });
    }
});

// GET /api/feed/fetch-external
// Placeholder endpoint to pull safe shorts/reels from a 3rd party API
router.post('/fetch-external', async (req, res) => {
    const { userId } = req.body;
    try {
        // In a real scenario, you'd use axios here to hit RapidAPI (e.g. TikTok Scraper)
        // using safe hashtags like #cute, #couples
        
        // Mocking the external fetch for now
        const mockExternalReel = new Post({
            userId, // Assigning it to the user who fetched it, or an admin bot user
            mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // Safe sample video
            type: 'reel',
            caption: 'Look at this cute video! #wholesome',
            externalSource: 'tiktok',
            externalId: 'mock_tx_123'
        });

        await mockExternalReel.save();

        res.json({ message: 'Successfully fetched safe external reels', reel: mockExternalReel });
    } catch (err) {
        console.error("Failed to fetch external", err);
        res.status(500).json({ error: 'Failed to fetch external content' });
    }
});

// GET /api/feed/public-reels
// Allows frontend to get mock reel data cleanly using the backend Node.js environment
// This bypasses browser CORS errors safely and now hits live reddit.
router.get('/public-reels', async (req, res) => {
    try {
        const afterToken = req.query.after || '';
        const safeSubreddits = 'aww+MadeMeSmile+funny+TikTokCats+TikTokDogs+TikTokPets';
        const url = `https://www.reddit.com/r/${safeSubreddits}/hot.json?limit=50${afterToken ? `&after=${afterToken}` : ''}`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch from Reddit');
        const data = await response.json();
        
        const posts = data.data.children;
        const newAfter = data.data.after;
        
        const formattedReels = posts
            .filter((p) => p.data.is_video && p.data.media?.reddit_video?.fallback_url)
            .map((p) => ({
                _id: p.data.id,
                userId: {
                    _id: p.data.author,
                    username: `@${p.data.author}`,
                    profilePic: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.data.author}`
                },
                mediaUrl: p.data.media.reddit_video.fallback_url,
                caption: p.data.title,
                likes: [],
                commentsCount: p.data.num_comments,
                views: p.data.ups 
            }));
            
        res.json({ data: { children: formattedReels, after: newAfter } });
    } catch (err) {
        console.error("Error fetching live reels", err);
        res.status(500).json({ error: "Failed to fetch live reels" });
    }
});

module.exports = router;
