import express from 'express';

import { updateProfile ,login,register, logout} from '../controllers/user.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { getAdminJobs, postJob ,getAllJobs, getJobById} from '../controllers/job.controller.js';


const router = express.Router();

router.route('/post').post(isAuthenticated,postJob);

router.route('/get').post(isAuthenticated, getAllJobs);

router.route('/getadminjobs').get(isAuthenticated, getJobById);

router.route('/get/:id').get(isAuthenticated,getAdminJobs);

export default router;
