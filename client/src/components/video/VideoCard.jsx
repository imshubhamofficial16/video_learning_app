import { useNavigate } from 'react-router-dom';
import { getAssetUrl } from '../../api/video';

const VideoCard = ({ video, onEdit, onDelete, onTogglePublish, isAdmin }) => {
  const navigate = useNavigate();
  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        background: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      {video.thumbnailUrl && (
        <img
          src={getAssetUrl(video.thumbnailUrl)}
          alt={video.title}
          style={{
            width: '100%',
            height: '180px',
            objectFit: 'cover',
            borderRadius: '4px',
            marginBottom: '10px'
          }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}

      <h3 style={{ margin: '0 0 10px 0' }}>{video.title}</h3>

      {video.description && (
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
          {video.description.length > 100
            ? `${video.description.substring(0, 100)}...`
            : video.description}
        </p>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '14px', color: '#666' }}>
        <span>Duration: {formatDuration(video.duration)}</span>
        <span>•</span>
        <span
          style={{
            color: video.isPublished ? '#28a745' : '#ffc107',
            fontWeight: 'bold'
          }}
        >
          {video.isPublished ? 'Published' : 'Draft'}
        </span>
      </div>

      {isAdmin && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onEdit(video)}
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
            onClick={() => navigate(`/admin/videos/${video._id}/questions`)}
            style={{
              padding: '6px 12px',
              background: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Questions
          </button>
          <button
            onClick={() => onTogglePublish(video._id)}
            style={{
              padding: '6px 12px',
              background: video.isPublished ? '#ffc107' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {video.isPublished ? 'Unpublish' : 'Publish'}
          </button>
          <button
            onClick={() => onDelete(video._id)}
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
      )}
    </div>
  );
};

export default VideoCard;
