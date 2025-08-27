const express = require('express');
const multer = require('multer');
const { uploadVideo } = require('../services/blobService');
const { saveVideo, listVideos } = require('../services/cosmosService');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.post('/upload', requireAuth, requireRole('creator'), upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No video file uploaded' });
    const { originalname, mimetype, buffer } = req.file;
    if (!mimetype.startsWith('video/')) return res.status(400).json({ error: 'File must be a video' });

    const { title = '', publisher = '', genre = '', ageRating = '' } = req.body;
    const id = `${Date.now()}-${originalname.replace(/\s+/g, '_')}`;
    const url = await uploadVideo(id, buffer, mimetype);

    const videoDoc = {
      id, title, publisher, genre, ageRating,
      url, createdAt: new Date().toISOString(),
      uploadedBy: (req.user && req.user.email) || 'unknown'
    };

    const saved = await saveVideo(videoDoc);
    res.json({ success: true, video: saved });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Video upload failed' });
  }
});

router.get('/', async (_req, res) => {
  try {
    const videos = await listVideos();
    res.json(videos);
  } catch (err) {
    console.error('List error:', err);
    res.status(500).json({ error: 'Could not fetch videos' });
  }
});

module.exports = router;
