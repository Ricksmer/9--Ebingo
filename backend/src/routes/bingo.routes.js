import { Router } from 'express';
import { getCard, getWinStatus } from '../controllers/bingo.controller.js';

const router = Router();

// Express 4 doesn't catch rejected promises on its own.
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/cards', wrap(getCard));
router.get('/cards/:token/win', wrap(getWinStatus));

export default router;
