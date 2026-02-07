import { AgentRoutes } from '@routes';
import { Application, Router, Request, Response } from 'express';

export async function SetRoutes(app: Application) {
  const router = Router();

  // Health check endpoint
  app.use('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'OK',
      version: '001',
    });
  });
  app.use('/api', router);
  new AgentRoutes(router);

  // Fallback for unmatched routes
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'API endpoint not found',
      path: req.path,
    });
  });
}
