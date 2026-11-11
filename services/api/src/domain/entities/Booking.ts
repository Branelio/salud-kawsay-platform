export type BookingStatus = 'pendiente' | 'asignada' | 'confirmada' | 'en-proceso' | 'completada' | 'cancelada';
export type PaymentStatus = 'pendiente' | 'pagado' | 'facturado';
export type PaymentMethod = 'transferencia' | 'efectivo' | 'tarjeta' | 'pendiente';

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
  nursePayoutUSD?: number;
  agencyMarginUSD?: number;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  createdAt?: string;
}

export class Booking {
  public readonly id: string;
  public readonly patientId: string;
  public readonly patientCedula: string;
  public readonly patientName: string;
  public readonly familyPhone: string;
  public nurseId?: string;
  public nurseName?: string;
  public readonly serviceType: string;
  public readonly date: string;
  public readonly shiftHours: string;
  public status: BookingStatus;
  public readonly totalPriceUSD: number;
  public nursePayoutUSD: number;
  public agencyMarginUSD: number;
  public paymentStatus: PaymentStatus;
  public paymentMethod: PaymentMethod;
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
    this.status = props.status || (props.nurseId ? 'asignada' : 'pendiente');
    this.totalPriceUSD = props.totalPriceUSD;

    // ERP Unit Economics: Cálculo de Honorarios y Margen
    this.nursePayoutUSD = props.nursePayoutUSD ?? this.calculateDefaultNursePayout(props.totalPriceUSD, props.shiftHours);
    this.agencyMarginUSD = props.agencyMarginUSD ?? Number((this.totalPriceUSD - this.nursePayoutUSD).toFixed(2));
    this.paymentStatus = props.paymentStatus || 'pendiente';
    this.paymentMethod = props.paymentMethod || 'pendiente';
    this.createdAt = props.createdAt || new Date().toISOString();
  }

  private calculateDefaultNursePayout(total: number, shift: string): number {
    const shiftPayoutMap: Record<string, number> = {
      '12h-dia': 20,
      '12h-noche': 24,
      '8h': 15,
      '24h': 40,
      'puntual': 10
    };
    return shiftPayoutMap[shift] || Number((total * 0.73).toFixed(2));
  }

  public assignNurse(nurseId: string, nurseName: string, customPayoutUSD?: number): void {
    this.nurseId = nurseId;
    this.nurseName = nurseName;
    if (this.status === 'pendiente') {
      this.status = 'asignada';
    }
    if (customPayoutUSD !== undefined) {
      this.nursePayoutUSD = customPayoutUSD;
      this.agencyMarginUSD = Number((this.totalPriceUSD - this.nursePayoutUSD).toFixed(2));
    }
  }

  public updateStatus(newStatus: BookingStatus): void {
    this.status = newStatus;
  }

  public updateFinancials(paymentStatus?: PaymentStatus, paymentMethod?: PaymentMethod, payoutUSD?: number): void {
    if (paymentStatus) this.paymentStatus = paymentStatus;
    if (paymentMethod) this.paymentMethod = paymentMethod;
    if (payoutUSD !== undefined) {
      this.nursePayoutUSD = payoutUSD;
      this.agencyMarginUSD = Number((this.totalPriceUSD - this.nursePayoutUSD).toFixed(2));
    }
  }
}
