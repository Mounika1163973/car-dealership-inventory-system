import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import SearchFilters from '../components/SearchFilters';
import VehicleCard from '../components/VehicleCard';
import VehicleFormModal from '../components/VehicleFormModal';

export default function Dashboard() {
  const { token, isAdmin } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listVehicles(token);
      setVehicles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleSearch(filters) {
    setLoading(true);
    setError(null);
    try {
      const data = await api.searchVehicles(token, filters);
      setVehicles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase(id) {
    try {
      const updated = await api.purchaseVehicle(token, id, 1);
      setVehicles((prev) => prev.map((v) => (v.id === id ? updated : v)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRestock(id) {
    try {
      const updated = await api.restockVehicle(token, id, 1);
      setVehicles((prev) => prev.map((v) => (v.id === id ? updated : v)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this vehicle from inventory?')) return;
    try {
      await api.deleteVehicle(token, id);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  function openAddModal() {
    setEditingVehicle(null);
    setModalOpen(true);
  }

  function openEditModal(vehicle) {
    setEditingVehicle(vehicle);
    setModalOpen(true);
  }

  async function handleModalSubmit(payload) {
    if (editingVehicle) {
      const updated = await api.updateVehicle(token, editingVehicle.id, payload);
      setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    } else {
      const created = await api.createVehicle(token, payload);
      setVehicles((prev) => [created, ...prev]);
    }
    setModalOpen(false);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest2 text-headlight-500">Current inventory</p>
          <h1 className="font-display text-4xl uppercase tracking-wide text-mist-100">On the lot</h1>
        </div>

        {isAdmin && (
          <button
            onClick={openAddModal}
            className="rounded bg-headlight-500 px-5 py-2.5 font-semibold text-asphalt-950 transition hover:bg-headlight-400"
          >
            + Add vehicle
          </button>
        )}
      </div>

      <SearchFilters onSearch={handleSearch} onReset={loadAll} />

      {error && (
        <p className="mb-6 rounded border border-taillight-500/50 bg-taillight-500/10 px-4 py-3 text-sm text-taillight-400">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-mist-500">Loading inventory…</p>
      ) : vehicles.length === 0 ? (
        <div className="rounded-lg border border-dashed border-asphalt-600 py-16 text-center text-mist-500">
          No vehicles match right now. {isAdmin ? 'Add one to get started.' : 'Check back soon.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onPurchase={handlePurchase}
              onRestock={handleRestock}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <VehicleFormModal
        open={modalOpen}
        initialVehicle={editingVehicle}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}
