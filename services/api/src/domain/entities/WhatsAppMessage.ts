export type WhatsAppMessageType = 'reserva_confirmada' | 'checkin_enfermera' | 'alerta_signos' | 'reporte_diario' | 'fichaje_ingreso';

export interface WhatsAppMessageProps {
  id: string;
  toPhone: string;
  messageText: string;
  type: WhatsAppMessageType;
  timestamp?: string;
  status?: 'enviado' | 'entregado' | 'leido';
}

export class WhatsAppMessage {
  public readonly id: string;
  public readonly toPhone: string;
  public readonly messageText: string;
  public readonly type: WhatsAppMessageType;
  public readonly timestamp: string;
  public readonly status: 'enviado' | 'entregado' | 'leido';

  constructor(props: WhatsAppMessageProps) {
    this.id = props.id;
    this.toPhone = props.toPhone;
    this.messageText = props.messageText;
    this.type = props.type;
    this.timestamp = props.timestamp || new Date().toISOString();
    this.status = props.status || 'entregado';
  }
}

