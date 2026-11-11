import { JwtService } from '../../infrastructure/security/JwtService';

export interface AuthResult {
  success: boolean;
  token?: string;
  user?: {
    userId: string;
    name: string;
    role: 'admin' | 'nurse' | 'family';
    email: string;
  };
  error?: string;
}

export class AdminAuthUseCase {
  constructor(private jwtService = new JwtService()) {}

  async execute(username?: string, password?: string): Promise<AuthResult> {
    const validUsername = username === 'admin' || username === 'admin@saludkawsay.ec';
    const validPassword = password === 'admin123';

    if (validUsername && validPassword) {
      const user = {
        userId: 'usr-admin-1',
        name: 'Administrador General',
        role: 'admin' as const,
        email: 'admin@saludkawsay.ec'
      };

      const token = this.jwtService.sign({
        userId: user.userId,
        email: user.email,
        role: user.role
      });

      return {
        success: true,
        token,
        user
      };
    }

    return {
      success: false,
      error: 'Credenciales inválidas. Usar admin / admin123'
    };
  }
}
