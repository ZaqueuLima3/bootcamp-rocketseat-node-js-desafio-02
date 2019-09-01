import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import SubscriptionController from './app/controllers/SubscriptionController';
import EventController from './app/controllers/EventController';

import authMeddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/session', SessionController.store);

routes.use(authMeddleware);

routes.put('/users', UserController.update);

routes.get('/meetups', MeetupController.index);
routes.get('/meetups/:meetupId', MeetupController.show);
routes.post('/meetups', MeetupController.store);
routes.put('/meetups/:meetupId', MeetupController.update);
routes.delete('/meetups/:meetupId', MeetupController.delete);

routes.get('/events', EventController.index);
routes.get('/subscription', SubscriptionController.index);

routes.post('/meetups/:meetupId/subscription', SubscriptionController.store);
routes.delete('/meetups/:meetupId/subscription', SubscriptionController.delete);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
