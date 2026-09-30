import { useState, useRef, useEffect } from 'react';
import Modal from '../common/Modal';
import SingleChoiceQuestion from '../question/SingleChoiceQuestion';
import MultipleChoiceQuestion from '../question/MultipleChoiceQuestion';
import ShortAnswerQuestion from '../question/ShortAnswerQuestion';
import useAutoSave from '../../hooks/useAutoSave';
import { getStreamUrl } from '../../api/video';

const VideoPlayer = ({ video, questions, onAnswerSubmit, existingResponses, onProgressUpdate, initialProgress }) => {
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(initialProgress?.lastWatchedTimestamp || 0);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [hasStarted, setHasStarted] = useState(false);
  const [hasResumed, setHasResumed] = useState(false);

  const streamUrl = getStreamUrl(video._id);

  useEffect(() => {
    // Mark already answered questions
    if (existingResponses && existingResponses.length > 0) {
      const answeredIds = existingResponses.map(r => r.questionId._id || r.questionId);
      setAnsweredQuestions(new Set(answeredIds));
    }
  }, [existingResponses]);

  // Auto-save progress every 5 seconds
  useAutoSave(() => {
    if (hasStarted && currentTime > 0 && onProgressUpdate) {
      const completionPercentage = video.duration
        ? Math.min(100, Math.round((currentTime / video.duration) * 100))
        : 0;

      onProgressUpdate({
        lastWatchedTimestamp: currentTime,
        completionPercentage,
        totalWatchTime: currentTime
      });
    }
  }, 5000);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    const playedSeconds = Math.floor(videoRef.current.currentTime);
    setCurrentTime(playedSeconds);

    if (!hasStarted && playedSeconds > 0) {
      setHasStarted(true);
    }

    // Check if there's a question at this timestamp that hasn't been answered
    const question = questions.find(
      q => q.timestamp === playedSeconds && !answeredQuestions.has(q._id)
    );

    if (question && !activeQuestion) {
      setActiveQuestion(question);
      videoRef.current.pause();
    }
  };

  const handleLoadedMetadata = () => {
    // Resume from last watched position (once)
    if (!hasResumed && initialProgress?.lastWatchedTimestamp > 0 && videoRef.current) {
      videoRef.current.currentTime = initialProgress.lastWatchedTimestamp;
      setHasResumed(true);
    }
  };

  const handleAnswerSubmit = async (answer) => {
    if (!activeQuestion) return;

    try {
      await onAnswerSubmit(activeQuestion._id, answer);

      // Mark question as answered
      setAnsweredQuestions(prev => new Set([...prev, activeQuestion._id]));

      // Close modal and resume video
      setActiveQuestion(null);
      if (videoRef.current) {
        videoRef.current.play();
      }
    } catch (error) {
      alert('Failed to submit answer. Please try again.');
    }
  };

  const renderQuestion = () => {
    if (!activeQuestion) return null;

    const existingResponse = existingResponses?.find(
      r => (r.questionId._id || r.questionId) === activeQuestion._id
    );

    switch (activeQuestion.questionType) {
      case 'single':
        return (
          <SingleChoiceQuestion
            question={activeQuestion}
            onSubmit={handleAnswerSubmit}
            initialAnswer={existingResponse?.answer}
          />
        );
      case 'multiple':
        return (
          <MultipleChoiceQuestion
            question={activeQuestion}
            onSubmit={handleAnswerSubmit}
            initialAnswer={existingResponse?.answer}
          />
        );
      case 'short':
        return (
          <ShortAnswerQuestion
            question={activeQuestion}
            onSubmit={handleAnswerSubmit}
            initialAnswer={existingResponse?.answer}
          />
        );
      default:
        return <p>Unknown question type</p>;
    }
  };

  return (
    <div>
      {/* Native HTML5 Video Player streaming from backend */}
      <div style={{ position: 'relative', background: '#000', borderRadius: '4px', overflow: 'hidden' }}>
        <video
          ref={videoRef}
          src={streamUrl}
          controls
          controlsList="nodownload"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          style={{ width: '100%', display: 'block', maxHeight: '500px' }}
        >
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Resume indicator */}
      {initialProgress && initialProgress.lastWatchedTimestamp > 0 && initialProgress.completionPercentage < 95 && (
        <div style={{ marginTop: '10px', padding: '10px', background: '#d1ecf1', color: '#0c5460', borderRadius: '4px', fontSize: '14px' }}>
          ▶️ Resuming from {Math.floor(initialProgress.lastWatchedTimestamp / 60)}:{(initialProgress.lastWatchedTimestamp % 60).toString().padStart(2, '0')} ({initialProgress.completionPercentage}% complete)
        </div>
      )}

      {/* Question Modal */}
      <Modal
        isOpen={!!activeQuestion}
        onClose={() => {}}
        title="Question"
      >
        {renderQuestion()}
        <div style={{ marginTop: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
          <small style={{ color: '#666' }}>
            💡 The video will resume after you submit your answer
          </small>
        </div>
      </Modal>

      {/* Progress indicator */}
      <div style={{ marginTop: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontWeight: 'bold' }}>Progress</span>
          <span>{answeredQuestions.size} / {questions.length} questions answered</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${questions.length > 0 ? (answeredQuestions.size / questions.length) * 100 : 0}%`,
              height: '100%',
              background: '#28a745',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
