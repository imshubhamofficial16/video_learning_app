import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { videoAPI } from '../../api/video';
import { questionAPI } from '../../api/question';
import { responseAPI } from '../../api/response';
import { progressAPI } from '../../api/progress';
import { useAuth } from '../../context/AuthContext';
import VideoPlayer from '../../components/video/VideoPlayer';

const VideoWatch = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [videoId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [videoData, questionsData, responsesData, progressData] = await Promise.all([
        videoAPI.getById(videoId),
        questionAPI.getAll(videoId),
        responseAPI.getVideoResponses(videoId),
        progressAPI.getVideoProgress(videoId)
      ]);

      setVideo(videoData);
      setQuestions(questionsData);
      setResponses(responsesData);
      setProgress(progressData);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const handleProgressUpdate = async (progressData) => {
    try {
      const updatedProgress = await progressAPI.updateProgress(videoId, progressData);
      setProgress(updatedProgress);
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const handleAnswerSubmit = async (questionId, answer) => {
    try {
      const response = await responseAPI.submit({
        questionId,
        videoId,
        answer
      });

      // Update responses
      setResponses(prev => {
        const existing = prev.find(r => r.questionId === questionId);
        if (existing) {
          return prev.map(r => r.questionId === questionId ? response : r);
        }
        return [...prev, response];
      });
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to submit answer');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading video...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <div
          style={{
            padding: '20px',
            background: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px',
            marginBottom: '20px'
          }}
        >
          {error}
        </div>
        <button
          onClick={() => navigate('/learner')}
          style={{
            padding: '10px 20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>{video?.title}</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Welcome, {user?.fullName}</p>
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

      {/* Description */}
      {video?.description && (
        <div
          style={{
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '4px',
            marginBottom: '20px'
          }}
        >
          <p style={{ margin: 0, color: '#333' }}>{video.description}</p>
        </div>
      )}

      {/* Video Player */}
      <VideoPlayer
        video={video}
        questions={questions}
        onAnswerSubmit={handleAnswerSubmit}
        existingResponses={responses}
        onProgressUpdate={handleProgressUpdate}
        initialProgress={progress}
      />

      {/* Video Info */}
      <div style={{ marginTop: '30px' }}>
        <h3>About this video</h3>
        <div style={{ color: '#666' }}>
          <p>📝 {questions.length} interactive {questions.length === 1 ? 'question' : 'questions'}</p>
          <p>⏱️ Duration: {Math.floor(video?.duration / 60)}:{(video?.duration % 60).toString().padStart(2, '0')}</p>
        </div>
      </div>
    </div>
  );
};

export default VideoWatch;
