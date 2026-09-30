import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { progressAPI } from '../../api/progress';
import { useAuth } from '../../context/AuthContext';

const MyProgress = () => {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const data = await progressAPI.getMyProgress();
      setProgressData(data);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
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
          <h1 style={{ margin: 0 }}>My Progress</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Track your learning journey</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/learner')}
            style={{
              padding: '10px 20px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
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

      {loading && <p>Loading progress...</p>}

      {!loading && progressData.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            background: 'white',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}
        >
          <p style={{ color: '#666', fontSize: '18px' }}>
            No progress yet. Start watching videos to track your progress!
          </p>
        </div>
      )}

      {!loading && progressData.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {progressData.filter(item => item.videoId).map((item) => (
            <div
              key={item._id}
              style={{
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/learner/videos/${item.videoId._id}`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>{item.videoId.title}</h3>
                  {item.videoId.description && (
                    <p style={{ color: '#666', fontSize: '14px', margin: '0 0 15px 0' }}>
                      {item.videoId.description.substring(0, 150)}
                      {item.videoId.description.length > 150 ? '...' : ''}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#666' }}>
                    <span>
                      ⏱️ Last watched: {formatTime(item.lastWatchedTimestamp)}
                    </span>
                    <span>
                      📅 {new Date(item.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    minWidth: '100px',
                    textAlign: 'center',
                    padding: '10px',
                    background: item.isCompleted ? '#d4edda' : '#fff3cd',
                    borderRadius: '4px'
                  }}
                >
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: item.isCompleted ? '#28a745' : '#ffc107' }}>
                    {item.completionPercentage}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    {item.isCompleted ? 'Completed ✓' : 'In Progress'}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: '15px' }}>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    background: '#e0e0e0',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      width: `${item.completionPercentage}%`,
                      height: '100%',
                      background: item.isCompleted ? '#28a745' : '#007bff',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProgress;
