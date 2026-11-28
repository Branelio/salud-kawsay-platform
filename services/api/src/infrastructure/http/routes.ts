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
  JsonMessagingService,
  JsonMedicationRepository,
  JsonSpecialtyClinicalRepository,
  JsonClinicOperationsRepository,
  JsonUserRepository
} from '../database/JsonRepositories';
import { isPostgresEnabled } from '../database/PostgresDatabase';
import {
  PostgresPatientRepository,
  PostgresClinicalRecordRepository,
  PostgresVitalSignsRepository,
  PostgresNurseRepository,
  PostgresBookingRepository,
  PostgresAlertRepository,
  PostgresReviewRepository,
  PostgresMessagingService,
  PostgresMedicationRepository,
  PostgresSpecialtyClinicalRepository,
  PostgresClinicOperationsRepository,
  PostgresUserRepository
} from '../database/PostgresRepositories';

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
import { AuthController, StatsController, UsersController } from './controllers/AuthAndStatsControllers';
import { JwtService } from '../security/JwtService';
import { NursesController, PatientsController } from './controllers/NursesAndPatientsControllers';
import { ClinicalRecordsController, VitalsController, AlertsController, MedicationsController, SpecialtyClinicalController, ClinicOperationsController } from './controllers/ClinicalAndVitalsControllers';
import { BookingsController, ReviewsController, WhatsAppController } from './controllers/BookingsReviewsAndWhatsAppControllers';

export function createApiRouter(): Router {
  const router = Router();

  // Instantiate Repositories (PostgreSQL/Neon when DATABASE_URL is set, otherwise local JSON fallback)
  const usePg = isPostgresEnabled();
  const patientRepo = usePg ? new PostgresPatientRepository() : new JsonPatientRepository();
  const clinicalRepo = usePg ? new PostgresClinicalRecordRepository() : new JsonClinicalRecordRepository();
  const vitalsRepo = usePg ? new PostgresVitalSignsRepository() : new JsonVitalSignsRepository();
  const nurseRepo = usePg ? new PostgresNurseRepository() : new JsonNurseRepository();
  const bookingRepo = usePg ? new PostgresBookingRepository() : new JsonBookingRepository();
  const alertRepo = usePg ? new PostgresAlertRepository() : new JsonAlertRepository();
  const reviewRepo = usePg ? new PostgresReviewRepository() : new JsonReviewRepository();
  const messagingService = usePg ? new PostgresMessagingService() : new JsonMessagingService();
  const medicationRepo = usePg ? new PostgresMedicationRepository() : new JsonMedicationRepository();
  const specialtyRepo = usePg ? new PostgresSpecialtyClinicalRepository() : new JsonSpecialtyClinicalRepository();
  const clinicOpsRepo = usePg ? new PostgresClinicOperationsRepository() : new JsonClinicOperationsRepository();
  const userRepo = usePg ? new PostgresUserRepository() : new JsonUserRepository();

  // Instantiate Use Cases
  const adminAuthUseCase = new AdminAuthUseCase(new JwtService(), userRepo);
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
  const usersController = new UsersController(userRepo);
  const nursesController = new NursesController(nurseRepo, checkinNurseUseCase);
  const patientsController = new PatientsController(patientRepo, verifyCedulaUseCase);
  const clinicalController = new ClinicalRecordsController(clinicalRepo, saveClinicalRecordUseCase);
  const vitalsController = new VitalsController(vitalsRepo, registerVitalSignsUseCase);
  const alertsController = new AlertsController(alertRepo, resolveAlertUseCase);
  const bookingsController = new BookingsController(bookingRepo, createBookingUseCase);
  const reviewsController = new ReviewsController(reviewRepo, addReviewUseCase);
  const waController = new WhatsAppController(messagingService);
  const medicationsController = new MedicationsController(medicationRepo);
  const specialtyController = new SpecialtyClinicalController(specialtyRepo);
  const clinicOpsController = new ClinicOperationsController(clinicOpsRepo);

  // Health
  router.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Salud Kawsay API Clean Architecture',
      database: usePg ? 'postgresql-neon' : 'json-local',
      time: new Date().toISOString()
    });
  });

  // Auth, Users & Stats
  router.post('/auth/login', authController.login);
  router.get('/stats', statsController.getStats);
  router.get('/users', usersController.getAll);
  router.post('/users', usersController.create);
  router.patch('/users/:id/toggle', usersController.toggleActive);

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

  // Kardex / eMAR (Medications)
  router.get('/medications', medicationsController.getAll);
  router.get('/medications/:patientId', medicationsController.getByPatientId);
  router.post('/medications', medicationsController.create);
  router.post('/medications/:id/administer', medicationsController.administer);

  // Multi-Specialty Clinical Suite (Odontología, Pediatría, Recetario CIE-10)
  router.get('/prescriptions', specialtyController.getPrescriptions);
  router.post('/prescriptions', specialtyController.createPrescription);
  router.get('/specialty/:patientId', specialtyController.getSpecialtyByPatient);
  router.post('/specialty/:patientId', specialtyController.saveSpecialty);

  // Caja & Pre-Facturación SRI Ecuador
  router.get('/invoices', clinicOpsController.getInvoices);
  router.post('/invoices', clinicOpsController.createInvoice);

  // Inventario Insumos & Lotes ARCSA
  router.get('/inventory', clinicOpsController.getInventory);
  router.post('/inventory', clinicOpsController.createInventoryItem);
  router.patch('/inventory/:id/stock', clinicOpsController.adjustInventoryStock);

  // Agenda Clínica Multi-Especialidad
  router.get('/appointments', clinicOpsController.getAppointments);
  router.post('/appointments', clinicOpsController.createAppointment);
  router.put('/appointments/:id/status', clinicOpsController.updateAppointmentStatus);

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

