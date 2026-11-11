import { Request, Response } from 'express';
import { IBookingRepository, IReviewRepository, IMessagingService } from '../../../domain/ports/repositories';
import { CreateBookingUseCase } from '../../../application/use-cases/CreateBookingUseCase';
import { AddReviewUseCase } from '../../../application/use-cases/AddReviewUseCase';
import { BookingStatus } from '../../../domain/entities/Booking';

export class BookingsController {
  constructor(
    private bookingRepo: IBookingRepository,
    private createBookingUseCase: CreateBookingUseCase
  ) {}

  getAll = async (_req: Request, res: Response) => {
    try {
      const bookings = await this.bookingRepo.getAll();
      res.json({ success: true, data: bookings });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const booking = await this.createBookingUseCase.execute(req.body);
      res.status(201).json({
        success: true,
        message: 'Reserva creada y notificada por WhatsApp',
        data: booking
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  };

  updateStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await this.bookingRepo.updateStatus(id, status as BookingStatus);
      if (updated) {
        res.json({ success: true, message: `Estado de reserva actualizado a ${status}`, data: updated });
      } else {
        res.status(404).json({ success: false, error: 'Reserva no encontrada' });
      }
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  };

  assignNurse = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { nurseId, nurseName, customPayoutUSD } = req.body;
      const updated = await this.bookingRepo.assignNurse(id, nurseId, nurseName, customPayoutUSD);
      if (updated) {
        res.json({ success: true, message: `Enfermera ${nurseName} asignada a la reserva #${id}`, data: updated });
      } else {
        res.status(404).json({ success: false, error: 'Reserva no encontrada' });
      }
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  };

  updateFinancials = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { paymentStatus, paymentMethod, nursePayoutUSD } = req.body;
      const updated = await this.bookingRepo.updateFinancials(id, paymentStatus, paymentMethod, nursePayoutUSD);
      if (updated) {
        res.json({ success: true, message: `Datos financieros de reserva #${id} actualizados`, data: updated });
      } else {
        res.status(404).json({ success: false, error: 'Reserva no encontrada' });
      }
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  };
}

export class ReviewsController {
  constructor(
    private reviewRepo: IReviewRepository,
    private addReviewUseCase: AddReviewUseCase
  ) {}

  getAll = async (_req: Request, res: Response) => {
    try {
      const reviews = await this.reviewRepo.getAll();
      res.json({ success: true, data: reviews });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const review = await this.addReviewUseCase.execute(req.body);
      res.status(201).json({ success: true, message: '¡Muchas gracias por tu recomendación!', data: review });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  };
}

export class WhatsAppController {
  constructor(private messagingService: IMessagingService) {}

  getLogs = async (_req: Request, res: Response) => {
    try {
      const logs = await this.messagingService.getLogs();
      res.json({ success: true, data: logs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  webhook = async (req: Request, res: Response) => {
    try {
      const { from, message } = req.body;
      console.log(`[WHATSAPP BOT WEBHOOK] Mensaje recibido de ${from}: "${message}"`);

      let botReply = 'Gracias por escribir a Salud Kawsay. ¿En qué podemos acompañarte hoy?';
      const cleanMsg = (message || '').toLowerCase();

      if (cleanMsg.includes('reserva') || cleanMsg.includes('turno') || cleanMsg.includes('precio') || cleanMsg.includes('costo')) {
        botReply = 'Ofrecemos cuidado de adulto mayor, signos vitales, medicamentos y curaciones. Podés cotizar en tiempo real y agendar en nuestra web con la Cédula del paciente.';
      } else if (cleanMsg.includes('signos') || cleanMsg.includes('estado') || cleanMsg.includes('bitacora')) {
        botReply = 'Para consultar la bitácora médica en vivo de tu familiar o verificar su Cédula, ingresá a la sección "Bitácora Médica" en nuestra web.';
      } else if (cleanMsg.includes('recomendaciones') || cleanMsg.includes('testimonios') || cleanMsg.includes('clientes')) {
        botReply = '¡Nuestros clientes nos recomiendan con 4.9/5 estrellas! Podés ver fotos reales y opiniones de otras familias en la sección de Testimonios de la web.';
      }

      const sentMsg = await this.messagingService.sendMessage(from, botReply, 'reporte_diario');
      res.json({ success: true, botReply, messageSent: sentMsg });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
}

