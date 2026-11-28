import { Request, Response } from 'express';
import { AdminAuthUseCase } from '../../../application/use-cases/AdminAuthUseCase';
import { GetStatsUseCase } from '../../../application/use-cases/GetStatsUseCase';
import { IUserRepository } from '../../../domain/ports/repositories';
import { ErpUser } from '../../../domain/entities/ErpUser';
import { PasswordHasher } from '../../security/PasswordHasher';

export class AuthController {
  constructor(private adminAuthUseCase: AdminAuthUseCase) {}

  login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const result = await this.adminAuthUseCase.execute(username, password);
    if (result.success) {
      res.json(result);
    } else {
      res.status(401).json(result);
    }
  };
}

export class StatsController {
  constructor(private getStatsUseCase: GetStatsUseCase) {}

  getStats = async (_req: Request, res: Response) => {
    try {
      const stats = await this.getStatsUseCase.execute();
      res.json({ success: true, data: stats });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
}

export class UsersController {
  constructor(private userRepo: IUserRepository) {}

  getAll = async (_req: Request, res: Response) => {
    try {
      const users = await this.userRepo.getAll();
      res.json({ success: true, data: users.map(u => u.toPublicProfile()) });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const { username, password, fullName, role, specialty, clinicId, clinicName } = req.body;
      if (!username || !password || !fullName) {
        return res.status(400).json({ success: false, error: 'Usuario, contraseña y nombre son obligatorios.' });
      }
      const passwordHash = await PasswordHasher.hash(password);
      const user = new ErpUser({
        id: `usr-${Math.floor(1000 + Math.random() * 9000)}`,
        username,
        fullName,
        role: role || 'doctor',
        specialty: specialty || 'General',
        clinicId: clinicId || 'clinic-kawsay-hq',
        clinicName: clinicName || 'Salud Kawsay Matriz Quito',
        passwordHash,
        active: true
      });
      const saved = await this.userRepo.save(user);
      return res.status(201).json({ success: true, message: 'Usuario del equipo creado con éxito', data: saved.toPublicProfile() });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  };

  toggleActive = async (req: Request, res: Response) => {
    try {
      const updated = await this.userRepo.toggleActive(req.params.id);
      if (updated) {
        res.json({ success: true, data: updated.toPublicProfile() });
      } else {
        res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  };
}
