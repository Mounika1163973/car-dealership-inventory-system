import { useEffect, useState } from 'react';

const inputClasses =
  'w-full rounded border border-asphalt-600 bg-asphalt-900 px-3 py-2 text-sm text-mist-100 placeholder:text-mist-500 focus:border-headlight-500';

const emptyForm = { make: '', model: '', category: '', price: '', quantity: '' };

export default function VehicleFormModal({ open, initialVehicle, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialVehicle) {
      setForm({
        make: initialVehicle.make,
        model: initialVehicle.model,
        category: initialVehicle.category,
        price: String(initialVehicle.price),
        quantity: String(initialVehicle.quantity),
      });
    } else {
      setForm(emptyForm);
    }
    setError(null);
  }, [initialVehicle, open]);

  if (!open) return null;

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const payload = {
      make: form.make.trim(),
      model: form.model.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
    };

    if (!payload.make || !payload.model || !payload.category) {
      setError('Make, model, and category are required.');
      return;
    }
    if (Number.isNaN(payload.price) || payload.price < 0) {
      setError('Price must be a non-negative number.');
      return;
    }
    if (!Number.isInteger(payload.quantity) || payload.quantity < 0) {
      setError('Quantity must be a non-negative whole number.');
      return;
    }

    setSaving(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-asphalt-950/80 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-lg border border-asphalt-700 bg-asphalt-800 p-6 shadow-2xl">
        <h2 className="mb-4 font-display text-xl uppercase tracking-wide text-mist-100">
          {initialVehicle ? 'Edit vehicle' : 'Add a vehicle'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest2 text-mist-500">Make</label>
            <input className={inputClasses} value={form.make} onChange={(e) => update('make', e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest2 text-mist-500">Model</label>
            <input className={inputClasses} value={form.model} onChange={(e) => update('model', e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest2 text-mist-500">Category</label>
            <input className={inputClasses} value={form.category} onChange={(e) => update('category', e.target.value)} placeholder="Sedan, SUV, Truck…" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-widest2 text-mist-500">Price ($)</label>
              <input type="number" min="0" className={inputClasses} value={form.price} onChange={(e) => update('price', e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-widest2 text-mist-500">Quantity</label>
              <input type="number" min="0" step="1" className={inputClasses} value={form.quantity} onChange={(e) => update('quantity', e.target.value)} required />
            </div>
          </div>

          {error && <p className="text-sm text-taillight-400">{error}</p>}

          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded border border-asphalt-600 px-4 py-2 text-sm text-mist-300 hover:border-headlight-500 hover:text-headlight-500">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="rounded bg-headlight-500 px-4 py-2 text-sm font-semibold text-asphalt-950 hover:bg-headlight-400 disabled:opacity-60">
              {saving ? 'Saving…' : initialVehicle ? 'Save changes' : 'Add vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
