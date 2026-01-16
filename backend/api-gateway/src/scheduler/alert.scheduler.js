/**
 * Alert Scheduler
 * Periodic evaluation of alerts using cron jobs
 */

const cron = require('node-cron');
const alertEngine = require('../services/alert.engine');

class AlertScheduler {
  constructor() {
    this.jobs = {};
    this.initialized = false;
  }

  /**
   * Initialize scheduler with default jobs
   */
  async initialize() {
    if (this.initialized) {
      console.log('Alert scheduler already initialized');
      return;
    }

    console.log('Initializing alert scheduler...');

    // Daily alert evaluation at 9 AM
    this.scheduleJob('daily_alerts', '0 9 * * *', async () => {
      console.log('[Alert Scheduler] Running daily alert evaluation');
      try {
        const result = await alertEngine.evaluateAllAlerts({ 
          evaluationFrequency: 'daily' 
        });
        console.log(`[Alert Scheduler] Daily evaluation complete: ${result.triggered}/${result.total} triggered`);
      } catch (error) {
        console.error('[Alert Scheduler] Error in daily alert evaluation:', error);
      }
    });

    // Hourly alert evaluation
    this.scheduleJob('hourly_alerts', '0 * * * *', async () => {
      console.log('[Alert Scheduler] Running hourly alert evaluation');
      try {
        const result = await alertEngine.evaluateAllAlerts({ 
          evaluationFrequency: 'hourly' 
        });
        console.log(`[Alert Scheduler] Hourly evaluation complete: ${result.triggered}/${result.total} triggered`);
      } catch (error) {
        console.error('[Alert Scheduler] Error in hourly alert evaluation:', error);
      }
    });

    // Real-time alert evaluation every 5 minutes (if needed for price alerts)
    this.scheduleJob('realtime_alerts', '*/5 * * * *', async () => {
      console.log('[Alert Scheduler] Running real-time alert evaluation');
      try {
        const result = await alertEngine.evaluateAllAlerts({ 
          evaluationFrequency: 'realtime' 
        });
        console.log(`[Alert Scheduler] Real-time evaluation complete: ${result.triggered}/${result.total} triggered`);
      } catch (error) {
        console.error('[Alert Scheduler] Error in real-time alert evaluation:', error);
      }
    });

    this.initialized = true;
    console.log('Alert scheduler initialized successfully');
  }

  /**
   * Schedule a custom cron job
   */
  scheduleJob(name, cronPattern, callback) {
    if (this.jobs[name]) {
      console.log(`Job ${name} already exists. Stopping existing job.`);
      this.jobs[name].stop();
    }

    try {
      const job = cron.schedule(cronPattern, callback);
      this.jobs[name] = job;
      console.log(`[Alert Scheduler] Scheduled job: ${name} (${cronPattern})`);
    } catch (error) {
      console.error(`[Alert Scheduler] Error scheduling job ${name}:`, error);
      throw error;
    }
  }

  /**
   * Stop a scheduled job
   */
  stopJob(name) {
    if (this.jobs[name]) {
      this.jobs[name].stop();
      delete this.jobs[name];
      console.log(`[Alert Scheduler] Stopped job: ${name}`);
    }
  }

  /**
   * Stop all scheduled jobs
   */
  stopAll() {
    Object.keys(this.jobs).forEach(name => {
      this.stopJob(name);
    });
    console.log('[Alert Scheduler] All jobs stopped');
  }

  /**
   * Get job status
   */
  getJobStatus(name) {
    return {
      name,
      exists: !!this.jobs[name],
      running: this.jobs[name]?.status === 'started'
    };
  }

  /**
   * Get all jobs status
   */
  getAllJobsStatus() {
    const status = {};
    Object.keys(this.jobs).forEach(name => {
      status[name] = this.getJobStatus(name);
    });
    return status;
  }
}

// Export singleton instance
module.exports = new AlertScheduler();
