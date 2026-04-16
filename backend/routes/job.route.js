import express from 'express';

import { updateProfile ,login,register, logout} from '../controllers/user.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { getAdminJobs, postJob ,getAllJobs, getJobById, updateJob} from '../controllers/job.controller.js';


const router = express.Router();

router.route('/post').post(isAuthenticated,postJob);

router.route('/get').get(getAllJobs);

router.route('/getadminjobs').get(isAuthenticated, getAdminJobs);

router.route('/get/:id').get(getJobById);

router.route('/update/:id').put(isAuthenticated, updateJob);

export default router;
