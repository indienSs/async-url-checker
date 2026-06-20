import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';

@Controller('api/jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  async createJob(@Body() createJobDto: CreateJobDto) {
    return this.jobsService.createJob(createJobDto.urls);
  }

  @Get()
  async getJobs() {
    return this.jobsService.getJobs();
  }

  @Get(':id')
  async getJob(@Param('id') id: string) {
    const job = this.jobsService.getJob(id);
    if (!job) {
      return { error: 'Job not found' };
    }
    return job;
  }

  @Delete(':id')
  async cancelJob(@Param('id') id: string) {
    const success = this.jobsService.cancelJob(id);
    if (!success) {
      return { error: 'Job not found or already cancelled' };
    }
    return { success: true };
  }
}