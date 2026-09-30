import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { videoAPI } from '../../api/video';
import { questionAPI } from '../../api/question';
import { useAuth } from '../../context/AuthContext';
import QuestionForm from '../../components/question/QuestionForm';
import Modal from '../../components/common/Modal';

const QuestionEditor = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [videoId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [videoData, questionsData] = await Promise.all([
        videoAPI.getById(videoId),
        questionAPI.getAll(videoId)
      ]);
      setVideo(videoData);
      setQuestions(questionsData);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingQuestion(null);
    setIsModalOpen(true);
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setIsModalOpen(true);
  };

  const handleSubmit = async (questionData) => {
    try {
      setIsSubmitting(true);
      if (editingQuestion) {
        await questionAPI.update(videoId, editingQuestion._id, questionData);
      } else {
        await questionAPI.create(videoId, questionData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save question');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Delete this question?')) {
      return;
    }

    try {
      await questionAPI.delete(videoId, questionId);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete question');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'single':
        return 'Single Choice';
      case 'multiple':
        return 'Multiple Choice';
      case 'short':
        return 'Short Answer';
      default:
        return type;
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0 }}>Question Editor</h1>
            <p style={{ color: '#666', margin: '5px 0' }}>
              Video: {video?.title || 'Unknown'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate('/admin/videos')}
              style={{
                padding: '10px 20px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Back to Videos
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
      </div>

      {/* Add Question Button */}
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
        + Add Question
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

      {/* Questions List */}
      {questions.length === 0 ? (
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
            No questions added yet. Add your first interactive question!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {questions.map((question) => (
            <div
              key={question._id}
              style={{
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '10px', fontSize: '14px' }}>
                    <span style={{ color: '#007bff', fontWeight: 'bold' }}>
                      ⏱️ {formatTime(question.timestamp)}
                    </span>
                    <span style={{ color: '#666' }}>
                      {getQuestionTypeLabel(question.questionType)}
                    </span>
                  </div>
                  <h3 style={{ margin: '0 0 15px 0' }}>{question.questionText}</h3>

                  {/* Show options for choice questions */}
                  {question.questionType !== 'short' && question.options && (
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {question.options.map((option, idx) => (
                        <li
                          key={idx}
                          style={{
                            color: option.isCorrect ? '#28a745' : '#333',
                            fontWeight: option.isCorrect ? 'bold' : 'normal'
                          }}
                        >
                          {option.optionText}
                          {option.isCorrect && ' ✓'}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Show expected answer for short answer */}
                  {question.questionType === 'short' && question.correctAnswer && (
                    <p style={{ color: '#666', fontSize: '14px', margin: '10px 0 0 0' }}>
                      <strong>Expected:</strong> {question.correctAnswer}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEdit(question)}
                    style={{
                      padding: '6px 12px',
                      background: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(question._id)}
                    style={{
                      padding: '6px 12px',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQuestion ? 'Edit Question' : 'Add Question'}
      >
        <QuestionForm
          question={editingQuestion}
          videoDuration={video?.duration}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default QuestionEditor;
