export type MedicationRoute = 'Oral' | 'Intravenosa' | 'Subcutánea' | 'Intramuscular' | 'Tópica' | 'Inhalatoria';
export type AdministrationStatus = 'administrado' | 'omitido' | 'retrasado';

export interface AdministrationLog {
  id: string;
  timestamp: string;
  nurseName: string;
  status: AdministrationStatus;
  notes?: string;
}

export interface MedicationOrderProps {
  id: string;
  patientId: string;
  patientName: string;
  medicationName: string;
  dosage: string;
  route: MedicationRoute;
  schedule: string;
  prescribedBy: string;
  active?: boolean;
  lastAdministeredAt?: string;
  lastAdministeredBy?: string;
  administrationLogs?: AdministrationLog[];
}

export class MedicationOrder {
  public readonly id: string;
  public readonly patientId: string;
  public readonly patientName: string;
  public readonly medicationName: string;
  public readonly dosage: string;
  public readonly route: MedicationRoute;
  public readonly schedule: string;
  public readonly prescribedBy: string;
  public active: boolean;
  public lastAdministeredAt?: string;
  public lastAdministeredBy?: string;
  public administrationLogs: AdministrationLog[];

  constructor(props: MedicationOrderProps) {
    this.id = props.id;
    this.patientId = props.patientId;
    this.patientName = props.patientName;
    this.medicationName = props.medicationName;
    this.dosage = props.dosage;
    this.route = props.route || 'Oral';
    this.schedule = props.schedule;
    this.prescribedBy = props.prescribedBy || 'Médico Tratante';
    this.active = props.active !== undefined ? props.active : true;
    this.lastAdministeredAt = props.lastAdministeredAt;
    this.lastAdministeredBy = props.lastAdministeredBy;
    this.administrationLogs = props.administrationLogs || [];
  }

  public logAdministration(nurseName: string, status: AdministrationStatus = 'administrado', notes?: string): AdministrationLog {
    const entry: AdministrationLog = {
      id: `adm-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      nurseName,
      status,
      notes
    };
    this.administrationLogs.unshift(entry);
    if (status === 'administrado') {
      this.lastAdministeredAt = entry.timestamp;
      this.lastAdministeredBy = nurseName;
    }
    return entry;
  }
}

