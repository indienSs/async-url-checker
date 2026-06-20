import { observer } from 'mobx-react-lite';
import { CreateJobForm } from './CreateJobForm';
import { JobList } from './JobList';
import { JobDetails } from './JobDetails';

const App: React.FC = observer(() => {
  return (
    <div className="app">
      <h1>URL Checker</h1>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <CreateJobForm />
          <JobList />
        </div>
        <div style={{ flex: 2 }}>
          <JobDetails />
        </div>
      </div>
    </div>
  );
});

export default App;