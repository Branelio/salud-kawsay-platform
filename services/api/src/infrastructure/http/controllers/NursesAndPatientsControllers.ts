import { Request, Response } from 'express';
import { INurseRepository, IPatientRepository } from '../../../domain/ports/repositories';
import { CheckinNurseUseCase } from '../../../application/use-cases/CheckinNurseUseCase';
import { VerifyCedulaUseCase } from '../../../application/use-cases/VerifyCedulaUseCase';
import { Nurse } from '../../../domain/entities/Nurse';

export class NursesController {
  constructor(
    private nurseRepo: INurseRepository,
    private checkinNurseUseCase: CheckinNurseUseCase
  ) {}

  getAll = async (_req: Request, res: Response) => {
    try {
      const nurses = await this.nurseRepo.getAll();
      res.json({ success: true, data: nurses });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const nurse = new Nurse({
        id: `nurse-${Math.floor(1000 + Math.random() * 9000)}`,
        ...req.body,
        rating: 5.0,
        isAvailable: true
      });
      const saved = await this.nurseRepo.save(nurse);
      res.status(201).json({ success: true, message: 'Enfermera registrada exitosamente', data: saved });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  };

  checkin = async (req: Request, res: Response) => {
    try {
      const checkin = await this.checkinNurseUseCase.execute(req.body);
      res.status(201).json({ success: true, message: 'Fichaje GPS registrado exitosamente', data: checkin });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  };

  getCheckins = async (_req: Request, res: Response) => {
    try {
      const checkins = await this.nurseRepo.getCheckins();
      res.json({ success: true, data: checkins });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
}

export class PatientsController {
  constructor(
    private patientRepo: IPatientRepository,
    private verifyCedulaUseCase: VerifyCedulaUseCase
  ) {}

  getAll = async (_req: Request, res: Response) => {
    try {
      const patients = await this.patientRepo.getAll();
      res.json({ success: true, data: patients });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  getByCedula = async (req: Request, res: Response) => {
    try {
      const { cedula } = req.params;
      const result = await this.verifyCedulaUseCase.execute(cedula);
      if (result.found && result.patient) {
        res.json({ success: true, found: true, data: result.patient });
      } else {
        res.json({ success: true, found: false, message: 'No existe registro con esa Cédula' });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
}

