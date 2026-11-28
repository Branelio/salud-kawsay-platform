import { Request, Response } from 'express';
import { IClinicalRecordRepository, IVitalSignsRepository, IAlertRepository, IMedicationRepository, ISpecialtyClinicalRepository, IClinicOperationsRepository } from '../../../domain/ports/repositories';
import { MedicationOrder } from '../../../domain/entities/MedicationOrder';
import { MedicalPrescription } from '../../../domain/entities/SpecialtyClinical';
import { InvoiceRecord, InventoryItem, ClinicAppointment } from '../../../domain/entities/ClinicOperations';
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

export class ClinicOperationsController {
  constructor(private opsRepo: IClinicOperationsRepository) {}

  getInvoices = async (_req: Request, res: Response) => {
    try {
      const invoices = await this.opsRepo.getInvoices();
      res.json({ success: true, data: invoices });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  createInvoice = async (req: Request, res: Response) => {
    try {
      const items = Array.isArray(req.body.items) ? req.body.items : [];
      let subtotal0 = 0;
      let subtotal15 = 0;
      for (const item of items) {
        const lineTotal = (Number(item.quantity) || 1) * (Number(item.unitPriceUSD) || 0);
        if (Number(item.ivaRate) === 15) subtotal15 += lineTotal;
        else subtotal0 += lineTotal;
      }
      const ivaUSD = Number((subtotal15 * 0.15).toFixed(2));
      const totalUSD = Number((subtotal0 + subtotal15 + ivaUSD).toFixed(2));
      const seq = Math.floor(100000 + Math.random() * 899999);
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const sriAccessKey = `${dateStr}0117900123450011001001000${seq}1234567811`;

      const invoice = new InvoiceRecord({
        id: `fac-${Math.floor(1000 + Math.random() * 9000)}`,
        invoiceNumber: `001-001-${String(seq).padStart(9, '0')}`,
        sriAccessKey,
        clientDocument: req.body.clientDocument,
        clientName: req.body.clientName,
        clientEmail: req.body.clientEmail,
        paymentMethod: req.body.paymentMethod || 'efectivo',
        items,
        subtotal0USD: Number(subtotal0.toFixed(2)),
        subtotal15USD: Number(subtotal15.toFixed(2)),
        ivaUSD,
        totalUSD,
        status: 'autorizado'
      });
      const saved = await this.opsRepo.saveInvoice(invoice);
      res.status(201).json({ success: true, message: 'Comprobante electrónico SRI generado', data: saved });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  };

  getInventory = async (_req: Request, res: Response) => {
    try {
      const items = await this.opsRepo.getInventory();
      res.json({ success: true, data: items });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  createInventoryItem = async (req: Request, res: Response) => {
    try {
      const item = new InventoryItem({
        id: `inv-${Math.floor(1000 + Math.random() * 9000)}`,
        ...req.body
      });
      const saved = await this.opsRepo.saveInventoryItem(item);
      res.status(201).json({ success: true, message: 'Insumo registrado en inventario ARCSA', data: saved });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  };

  adjustInventoryStock = async (req: Request, res: Response) => {
    try {
      const delta = Number(req.body.delta) || 0;
      const updated = await this.opsRepo.adjustInventoryStock(req.params.id, delta);
      if (updated) {
        res.json({ success: true, data: updated });
      } else {
        res.status(404).json({ success: false, error: 'Insumo no encontrado' });
      }
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  };

  getAppointments = async (_req: Request, res: Response) => {
    try {
      const list = await this.opsRepo.getAppointments();
      res.json({ success: true, data: list });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  createAppointment = async (req: Request, res: Response) => {
    try {
      const appt = new ClinicAppointment({
        id: `cit-${Math.floor(1000 + Math.random() * 9000)}`,
        ...req.body
      });
      const saved = await this.opsRepo.saveAppointment(appt);
      res.status(201).json({ success: true, message: 'Cita agendada en consultorio', data: saved });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  };

  updateAppointmentStatus = async (req: Request, res: Response) => {
    try {
      const updated = await this.opsRepo.updateAppointmentStatus(req.params.id, req.body.status);
      if (updated) {
        res.json({ success: true, data: updated });
      } else {
        res.status(404).json({ success: false, error: 'Cita no encontrada' });
      }
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  };
}
