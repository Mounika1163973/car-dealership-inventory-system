import { useState } from 'react';

const inputClasses =
  'w-full rounded border border-asphalt-600 bg-asphalt-900 px-3 py-2 text-sm text-mist-100 placeholder:text-mist-500 focus:border-headlight-500';

export default function SearchFilters({ onSearch, onReset }) {
  const [filters, setFilters] = useState({ make: '', model: '', category: '', minPrice: '', maxPrice: '' });

  function update(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSearch(filters);
  }

  function handleReset() {
    setFilters({ make: '', model: '', category: '', minPrice: '', maxPrice: '' });
    onReset();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 grid grid-cols-2 gap-3 rounded-lg border border-asphalt-700 bg-asphalt-800 p-5 sm:grid-cols-3 lg:grid-cols-6"
    >
      <div className="col-span-2 sm:col-span-1">
        <label className="mb-1 block text-xs uppercase tracking-widest2 text-mist-500">Make</label>
        <input className={inputClasses} value={filters.make} onChange={(e) => update('make', e.target.value)} placeholder="Toyota" />
      </div>
      <div className="col-span-2 sm:col-span-1">
        <label className="mb-1 block text-xs uppercase tracking-widest2 text-mist-500">Model</label>
        <input className={inputClasses} value={filters.model} onChange={(e) => update('model', e.target.value)} placeholder="Corolla" />
      </div>
      <div className="col-span-2 sm:col-span-1">
        <label className="mb-1 block text-xs uppercase tracking-widest2 text-mist-500">Category</label>
        <input className={inputClasses} value={filters.category} onChange={(e) => update('category', e.target.value)} placeholder="SUV" />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-widest2 text-mist-500">Min $</label>
        <input type="number" min="0" className={inputClasses} value={filters.minPrice} onChange={(e) => update('minPrice', e.target.value)} placeholder="0" />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-widest2 text-mist-500">Max $</label>
        <input type="number" min="0" className={inputClasses} value={filters.maxPrice} onChange={(e) => update('maxPrice', e.target.value)} placeholder="100000" />
      </div>
      <div className="flex items-end gap-2">
        <button type="submit" className="flex-1 rounded bg-headlight-500 px-3 py-2 text-sm font-semibold text-asphalt-950 hover:bg-headlight-400">
          Search
        </button>
        <button type="button" onClick={handleReset} className="rounded border border-asphalt-600 px-3 py-2 text-sm text-mist-300 hover:border-headlight-500 hover:text-headlight-500">
          Reset
        </button>
      </div>
    </form>
  );
}
