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
        console.log(`[DATABASE] Base de datos JSON inicializada: ${DATA_FILE}`);
        return;
      } catch (err: any) {
        console.error(`[DATABASE] Error cargando database.json: ${err.message}`);
      }
    }
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
        checkins: this.checkins
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err: any) {
      console.error(`[DATABASE] Error guardando archivo JSON: ${err.message}`);
    }
  }
}

