import { pgQuery } from './PostgresDatabase';
import { Patient } from '../../domain/entities/Patient';
import { ClinicalRecord } from '../../domain/entities/ClinicalRecord';
import { VitalSignRecord } from '../../domain/entities/VitalSignRecord';
import { Nurse } from '../../domain/entities/Nurse';
import { NurseCheckin } from '../../domain/entities/NurseCheckin';
import { Booking, BookingStatus, PaymentStatus, PaymentMethod } from '../../domain/entities/Booking';
import { MedicalAlert } from '../../domain/entities/MedicalAlert';
import { Review } from '../../domain/entities/Review';
import { WhatsAppMessage, WhatsAppMessageType } from '../../domain/entities/WhatsAppMessage';
import { MedicationOrder, AdministrationStatus } from '../../domain/entities/MedicationOrder';
import {
  IPatientRepository,
  IClinicalRecordRepository,
  IVitalSignsRepository,
  INurseRepository,
  IBookingRepository,
  IAlertRepository,
  IReviewRepository,
  IMessagingService,
  IMedicationRepository
} from '../../domain/ports/repositories';

function mapPatient(r: any): Patient {
  return new Patient({
    id: r.id,
    cedula: r.cedula,
    fullName: r.full_name,
    age: r.age,
    bloodType: r.blood_type,
    allergies: r.allergies,
    condition: r.condition,
    address: r.address,
    familyContactName: r.family_contact_name,
    familyPhone: r.family_phone
  });
}

function mapClinicalRecord(r: any): ClinicalRecord {
  return new ClinicalRecord({
    patientId: r.patient_id,
    cedula: r.cedula,
    fullName: r.full_name,
    age: r.age,
    bloodType: r.blood_type,
    allergies: r.allergies,
    primaryDiagnosis: r.primary_diagnosis,
    prescribedMeds: r.prescribed_meds,
    attendingDoctor: r.attending_doctor,
    emergencyContact: r.emergency_contact,
    specialCareNotes: r.special_care_notes,
    lastUpdated: r.last_updated
  });
}

function mapVital(r: any): VitalSignRecord {
  return new VitalSignRecord({
    id: r.id,
    patientId: r.patient_id,
    patientName: r.patient_name,
    nurseId: r.nurse_id,
    nurseName: r.nurse_name,
    timestamp: r.timestamp,
    bloodPressureSystolic: r.bp_systolic,
    bloodPressureDiastolic: r.bp_diastolic,
    bloodGlucoseMgDl: r.glucose_mg_dl,
    oxygenSaturation: r.oxygen_saturation,
    heartRateBpm: r.heart_rate_bpm,
    temperatureCelsius: Number(r.temperature_c),
    medicationAdministered: r.medication_administered,
    nurseNotes: r.nurse_notes,
    statusFlag: r.status_flag
  });
}

function mapBooking(r: any): Booking {
  return new Booking({
    id: r.id,
    patientId: r.patient_id,
    patientCedula: r.patient_cedula,
    patientName: r.patient_name,
    familyPhone: r.family_phone,
    serviceType: r.service_type,
    date: r.date,
    shiftHours: r.shift_hours,
    status: r.status,
    totalPriceUSD: Number(r.total_price_usd),
    nursePayoutUSD: Number(r.nurse_payout_usd),
    agencyMarginUSD: Number(r.agency_margin_usd),
    paymentStatus: r.payment_status,
    paymentMethod: r.payment_method,
    nurseId: r.assigned_nurse_id || undefined,
    nurseName: r.assigned_nurse_name || undefined,
    createdAt: r.created_at
  });
}

function mapMedication(r: any): MedicationOrder {
  return new MedicationOrder({
    id: r.id,
    patientId: r.patient_id,
    patientName: r.patient_name,
    medicationName: r.medication_name,
    dosage: r.dosage,
    route: r.route,
    schedule: r.schedule,
    prescribedBy: r.prescribed_by,
    active: r.active,
    lastAdministeredAt: r.last_administered_at || undefined,
    lastAdministeredBy: r.last_administered_by || undefined,
    administrationLogs: Array.isArray(r.administration_logs) ? r.administration_logs : []
  });
}

export class PostgresPatientRepository implements IPatientRepository {
  async getAll(): Promise<Patient[]> {
    const res = await pgQuery('SELECT * FROM patients ORDER BY full_name ASC');
    return res.rows.map(mapPatient);
  }

  async getById(id: string): Promise<Patient | null> {
    const res = await pgQuery('SELECT * FROM patients WHERE id = $1', [id]);
    return res.rows[0] ? mapPatient(res.rows[0]) : null;
  }

  async getByCedula(cedula: string): Promise<Patient | null> {
    const res = await pgQuery('SELECT * FROM patients WHERE cedula = $1', [cedula]);
    return res.rows[0] ? mapPatient(res.rows[0]) : null;
  }

  async save(patient: Patient): Promise<Patient> {
    await pgQuery(
      `INSERT INTO patients (id, cedula, full_name, age, blood_type, allergies, condition, address, family_contact_name, family_phone)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO UPDATE SET
         cedula = EXCLUDED.cedula, full_name = EXCLUDED.full_name, age = EXCLUDED.age,
         blood_type = EXCLUDED.blood_type, allergies = EXCLUDED.allergies, condition = EXCLUDED.condition,
         address = EXCLUDED.address, family_contact_name = EXCLUDED.family_contact_name, family_phone = EXCLUDED.family_phone`,
      [patient.id, patient.cedula, patient.fullName, patient.age, patient.bloodType, patient.allergies, patient.condition, patient.address, patient.familyContactName, patient.familyPhone]
    );
    return patient;
  }
}

export class PostgresClinicalRecordRepository implements IClinicalRecordRepository {
  async getAll(): Promise<ClinicalRecord[]> {
    const res = await pgQuery('SELECT * FROM clinical_records ORDER BY last_updated DESC');
    return res.rows.map(mapClinicalRecord);
  }

  async getByPatientIdOrCedula(patientIdOrCedula: string): Promise<ClinicalRecord | null> {
    const res = await pgQuery(
      'SELECT * FROM clinical_records WHERE patient_id = $1 OR cedula = $1 LIMIT 1',
      [patientIdOrCedula]
    );
    return res.rows[0] ? mapClinicalRecord(res.rows[0]) : null;
  }

  async save(record: ClinicalRecord): Promise<ClinicalRecord> {
    await pgQuery(
      `INSERT INTO clinical_records (patient_id, cedula, full_name, age, blood_type, allergies, primary_diagnosis, prescribed_meds, attending_doctor, emergency_contact, special_care_notes, last_updated)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (patient_id) DO UPDATE SET
         cedula = EXCLUDED.cedula, full_name = EXCLUDED.full_name, age = EXCLUDED.age,
         blood_type = EXCLUDED.blood_type, allergies = EXCLUDED.allergies, primary_diagnosis = EXCLUDED.primary_diagnosis,
         prescribed_meds = EXCLUDED.prescribed_meds, attending_doctor = EXCLUDED.attending_doctor,
         emergency_contact = EXCLUDED.emergency_contact, special_care_notes = EXCLUDED.special_care_notes, last_updated = EXCLUDED.last_updated`,
      [record.patientId, record.cedula, record.fullName, record.age, record.bloodType, record.allergies, record.primaryDiagnosis, record.prescribedMeds, record.attendingDoctor, record.emergencyContact, record.specialCareNotes, record.lastUpdated]
    );
    return record;
  }
}

export class PostgresVitalSignsRepository implements IVitalSignsRepository {
  async getAll(): Promise<VitalSignRecord[]> {
    const res = await pgQuery('SELECT * FROM vital_logs ORDER BY timestamp DESC');
    return res.rows.map(mapVital);
  }

  async getByPatientId(patientId: string): Promise<VitalSignRecord[]> {
    const res = await pgQuery('SELECT * FROM vital_logs WHERE patient_id = $1 ORDER BY timestamp DESC', [patientId]);
    return res.rows.map(mapVital);
  }

  async save(vital: VitalSignRecord): Promise<VitalSignRecord> {
    await pgQuery(
      `INSERT INTO vital_logs (id, patient_id, patient_name, nurse_id, nurse_name, timestamp, bp_systolic, bp_diastolic, glucose_mg_dl, oxygen_saturation, heart_rate_bpm, temperature_c, medication_administered, nurse_notes, status_flag)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [vital.id, vital.patientId, vital.patientName || null, vital.nurseId, vital.nurseName, vital.timestamp, vital.bloodPressureSystolic, vital.bloodPressureDiastolic, vital.bloodGlucoseMgDl, vital.oxygenSaturation, vital.heartRateBpm, vital.temperatureCelsius, vital.medicationAdministered, vital.nurseNotes, vital.statusFlag]
    );
    return vital;
  }
}

export class PostgresNurseRepository implements INurseRepository {
  async getAll(): Promise<Nurse[]> {
    const res = await pgQuery('SELECT * FROM nurses ORDER BY name ASC');
    return res.rows.map(r => new Nurse({
      id: r.id,
      name: r.name,
      photoUrl: r.photo_url,
      specialty: r.specialty,
      rating: Number(r.rating),
      phone: r.phone,
      experienceYears: r.experience_years,
      isAvailable: r.is_available,
      bio: r.bio,
      licenseNumber: r.license_number,
      credentialStatus: r.credential_status
    }));
  }

  async getById(id: string): Promise<Nurse | null> {
    const res = await pgQuery('SELECT * FROM nurses WHERE id = $1', [id]);
    const r = res.rows[0];
    if (!r) return null;
    return new Nurse({
      id: r.id,
      name: r.name,
      photoUrl: r.photo_url,
      specialty: r.specialty,
      rating: Number(r.rating),
      phone: r.phone,
      experienceYears: r.experience_years,
      isAvailable: r.is_available,
      bio: r.bio,
      licenseNumber: r.license_number,
      credentialStatus: r.credential_status
    });
  }

  async save(nurse: Nurse): Promise<Nurse> {
    await pgQuery(
      `INSERT INTO nurses (id, name, photo_url, specialty, rating, phone, experience_years, is_available, bio, license_number, credential_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, specialty = EXCLUDED.specialty, phone = EXCLUDED.phone,
         experience_years = EXCLUDED.experience_years, is_available = EXCLUDED.is_available,
         bio = EXCLUDED.bio, license_number = EXCLUDED.license_number, credential_status = EXCLUDED.credential_status`,
      [nurse.id, nurse.name, nurse.photoUrl || '', nurse.specialty, nurse.rating, nurse.phone, nurse.experienceYears, nurse.isAvailable, nurse.bio || null, nurse.licenseNumber, nurse.credentialStatus]
    );
    return nurse;
  }

  async saveCheckin(checkin: NurseCheckin): Promise<NurseCheckin> {
    await pgQuery(
      `INSERT INTO nurse_checkins (id, nurse_id, nurse_name, patient_id, patient_name, latitude, longitude, address, timestamp, status, event_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [checkin.id, checkin.nurseId, checkin.nurseName, checkin.patientId, checkin.patientName, checkin.latitude, checkin.longitude, checkin.address, checkin.timestamp, checkin.status, checkin.eventType]
    );
    return checkin;
  }

  async getCheckins(): Promise<NurseCheckin[]> {
    const res = await pgQuery('SELECT * FROM nurse_checkins ORDER BY timestamp DESC');
    return res.rows.map(r => new NurseCheckin({
      id: r.id,
      nurseId: r.nurse_id,
      nurseName: r.nurse_name,
      patientId: r.patient_id,
      patientName: r.patient_name,
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
      address: r.address,
      timestamp: r.timestamp,
      status: r.status,
      eventType: r.event_type
    }));
  }
}

export class PostgresBookingRepository implements IBookingRepository {
  async getAll(): Promise<Booking[]> {
    const res = await pgQuery('SELECT * FROM bookings ORDER BY created_at DESC');
    return res.rows.map(mapBooking);
  }

  async getById(id: string): Promise<Booking | null> {
    const res = await pgQuery('SELECT * FROM bookings WHERE id = $1', [id]);
    return res.rows[0] ? mapBooking(res.rows[0]) : null;
  }

  async save(booking: Booking): Promise<Booking> {
    await pgQuery(
      `INSERT INTO bookings (id, patient_id, patient_cedula, patient_name, family_phone, service_type, date, shift_hours, status, total_price_usd, nurse_payout_usd, agency_margin_usd, payment_status, payment_method, assigned_nurse_id, assigned_nurse_name, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
      [booking.id, booking.patientId, booking.patientCedula, booking.patientName, booking.familyPhone, booking.serviceType, booking.date, booking.shiftHours, booking.status, booking.totalPriceUSD, booking.nursePayoutUSD, booking.agencyMarginUSD, booking.paymentStatus, booking.paymentMethod, booking.nurseId || null, booking.nurseName || null, booking.createdAt]
    );
    return booking;
  }

  async updateStatus(id: string, status: BookingStatus): Promise<Booking | null> {
    const res = await pgQuery('UPDATE bookings SET status = $2 WHERE id = $1 RETURNING *', [id, status]);
    return res.rows[0] ? mapBooking(res.rows[0]) : null;
  }

  async assignNurse(id: string, nurseId: string, nurseName: string, customPayoutUSD?: number): Promise<Booking | null> {
    const booking = await this.getById(id);
    if (!booking) return null;
    booking.assignNurse(nurseId, nurseName, customPayoutUSD);
    await pgQuery(
      `UPDATE bookings SET assigned_nurse_id = $2, assigned_nurse_name = $3, nurse_payout_usd = $4, agency_margin_usd = $5, status = $6 WHERE id = $1`,
      [id, booking.nurseId || null, booking.nurseName || null, booking.nursePayoutUSD, booking.agencyMarginUSD, booking.status]
    );
    return booking;
  }

  async updateFinancials(id: string, paymentStatus?: PaymentStatus, paymentMethod?: PaymentMethod, payoutUSD?: number): Promise<Booking | null> {
    const booking = await this.getById(id);
    if (!booking) return null;
    booking.updateFinancials(paymentStatus, paymentMethod, payoutUSD);
    await pgQuery(
      `UPDATE bookings SET payment_status = $2, payment_method = $3, nurse_payout_usd = $4, agency_margin_usd = $5 WHERE id = $1`,
      [id, booking.paymentStatus, booking.paymentMethod, booking.nursePayoutUSD, booking.agencyMarginUSD]
    );
    return booking;
  }
}

export class PostgresAlertRepository implements IAlertRepository {
  async getAll(): Promise<MedicalAlert[]> {
    const res = await pgQuery('SELECT * FROM medical_alerts ORDER BY timestamp DESC');
    return res.rows.map(r => new MedicalAlert({
      id: r.id,
      patientId: r.patient_id,
      patientName: r.patient_name,
      vitalId: r.vital_id,
      severity: r.severity,
      message: r.message,
      timestamp: r.timestamp,
      resolved: r.resolved,
      resolvedBy: r.resolved_by || undefined,
      resolvedNotes: r.resolved_notes || undefined
    }));
  }

  async getById(id: string): Promise<MedicalAlert | null> {
    const res = await pgQuery('SELECT * FROM medical_alerts WHERE id = $1', [id]);
    const r = res.rows[0];
    if (!r) return null;
    return new MedicalAlert({
      id: r.id,
      patientId: r.patient_id,
      patientName: r.patient_name,
      vitalId: r.vital_id,
      severity: r.severity,
      message: r.message,
      timestamp: r.timestamp,
      resolved: r.resolved,
      resolvedBy: r.resolved_by || undefined,
      resolvedNotes: r.resolved_notes || undefined
    });
  }

  async save(alert: MedicalAlert): Promise<MedicalAlert> {
    await pgQuery(
      `INSERT INTO medical_alerts (id, patient_id, patient_name, vital_id, severity, message, timestamp, resolved, resolved_by, resolved_notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [alert.id, alert.patientId, alert.patientName, alert.vitalId, alert.severity, alert.message, alert.timestamp, alert.resolved, alert.resolvedBy || null, alert.resolvedNotes || null]
    );
    return alert;
  }

  async resolve(id: string, resolvedBy: string, notes?: string): Promise<MedicalAlert | null> {
    const alert = await this.getById(id);
    if (!alert) return null;
    alert.resolve(resolvedBy, notes);
    await pgQuery(
      'UPDATE medical_alerts SET resolved = TRUE, resolved_by = $2, resolved_notes = $3 WHERE id = $1',
      [id, alert.resolvedBy, alert.resolvedNotes]
    );
    return alert;
  }
}

export class PostgresReviewRepository implements IReviewRepository {
  async getAll(): Promise<Review[]> {
    const res = await pgQuery('SELECT * FROM reviews ORDER BY date DESC');
    return res.rows.map(r => new Review({
      id: r.id,
      clientName: r.client_name,
      relation: r.relation,
      photoUrl: r.photo_url,
      rating: r.rating,
      comment: r.comment,
      date: r.date,
      isVerified: r.is_verified
    }));
  }

  async save(review: Review): Promise<Review> {
    await pgQuery(
      `INSERT INTO reviews (id, client_name, relation, photo_url, rating, comment, date, is_verified)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [review.id, review.clientName, review.relation, review.photoUrl, review.rating, review.comment, review.date, review.isVerified]
    );
    return review;
  }
}

export class PostgresMessagingService implements IMessagingService {
  async sendMessage(toPhone: string, messageText: string, type: WhatsAppMessageType): Promise<WhatsAppMessage> {
    const msg = new WhatsAppMessage({
      id: `wa-${Math.floor(1000 + Math.random() * 9000)}`,
      toPhone,
      messageText,
      type,
      status: 'entregado'
    });
    await pgQuery(
      `INSERT INTO whatsapp_logs (id, to_phone, message_text, type, timestamp, status)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [msg.id, msg.toPhone, msg.messageText, msg.type, msg.timestamp, msg.status]
    );
    return msg;
  }

  async getLogs(): Promise<WhatsAppMessage[]> {
    const res = await pgQuery('SELECT * FROM whatsapp_logs ORDER BY timestamp DESC LIMIT 100');
    return res.rows.map(r => new WhatsAppMessage({
      id: r.id,
      toPhone: r.to_phone,
      messageText: r.message_text,
      type: r.type,
      timestamp: r.timestamp,
      status: r.status
    }));
  }
}

export class PostgresMedicationRepository implements IMedicationRepository {
  async getAll(): Promise<MedicationOrder[]> {
    const res = await pgQuery('SELECT * FROM medications ORDER BY id DESC');
    return res.rows.map(mapMedication);
  }

  async getByPatientId(patientId: string): Promise<MedicationOrder[]> {
    const res = await pgQuery('SELECT * FROM medications WHERE patient_id = $1 ORDER BY id DESC', [patientId]);
    return res.rows.map(mapMedication);
  }

  async save(order: MedicationOrder): Promise<MedicationOrder> {
    await pgQuery(
      `INSERT INTO medications (id, patient_id, patient_name, medication_name, dosage, route, schedule, prescribed_by, active, last_administered_at, last_administered_by, administration_logs)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb)`,
      [order.id, order.patientId, order.patientName, order.medicationName, order.dosage, order.route, order.schedule, order.prescribedBy, order.active, order.lastAdministeredAt || null, order.lastAdministeredBy || null, JSON.stringify(order.administrationLogs)]
    );
    return order;
  }

  async logAdministration(id: string, nurseName: string, status: AdministrationStatus, notes?: string): Promise<MedicationOrder | null> {
    const res = await pgQuery('SELECT * FROM medications WHERE id = $1', [id]);
    if (!res.rows[0]) return null;
    const order = mapMedication(res.rows[0]);
    order.logAdministration(nurseName, status, notes);
    await pgQuery(
      `UPDATE medications SET last_administered_at = $2, last_administered_by = $3, administration_logs = $4::jsonb WHERE id = $1`,
      [id, order.lastAdministeredAt || null, order.lastAdministeredBy || null, JSON.stringify(order.administrationLogs)]
    );
    return order;
  }
}
