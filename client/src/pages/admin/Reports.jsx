import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportAPI } from '../../api/report';
import { useAuth } from '../../context/AuthContext';

const Reports = () => {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLearners();
  }, []);

  const fetchLearners = async () => {
    try {
      setLoading(true);
      const data = await reportAPI.getAllLearners();
      setLearners(data);
    } catch (error) {
      console.error('Failed to fetch learners:', error);
    } finally {
      setLoading(false);
    }
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
          <h1 style={{ margin: 0 }}>Learner Reports</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Track learner progress and performance</p>
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

      {loading && <p>Loading reports...</p>}

      {!loading && learners.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            background: 'white',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}
        >
          <p style={{ color: '#666', fontSize: '18px' }}>No learners registered yet.</p>
        </div>
      )}

      {!loading && learners.length > 0 && (
        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #ddd', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8f9fa' }}>
              <tr>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Learner</th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Assigned</th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>In Progress</th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Completed</th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Email</th>
              </tr>
            </thead>
            <tbody>
              {learners.map((learner) => (
                <tr key={learner._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '15px' }}>
                    <strong>{learner.fullName}</strong>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <span style={{ padding: '4px 12px', background: '#e7f3ff', color: '#007bff', borderRadius: '12px', fontSize: '14px' }}>
                      {learner.stats.assigned}
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <span style={{ padding: '4px 12px', background: '#fff3cd', color: '#856404', borderRadius: '12px', fontSize: '14px' }}>
                      {learner.stats.inProgress}
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <span style={{ padding: '4px 12px', background: '#d4edda', color: '#155724', borderRadius: '12px', fontSize: '14px' }}>
                      {learner.stats.completed}
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
                    {learner.email}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Stats */}
      {!loading && learners.length > 0 && (
        <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div style={{ background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff' }}>{learners.length}</div>
            <div style={{ color: '#666', marginTop: '5px' }}>Total Learners</div>
          </div>
          <div style={{ background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>
              {learners.reduce((sum, l) => sum + l.stats.completed, 0)}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Total Completed</div>
          </div>
          <div style={{ background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107' }}>
              {learners.reduce((sum, l) => sum + l.stats.inProgress, 0)}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>In Progress</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
