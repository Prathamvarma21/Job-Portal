import express from 'express';

import { updateProfile ,login,register, logout, toggleSaveJob} from '../controllers/user.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { singleUpload } from '../middlewares/multer.js';


const router = express.Router();

router.route('/register').post(singleUpload, register);

router.route('/login').post(login);

router.route('/logout').get(logout);

router.route('/profile/update').post(isAuthenticated, singleUpload, updateProfile);

router.route('/profile/save-job/:id').post(isAuthenticated, toggleSaveJob);

export default router;
