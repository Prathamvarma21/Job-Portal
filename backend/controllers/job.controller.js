import {Job} from '../models/job.model.js';

export const postJob = async (req, res) => {
  try {
    const { title, description, requirements, salary,location, jobType,experience,position , companyId } = req.body;
    if (!title || !description || !requirements|| !salary||!location|| !jobType||!experience||!position || !companyId) {
      return res.status(400).json({ message: 'Title, description, and company ID are required', success: false });
    }
const userId = req.params.id; 
    // Create the job
    const job = await Job.create({
      title,
      description,
      requirements: requirements.split(','),
        salary:Number,
        location,
        jobType,
        experiencelevel:experience,
        position,
       company: companyId,
        created_by:userId
    });

    return res.status(201).json({ message: 'Job posted successfully', job, success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', success: false });
  }
}

export const getAllJobs = async (req, res) => {
  try {
    const keywords = req.query.keywords || '';
    const query = {
        $or: [
            { title: { $regex: keywords, $options: 'i' } },
            { description: { $regex: keywords, $options: 'i' } },
            { requirements: { $regex: keywords, $options: 'i' } }
        ]
    }
    const jobs = await Job.find(query).populate({path:'company'}).sort({ createdAt: -1 });
    if (!jobs ) {
      return res.status(404).json({ message: 'No jobs found', success: false });
    }
    return res.status(200).json({ jobs, success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', success: false });
  }
}

export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id; // Assuming the job ID is passed as a URL parameter
    const job = await Job.findById(jobId)
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found', success: false });
    }
    
    return res.status(200).json({ job, success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', success: false });
  }
}

export const getAdminJobs = async (req, res) => {
  try {
    const adminId = req.id; // Assuming the user ID is set by authentication middleware
    const jobs = await Job.find({})
    
    if (!jobs) {
      return res.status(404).json({ message: 'No jobs found for this user', success: false });
    }
    
    return res.status(200).json({ jobs, success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', success: false });
  }
}