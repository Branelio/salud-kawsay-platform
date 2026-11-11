export interface MedicalAlertProps {
  id: string;
  patientId: string;
  patientName: string;
  vitalId: string;
  severity: 'advertencia' | 'critico';
  message: string;
  timestamp?: string;
  resolved?: boolean;
  resolvedBy?: string;
  resolvedNotes?: string;
}

export class MedicalAlert {
  public readonly id: string;
  public readonly patientId: string;
  public readonly patientName: string;
  public readonly vitalId: string;
  public readonly severity: 'advertencia' | 'critico';
  public readonly message: string;
  public readonly timestamp: string;
  public resolved: boolean;
  public resolvedBy?: string;
  public resolvedNotes?: string;

  constructor(props: MedicalAlertProps) {
    this.id = props.id;
    this.patientId = props.patientId;
    this.patientName = props.patientName;
    this.vitalId = props.vitalId;
    this.severity = props.severity;
    this.message = props.message;
    this.timestamp = props.timestamp || new Date().toISOString();
    this.resolved = props.resolved ?? false;
    this.resolvedBy = props.resolvedBy;
    this.resolvedNotes = props.resolvedNotes;
  }

  public resolve(resolvedBy: string, notes?: string): void {
    this.resolved = true;
    this.resolvedBy = resolvedBy;
    this.resolvedNotes = notes || 'Atendido por personal de salud.';
  }
}

