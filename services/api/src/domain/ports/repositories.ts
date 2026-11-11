import { Patient } from '../entities/Patient';
import { ClinicalRecord } from '../entities/ClinicalRecord';
import { VitalSignRecord } from '../entities/VitalSignRecord';
import { Nurse } from '../entities/Nurse';
import { NurseCheckin } from '../entities/NurseCheckin';
import { Booking, BookingStatus } from '../entities/Booking';
import { MedicalAlert } from '../entities/MedicalAlert';
import { Review } from '../entities/Review';
import { WhatsAppMessage, WhatsAppMessageType } from '../entities/WhatsAppMessage';

export interface IPatientRepository {
  getAll(): Promise<Patient[]>;
  getById(id: string): Promise<Patient | null>;
  getByCedula(cedula: string): Promise<Patient | null>;
  save(patient: Patient): Promise<Patient>;
}

export interface IClinicalRecordRepository {
  getAll(): Promise<ClinicalRecord[]>;
  getByPatientIdOrCedula(patientIdOrCedula: string): Promise<ClinicalRecord | null>;
  save(record: ClinicalRecord): Promise<ClinicalRecord>;
}

export interface IVitalSignsRepository {
  getAll(): Promise<VitalSignRecord[]>;
  getByPatientId(patientId: string): Promise<VitalSignRecord[]>;
  save(vital: VitalSignRecord): Promise<VitalSignRecord>;
}

export interface INurseRepository {
  getAll(): Promise<Nurse[]>;
  getById(id: string): Promise<Nurse | null>;
  save(nurse: Nurse): Promise<Nurse>;
  saveCheckin(checkin: NurseCheckin): Promise<NurseCheckin>;
  getCheckins(): Promise<NurseCheckin[]>;
}

export interface IBookingRepository {
  getAll(): Promise<Booking[]>;
  getById(id: string): Promise<Booking | null>;
  save(booking: Booking): Promise<Booking>;
  updateStatus(id: string, status: BookingStatus): Promise<Booking | null>;
}

export interface IAlertRepository {
  getAll(): Promise<MedicalAlert[]>;
  getById(id: string): Promise<MedicalAlert | null>;
  save(alert: MedicalAlert): Promise<MedicalAlert>;
  resolve(id: string, resolvedBy: string, notes?: string): Promise<MedicalAlert | null>;
}

export interface IReviewRepository {
  getAll(): Promise<Review[]>;
  save(review: Review): Promise<Review>;
}

export interface IMessagingService {
  sendMessage(toPhone: string, messageText: string, type: WhatsAppMessageType): Promise<WhatsAppMessage>;
  getLogs(): Promise<WhatsAppMessage[]>;
}

