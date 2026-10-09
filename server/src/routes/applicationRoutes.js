import { Router } from 'express';
import {
  createApplication, listApplications, getApplication,
  updateApplication, deleteApplication,
} from '../controllers/applicationController.js';
import { validateApplication, validateId } from '../middleware/validateApplication.js';

const router = Router();
router.param('id', validateId);
router.route('/')
  .post(validateApplication, createApplication)
  .get(listApplications);
router.route('/:id')
  .get(getApplication)
  .patch(validateApplication, updateApplication)
  .delete(deleteApplication);

export default router;
