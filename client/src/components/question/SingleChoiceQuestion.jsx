import { useState } from 'react';

const SingleChoiceQuestion = ({ question, onSubmit, initialAnswer }) => {
  const [selectedOption, setSelectedOption] = useState(initialAnswer || '');

  const handleSubmit = () => {
    if (!selectedOption) {
      alert('Please select an answer');
      return;
    }
    onSubmit(selectedOption);
  };

  return (
    <div>
      <h3 style={{ marginBottom: '20px' }}>{question.questionText}</h3>
      <div style={{ marginBottom: '20px' }}>
        {question.options.map((option) => (
          <div
            key={option._id}
            style={{
              marginBottom: '12px',
              padding: '12px',
              border: selectedOption === option._id ? '2px solid #007bff' : '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              background: selectedOption === option._id ? '#e7f3ff' : 'white'
            }}
            onClick={() => setSelectedOption(option._id)}
          >
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="answer"
                value={option._id}
                checked={selectedOption === option._id}
                onChange={() => setSelectedOption(option._id)}
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

export default SingleChoiceQuestion;
