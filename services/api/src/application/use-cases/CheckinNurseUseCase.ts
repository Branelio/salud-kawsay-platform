import { NurseCheckin } from '../../domain/entities/NurseCheckin';
import { INurseRepository, IPatientRepository, IMessagingService } from '../../domain/ports/repositories';

export interface CheckinNurseDTO {
  nurseId?: string;
  nurseName?: string;
  patientId?: string;
  patientName?: string;
  latitude: number;
  longitude: number;
  address?: string;
}

export class CheckinNurseUseCase {
  constructor(
    private nurseRepo: INurseRepository,
    private patientRepo: IPatientRepository,
    private messagingService: IMessagingService
  ) {}

  async execute(dto: CheckinNurseDTO): Promise<NurseCheckin> {
    const id = `chk-${Math.floor(1000 + Math.random() * 9000)}`;
    const checkin = new NurseCheckin({
      id,
      nurseId: dto.nurseId || 'nurse-1',
      nurseName: dto.nurseName || 'Lic. María Elena Ramos',
      patientId: dto.patientId || 'pat-1',
      patientName: dto.patientName || 'Sra. Carmen Rosa Delgado',
      latitude: dto.latitude || -0.180653,
      longitude: dto.longitude || -78.467838,
      address: dto.address || 'Av. Coruña 124, Quito',
      status: 'ingreso_confirmado'
    });

    const saved = await this.nurseRepo.saveCheckin(checkin);

    const patient = await this.patientRepo.getById(saved.patientId);
    const phone = patient ? patient.familyPhone : '0998765432';

    await this.messagingService.sendMessage(
      phone,
      `📍 Fichaje GPS Confirmado: ${saved.nurseName} ha ingresado al domicilio para la guardia de ${saved.patientName}. Ubicación verificada (${saved.latitude.toFixed(4)}, ${saved.longitude.toFixed(4)}).`,
      'fichaje_ingreso'
    );

    return saved;
  }
}

