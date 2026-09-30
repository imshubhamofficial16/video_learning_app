import { useState, useEffect, useRef } from 'react';

const VideoForm = ({ video, onSubmit, onCancel, isLoading, uploadProgress }) => {
  const isEdit = Boolean(video);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: ''
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const videoInputRef = useRef(null);

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title || '',
        description: video.description || '',
        duration: video.duration || ''
      });
    }
  }, [video]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    setFileError('');
    if (!file) {
      setVideoFile(null);
      return;
    }

    // Validate type
    if (!file.type.startsWith('video/')) {
      setFileError('Please select a valid video file');
      setVideoFile(null);
      return;
    }

    setVideoFile(file);

    // Auto-detect duration from the video metadata
    const videoEl = document.createElement('video');
    videoEl.preload = 'metadata';
    videoEl.onloadedmetadata = () => {
      window.URL.revokeObjectURL(videoEl.src);
      const detectedDuration = Math.round(videoEl.duration);
      if (detectedDuration && !isNaN(detectedDuration)) {
        setFormData((prev) => ({ ...prev, duration: detectedDuration }));
      }
    };
    videoEl.src = URL.createObjectURL(file);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith('image/')) {
      setFileError('Thumbnail must be an image file');
      return;
    }
    setThumbnailFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFileError('');

    if (isEdit) {
      // Edit only updates metadata (title, description, duration)
      onSubmit({
        title: formData.title,
        description: formData.description,
        duration: formData.duration ? Number(formData.duration) : 0
      });
      return;
    }

    // Create requires a video file
    if (!videoFile) {
      setFileError('Please select a video file to upload');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('duration', formData.duration || 0);
    data.append('video', videoFile);
    if (thumbnailFile) {
      data.append('thumbnail', thumbnailFile);
    }

    onSubmit(data);
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      {/* Video file upload - only on create */}
      {!isEdit && (
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Video File *
          </label>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
            Supported: MP4, WebM, OGG, MOV, AVI, MKV (max 500MB)
          </small>
          {videoFile && (
            <div style={{ marginTop: '8px', padding: '8px', background: '#e7f3ff', borderRadius: '4px', fontSize: '14px' }}>
              📹 {videoFile.name} ({formatBytes(videoFile.size)})
            </div>
          )}
        </div>
      )}

      {isEdit && (
        <div style={{ marginBottom: '15px', padding: '10px', background: '#fff3cd', color: '#856404', borderRadius: '4px', fontSize: '14px' }}>
          ℹ️ Video file cannot be changed. Delete and re-upload to replace the video.
        </div>
      )}

      {/* Thumbnail upload - only on create */}
      {!isEdit && (
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Thumbnail (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          {thumbnailFile && (
            <div style={{ marginTop: '8px', padding: '8px', background: '#e7f3ff', borderRadius: '4px', fontSize: '14px' }}>
              🖼️ {thumbnailFile.name} ({formatBytes(thumbnailFile.size)})
            </div>
          )}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Duration (seconds)
        </label>
        <input
          type="number"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          min="0"
          placeholder="Auto-detected from video"
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <small style={{ color: '#666' }}>Auto-detected when you select a video file</small>
      </div>

      {/* File error */}
      {fileError && (
        <div style={{ marginBottom: '15px', padding: '10px', background: '#f8d7da', color: '#721c24', borderRadius: '4px', fontSize: '14px' }}>
          {fileError}
        </div>
      )}

      {/* Upload progress bar */}
      {isLoading && uploadProgress > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '5px' }}>
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div style={{ width: '100%', height: '10px', background: '#e0e0e0', borderRadius: '5px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${uploadProgress}%`,
                height: '100%',
                background: '#28a745',
                transition: 'width 0.2s ease'
              }}
            />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Upload & Create'}
        </button>
      </div>
    </form>
  );
};

export default VideoForm;
