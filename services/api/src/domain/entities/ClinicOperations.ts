export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPriceUSD: number;
  ivaRate: 0 | 15; // Ecuador SRI: 0% servicios médicos, 15% insumos/bienes
}

export interface InvoiceRecordProps {
  id: string;
  invoiceNumber: string;
  sriAccessKey: string;
  clientDocument: string; // Cédula o RUC
  clientName: string;
  clientEmail?: string;
  paymentMethod: 'efectivo' | 'transferencia' | 'tarjeta';
  items: InvoiceLineItem[];
  subtotal0USD: number;
  subtotal15USD: number;
  ivaUSD: number;
  totalUSD: number;
  status?: 'autorizado' | 'borrador' | 'anulado';
  issuedAt?: string;
}

export class InvoiceRecord {
  public readonly id: string;
  public readonly invoiceNumber: string;
  public readonly sriAccessKey: string;
  public readonly clientDocument: string;
  public readonly clientName: string;
  public readonly clientEmail: string;
  public readonly paymentMethod: 'efectivo' | 'transferencia' | 'tarjeta';
  public readonly items: InvoiceLineItem[];
  public readonly subtotal0USD: number;
  public readonly subtotal15USD: number;
  public readonly ivaUSD: number;
  public readonly totalUSD: number;
  public status: 'autorizado' | 'borrador' | 'anulado';
  public readonly issuedAt: string;

  constructor(props: InvoiceRecordProps) {
    this.id = props.id;
    this.invoiceNumber = props.invoiceNumber;
    this.sriAccessKey = props.sriAccessKey;
    this.clientDocument = props.clientDocument;
    this.clientName = props.clientName;
    this.clientEmail = props.clientEmail || 'paciente@correo.ec';
    this.paymentMethod = props.paymentMethod || 'efectivo';
    this.items = props.items || [];
    this.subtotal0USD = Number(props.subtotal0USD) || 0;
    this.subtotal15USD = Number(props.subtotal15USD) || 0;
    this.ivaUSD = Number(props.ivaUSD) || 0;
    this.totalUSD = Number(props.totalUSD) || 0;
    this.status = props.status || 'autorizado';
    this.issuedAt = props.issuedAt || new Date().toISOString();
  }
}

export interface InventoryItemProps {
  id: string;
  name: string;
  category: 'Enfermería' | 'Odontología' | 'Pediatría' | 'General';
  sku: string;
  lotNumber: string;
  expirationDate: string;
  stock: number;
  minStock: number;
  unitCostUSD: number;
  unit: string;
}

export class InventoryItem {
  public readonly id: string;
  public readonly name: string;
  public readonly category: 'Enfermería' | 'Odontología' | 'Pediatría' | 'General';
  public readonly sku: string;
  public readonly lotNumber: string;
  public readonly expirationDate: string;
  public stock: number;
  public readonly minStock: number;
  public readonly unitCostUSD: number;
  public readonly unit: string;

  constructor(props: InventoryItemProps) {
    this.id = props.id;
    this.name = props.name;
    this.category = props.category || 'General';
    this.sku = props.sku;
    this.lotNumber = props.lotNumber;
    this.expirationDate = props.expirationDate;
    this.stock = Number(props.stock) || 0;
    this.minStock = Number(props.minStock) || 10;
    this.unitCostUSD = Number(props.unitCostUSD) || 0;
    this.unit = props.unit || 'unidad';
  }
}

export type AppointmentStatus = 'confirmada' | 'en-sala' | 'atendida' | 'cancelada';

export interface ClinicAppointmentProps {
  id: string;
  patientName: string;
  patientPhone: string;
  specialty: 'Odontología' | 'Pediatría' | 'Medicina General' | 'Enfermería';
  professionalName: string;
  room: string;
  date: string;
  time: string;
  reason: string;
  status?: AppointmentStatus;
}

export class ClinicAppointment {
  public readonly id: string;
  public readonly patientName: string;
  public readonly patientPhone: string;
  public readonly specialty: 'Odontología' | 'Pediatría' | 'Medicina General' | 'Enfermería';
  public readonly professionalName: string;
  public readonly room: string;
  public readonly date: string;
  public readonly time: string;
  public readonly reason: string;
  public status: AppointmentStatus;

  constructor(props: ClinicAppointmentProps) {
    this.id = props.id;
    this.patientName = props.patientName;
    this.patientPhone = props.patientPhone;
    this.specialty = props.specialty || 'Medicina General';
    this.professionalName = props.professionalName;
    this.room = props.room || 'Consultorio 1';
    this.date = props.date;
    this.time = props.time;
    this.reason = props.reason;
    this.status = props.status || 'confirmada';
  }
}
