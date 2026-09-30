import { useState } from 'react';

const MultipleChoiceQuestion = ({ question, onSubmit, initialAnswer }) => {
  const [selectedOptions, setSelectedOptions] = useState(initialAnswer || []);

  const handleToggle = (optionId) => {
    if (selectedOptions.includes(optionId)) {
      setSelectedOptions(selectedOptions.filter(id => id !== optionId));
    } else {
      setSelectedOptions([...selectedOptions, optionId]);
    }
  };

  const handleSubmit = () => {
    if (selectedOptions.length === 0) {
      alert('Please select at least one answer');
      return;
    }
    onSubmit(selectedOptions);
  };

  return (
    <div>
      <h3 style={{ marginBottom: '20px' }}>{question.questionText}</h3>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
        Select all that apply
      </p>
      <div style={{ marginBottom: '20px' }}>
        {question.options.map((option) => (
          <div
            key={option._id}
            style={{
              marginBottom: '12px',
              padding: '12px',
              border: selectedOptions.includes(option._id) ? '2px solid #007bff' : '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              background: selectedOptions.includes(option._id) ? '#e7f3ff' : 'white'
            }}
            onClick={() => handleToggle(option._id)}
          >
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedOptions.includes(option._id)}
                onChange={() => handleToggle(option._id)}
                style={{ marginRight: '10px' }}
              />
              <span>{option.optionText}</span>
            </label>
          </div>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        style={{
          padding: '10px 30px',
          background: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
          width: '100%'
        }}
      >
        Submit Answer
      </button>
    </div>
  );
};

export default MultipleChoiceQuestion;
