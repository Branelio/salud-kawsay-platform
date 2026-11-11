import { Patient } from '../../domain/entities/Patient';
import { ClinicalRecord } from '../../domain/entities/ClinicalRecord';
import { IPatientRepository, IClinicalRecordRepository } from '../../domain/ports/repositories';

export interface PatientVerificationResult {
  found: boolean;
  patient?: Patient & { clinicalRecord: ClinicalRecord | null };
}

export class VerifyCedulaUseCase {
  constructor(
    private patientRepo: IPatientRepository,
    private clinicalRepo: IClinicalRecordRepository
  ) {}

  async execute(cedula: string): Promise<PatientVerificationResult> {
    const patient = await this.patientRepo.getByCedula(cedula);
    if (!patient) {
      return { found: false };
    }

    const clinicalRecord = await this.clinicalRepo.getByPatientIdOrCedula(cedula) 
      || await this.clinicalRepo.getByPatientIdOrCedula(patient.id);

    return {
      found: true,
      patient: {
        ...patient,
        clinicalRecord
      }
    };
  }
}

