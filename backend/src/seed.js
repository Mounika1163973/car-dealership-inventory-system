/**
 * Seed script — populates the vehicles table with a handful of sample
 * vehicles so the dashboard isn't empty on a fresh install.
 *
 * Usage:
 *   npm run seed          # add sample vehicles (skips ones that already exist)
 *   npm run seed -- --reset   # wipe the vehicles table first, then seed
 *
 * Safe to run multiple times: existing vehicles are matched by
 * make + model + category, so re-running won't create duplicates
 * unless --reset is passed.
 */
const { db, initSchema } = require('./models/db');
const VehicleModel = require('./models/vehicleModel');

const sampleVehicles = [
  { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 22000, quantity: 8 },
  { make: 'Toyota', model: 'RAV4', category: 'SUV', price: 29500, quantity: 5 },
  { make: 'Honda', model: 'Civic', category: 'Sedan', price: 23500, quantity: 6 },
  { make: 'Honda', model: 'CR-V', category: 'SUV', price: 31000, quantity: 4 },
  { make: 'Ford', model: 'F-150', category: 'Truck', price: 38000, quantity: 3 },
  { make: 'Ford', model: 'Mustang', category: 'Coupe', price: 42000, quantity: 2 },
  { make: 'Chevrolet', model: 'Silverado', category: 'Truck', price: 40000, quantity: 3 },
  { make: 'Tesla', model: 'Model 3', category: 'Sedan', price: 41000, quantity: 5 },
  { make: 'Tesla', model: 'Model Y', category: 'SUV', price: 47000, quantity: 4 },
  { make: 'Jeep', model: 'Wrangler', category: 'SUV', price: 34500, quantity: 6 },
  { make: 'Mazda', model: 'MX-5 Miata', category: 'Convertible', price: 28500, quantity: 2 },
  { make: 'Subaru', model: 'Outback', category: 'Wagon', price: 30500, quantity: 5 },
];

function seed({ reset = false } = {}) {
  initSchema();

  if (reset) {
    db.exec('DELETE FROM vehicles;');
    console.log('Cleared existing vehicles.');
  }

  let created = 0;
  let skipped = 0;

  for (const vehicle of sampleVehicles) {
    const existing = db
      .prepare('SELECT id FROM vehicles WHERE make = ? AND model = ? AND category = ?')
      .get(vehicle.make, vehicle.model, vehicle.category);

    if (existing) {
      skipped += 1;
      continue;
    }

    VehicleModel.create(vehicle);
    created += 1;
  }

  console.log(`Seed complete: ${created} vehicle(s) added, ${skipped} already present.`);
}

if (require.main === module) {
  const reset = process.argv.includes('--reset');
  seed({ reset });
  process.exit(0);
}

module.exports = { seed, sampleVehicles };
