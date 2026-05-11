import express from 'express';
import { getCatalogue } from '../handlers/catalogue';

const router = express.Router();

router.get('/', getCatalogue);

export default router;