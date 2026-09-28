import { Router, Request, Response } from 'express';
import { DiningTable } from '../models/DiningTable.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware.js';
import { AuditLog } from '../models/AuditLog.js';
import { pickAllowed, errorMessage } from '../utils/request.js';

const router = Router();

const EDITABLE_FIELDS = [
  'tableNumber',
  'capacity',
  'type',
  'zone',
  'description',
  'isActive',
  'sortOrder',
] as const;

// GET /api/tables (Public/Shared)
router.get('/', async (req: Request, res: Response) => {
  try {
    const onlyActive = req.query.all !== 'true';
    const filter = onlyActive ? { isActive: true } : {};
    const tables = await DiningTable.find(filter).sort({ sortOrder: 1, tableNumber: 1 });
    res.json({ success: true, data: tables });
  } catch (err) {
    res.status(500).json({ success: false, message: errorMessage(err) });
  }
});

// Admin: POST /api/tables
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const table = await DiningTable.create(pickAllowed(req.body, EDITABLE_FIELDS));
    await AuditLog.create({
      actor: req.user?.email || 'Admin',
      action: 'TABLE_CREATED',
      resource: 'DiningTable',
      resourceId: table._id.toString(),
      metadata: pickAllowed(req.body, EDITABLE_FIELDS),
    });
    res.status(201).json({ success: true, data: table });
  } catch (err) {
    res.status(400).json({ success: false, message: errorMessage(err) });
  }
});

// Admin: PUT /api/tables/:id
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const table = await DiningTable.findByIdAndUpdate(
      req.params.id,
      pickAllowed(req.body, EDITABLE_FIELDS),
      { new: true, runValidators: true }
    );
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });

    await AuditLog.create({
      actor: req.user?.email || 'Admin',
      action: 'TABLE_UPDATED',
      resource: 'DiningTable',
      resourceId: req.params.id,
      metadata: pickAllowed(req.body, EDITABLE_FIELDS),
    });

    res.json({ success: true, data: table });
  } catch (err) {
    res.status(400).json({ success: false, message: errorMessage(err) });
  }
});

// Admin: DELETE /api/tables/:id
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const table = await DiningTable.findByIdAndDelete(req.params.id);
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });

    await AuditLog.create({
      actor: req.user?.email || 'Admin',
      action: 'TABLE_DELETED',
      resource: 'DiningTable',
      resourceId: req.params.id,
      metadata: { tableNumber: table.tableNumber },
    });

    res.json({ success: true, message: 'Table deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: errorMessage(err) });
  }
});

export default router;
