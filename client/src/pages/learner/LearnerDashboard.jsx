import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { videoAPI } from '../../api/video';
import VideoCard from '../../components/video/VideoCard';

const LearnerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const data = await videoAPI.getAll();
      setVideos(data);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>My Learning</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/learner/progress')}
            style={{
              padding: '8px 16px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📊 My Progress
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
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
      <p>Welcome, {user?.fullName}!</p>

      {loading && <p>Loading videos...</p>}

      {!loading && videos.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            background: 'white',
            borderRadius: '8px',
            border: '1px solid #ddd',
            marginTop: '30px'
          }}
        >
          <p style={{ color: '#666', fontSize: '18px' }}>No videos available yet.</p>
        </div>
      )}

      {!loading && videos.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>Available Videos ({videos.length})</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
              marginTop: '20px'
            }}
          >
            {videos.map((video) => (
              <div
                key={video._id}
                onClick={() => navigate(`/learner/videos/${video._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <VideoCard video={video} isAdmin={false} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnerDashboard;
