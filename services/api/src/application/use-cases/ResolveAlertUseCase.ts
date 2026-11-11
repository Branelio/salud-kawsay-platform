import { MedicalAlert } from '../../domain/entities/MedicalAlert';
import { IAlertRepository } from '../../domain/ports/repositories';

export class ResolveAlertUseCase {
  constructor(private alertRepo: IAlertRepository) {}

  async execute(alertId: string, notes?: string): Promise<MedicalAlert | null> {
    return this.alertRepo.resolve(alertId, 'Administración Médica', notes);
  }
}

