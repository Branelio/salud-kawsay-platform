import { Router } from 'express';

// Repositories
import {
  JsonPatientRepository,
  JsonClinicalRecordRepository,
  JsonVitalSignsRepository,
  JsonNurseRepository,
  JsonBookingRepository,
  JsonAlertRepository,
  JsonReviewRepository,
  JsonMessagingService
} from '../database/JsonRepositories';

// Use Cases
import { AdminAuthUseCase } from '../../application/use-cases/AdminAuthUseCase';
import { GetStatsUseCase } from '../../application/use-cases/GetStatsUseCase';
import { CheckinNurseUseCase } from '../../application/use-cases/CheckinNurseUseCase';
import { VerifyCedulaUseCase } from '../../application/use-cases/VerifyCedulaUseCase';
import { SaveClinicalRecordUseCase } from '../../application/use-cases/SaveClinicalRecordUseCase';
import { RegisterVitalSignsUseCase } from '../../application/use-cases/RegisterVitalSignsUseCase';
import { ResolveAlertUseCase } from '../../application/use-cases/ResolveAlertUseCase';
import { CreateBookingUseCase } from '../../application/use-cases/CreateBookingUseCase';
import { AddReviewUseCase } from '../../application/use-cases/AddReviewUseCase';

// Controllers
import { AuthController, StatsController } from './controllers/AuthAndStatsControllers';
import { NursesController, PatientsController } from './controllers/NursesAndPatientsControllers';
import { ClinicalRecordsController, VitalsController, AlertsController } from './controllers/ClinicalAndVitalsControllers';
import { BookingsController, ReviewsController, WhatsAppController } from './controllers/BookingsReviewsAndWhatsAppControllers';

export function createApiRouter(): Router {
  const router = Router();

  // Instantiate Repositories
  const patientRepo = new JsonPatientRepository();
  const clinicalRepo = new JsonClinicalRecordRepository();
  const vitalsRepo = new JsonVitalSignsRepository();
  const nurseRepo = new JsonNurseRepository();
  const bookingRepo = new JsonBookingRepository();
  const alertRepo = new JsonAlertRepository();
  const reviewRepo = new JsonReviewRepository();
  const messagingService = new JsonMessagingService();

  // Instantiate Use Cases
  const adminAuthUseCase = new AdminAuthUseCase();
  const getStatsUseCase = new GetStatsUseCase(bookingRepo, patientRepo, nurseRepo, alertRepo, reviewRepo);
  const checkinNurseUseCase = new CheckinNurseUseCase(nurseRepo, patientRepo, messagingService);
  const verifyCedulaUseCase = new VerifyCedulaUseCase(patientRepo, clinicalRepo);
  const saveClinicalRecordUseCase = new SaveClinicalRecordUseCase(clinicalRepo, patientRepo);
  const registerVitalSignsUseCase = new RegisterVitalSignsUseCase(vitalsRepo, alertRepo, patientRepo, messagingService);
  const resolveAlertUseCase = new ResolveAlertUseCase(alertRepo);
  const createBookingUseCase = new CreateBookingUseCase(bookingRepo, patientRepo, messagingService);
  const addReviewUseCase = new AddReviewUseCase(reviewRepo);

  // Instantiate Controllers
  const authController = new AuthController(adminAuthUseCase);
  const statsController = new StatsController(getStatsUseCase);
  const nursesController = new NursesController(nurseRepo, checkinNurseUseCase);
  const patientsController = new PatientsController(patientRepo, verifyCedulaUseCase);
  const clinicalController = new ClinicalRecordsController(clinicalRepo, saveClinicalRecordUseCase);
  const vitalsController = new VitalsController(vitalsRepo, registerVitalSignsUseCase);
  const alertsController = new AlertsController(alertRepo, resolveAlertUseCase);
  const bookingsController = new BookingsController(bookingRepo, createBookingUseCase);
  const reviewsController = new ReviewsController(reviewRepo, addReviewUseCase);
  const waController = new WhatsAppController(messagingService);

  // Health
  router.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Salud Kawsay API Clean Architecture',
      time: new Date().toISOString()
    });
  });

  // Auth & Stats
  router.post('/auth/login', authController.login);
  router.get('/stats', statsController.getStats);

  // Nurses & Checkins
  router.get('/nurses', nursesController.getAll);
  router.post('/nurses', nursesController.create);
  router.post('/nurses/checkin', nursesController.checkin);
  router.get('/nurses/checkins', nursesController.getCheckins);

  // Patients & Cédula
  router.get('/patients', patientsController.getAll);
  router.get('/patients/cedula/:cedula', patientsController.getByCedula);

  // Clinical Records
  router.get('/clinical-records', clinicalController.getAll);
  router.get('/clinical-records/:patientId', clinicalController.getByPatientId);
  router.post('/clinical-records', clinicalController.save);

  // Bookings
  router.get('/bookings', bookingsController.getAll);
  router.post('/bookings', bookingsController.create);
  router.put('/bookings/:id/status', bookingsController.updateStatus);
  router.put('/bookings/:id/assign-nurse', bookingsController.assignNurse);
  router.put('/bookings/:id/financials', bookingsController.updateFinancials);

  // Vital Signs
  router.get('/vitals', vitalsController.getAll);
  router.get('/vitals/:patientId', vitalsController.getByPatientId);
  router.post('/vitals', vitalsController.register);

  // Alerts
  router.get('/alerts', alertsController.getAll);
  router.post('/alerts/:id/resolve', alertsController.resolve);

  // Reviews
  router.get('/reviews', reviewsController.getAll);
  router.post('/reviews', reviewsController.create);

  // WhatsApp
  router.get('/whatsapp/logs', waController.getLogs);
  router.post('/whatsapp/webhook', waController.webhook);

  return router;
}

