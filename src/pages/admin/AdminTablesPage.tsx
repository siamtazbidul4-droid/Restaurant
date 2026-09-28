import React, { useEffect, useState } from 'react';
import { tablesApi, DiningTableDto } from '../../api/tables.api.js';
import { Modal } from '../../components/ui/Modal.js';
import { ConfirmModal } from '../../components/ui/ConfirmModal.js';
import { Input } from '../../components/ui/Input.js';
import { Select } from '../../components/ui/Select.js';
import { Button } from '../../components/ui/Button.js';
import { useToast } from '../../context/ToastContext.js';
import { Plus, Edit2, Trash2, Loader2, Armchair } from 'lucide-react';

export const AdminTablesPage: React.FC = () => {
  const [tables, setTables] = useState<DiningTableDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<DiningTableDto | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<Partial<DiningTableDto>>({
    tableNumber: '',
    capacity: 2,
    type: 'standard',
    zone: 'Main Dining Room',
    description: '',
    isActive: true,
    sortOrder: 0,
  });

  const { success, error } = useToast();

  const loadTables = () => {
    setLoading(true);
    tablesApi
      .getTables(true)
      .then((res) => {
        if (res.success) setTables(res.data);
      })
      .catch((err) => error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTables();
  }, []);

  const handleOpenCreate = () => {
    setEditingTable(null);
    setFormData({
      tableNumber: `T-0${tables.length + 1}`,
      capacity: 4,
      type: 'standard',
      zone: 'Main Dining Room',
      description: '',
      isActive: true,
      sortOrder: tables.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: DiningTableDto) => {
    setEditingTable(t);
    setFormData(t);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTable) {
        await tablesApi.updateTable(editingTable._id, formData);
        success('Table updated.');
      } else {
        await tablesApi.createTable(formData);
        success('Table created.');
      }
      setIsModalOpen(false);
      loadTables();
    } catch (err: any) {
      error(err.message || 'Operation failed.');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await tablesApi.deleteTable(deleteId);
      success('Table removed.');
      setDeleteId(null);
      loadTables();
    } catch (err: any) {
      error(err.message || 'Failed to remove table.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] font-sans font-medium">
            Floor Architecture
          </span>
          <h1 className="font-serif text-3xl text-white">Dining Tables & Seating Zones</h1>
        </div>

        <Button onClick={handleOpenCreate} size="md">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          <span>Add Dining Table</span>
        </Button>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#C5A880]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tables.map((t) => (
            <div
              key={t._id}
              className={`p-5 bg-[#141419] border ${
                t.isActive ? 'border-white/10' : 'border-rose-900/40 opacity-60'
              } flex flex-col justify-between space-y-4`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#C5A880] font-mono">
                    {t.zone}
                  </span>
                  <h3 className="font-mono text-xl font-bold text-white mt-0.5">
                    {t.tableNumber}
                  </h3>
                </div>
                <div className="p-2 bg-[#1B1B24] border border-white/5 text-stone-300">
                  <Armchair className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-stone-400">Capacity:</span>
                  <span className="text-white font-medium">{t.capacity} Guests</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-stone-400">Type:</span>
                  <span className="text-stone-200 capitalize">{t.type.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-stone-400">Active Status:</span>
                  <span className={t.isActive ? 'text-emerald-400' : 'text-rose-400'}>
                    {t.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {t.description && (
                <p className="text-[11px] text-stone-400 line-clamp-2 italic">{t.description}</p>
              )}

              <div className="pt-2 border-t border-white/5 flex justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(t)}
                  className="p-1.5 text-stone-400 hover:text-white transition-colors"
                  title="Edit table"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteId(t._id)}
                  className="p-1.5 text-rose-400 hover:text-rose-200 transition-colors"
                  title="Delete table"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTable ? 'Edit Dining Table' : 'Add Dining Table'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Table Number / Code"
              required
              value={formData.tableNumber}
              onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
              placeholder="e.g. T-08"
            />
            <Input
              label="Capacity (Seats)"
              type="number"
              min="1"
              max="24"
              required
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Seating Zone"
              value={formData.zone}
              onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
            >
              <option value="Main Dining Room">Main Dining Room</option>
              <option value="Mezzanine">Mezzanine</option>
              <option value="Veranda Terrace">Veranda Terrace</option>
              <option value="Private Cellar">Private Cellar</option>
            </Select>

            <Select
              label="Table Format"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            >
              <option value="standard">Standard Four-Top</option>
              <option value="window">Window Banquette</option>
              <option value="booth">Alcove Velvet Booth</option>
              <option value="private_salon">Private Salon</option>
              <option value="chefs_counter">Chef’s Atelier Counter</option>
            </Select>
          </div>

          <Input
            label="Location Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g. Center room vantage, avenue light"
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="accent-[#C5A880] w-4 h-4"
            />
            <label htmlFor="isActive" className="text-xs text-white">
              Table is active and available for bookings
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingTable ? 'Save Changes' : 'Create Table'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Dining Table"
        message="Are you sure you want to remove this table from the active floor plan?"
        isLoading={isDeleting}
      />
    </div>
  );
};
