import { Request, Response } from 'express';
import { AdminAuthUseCase } from '../../../application/use-cases/AdminAuthUseCase';
import { GetStatsUseCase } from '../../../application/use-cases/GetStatsUseCase';

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

