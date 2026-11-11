import { JsonStorage } from './JsonStorage';
import { Patient } from '../../domain/entities/Patient';
import { ClinicalRecord } from '../../domain/entities/ClinicalRecord';
import { VitalSignRecord } from '../../domain/entities/VitalSignRecord';
import { Nurse } from '../../domain/entities/Nurse';
import { NurseCheckin } from '../../domain/entities/NurseCheckin';
import { Booking, BookingStatus, PaymentStatus, PaymentMethod } from '../../domain/entities/Booking';
import { MedicalAlert } from '../../domain/entities/MedicalAlert';
import { Review } from '../../domain/entities/Review';
import { WhatsAppMessage, WhatsAppMessageType } from '../../domain/entities/WhatsAppMessage';
import {
  IPatientRepository,
  IClinicalRecordRepository,
  IVitalSignsRepository,
  INurseRepository,
  IBookingRepository,
  IAlertRepository,
  IReviewRepository,
  IMessagingService
} from '../../domain/ports/repositories';

export class JsonPatientRepository implements IPatientRepository {
  private storage = JsonStorage.getInstance();

  async getAll(): Promise<Patient[]> {
    return [...this.storage.patients];
  }

  async getById(id: string): Promise<Patient | null> {
    return this.storage.patients.find(p => p.id === id) || null;
  }

  async getByCedula(cedula: string): Promise<Patient | null> {
    return this.storage.patients.find(p => p.cedula === cedula) || null;
  }

  async save(patient: Patient): Promise<Patient> {
    const idx = this.storage.patients.findIndex(p => p.id === patient.id || p.cedula === patient.cedula);
    if (idx >= 0) {
      this.storage.patients[idx] = patient;
    } else {
      this.storage.patients.push(patient);
    }
    this.storage.save();
    return patient;
  }
}

export class JsonClinicalRecordRepository implements IClinicalRecordRepository {
  private storage = JsonStorage.getInstance();

  async getAll(): Promise<ClinicalRecord[]> {
    return [...this.storage.clinicalRecords];
  }

  async getByPatientIdOrCedula(patientIdOrCedula: string): Promise<ClinicalRecord | null> {
    return this.storage.clinicalRecords.find(r => r.patientId === patientIdOrCedula || r.cedula === patientIdOrCedula) || null;
  }

  async save(record: ClinicalRecord): Promise<ClinicalRecord> {
    const idx = this.storage.clinicalRecords.findIndex(r => r.cedula === record.cedula || r.patientId === record.patientId);
    if (idx >= 0) {
      this.storage.clinicalRecords[idx] = record;
    } else {
      this.storage.clinicalRecords.push(record);
    }
    this.storage.save();
    return record;
  }
}

export class JsonVitalSignsRepository implements IVitalSignsRepository {
  private storage = JsonStorage.getInstance();

  async getAll(): Promise<VitalSignRecord[]> {
    return [...this.storage.vitalLogs];
  }

  async getByPatientId(patientId: string): Promise<VitalSignRecord[]> {
    return this.storage.vitalLogs.filter(v => v.patientId === patientId);
  }

  async save(vital: VitalSignRecord): Promise<VitalSignRecord> {
    this.storage.vitalLogs.unshift(vital);
    this.storage.save();
    return vital;
  }
}

export class JsonNurseRepository implements INurseRepository {
  private storage = JsonStorage.getInstance();

  async getAll(): Promise<Nurse[]> {
    return [...this.storage.nurses];
  }

  async getById(id: string): Promise<Nurse | null> {
    return this.storage.nurses.find(n => n.id === id) || null;
  }

  async save(nurse: Nurse): Promise<Nurse> {
    this.storage.nurses.push(nurse);
    this.storage.save();
    return nurse;
  }

  async saveCheckin(checkin: NurseCheckin): Promise<NurseCheckin> {
    this.storage.checkins.unshift(checkin);
    this.storage.save();
    return checkin;
  }

  async getCheckins(): Promise<NurseCheckin[]> {
    return [...this.storage.checkins];
  }
}

export class JsonBookingRepository implements IBookingRepository {
  private storage = JsonStorage.getInstance();

  async getAll(): Promise<Booking[]> {
    return [...this.storage.bookings];
  }

  async getById(id: string): Promise<Booking | null> {
    return this.storage.bookings.find(b => b.id === id) || null;
  }

  async save(booking: Booking): Promise<Booking> {
    this.storage.bookings.unshift(booking);
    this.storage.save();
    return booking;
  }

  async updateStatus(id: string, status: BookingStatus): Promise<Booking | null> {
    const booking = this.storage.bookings.find(b => b.id === id);
    if (booking) {
      booking.updateStatus(status);
      this.storage.save();
      return booking;
    }
    return null;
  }

  async assignNurse(id: string, nurseId: string, nurseName: string, customPayoutUSD?: number): Promise<Booking | null> {
    const booking = this.storage.bookings.find(b => b.id === id);
    if (booking) {
      booking.assignNurse(nurseId, nurseName, customPayoutUSD);
      this.storage.save();
      return booking;
    }
    return null;
  }

  async updateFinancials(id: string, paymentStatus?: PaymentStatus, paymentMethod?: PaymentMethod, payoutUSD?: number): Promise<Booking | null> {
    const booking = this.storage.bookings.find(b => b.id === id);
    if (booking) {
      booking.updateFinancials(paymentStatus, paymentMethod, payoutUSD);
      this.storage.save();
      return booking;
    }
    return null;
  }
}

export class JsonAlertRepository implements IAlertRepository {
  private storage = JsonStorage.getInstance();

  async getAll(): Promise<MedicalAlert[]> {
    return [...this.storage.alerts];
  }

  async getById(id: string): Promise<MedicalAlert | null> {
    return this.storage.alerts.find(a => a.id === id) || null;
  }

  async save(alert: MedicalAlert): Promise<MedicalAlert> {
    this.storage.alerts.unshift(alert);
    this.storage.save();
    return alert;
  }

  async resolve(id: string, resolvedBy: string, notes?: string): Promise<MedicalAlert | null> {
    const alert = this.storage.alerts.find(a => a.id === id);
    if (alert) {
      alert.resolve(resolvedBy, notes);
      this.storage.save();
      return alert;
    }
    return null;
  }
}

export class JsonReviewRepository implements IReviewRepository {
  private storage = JsonStorage.getInstance();

  async getAll(): Promise<Review[]> {
    return [...this.storage.reviews];
  }

  async save(review: Review): Promise<Review> {
    this.storage.reviews.unshift(review);
    this.storage.save();
    return review;
  }
}

export class JsonMessagingService implements IMessagingService {
  private storage = JsonStorage.getInstance();

  async sendMessage(toPhone: string, messageText: string, type: WhatsAppMessageType): Promise<WhatsAppMessage> {
    const msg = new WhatsAppMessage({
      id: `wa-${Math.floor(1000 + Math.random() * 9000)}`,
      toPhone,
      messageText,
      type,
      status: 'entregado'
    });
    this.storage.whatsappLog.unshift(msg);
    this.storage.save();
    return msg;
  }

  async getLogs(): Promise<WhatsAppMessage[]> {
    return [...this.storage.whatsappLog];
  }
}

