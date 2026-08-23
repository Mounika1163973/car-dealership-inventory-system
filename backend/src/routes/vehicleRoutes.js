const express = require('express');
const {
  createVehicle,
  listVehicles,
  searchVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
  purchaseVehicle,
  restockVehicle,
} = require('../controllers/vehicleController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All vehicle routes require a valid JWT.
router.use(authenticate);

// NOTE: /search must be declared before the /:id route so that
// "search" is not swallowed as an :id path parameter.
router.get('/search', searchVehicles);

router.post('/', createVehicle);
router.get('/', listVehicles);
router.get('/:id', getVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', requireAdmin, deleteVehicle);

router.post('/:id/purchase', purchaseVehicle);
router.post('/:id/restock', requireAdmin, restockVehicle);

module.exports = router;
