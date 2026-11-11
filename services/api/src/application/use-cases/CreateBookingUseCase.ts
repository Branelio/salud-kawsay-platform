import { Booking } from '../../domain/entities/Booking';
import { Patient } from '../../domain/entities/Patient';
import { IBookingRepository, IPatientRepository, IMessagingService } from '../../domain/ports/repositories';

export interface CreateBookingDTO {
  patientCedula: string;
  patientName: string;
  familyPhone: string;
  nurseId?: string;
  nurseName?: string;
  serviceType: string;
  date: string;
  shiftHours: string;
  totalPriceUSD: number;
}

export class CreateBookingUseCase {
  constructor(
    private bookingRepo: IBookingRepository,
    private patientRepo: IPatientRepository,
    private messagingService: IMessagingService
  ) {}

  async execute(dto: CreateBookingDTO): Promise<Booking> {
    let patient = await this.patientRepo.getByCedula(dto.patientCedula);
    if (!patient) {
      patient = new Patient({
        id: `pat-${Math.floor(1000 + Math.random() * 9000)}`,
        cedula: dto.patientCedula || '1700000000',
        fullName: dto.patientName,
        age: 75,
        bloodType: 'O+',
        allergies: 'En revisión clínica',
        condition: dto.serviceType,
        address: 'Quito, Ecuador',
        familyContactName: 'Familiar Responsable',
        familyPhone: dto.familyPhone
      });
      await this.patientRepo.save(patient);
    }

    const shiftPriceMap: Record<string, number> = {
      '12h-dia': 27,
      '12h-noche': 33,
      '8h': 20,
      '24h': 55,
      'puntual': 14
    };
    const computedPrice = dto.totalPriceUSD || shiftPriceMap[dto.shiftHours] || 27;

    const booking = new Booking({
      id: `res-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: patient.id,
      patientCedula: patient.cedula,
      patientName: patient.fullName,
      familyPhone: dto.familyPhone,
      nurseId: dto.nurseId,
      nurseName: dto.nurseName,
      serviceType: dto.serviceType,
      date: dto.date,
      shiftHours: dto.shiftHours,
      totalPriceUSD: computedPrice,
      status: 'pendiente'
    });

    const savedBooking = await this.bookingRepo.save(booking);

    await this.messagingService.sendMessage(
      savedBooking.familyPhone,
      `¡Hola! Tu reserva (#${savedBooking.id}) para ${savedBooking.patientName} (Cédula: ${savedBooking.patientCedula}) fue registrada exitosamente para el día ${savedBooking.date} (${savedBooking.shiftHours}).`,
      'reserva_confirmada'
    );

    return savedBooking;
  }
}

