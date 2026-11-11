import { Request, Response } from 'express';
import { IClinicalRecordRepository, IVitalSignsRepository, IAlertRepository } from '../../../domain/ports/repositories';
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

