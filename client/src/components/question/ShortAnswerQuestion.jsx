import { useState } from 'react';

const ShortAnswerQuestion = ({ question, onSubmit, initialAnswer }) => {
  const [answer, setAnswer] = useState(initialAnswer || '');

  const handleSubmit = () => {
    if (!answer.trim()) {
      alert('Please enter an answer');
      return;
    }
    onSubmit(answer);
  };

  return (
    <div>
      <h3 style={{ marginBottom: '20px' }}>{question.questionText}</h3>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here..."
        rows={4}
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '14px',
          marginBottom: '20px',
          resize: 'vertical'
        }}
      />
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

export default ShortAnswerQuestion;
