import { Request, Response } from 'express';
import { IClinicalRecordRepository, IVitalSignsRepository, IAlertRepository, IMedicationRepository, ISpecialtyClinicalRepository } from '../../../domain/ports/repositories';
import { MedicationOrder } from '../../../domain/entities/MedicationOrder';
import { MedicalPrescription } from '../../../domain/entities/SpecialtyClinical';
import { SaveClinicalRecordUseCase } from '../../../application/use-cases/SaveClinicalRecordUseCase';
import { RegisterVitalSignsUseCase } from '../../../application/use-cases/RegisterVitalSignsUseCase';
import { ResolveAlertUseCase } from '../../../application/use-cases/ResolveAlertUseCase';

export class ClinicalRecordsController {
  constructor(
    private clinicalRepo: IClinicalRecordRepository,
    private saveClinicalRecordUseCase: SaveClinicalRecordUseCase
  ) {}

  getAll = async (_req: Request, res: Response) => {
    try {
      const records = await this.clinicalRepo.getAll();
      res.json({ success: true, data: records });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  getByPatientId = async (req: Request, res: Response) => {
    try {
      const { patientId } = req.params;
      const record = await this.clinicalRepo.getByPatientIdOrCedula(patientId);
      if (record) {
        res.json({ success: true, data: record });
      } else {
        res.status(404).json({ success: false, error: 'Ficha clínica no encontrada' });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  save = async (req: Request, res: Response) => {
    try {
      const result = await this.saveClinicalRecordUseCase.execute(req.body);
      res.status(201).json({ success: true, message: 'Ficha Clínica guardada exitosamente', data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  };
}

export class VitalsController {
  constructor(
    private vitalsRepo: IVitalSignsRepository,
    private registerVitalSignsUseCase: RegisterVitalSignsUseCase
  ) {}

  getAll = async (_req: Request, res: Response) => {
    try {
      const vitals = await this.vitalsRepo.getAll();
      res.json({ success: true, data: vitals });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  getByPatientId = async (req: Request, res: Response) => {
    try {
      const { patientId } = req.params;
      const vitals = await this.vitalsRepo.getByPatientId(patientId);
      res.json({ success: true, data: vitals });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  register = async (req: Request, res: Response) => {
    try {
      const vital = await this.registerVitalSignsUseCase.execute(req.body);
      res.status(201).json({
        success: true,
        message: 'Signos vitales registrados y alerta/notificación enviada por WhatsApp',
        data: vital
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  };
}

export class AlertsController {
  constructor(
    private alertRepo: IAlertRepository,
    private resolveAlertUseCase: ResolveAlertUseCase
  ) {}

  getAll = async (_req: Request, res: Response) => {
    try {
      const alerts = await this.alertRepo.getAll();
      res.json({ success: true, data: alerts });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  resolve = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const resolved = await this.resolveAlertUseCase.execute(id, notes);
      if (resolved) {
        res.json({ success: true, message: 'Alerta resuelta correctamente', data: resolved });
      } else {
        res.status(404).json({ success: false, error: 'Alerta no encontrada' });
      }
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  };
}

export class MedicationsController {
  constructor(private medicationRepo: IMedicationRepository) {}

  getAll = async (_req: Request, res: Response) => {
    try {
      const meds = await this.medicationRepo.getAll();
      res.json({ success: true, data: meds });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  getByPatientId = async (req: Request, res: Response) => {
    try {
      const meds = await this.medicationRepo.getByPatientId(req.params.patientId);
      res.json({ success: true, data: meds });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const order = new MedicationOrder({
        id: `med-${Math.floor(1000 + Math.random() * 9000)}`,
        ...req.body
      });
      const saved = await this.medicationRepo.save(order);
      res.status(201).json({ success: true, message: 'Prescripción agregada al Kardex/eMAR', data: saved });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  };

  administer = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { nurseName, status, notes } = req.body;
      const updated = await this.medicationRepo.logAdministration(
        id,
        nurseName || 'Enfermera de Turno',
        status || 'administrado',
        notes
      );
      if (updated) {
        res.json({ success: true, message: 'Administración registrada en eMAR', data: updated });
      } else {
        res.status(404).json({ success: false, error: 'Orden de medicación no encontrada' });
      }
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  };
}

export class SpecialtyClinicalController {
  constructor(private specialtyRepo: ISpecialtyClinicalRepository) {}

  getPrescriptions = async (_req: Request, res: Response) => {
    try {
      const list = await this.specialtyRepo.getPrescriptions();
      res.json({ success: true, data: list });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  createPrescription = async (req: Request, res: Response) => {
    try {
      const rx = new MedicalPrescription({
        id: `rx-${Math.floor(1000 + Math.random() * 9000)}`,
        ...req.body
      });
      const saved = await this.specialtyRepo.savePrescription(rx);
      res.status(201).json({ success: true, message: 'Receta médica emitida exitosamente', data: saved });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  };

  getSpecialtyByPatient = async (req: Request, res: Response) => {
    try {
      const data = await this.specialtyRepo.getSpecialtyByPatientId(req.params.patientId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  saveSpecialty = async (req: Request, res: Response) => {
    try {
      const current = await this.specialtyRepo.getSpecialtyByPatientId(req.params.patientId);
      const updated = await this.specialtyRepo.saveSpecialtyData({
        ...current,
        ...req.body,
        patientId: req.params.patientId
      });
      res.json({ success: true, message: 'Ficha de especialidad guardada', data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  };
}
