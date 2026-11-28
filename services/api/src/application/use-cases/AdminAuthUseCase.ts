import { JwtService } from '../../infrastructure/security/JwtService';
import { PasswordHasher } from '../../infrastructure/security/PasswordHasher';
import { IUserRepository } from '../../domain/ports/repositories';
import { ErpRole } from '../../domain/entities/ErpUser';

export interface AuthResult {
  success: boolean;
  token?: string;
  user?: {
    userId: string;
    name: string;
    role: ErpRole | 'family';
    specialty?: string;
    clinicId?: string;
    clinicName?: string;
    email: string;
  };
  error?: string;
}

export class AdminAuthUseCase {
  constructor(
    private jwtService = new JwtService(),
    private userRepo?: IUserRepository
  ) {}

  async execute(username?: string, password?: string): Promise<AuthResult> {
    if (!username || !password) {
      return { success: false, error: 'Ingresá usuario y contraseña.' };
    }

    const normalized = username.trim().toLowerCase();

    // 1. Check multi-role staff accounts in database (Doctor, Nurse, Reception, Clinic Admin)
    if (this.userRepo) {
      const staffUser = await this.userRepo.getByUsername(normalized);
      if (staffUser) {
        if (!staffUser.active) {
          return { success: false, error: 'Tu cuenta se encuentra desactivada. Contactá a Administración.' };
        }
        const match = await PasswordHasher.compare(password, staffUser.passwordHash);
        if (!match) {
          return { success: false, error: 'Credenciales inválidas. Verifique su usuario y contraseña.' };
        }
        const token = this.jwtService.sign({
          userId: staffUser.id,
          email: staffUser.username,
          role: staffUser.role,
          clinicId: staffUser.clinicId
        });
        return {
          success: true,
          token,
          user: {
            userId: staffUser.id,
            name: staffUser.fullName,
            role: staffUser.role,
            specialty: staffUser.specialty,
            clinicId: staffUser.clinicId,
            clinicName: staffUser.clinicName,
            email: staffUser.username
          }
        };
      }
    }

    // 2. Bootstrap Super-Admin fallback
    const validAdminUser = normalized === 'admin' || normalized === 'admin@saludkawsay.ec';
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (validAdminUser && password === expectedPassword) {
      const user = {
        userId: 'usr-admin-1',
        name: 'Administrador General',
        role: 'admin' as const,
        specialty: 'Dirección Médica',
        clinicId: 'clinic-kawsay-hq',
        clinicName: 'Salud Kawsay Matriz Quito',
        email: 'admin@saludkawsay.ec'
      };
      const token = this.jwtService.sign({
        userId: user.userId,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId
      });
      return { success: true, token, user };
    }

    return {
      success: false,
      error: 'Credenciales inválidas. Verifique su usuario y contraseña.'
    };
  }
}
