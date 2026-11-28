import fs from 'fs';
import path from 'path';
import { Patient } from '../../domain/entities/Patient';
import { ClinicalRecord } from '../../domain/entities/ClinicalRecord';
import { VitalSignRecord } from '../../domain/entities/VitalSignRecord';
import { Nurse } from '../../domain/entities/Nurse';
import { NurseCheckin } from '../../domain/entities/NurseCheckin';
import { Booking, BookingStatus } from '../../domain/entities/Booking';
import { MedicalAlert } from '../../domain/entities/MedicalAlert';
import { Review } from '../../domain/entities/Review';
import { WhatsAppMessage, WhatsAppMessageType } from '../../domain/entities/WhatsAppMessage';
import { MedicationOrder } from '../../domain/entities/MedicationOrder';
import { MedicalPrescription, PatientSpecialtyData } from '../../domain/entities/SpecialtyClinical';
import { InvoiceRecord, InventoryItem, ClinicAppointment } from '../../domain/entities/ClinicOperations';

const DATA_DIR = path.join(__dirname, '../../../data');
const DATA_FILE = path.join(DATA_DIR, 'database.json');

export class JsonStorage {
  private static instance: JsonStorage;

  public nurses: Nurse[] = [];
  public patients: Patient[] = [];
  public bookings: Booking[] = [];
  public vitalLogs: VitalSignRecord[] = [];
  public whatsappLog: WhatsAppMessage[] = [];
  public reviews: Review[] = [];
  public alerts: MedicalAlert[] = [];
  public clinicalRecords: ClinicalRecord[] = [];
  public checkins: NurseCheckin[] = [];
  public medications: MedicationOrder[] = [];
  public prescriptions: MedicalPrescription[] = [];
  public specialtyRecords: Record<string, PatientSpecialtyData> = {};
  public invoices: InvoiceRecord[] = [];
  public inventoryItems: InventoryItem[] = [];
  public appointments: ClinicAppointment[] = [];

  private constructor() {
    this.init();
  }

  public static getInstance(): JsonStorage {
    if (!JsonStorage.instance) {
      JsonStorage.instance = new JsonStorage();
    }
    return JsonStorage.instance;
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        const data = JSON.parse(raw);
        this.nurses = (data.nurses || []).map((n: any) => new Nurse(n));
        this.patients = (data.patients || []).map((p: any) => new Patient(p));
        this.bookings = (data.bookings || []).map((b: any) => new Booking(b));
        this.vitalLogs = (data.vitalLogs || []).map((v: any) => new VitalSignRecord(v));
        this.whatsappLog = (data.whatsappLog || []).map((w: any) => new WhatsAppMessage(w));
        this.reviews = (data.reviews || []).map((r: any) => new Review(r));
        this.alerts = (data.alerts || []).map((a: any) => new MedicalAlert(a));
        this.clinicalRecords = (data.clinicalRecords || []).map((c: any) => new ClinicalRecord(c));
        this.checkins = (data.checkins || []).map((k: any) => new NurseCheckin(k));
        this.medications = (data.medications || []).map((m: any) => new MedicationOrder(m));
        this.prescriptions = (data.prescriptions || []).map((p: any) => new MedicalPrescription(p));
        this.specialtyRecords = data.specialtyRecords || {};
        this.invoices = (data.invoices || []).map((i: any) => new InvoiceRecord(i));
        this.inventoryItems = (data.inventoryItems || []).map((it: any) => new InventoryItem(it));
        this.appointments = (data.appointments || []).map((a: any) => new ClinicAppointment(a));
        if (this.inventoryItems.length === 0) {
          this.seedDefaultOperations();
        }
        if (this.medications.length === 0) {
          this.seedDefaultMedications();
        }
        console.log(`[DATABASE] Base de datos JSON inicializada: ${DATA_FILE}`);
        return;
      } catch (err: any) {
        console.error(`[DATABASE] Error cargando database.json: ${err.message}`);
      }
    }
    this.save();
  }

  private seedDefaultMedications() {
    this.medications = [
      new MedicationOrder({
        id: 'med-101',
        patientId: 'pat-1',
        patientName: 'Sra. Carmen Rosa Delgado',
        medicationName: 'Enalapril',
        dosage: '10 mg',
        route: 'Oral',
        schedule: 'Cada 12h (08:00 - 20:00)',
        prescribedBy: 'Dr. Fernando Salazar (Cardiología)',
        active: true,
        lastAdministeredAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        lastAdministeredBy: 'Lic. María Elena Ramos',
        administrationLogs: [
          {
            id: 'adm-1001',
            timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
            nurseName: 'Lic. María Elena Ramos',
            status: 'administrado',
            notes: 'Toma con desayuno, presión estable 125/82.'
          }
        ]
      }),
      new MedicationOrder({
        id: 'med-102',
        patientId: 'pat-2',
        patientName: 'Sr. Manuel Fernando Ortiz',
        medicationName: 'Enoxaparina Sódica',
        dosage: '40 mg / 0.4 ml',
        route: 'Subcutánea',
        schedule: 'Cada 24h (09:00 AM)',
        prescribedBy: 'Dra. Patricia Vélez (Traumatología)',
        active: true,
        administrationLogs: []
      })
    ];
    this.save();
  }

  private seedDefaultOperations() {
    this.inventoryItems = [
      new InventoryItem({ id: 'inv-101', name: 'Guantes de Nitrilo Estériles (Caja x100)', category: 'Enfermería', sku: 'ENF-GUA-100', lotNumber: 'LOT-2026-A8', expirationDate: '2027-08-15', stock: 42, minStock: 15, unitCostUSD: 7.5, unit: 'caja' }),
      new InventoryItem({ id: 'inv-102', name: 'Resina Compuesta Nano-Híbrida A2 (3M)', category: 'Odontología', sku: 'ODO-RES-A2', lotNumber: 'LOT-2026-D3', expirationDate: '2027-03-20', stock: 8, minStock: 5, unitCostUSD: 28, unit: 'jeringa' }),
      new InventoryItem({ id: 'inv-103', name: 'Suero Fisiológico NaCl 0.9% 500ml', category: 'General', sku: 'GEN-SUE-500', lotNumber: 'LOT-2026-S1', expirationDate: '2026-12-30', stock: 12, minStock: 20, unitCostUSD: 1.85, unit: 'frasco' })
    ];
    const today = new Date().toISOString().slice(0, 10);
    this.appointments = [
      new ClinicAppointment({ id: 'cit-201', patientName: 'Sra. Carmen Rosa Delgado', patientPhone: '0998765432', specialty: 'Medicina General', professionalName: 'Dr. Fernando Salazar', room: 'Consultorio 1', date: today, time: '09:30', reason: 'Control de presión arterial y ajuste de Enalapril', status: 'confirmada' }),
      new ClinicAppointment({ id: 'cit-202', patientName: 'Mateo Sebastián Vega', patientPhone: '0984412233', specialty: 'Odontología', professionalName: 'Dra. Valeria Mendoza', room: 'Sillón Dental A', date: today, time: '11:00', reason: 'Profilaxis y sellantes molares', status: 'en-sala' })
    ];
    this.save();
  }

  public save() {
    try {
      const data = {
        nurses: this.nurses,
        patients: this.patients,
        bookings: this.bookings,
        vitalLogs: this.vitalLogs,
        whatsappLog: this.whatsappLog,
        reviews: this.reviews,
        alerts: this.alerts,
        clinicalRecords: this.clinicalRecords,
        checkins: this.checkins,
        medications: this.medications,
        prescriptions: this.prescriptions,
        specialtyRecords: this.specialtyRecords,
        invoices: this.invoices,
        inventoryItems: this.inventoryItems,
        appointments: this.appointments
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err: any) {
      console.error(`[DATABASE] Error guardando archivo JSON: ${err.message}`);
    }
  }
}

