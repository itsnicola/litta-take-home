import express from 'express';
import { getCatalogue, getQuote } from '../handlers/catalogue';

const router = express.Router();

router.get('/', getCatalogue);
router.get('/quote', getQuote);

export default router;