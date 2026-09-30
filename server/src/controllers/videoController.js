const Video = require('../models/Video');
const path = require('path');
const fs = require('fs');

// @desc    Get all videos
// @route   GET /api/videos
// @access  Private
const getVideos = async (req, res) => {
  try {
    const query = {};

    // If learner, only show published videos
    if (req.user.role === 'learner') {
      query.isPublished = true;
    }

    const videos = await Video.find(query)
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.json(videos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Private
const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('createdBy', 'fullName email');

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Learners can only see published videos
    if (req.user.role === 'learner' && !video.isPublished) {
      return res.status(403).json({ message: 'This video is not available' });
    }

    res.json(video);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create video (with file upload)
// @route   POST /api/videos
// @access  Private (Admin only)
const createVideo = async (req, res) => {
  try {
    const { title, description, duration } = req.body;

    // Video file is required
    if (!req.files || !req.files.video) {
      return res.status(400).json({ message: 'Video file is required' });
    }

    const videoFile = req.files.video[0];
    // Store relative path used for streaming endpoint
    const videoUrl = `/uploads/videos/${videoFile.filename}`;

    // Optional thumbnail
    let thumbnailUrl = '';
    if (req.files.thumbnail) {
      thumbnailUrl = `/uploads/thumbnails/${req.files.thumbnail[0].filename}`;
    }

    const video = await Video.create({
      title,
      description,
      thumbnailUrl,
      videoUrl,
      duration: duration ? Number(duration) : 0,
      createdBy: req.user._id
    });

    res.status(201).json(video);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Stream video with range support
// @route   GET /api/videos/:id/stream
// @access  Private
const streamVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Learners can only stream published videos
    if (req.user.role === 'learner' && !video.isPublished) {
      return res.status(403).json({ message: 'This video is not available' });
    }

    // Resolve absolute path from stored relative videoUrl
    const videoPath = path.join(__dirname, '../../', video.videoUrl);

    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ message: 'Video file not found on server' });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Determine content type from extension
    const ext = path.extname(videoPath).toLowerCase();
    const mimeTypes = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.ogg': 'video/ogg',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.mkv': 'video/x-matroska'
    };
    const contentType = mimeTypes[ext] || 'video/mp4';

    if (range) {
      // Partial content - enables seeking and efficient streaming
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const file = fs.createReadStream(videoPath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType
      });

      file.pipe(res);
    } else {
      // Full content
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes'
      });

      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update video
// @route   PUT /api/videos/:id
// @access  Private (Admin only)
const updateVideo = async (req, res) => {
  try {
    const { title, description, thumbnailUrl, videoUrl, duration } = req.body;

    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    video.title = title || video.title;
    video.description = description !== undefined ? description : video.description;
    video.thumbnailUrl = thumbnailUrl !== undefined ? thumbnailUrl : video.thumbnailUrl;
    video.videoUrl = videoUrl || video.videoUrl;
    video.duration = duration || video.duration;

    const updatedVideo = await video.save();

    res.json(updatedVideo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private (Admin only)
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Clean up uploaded files from disk
    const filesToDelete = [];
    if (video.videoUrl && video.videoUrl.startsWith('/uploads/')) {
      filesToDelete.push(path.join(__dirname, '../../', video.videoUrl));
    }
    if (video.thumbnailUrl && video.thumbnailUrl.startsWith('/uploads/')) {
      filesToDelete.push(path.join(__dirname, '../../', video.thumbnailUrl));
    }

    filesToDelete.forEach((filePath) => {
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error(`Failed to delete file ${filePath}:`, err.message);
        }
      }
    });

    await video.deleteOne();

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Toggle video publish status
// @route   PATCH /api/videos/:id/publish
// @access  Private (Admin only)
const togglePublish = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    video.isPublished = !video.isPublished;
    await video.save();

    res.json({
      message: `Video ${video.isPublished ? 'published' : 'unpublished'} successfully`,
      video
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  togglePublish,
  streamVideo
};
