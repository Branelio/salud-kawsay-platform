export interface Nurse {
  id: string;
  name: string;
  photoUrl: string;
  specialty: string;
  rating: number;
  phone: string;
  experienceYears: number;
  isAvailable: boolean;
}

export interface Patient {
  id: string;
  fullName: string;
  age: number;
  condition: string;
  address: string;
  familyContactName: string;
  familyPhone: string;
}

export interface ServiceBooking {
  id: string;
  patientId: string;
  patientName: string;
  familyPhone: string;
  nurseId?: string;
  nurseName?: string;
  serviceType: 'adulto-mayor' | 'signos-vitales' | 'medicamentos' | 'curaciones' | 'acompanamiento' | 'avd-integral';
  date: string;
  shiftHours: '8h' | '12h' | '24h' | 'puntual';
  status: 'pendiente' | 'confirmada' | 'en-proceso' | 'completada';
  totalPriceUSD: number;
  createdAt: string;
}

export interface VitalSignEntry {
  id: string;
  patientId: string;
  nurseId: string;
  nurseName: string;
  timestamp: string;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  bloodGlucoseMgDl: number;
  oxygenSaturation: number;
  heartRateBpm: number;
  temperatureCelsius: number;
  medicationAdministered: string;
  nurseNotes: string;
  statusFlag: 'normal' | 'advertencia' | 'critico';
}

export interface WhatsAppMessage {
  id: string;
  toPhone: string;
  messageText: string;
  type: 'reserva_confirmada' | 'checkin_enfermera' | 'alerta_signos' | 'reporte_diario';
  timestamp: string;
  status: 'enviado' | 'entregado' | 'leido';
}
