import { observer } from 'mobx-react-lite';
import { jobStore } from '../stores/jobStore';
import { UrlStatus } from '../types';

export const JobDetails: React.FC = observer(() => {
  if (!jobStore.activeJobId) {
    return <div className="job-details">Select a job to view details</div>;
  }

  const progress = jobStore.getProgress();

  const getStatusColor = (status: UrlStatus): string => {
    switch (status) {
      case UrlStatus.SUCCESS: return 'green';
      case UrlStatus.ERROR: return 'red';
      case UrlStatus.IN_PROGRESS: return 'blue';
      case UrlStatus.CANCELLED: return 'orange';
      default: return 'gray';
    }
  };

  return (
    <div className="job-details">
      <h2>Детали проверки: {jobStore.activeJobId?.substring(0, 8)}...</h2>
      
      {progress && (
        <div>
          <strong>Прогресс:</strong> {progress.processed} из {progress.total} выполняется
          {jobStore.activeJobDetails && (
            <span> (Статус: {jobStore.activeJobDetails.status})</span>
          )}
        </div>
      )}

      <button 
        onClick={() => jobStore.cancelJob(jobStore.activeJobId!)}
        disabled={!jobStore.activeJobDetails || 
          ['completed', 'cancelled', 'failed'].includes(jobStore.activeJobDetails.status)}
      >
        Прервать запрос
      </button>

      {jobStore.isLoadingDetails && <div>Loading details...</div>}

      {jobStore.activeJobDetails && (
        <div className="url-list">
          <h3>URLs:</h3>
          {jobStore.activeJobDetails.urls.map((urlResult, index) => (
            <div
              key={index}
              style={{
                padding: '10px',
                margin: '5px 0',
                border: '1px solid #ccc',
                backgroundColor: '#f9f9f9'
              }}
            >
              <div>
                <strong>URL:</strong> {urlResult.url}
              </div>
              <div>
                <strong>Статус:</strong>{' '}
                <span style={{ color: getStatusColor(urlResult.status) }}>
                  {urlResult.status}
                </span>
              </div>
              {urlResult.httpStatus && (
                <div><strong>HTTP статус:</strong> {urlResult.httpStatus}</div>
              )}
              {urlResult.error && (
                <div style={{ color: 'red' }}>
                  <strong>Error:</strong> {urlResult.error}
                </div>
              )}
              {urlResult.startTime && (
                <div>
                  <strong>Начало обработки:</strong> {new Date(urlResult.startTime).toLocaleString()}
                </div>
              )}
              {urlResult.endTime && (
                <div>
                  <strong>Окончание обработки:</strong> {new Date(urlResult.endTime).toLocaleString()}
                </div>
              )}
              {urlResult.duration && (
                <div>
                  <strong>Продолжительность:</strong> {urlResult.duration}ms
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});