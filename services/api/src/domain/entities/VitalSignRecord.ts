export type VitalStatus = 'normal' | 'advertencia' | 'critico';

export interface VitalSignRecordProps {
  id: string;
  patientId: string;
  patientName?: string;
  nurseId: string;
  nurseName: string;
  timestamp?: string;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  bloodGlucoseMgDl: number;
  oxygenSaturation: number;
  heartRateBpm: number;
  temperatureCelsius: number;
  medicationAdministered: string;
  nurseNotes: string;
  statusFlag?: VitalStatus;
}

export class VitalSignRecord {
  public readonly id: string;
  public readonly patientId: string;
  public readonly patientName?: string;
  public readonly nurseId: string;
  public readonly nurseName: string;
  public readonly timestamp: string;
  public readonly bloodPressureSystolic: number;
  public readonly bloodPressureDiastolic: number;
  public readonly bloodGlucoseMgDl: number;
  public readonly oxygenSaturation: number;
  public readonly heartRateBpm: number;
  public readonly temperatureCelsius: number;
  public readonly medicationAdministered: string;
  public readonly nurseNotes: string;
  public readonly statusFlag: VitalStatus;

  constructor(props: VitalSignRecordProps) {
    this.id = props.id;
    this.patientId = props.patientId;
    this.patientName = props.patientName;
    this.nurseId = props.nurseId;
    this.nurseName = props.nurseName;
    this.timestamp = props.timestamp || new Date().toISOString();
    this.bloodPressureSystolic = props.bloodPressureSystolic;
    this.bloodPressureDiastolic = props.bloodPressureDiastolic;
    this.bloodGlucoseMgDl = props.bloodGlucoseMgDl;
    this.oxygenSaturation = props.oxygenSaturation;
    this.heartRateBpm = props.heartRateBpm;
    this.temperatureCelsius = props.temperatureCelsius;
    this.medicationAdministered = props.medicationAdministered;
    this.nurseNotes = props.nurseNotes;
    this.statusFlag = props.statusFlag || this.evaluateTriage();
  }

  public evaluateTriage(): VitalStatus {
    // Protocolo de Triage Clínico Domiciliario
    const isCritical = 
      this.bloodPressureSystolic > 170 ||
      this.bloodPressureSystolic < 85 ||
      this.bloodPressureDiastolic > 110 ||
      this.bloodGlucoseMgDl > 250 ||
      this.bloodGlucoseMgDl < 60 ||
      this.oxygenSaturation < 88 ||
      this.heartRateBpm > 130 ||
      this.heartRateBpm < 45 ||
      this.temperatureCelsius > 39.0 ||
      this.temperatureCelsius < 35.0;

    if (isCritical) {
      return 'critico';
    }

    const isWarning =
      this.bloodPressureSystolic > 140 ||
      this.bloodPressureSystolic < 95 ||
      this.bloodPressureDiastolic > 90 ||
      this.bloodGlucoseMgDl > 180 ||
      this.bloodGlucoseMgDl < 70 ||
      this.oxygenSaturation < 92 ||
      this.heartRateBpm > 105 ||
      this.heartRateBpm < 55 ||
      this.temperatureCelsius > 37.8 ||
      this.temperatureCelsius < 35.8;

    if (isWarning) {
      return 'advertencia';
    }

    return 'normal';
  }
}

