export interface ClinicalRecordProps {
  patientId: string;
  cedula: string;
  fullName: string;
  age: number;
  bloodType: string;
  allergies: string;
  primaryDiagnosis: string;
  prescribedMeds: string;
  attendingDoctor: string;
  emergencyContact: string;
  specialCareNotes: string;
  lastUpdated: string;
}

export class ClinicalRecord {
  public readonly patientId: string;
  public readonly cedula: string;
  public readonly fullName: string;
  public readonly age: number;
  public readonly bloodType: string;
  public readonly allergies: string;
  public readonly primaryDiagnosis: string;
  public readonly prescribedMeds: string;
  public readonly attendingDoctor: string;
  public readonly emergencyContact: string;
  public readonly specialCareNotes: string;
  public readonly lastUpdated: string;

  constructor(props: ClinicalRecordProps) {
    this.patientId = props.patientId;
    this.cedula = props.cedula;
    this.fullName = props.fullName;
    this.age = props.age;
    this.bloodType = props.bloodType || 'O+';
    this.allergies = props.allergies || 'Ninguna';
    this.primaryDiagnosis = props.primaryDiagnosis || 'En monitoreo regular';
    this.prescribedMeds = props.prescribedMeds || 'Según indicación médica';
    this.attendingDoctor = props.attendingDoctor || 'Médico Tratante';
    this.emergencyContact = props.emergencyContact;
    this.specialCareNotes = props.specialCareNotes || 'Sin observaciones adicionales';
    this.lastUpdated = props.lastUpdated || new Date().toISOString();
  }
}

