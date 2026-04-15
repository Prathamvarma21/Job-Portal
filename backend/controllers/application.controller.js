import { Application } from '../models/application.model.js';
import { Job } from '../models/job.model.js';

export const applyjob = async (req, res) => {
  try {
    const jobId = req.params.id; // Assuming the job ID is passed as a URL parameter
    const userId = req.id;
    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required', success: false });
    }
    const existingApplication = await Application.findOne({ job: jobId, applicant: userId });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job', success: false });
    }

    const application = await Application.create({
      job: jobId,
      applicant: userId,
      status: 'applied'
    });
    const job = await Job.findById(jobId).populate('company');
    if (!job) {
      return res.status(404).json({ message: 'Job not found', success: false });
    }
    const newApplication = await Application.create({
      job: jobId,
      applicant: userId,

    });
    job.applicants.push(newApplication._id);
    await job.save();

    return res.status(201).json({ message: 'Application submitted successfully', application, job, success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', success: false });
  }
}

export const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.id; // Assuming the user ID is set by authentication middleware
    const applications = await Application.find({ applicant: userId }).sort({ createdAt: -1 }).populate({
      path: 'job',
      options: { sort: { createdAt: -1 } },
      populate: {
        path: 'company',
        options: { sort: { createdAt: -1 } }
      }

    });

    if (!application) {
      return res.status(404).json({ message: 'No applications found for this user', success: false });
    }

    return res.status(200).json({ applications, success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error', success: false });
  }
}

export const getApplicants = async (req, res) => {
  try {
    const jobId = req.params.id; // Assuming the job ID is passed as a URL parameter
    const applicants = await Application.find({ job: jobId }).populate({
      path: 'applications',
      options: { sort: { createdAt: -1 } },
      populate: {
        path: 'applicant',
      }
    });
    if (!job) {
      return res.status(404).json({ message: 'Job not found', success: false });
    }
    return res.status(200).json({ job, success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error', success: false });
  }
}

export const updateStatus = async (req, res) => {
  try {

    const { status } = req.body; // Expecting status to be passed in the request body
    const applicationId = req.params.id; // Assuming the application ID is passed as a URL parameter
    if (!status) {
      return res.status(400).json({ message: 'Status is required', success: false });
    }

    const application = await Application.findOne({ _id: applicationId });

    if (!application) {
      return res.status(404).json({ message: 'Application not found', success: false });
    }
    application.status = status.toLowerCase();
    await application.save();
    return res.status(200).json({ message: 'Application status updated successfully', application, success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error', success: false });
  }
}