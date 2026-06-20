import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export enum JobStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export enum UrlStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SUCCESS = 'success',
  ERROR = 'error',
  CANCELLED = 'cancelled',
}

export interface UrlResult {
  url: string;
  status: UrlStatus;
  httpStatus?: number;
  error?: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
}

export interface Job {
  id: string;
  createdAt: Date;
  status: JobStatus;
  urls: UrlResult[];
}

@Injectable()
export class JobsService {
  private jobs: Map<string, Job> = new Map();

  async createJob(urls: string[]): Promise<{ jobId: string }> {
    const jobId = uuidv4();
    const urlResults: UrlResult[] = urls.map(url => ({
      url,
      status: UrlStatus.PENDING,
    }));

    const job: Job = {
      id: jobId,
      createdAt: new Date(),
      status: JobStatus.PENDING,
      urls: urlResults,
    };

    this.jobs.set(jobId, job);

    this.processJob(jobId).catch(error => {
      console.error(`Job ${jobId} failed:`, error);
    });

    return { jobId };
  }

  getJobs(): any[] {
    return Array.from(this.jobs.values()).map(job => ({
      id: job.id,
      createdAt: job.createdAt,
      status: job.status,
      totalUrls: job.urls.length,
      successCount: job.urls.filter(u => u.status === UrlStatus.SUCCESS).length,
      errorCount: job.urls.filter(u => u.status === UrlStatus.ERROR).length,
    }));
  }

  getJob(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  cancelJob(id: string): boolean {
    const job = this.jobs.get(id);
    if (!job) {
      return false;
    }

    if (job.status === JobStatus.CANCELLED || 
        job.status === JobStatus.COMPLETED || 
        job.status === JobStatus.FAILED) {
      return false;
    }

    job.status = JobStatus.CANCELLED;
    
    job.urls.forEach(urlResult => {
      if (urlResult.status === UrlStatus.PENDING || urlResult.status === UrlStatus.IN_PROGRESS) {
        urlResult.status = UrlStatus.CANCELLED;
      }
    });

    return true;
  }

  private async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.status = JobStatus.IN_PROGRESS;

    const pendingUrls = job.urls.filter(u => u.status === UrlStatus.PENDING);
    
    const chunks = this.chunkArray(pendingUrls, 5);
    
    for (const chunk of chunks) {
      const currentJob = this.jobs.get(jobId);
      if (!currentJob || currentJob.status === JobStatus.CANCELLED) break;
      
      const promises = chunk.map(urlResult => this.checkUrl(jobId, urlResult));
      await Promise.all(promises);
    }

    const finalJob = this.jobs.get(jobId);
    if (finalJob && finalJob.status !== JobStatus.CANCELLED) {
      const hasErrors = finalJob.urls.some(u => u.status === UrlStatus.ERROR);
      finalJob.status = hasErrors ? JobStatus.FAILED : JobStatus.COMPLETED;
    }
  }

  private async checkUrl(jobId: string, urlResult: UrlResult): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    if (job.status === JobStatus.CANCELLED) {
      urlResult.status = UrlStatus.CANCELLED;
      return;
    }

    urlResult.status = UrlStatus.IN_PROGRESS;
    urlResult.startTime = new Date();

    try {
      const delay = Math.floor(Math.random() * 10000);
      await new Promise(resolve => setTimeout(resolve, delay));

      const currentJob = this.jobs.get(jobId);
      if (!currentJob || currentJob.status === JobStatus.CANCELLED) {
        urlResult.status = UrlStatus.CANCELLED;
        return;
      }

      const response = await axios.head(urlResult.url, {
        timeout: 5000,
        validateStatus: () => true,
      });

      urlResult.httpStatus = response.status;
      urlResult.status = response.status < 400 ? UrlStatus.SUCCESS : UrlStatus.ERROR;
    } catch (error: unknown) {
      urlResult.status = UrlStatus.ERROR;
      if (error instanceof Error) {
        urlResult.error = error.message;
      } else {
        urlResult.error = 'Unknown error occurred';
      }
    } finally {
      urlResult.endTime = new Date();
      if (urlResult.startTime) {
        urlResult.duration = urlResult.endTime.getTime() - urlResult.startTime.getTime();
      }
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}