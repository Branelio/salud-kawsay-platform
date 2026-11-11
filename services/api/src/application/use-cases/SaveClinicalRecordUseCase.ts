import { ClinicalRecord } from '../../domain/entities/ClinicalRecord';
import { Patient } from '../../domain/entities/Patient';
import { IClinicalRecordRepository, IPatientRepository } from '../../domain/ports/repositories';

export interface SaveClinicalRecordDTO {
  cedula: string;
  fullName: string;
  age: number | string;
  bloodType?: string;
  allergies?: string;
  primaryDiagnosis?: string;
  prescribedMeds?: string;
  attendingDoctor?: string;
  emergencyContact?: string;
  specialCareNotes?: string;
  address?: string;
  familyPhone?: string;
  patientId?: string;
}

export class SaveClinicalRecordUseCase {
  constructor(
    private clinicalRepo: IClinicalRecordRepository,
    private patientRepo: IPatientRepository
  ) {}

  async execute(dto: SaveClinicalRecordDTO): Promise<{ patient: Patient; clinicalRecord: ClinicalRecord }> {
    let patient = await this.patientRepo.getByCedula(dto.cedula);

    if (!patient) {
      patient = new Patient({
        id: dto.patientId || `pat-${Math.floor(1000 + Math.random() * 9000)}`,
        cedula: dto.cedula,
        fullName: dto.fullName,
        age: typeof dto.age === 'number' ? dto.age : parseInt(dto.age, 10) || 70,
        bloodType: dto.bloodType || 'O+',
        allergies: dto.allergies || 'Ninguna',
        condition: dto.primaryDiagnosis || 'En atención domiciliaria',
        address: dto.address || 'Quito, Ecuador',
        familyContactName: dto.emergencyContact || 'Familiar',
        familyPhone: dto.familyPhone || '0998765432'
      });
      await this.patientRepo.save(patient);
    } else {
      // Update patient profile if needed
      patient = new Patient({
        id: patient.id,
        cedula: patient.cedula,
        fullName: dto.fullName || patient.fullName,
        age: typeof dto.age === 'number' ? dto.age : parseInt(dto.age as string, 10) || patient.age,
        bloodType: dto.bloodType || patient.bloodType,
        allergies: dto.allergies || patient.allergies,
        condition: dto.primaryDiagnosis || patient.condition,
        address: dto.address || patient.address,
        familyContactName: dto.emergencyContact || patient.familyContactName,
        familyPhone: dto.familyPhone || patient.familyPhone
      });
      await this.patientRepo.save(patient);
    }

    const clinicalRecord = new ClinicalRecord({
      patientId: patient.id,
      cedula: dto.cedula,
      fullName: patient.fullName,
      age: patient.age,
      bloodType: patient.bloodType,
      allergies: patient.allergies,
      primaryDiagnosis: dto.primaryDiagnosis || 'En monitoreo regular',
      prescribedMeds: dto.prescribedMeds || 'Según indicación médica',
      attendingDoctor: dto.attendingDoctor || 'Médico Tratante',
      emergencyContact: dto.emergencyContact || patient.familyPhone,
      specialCareNotes: dto.specialCareNotes || 'Sin observaciones adicionales',
      lastUpdated: new Date().toISOString()
    });

    const savedRecord = await this.clinicalRepo.save(clinicalRecord);
    return { patient, clinicalRecord: savedRecord };
  }
}

