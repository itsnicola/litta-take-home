import express from 'express';
import { getCatalogue, getQuote, postRequest } from '../handlers/catalogue';

const router = express.Router();

router.get('/', getCatalogue);
router.get('/quote', getQuote);

router.post('/request', postRequest);

export default router;
