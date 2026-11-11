import { Request, Response, NextFunction } from 'express';
import { JwtService, JwtPayload } from '../../security/JwtService';

const jwtService = new JwtService();

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Autenticación requerida: Cabecera Authorization ausente o con formato incorrecto'
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwtService.verify(token);
    req.user = payload;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: `Token inválido o expirado: ${error.message}`
    });
  }
}

export function requireRoles(...allowedRoles: Array<'admin' | 'nurse' | 'family'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Acceso denegado: Se requiere uno de los roles [${allowedRoles.join(', ')}]`
      });
      return;
    }

    next();
  };
}
