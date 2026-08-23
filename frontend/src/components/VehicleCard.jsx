import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function VehicleCard({ vehicle, onPurchase, onRestock, onEdit, onDelete }) {
  const { isAdmin } = useAuth();
  const [busy, setBusy] = useState(false);
  const outOfStock = vehicle.quantity <= 0;

  async function handlePurchase() {
    setBusy(true);
    try {
      await onPurchase(vehicle.id);
    } finally {
      setBusy(false);
    }
  }

  async function handleRestock() {
    setBusy(true);
    try {
      await onRestock(vehicle.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-asphalt-700 bg-asphalt-800 transition hover:border-headlight-500/50">
      <div className="flex items-start justify-between border-b border-asphalt-700 bg-grille-fade px-5 py-4">
        <div>
          <p className="font-display text-2xl uppercase leading-none tracking-wide text-mist-100">
            {vehicle.make} {vehicle.model}
          </p>
          <p className="mt-1 text-xs uppercase tracking-widest2 text-mist-500">{vehicle.category}</p>
        </div>

        {/* License-plate styled stock badge — the recurring signature motif of the UI */}
        <div
          className={`flex shrink-0 flex-col items-center rounded border-2 px-2.5 py-1 font-mono ${
            outOfStock
              ? 'border-taillight-500 text-taillight-400'
              : 'border-headlight-500 text-headlight-400'
          }`}
          title={outOfStock ? 'Out of stock' : `${vehicle.quantity} in stock`}
        >
          <span className="text-[10px] uppercase tracking-widest2 text-mist-500">stock</span>
          <span className="text-lg font-bold leading-none">
            {outOfStock ? '00' : String(vehicle.quantity).padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4 px-5 py-4">
        <p className="font-mono text-2xl text-headlight-500">{currency.format(vehicle.price)}</p>

        <div className="flex flex-wrap items-center gap-2">
          {!isAdmin && (
            <button
              onClick={handlePurchase}
              disabled={outOfStock || busy}
              className="flex-1 rounded bg-headlight-500 px-4 py-2 text-sm font-semibold text-asphalt-950 transition hover:bg-headlight-400 disabled:cursor-not-allowed disabled:bg-asphalt-600 disabled:text-mist-500"
            >
              {outOfStock ? 'Sold out' : busy ? 'Processing…' : 'Purchase'}
            </button>
          )}

          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleRestock}
                disabled={busy}
                className="rounded border border-asphalt-600 px-3 py-2 text-sm text-mist-300 transition hover:border-headlight-500 hover:text-headlight-500"
                title="Add 1 unit to stock"
              >
                + Restock
              </button>
              <button
                onClick={() => onEdit(vehicle)}
                className="rounded border border-asphalt-600 px-3 py-2 text-sm text-mist-300 transition hover:border-headlight-500 hover:text-headlight-500"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(vehicle.id)}
                className="rounded border border-taillight-500/50 px-3 py-2 text-sm text-taillight-400 transition hover:bg-taillight-500/10"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
