export type BookingStatus = 'pendiente' | 'confirmada' | 'en-proceso' | 'completada' | 'cancelada';

export interface BookingProps {
  id: string;
  patientId: string;
  patientCedula: string;
  patientName: string;
  familyPhone: string;
  nurseId?: string;
  nurseName?: string;
  serviceType: string;
  date: string;
  shiftHours: string;
  status?: BookingStatus;
  totalPriceUSD: number;
  createdAt?: string;
}

export class Booking {
  public readonly id: string;
  public readonly patientId: string;
  public readonly patientCedula: string;
  public readonly patientName: string;
  public readonly familyPhone: string;
  public readonly nurseId?: string;
  public readonly nurseName?: string;
  public readonly serviceType: string;
  public readonly date: string;
  public readonly shiftHours: string;
  public status: BookingStatus;
  public readonly totalPriceUSD: number;
  public readonly createdAt: string;

  constructor(props: BookingProps) {
    this.id = props.id;
    this.patientId = props.patientId;
    this.patientCedula = props.patientCedula;
    this.patientName = props.patientName;
    this.familyPhone = props.familyPhone;
    this.nurseId = props.nurseId;
    this.nurseName = props.nurseName;
    this.serviceType = props.serviceType;
    this.date = props.date;
    this.shiftHours = props.shiftHours;
    this.status = props.status || 'pendiente';
    this.totalPriceUSD = props.totalPriceUSD;
    this.createdAt = props.createdAt || new Date().toISOString();
  }

  public updateStatus(newStatus: BookingStatus): void {
    this.status = newStatus;
  }
}

