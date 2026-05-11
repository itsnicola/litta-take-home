import { Request, Response } from 'express';
import * as catalogueService from '../services/catalogue';

export async function getCatalogue(req: Request, res: Response) {
  try {
    const items = await catalogueService.getCatalogue();
    res.json(items);
  } catch (error) {
    console.error('Error fetching catalogue:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
