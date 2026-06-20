import { makeAutoObservable, runInAction } from 'mobx';
import { JobListItem, JobDetails, JobStatus, UrlStatus } from '../types';
import { jobsApi } from '../api/jobsApi';

class JobStore {
  jobs: JobListItem[] = [];
  activeJobId: string | null = null;
  activeJobDetails: JobDetails | null = null;
  isLoadingJobs = false;
  isLoadingDetails = false;
  error: string | null = null;
  pollingInterval: NodeJS.Timeout | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async loadJobs() {
    this.isLoadingJobs = true;
    this.error = null;
    try {
      const jobs = await jobsApi.getJobs();
      runInAction(() => {
        this.jobs = jobs;
        this.isLoadingJobs = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = 'Failed to load jobs';
        this.isLoadingJobs = false;
      });
    }
  }

  async createJob(urls: string[]) {
    this.error = null;
    try {
      const { jobId } = await jobsApi.createJob(urls);
      runInAction(() => {
        this.setActiveJob(jobId);
      });
      await this.loadJobs();
    } catch (err) {
      runInAction(() => {
        this.error = 'Failed to create job';
      });
    }
  }

  setActiveJob(jobId: string | null) {
    this.stopPolling();
    this.activeJobId = jobId;
    this.activeJobDetails = null;
    
    if (jobId) {
      this.startPolling();
    }
  }

  async loadJobDetails(jobId: string) {
    if (this.activeJobId !== jobId) return;
    
    this.isLoadingDetails = true;
    try {
      const details = await jobsApi.getJobDetails(jobId);
      runInAction(() => {
        if (this.activeJobId === jobId) {
          this.activeJobDetails = details;
          this.isLoadingDetails = false;
          
          if (this.isJobFinal(details.status)) {
            this.stopPolling();
          }
        }
      });
    } catch (err) {
      runInAction(() => {
        if (this.activeJobId === jobId) {
          this.error = 'Failed to load job details';
          this.isLoadingDetails = false;
        }
      });
    }
  }

  async cancelJob(jobId: string) {
    try {
      await jobsApi.cancelJob(jobId);
      await this.loadJobs();
      if (this.activeJobId === jobId) {
        this.stopPolling();
      }
    } catch (err) {
      runInAction(() => {
        this.error = 'Failed to cancel job';
      });
    }
  }

  private startPolling() {
    if (!this.activeJobId) return;
    
    this.loadJobDetails(this.activeJobId);
    
    this.pollingInterval = setInterval(() => {
      if (this.activeJobId) {
        this.loadJobDetails(this.activeJobId);
      }
    }, 2000);
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private isJobFinal(status: JobStatus): boolean {
    return [
      JobStatus.COMPLETED,
      JobStatus.CANCELLED,
      JobStatus.FAILED,
    ].includes(status);
  }

  getProgress(): { processed: number; total: number } | null {
    if (!this.activeJobDetails) return null;
    
    const total = this.activeJobDetails.urls.length;
    const processed = this.activeJobDetails.urls.filter(
      u => u.status !== UrlStatus.PENDING
    ).length;
    
    return { processed, total };
  }
}

export const jobStore = new JobStore();