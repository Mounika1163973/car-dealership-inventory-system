const VehicleModel = require('../models/vehicleModel');

function validateVehiclePayload(body, { partial = false } = {}) {
  const errors = [];
  const { make, model, category, price, quantity } = body;

  if (!partial || make !== undefined) {
    if (!make || typeof make !== 'string') errors.push('make is required and must be a string');
  }
  if (!partial || model !== undefined) {
    if (!model || typeof model !== 'string') errors.push('model is required and must be a string');
  }
  if (!partial || category !== undefined) {
    if (!category || typeof category !== 'string') errors.push('category is required and must be a string');
  }
  if (!partial || price !== undefined) {
    if (price === undefined || typeof price !== 'number' || price < 0) {
      errors.push('price is required and must be a non-negative number');
    }
  }
  if (!partial || quantity !== undefined) {
    if (quantity === undefined || !Number.isInteger(quantity) || quantity < 0) {
      errors.push('quantity is required and must be a non-negative integer');
    }
  }

  return errors;
}

function createVehicle(req, res) {
  const errors = validateVehiclePayload(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const { make, model, category, price, quantity } = req.body;
  const vehicle = VehicleModel.create({ make, model, category, price, quantity });
  return res.status(201).json(vehicle);
}

function listVehicles(req, res) {
  return res.status(200).json(VehicleModel.findAll());
}

function searchVehicles(req, res) {
  const { make, model, category, minPrice, maxPrice } = req.query;

  const filters = {
    make,
    model,
    category,
    minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
    maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
  };

  if (minPrice !== undefined && Number.isNaN(filters.minPrice)) {
    return res.status(400).json({ error: 'minPrice must be a number' });
  }
  if (maxPrice !== undefined && Number.isNaN(filters.maxPrice)) {
    return res.status(400).json({ error: 'maxPrice must be a number' });
  }

  return res.status(200).json(VehicleModel.search(filters));
}

function getVehicle(req, res) {
  const vehicle = VehicleModel.findById(Number(req.params.id));
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
  return res.status(200).json(vehicle);
}

function updateVehicle(req, res) {
  const id = Number(req.params.id);
  const existing = VehicleModel.findById(id);
  if (!existing) return res.status(404).json({ error: 'Vehicle not found' });

  const errors = validateVehiclePayload(req.body, { partial: true });
  if (errors.length) return res.status(400).json({ errors });

  const updated = VehicleModel.update(id, req.body);
  return res.status(200).json(updated);
}

function deleteVehicle(req, res) {
  const id = Number(req.params.id);
  const existing = VehicleModel.findById(id);
  if (!existing) return res.status(404).json({ error: 'Vehicle not found' });

  VehicleModel.delete(id);
  return res.status(204).send();
}

function purchaseVehicle(req, res) {
  const id = Number(req.params.id);
  const amount = Number(req.body?.amount) > 0 ? Number(req.body.amount) : 1;

  const existing = VehicleModel.findById(id);
  if (!existing) return res.status(404).json({ error: 'Vehicle not found' });

  try {
    const updated = VehicleModel.purchase(id, amount);
    return res.status(200).json(updated);
  } catch (err) {
    if (err.code === 'INSUFFICIENT_STOCK') {
      return res.status(400).json({ error: 'Not enough stock available for this purchase' });
    }
    throw err;
  }
}

function restockVehicle(req, res) {
  const id = Number(req.params.id);
  const amount = Number(req.body?.amount) > 0 ? Number(req.body.amount) : 1;

  const existing = VehicleModel.findById(id);
  if (!existing) return res.status(404).json({ error: 'Vehicle not found' });

  const updated = VehicleModel.restock(id, amount);
  return res.status(200).json(updated);
}

module.exports = {
  createVehicle,
  listVehicles,
  searchVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
  purchaseVehicle,
  restockVehicle,
  validateVehiclePayload,
};
