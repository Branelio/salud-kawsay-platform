export interface PrescriptionItem {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface MedicalPrescriptionProps {
  id: string;
  patientId: string;
  patientName: string;
  patientCedula: string;
  specialty: 'Medicina General' | 'Odontología' | 'Pediatría' | 'Enfermería';
  cie10Code: string;
  cie10Description: string;
  items: PrescriptionItem[];
  indications: string;
  doctorName: string;
  doctorLicense: string;
  createdAt?: string;
}

export class MedicalPrescription {
  public readonly id: string;
  public readonly patientId: string;
  public readonly patientName: string;
  public readonly patientCedula: string;
  public readonly specialty: 'Medicina General' | 'Odontología' | 'Pediatría' | 'Enfermería';
  public readonly cie10Code: string;
  public readonly cie10Description: string;
  public readonly items: PrescriptionItem[];
  public readonly indications: string;
  public readonly doctorName: string;
  public readonly doctorLicense: string;
  public readonly createdAt: string;

  constructor(props: MedicalPrescriptionProps) {
    this.id = props.id;
    this.patientId = props.patientId;
    this.patientName = props.patientName;
    this.patientCedula = props.patientCedula;
    this.specialty = props.specialty || 'Medicina General';
    this.cie10Code = props.cie10Code;
    this.cie10Description = props.cie10Description;
    this.items = props.items || [];
    this.indications = props.indications || '';
    this.doctorName = props.doctorName || 'Dr. Especialista';
    this.doctorLicense = props.doctorLicense || 'MSP-EC-REG';
    this.createdAt = props.createdAt || new Date().toISOString();
  }
}

export type ToothStatus = 'sano' | 'caries' | 'resina' | 'endodoncia' | 'corona' | 'extraccion';

export interface ToothCondition {
  status: ToothStatus;
  notes?: string;
}

export interface VaccineEntry {
  name: string;
  ageGroup: string;
  status: 'aplicada' | 'pendiente';
  date?: string;
}

export interface PatientSpecialtyData {
  patientId: string;
  odontogram: Record<string, ToothCondition>;
  dentalTreatmentPlan: string;
  pediatrics: {
    weightKg: number;
    heightCm: number;
    headCircumferenceCm: number;
    growthNotes: string;
    vaccines: VaccineEntry[];
  };
  updatedAt: string;
}

export function createDefaultSpecialtyData(patientId: string): PatientSpecialtyData {
  return {
    patientId,
    odontogram: {},
    dentalTreatmentPlan: '',
    pediatrics: {
      weightKg: 0,
      heightCm: 0,
      headCircumferenceCm: 0,
      growthNotes: '',
      vaccines: [
        { name: 'BCG (Tuberculosis)', ageGroup: 'Recién Nacido', status: 'pendiente' },
        { name: 'Hepatitis B (HB)', ageGroup: 'Recién Nacido', status: 'pendiente' },
        { name: 'Rotavirus (1ra y 2da)', ageGroup: '2 - 4 meses', status: 'pendiente' },
        { name: 'Pentavalente (DPT-HB-Hib)', ageGroup: '2 - 4 - 6 meses', status: 'pendiente' },
        { name: 'Neumococo Conjugada', ageGroup: '2 - 4 - 6 meses', status: 'pendiente' },
        { name: 'SRP (Sarampión, Rubéola, Paperas)', ageGroup: '12 - 18 meses', status: 'pendiente' },
        { name: 'Varicela', ageGroup: '15 meses', status: 'pendiente' },
        { name: 'Influenza Pediátrica', ageGroup: 'Anual', status: 'pendiente' }
      ]
    },
    updatedAt: new Date().toISOString()
  };
}
