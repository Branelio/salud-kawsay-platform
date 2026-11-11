export interface NurseCheckinProps {
  id: string;
  nurseId: string;
  nurseName: string;
  patientId: string;
  patientName: string;
  latitude: number;
  longitude: number;
  address: string;
  timestamp?: string;
  status?: string;
}

export class NurseCheckin {
  public readonly id: string;
  public readonly nurseId: string;
  public readonly nurseName: string;
  public readonly patientId: string;
  public readonly patientName: string;
  public readonly latitude: number;
  public readonly longitude: number;
  public readonly address: string;
  public readonly timestamp: string;
  public readonly status: string;

  constructor(props: NurseCheckinProps) {
    this.id = props.id;
    this.nurseId = props.nurseId;
    this.nurseName = props.nurseName;
    this.patientId = props.patientId;
    this.patientName = props.patientName;
    this.latitude = props.latitude;
    this.longitude = props.longitude;
    this.address = props.address;
    this.timestamp = props.timestamp || new Date().toISOString();
    this.status = props.status || 'ingreso_confirmado';
  }
}

