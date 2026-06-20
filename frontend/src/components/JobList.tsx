import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { jobStore } from '../stores/jobStore';

export const JobList: React.FC = observer(() => {
  useEffect(() => {
    jobStore.loadJobs();
    const interval = setInterval(() => jobStore.loadJobs(), 5000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="job-list">
      <h2>История проверок</h2>
      {jobStore.isLoadingJobs && <div>Loading jobs...</div>}
      {jobStore.jobs.map(job => (
        <div
          key={job.id}
          className={`job-item ${job.id === jobStore.activeJobId ? 'active' : ''}`}
          onClick={() => jobStore.setActiveJob(job.id)}
          style={{
            cursor: 'pointer',
            padding: '10px',
            margin: '5px 0',
            border: '1px solid #ccc',
            backgroundColor: job.id === jobStore.activeJobId ? '#e0e0e0' : 'white'
          }}
        >
          <div><strong>ID:</strong> {job.id.substring(0, 8)}...</div>
          <div><strong>Создана:</strong> {formatDate(job.createdAt)}</div>
          <div><strong>Статус:</strong> {job.status}</div>
          <div>
            <strong>Результат:</strong> {job.successCount} успешно / {job.errorCount} с ошибкой
            (всего: {job.totalUrls})
          </div>
        </div>
      ))}
    </div>
  );
});