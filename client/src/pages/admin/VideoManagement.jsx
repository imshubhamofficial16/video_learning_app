import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI } from '../../api/video';
import { useAuth } from '../../context/AuthContext';
import VideoCard from '../../components/video/VideoCard';
import VideoForm from '../../components/video/VideoForm';
import Modal from '../../components/common/Modal';

const VideoManagement = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const data = await videoAPI.getAll();
      setVideos(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingVideo(null);
    setIsModalOpen(true);
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setIsModalOpen(true);
  };

  const handleSubmit = async (videoData) => {
    try {
      setIsSubmitting(true);
      setUploadProgress(0);
      if (editingVideo) {
        await videoAPI.update(editingVideo._id, videoData);
      } else {
        // videoData is FormData for uploads; track progress
        await videoAPI.create(videoData, (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        });
      }
      setIsModalOpen(false);
      fetchVideos();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save video');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      await videoAPI.delete(id);
      fetchVideos();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete video');
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      await videoAPI.togglePublish(id);
      fetchVideos();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update video status');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Video Management</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Welcome, {user?.fullName}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/admin')}
            style={{
              padding: '10px 20px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back to Dashboard
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Create Button */}
      <button
        onClick={handleCreate}
        style={{
          padding: '12px 24px',
          background: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
          marginBottom: '20px'
        }}
      >
        + Create Video
      </button>

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: '15px',
            background: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px',
            marginBottom: '20px'
          }}
        >
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && <p>Loading videos...</p>}

      {/* Videos Grid */}
      {!loading && videos.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            background: 'white',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}
        >
          <p style={{ color: '#666', fontSize: '18px' }}>No videos yet. Create your first video!</p>
        </div>
      )}

      {!loading && videos.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}
        >
          {videos.map((video) => (
            <VideoCard
              key={video._id}
              video={video}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTogglePublish={handleTogglePublish}
              isAdmin={true}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVideo ? 'Edit Video' : 'Create Video'}
      >
        <VideoForm
          video={editingVideo}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={isSubmitting}
          uploadProgress={uploadProgress}
        />
      </Modal>
    </div>
  );
};

export default VideoManagement;
