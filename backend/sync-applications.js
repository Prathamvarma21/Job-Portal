import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { Job } from './models/job.model.js';
import { Application } from './models/application.model.js';

const syncApplications = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const applications = await Application.find({});
        console.log(`Found ${applications.length} applications.`);

        for (const app of applications) {
            const job = await Job.findById(app.job);
            if (job) {
                if (!job.applications.includes(app._id)) {
                    job.applications.push(app._id);
                    await job.save();
                    console.log(`Linked application ${app._id} to job ${job._id}`);
                }
            } else {
                console.log(`Job ${app.job} not found for application ${app._id}`);
            }
        }
        
        console.log('Sync complete!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

syncApplications();
