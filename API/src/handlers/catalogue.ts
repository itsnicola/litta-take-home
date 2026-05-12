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


export async function postRequest(req: Request, res: Response) {
  try {
    const catalogueItemId = Number(req.query.catalogueItemId);
    const quantity = Number(req.query.quantity);
    const postcode = String(req.query.postcode ?? '');
    const userName = String(req.query.customerName ?? '');
    const userEmail = String(req.query.customerEmail ?? '');

    const response = await catalogueService.postRequest(catalogueItemId, quantity, postcode, userName, userEmail);
    res.status(201).json(response);
  } catch (error) {
    console.error('Error sending request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
