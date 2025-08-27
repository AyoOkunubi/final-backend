const express = require('express');
const { addComment, getComments } = require('../services/cosmosService');
const { analyzeSentiment } = require('../services/sentimentService');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/:videoId', requireAuth, async (req, res) => {
  try {
    const { videoId } = req.params;
    const { text = '' } = req.body;
    if (!text) return res.status(400).json({ error: 'Comment text is required' });

    const sentiment = await analyzeSentiment(text);
    const userId = (req.user && req.user.email) || 'user';

    const comment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      videoId,
      user: userId,
      text,
      sentiment,
      createdAt: new Date().toISOString()
    };
    const saved = await addComment(comment);
    res.json(saved);
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ error: 'Could not add comment' });
  }
});

router.get('/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const comments = await getComments(videoId);
    res.json(comments);
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ error: 'Could not fetch comments' });
  }
});

module.exports = router;
