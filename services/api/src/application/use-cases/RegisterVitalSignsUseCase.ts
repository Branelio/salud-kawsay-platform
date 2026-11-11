import { VitalSignRecord, VitalSignRecordProps } from '../../domain/entities/VitalSignRecord';
import { MedicalAlert } from '../../domain/entities/MedicalAlert';
import { IVitalSignsRepository, IAlertRepository, IPatientRepository, IMessagingService } from '../../domain/ports/repositories';

export interface RegisterVitalSignsDTO {
  patientId: string;
  patientName?: string;
  nurseId: string;
  nurseName: string;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  bloodGlucoseMgDl: number;
  oxygenSaturation: number;
  heartRateBpm: number;
  temperatureCelsius: number;
  medicationAdministered: string;
  nurseNotes: string;
}

export class RegisterVitalSignsUseCase {
  constructor(
    private vitalsRepo: IVitalSignsRepository,
    private alertRepo: IAlertRepository,
    private patientRepo: IPatientRepository,
    private messagingService: IMessagingService
  ) {}

  async execute(dto: RegisterVitalSignsDTO): Promise<VitalSignRecord> {
    const id = `vital-${Math.floor(1000 + Math.random() * 9000)}`;
    const vitalRecord = new VitalSignRecord({
      id,
      patientId: dto.patientId,
      patientName: dto.patientName,
      nurseId: dto.nurseId,
      nurseName: dto.nurseName,
      bloodPressureSystolic: dto.bloodPressureSystolic,
      bloodPressureDiastolic: dto.bloodPressureDiastolic,
      bloodGlucoseMgDl: dto.bloodGlucoseMgDl,
      oxygenSaturation: dto.oxygenSaturation,
      heartRateBpm: dto.heartRateBpm,
      temperatureCelsius: dto.temperatureCelsius,
      medicationAdministered: dto.medicationAdministered,
      nurseNotes: dto.nurseNotes
    });

    const savedVital = await this.vitalsRepo.save(vitalRecord);

    // Si el estado es advertencia o crítico, disparamos alerta clínica
    if (savedVital.statusFlag !== 'normal') {
      const alertId = `alert-${Math.floor(1000 + Math.random() * 9000)}`;
      const message = savedVital.statusFlag === 'critico'
        ? `ALERTA CRÍTICA: P.A ${savedVital.bloodPressureSystolic}/${savedVital.bloodPressureDiastolic} mmHg, SatO2 ${savedVital.oxygenSaturation}%, Temp ${savedVital.temperatureCelsius}°C`
        : `Aviso Clínico: P.A ${savedVital.bloodPressureSystolic}/${savedVital.bloodPressureDiastolic} mmHg, Glucosa ${savedVital.bloodGlucoseMgDl} mg/dL`;

      const alert = new MedicalAlert({
        id: alertId,
        patientId: savedVital.patientId,
        patientName: savedVital.patientName || 'Paciente Domiciliario',
        vitalId: savedVital.id,
        severity: savedVital.statusFlag,
        message
      });
      await this.alertRepo.save(alert);
    }

    // Notificación a la familia
    const patient = await this.patientRepo.getById(savedVital.patientId);
    const phone = patient ? patient.familyPhone : '0998765432';

    const alertPrefix = savedVital.statusFlag === 'critico'
      ? '⚠️ ALERTA MÉDICA: '
      : savedVital.statusFlag === 'advertencia'
        ? 'ℹ️ Aviso de Signos Vitales: '
        : '📋 Reporte de Guardia: ';

    await this.messagingService.sendMessage(
      phone,
      `${alertPrefix}Nuevos signos vitales registrados por ${savedVital.nurseName}: P.A: ${savedVital.bloodPressureSystolic}/${savedVital.bloodPressureDiastolic} mmHg, Glucosa: ${savedVital.bloodGlucoseMgDl} mg/dL, SatO2: ${savedVital.oxygenSaturation}%. Notas: ${savedVital.nurseNotes}`,
      savedVital.statusFlag !== 'normal' ? 'alerta_signos' : 'reporte_diario'
    );

    return savedVital;
  }
}

