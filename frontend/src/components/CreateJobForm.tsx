import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { jobStore } from '../stores/jobStore';

export const CreateJobForm: React.FC = observer(() => {
  const [textareaValue, setTextareaValue] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const urls = textareaValue
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);
    
    if (urls.length === 0) return;
    
    await jobStore.createJob(urls);
    setTextareaValue('');
  };

  return (
    <div className="create-job-form">
      <h2>Создать новую проверку</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={textareaValue}
          onChange={(e) => setTextareaValue(e.target.value)}
          placeholder="Введите url (построчно)"
          rows={5}
          cols={50}
          required
        />
        <br />
        <button type="submit">Начать проверку</button>
      </form>
      {jobStore.error && <div className="error">{jobStore.error}</div>}
    </div>
  );
});