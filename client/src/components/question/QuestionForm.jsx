import { useState, useEffect } from 'react';

const QuestionForm = ({ question, videoDuration, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    timestamp: '',
    questionText: '',
    questionType: 'single',
    options: [
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false }
    ],
    correctAnswer: ''
  });

  useEffect(() => {
    if (question) {
      setFormData({
        timestamp: question.timestamp || '',
        questionText: question.questionText || '',
        questionType: question.questionType || 'single',
        options: question.options && question.options.length > 0
          ? question.options
          : [
              { optionText: '', isCorrect: false },
              { optionText: '', isCorrect: false }
            ],
        correctAnswer: question.correctAnswer || ''
      });
    }
  }, [question]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setFormData({
      ...formData,
      questionType: newType,
      // Reset options when switching to short answer
      options: newType === 'short' ? [] : formData.options
    });
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index][field] = value;

    // For single choice, uncheck other options
    if (field === 'isCorrect' && value && formData.questionType === 'single') {
      newOptions.forEach((opt, i) => {
        if (i !== index) opt.isCorrect = false;
      });
    }

    setFormData({
      ...formData,
      options: newOptions
    });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { optionText: '', isCorrect: false }]
    });
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) {
      alert('At least 2 options required');
      return;
    }
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      options: newOptions
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (formData.questionType !== 'short') {
      const hasCorrect = formData.options.some(opt => opt.isCorrect);
      if (!hasCorrect) {
        alert('Please mark at least one correct answer');
        return;
      }
    }

    onSubmit(formData);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Timestamp (seconds) *
        </label>
        <input
          type="number"
          name="timestamp"
          value={formData.timestamp}
          onChange={handleChange}
          required
          min="0"
          max={videoDuration || 9999}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        {formData.timestamp && (
          <small style={{ color: '#666' }}>Time: {formatTime(formData.timestamp)}</small>
        )}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Question Type *
        </label>
        <select
          name="questionType"
          value={formData.questionType}
          onChange={handleTypeChange}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="single">Single Choice</option>
          <option value="multiple">Multiple Choice</option>
          <option value="short">Short Answer</option>
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Question Text *
        </label>
        <textarea
          name="questionText"
          value={formData.questionText}
          onChange={handleChange}
          required
          rows={3}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      {/* Options for choice questions */}
      {formData.questionType !== 'short' && (
        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ fontWeight: 'bold' }}>Options *</label>
            <button
              type="button"
              onClick={addOption}
              style={{
                padding: '6px 12px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              + Add Option
            </button>
          </div>

          {formData.options.map((option, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '10px',
                alignItems: 'center'
              }}
            >
              <input
                type="checkbox"
                checked={option.isCorrect}
                onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                title="Mark as correct"
              />
              <input
                type="text"
                value={option.optionText}
                onChange={(e) => handleOptionChange(index, 'optionText', e.target.value)}
                placeholder={`Option ${index + 1}`}
                required
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              {formData.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  style={{
                    padding: '6px 10px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <small style={{ color: '#666' }}>
            {formData.questionType === 'single'
              ? 'Check one correct answer'
              : 'Check all correct answers'}
          </small>
        </div>
      )}

      {/* Correct answer for short answer type */}
      {formData.questionType === 'short' && (
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Expected Answer (Optional)
          </label>
          <input
            type="text"
            name="correctAnswer"
            value={formData.correctAnswer}
            onChange={handleChange}
            placeholder="For reference only"
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <small style={{ color: '#666' }}>This won't be validated automatically</small>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '10px 20px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
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
          {isLoading ? 'Saving...' : question ? 'Update Question' : 'Add Question'}
        </button>
      </div>
    </form>
  );
};

export default QuestionForm;
