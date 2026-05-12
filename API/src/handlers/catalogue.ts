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

export async function getQuote(req: Request, res: Response) {
  try {
    const catalogueItemId = Number(req.query.catalogueItemId);
    const quantity = Number(req.query.quantity);
    const postcode = String(req.query.postcode ?? '');

    // TODO: add verification - numbers + postcode. 

    const quote = await catalogueService.getQuote(catalogueItemId, quantity, postcode)
    res.json(quote);
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
