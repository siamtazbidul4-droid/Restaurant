import React, { useEffect, useState, useCallback } from 'react';
import { reservationsApi, ReservationPayload } from '../../api/reservations.api.js';
import { tablesApi, DiningTableDto } from '../../api/tables.api.js';
import { Modal } from '../../components/ui/Modal.js';
import { ConfirmModal } from '../../components/ui/ConfirmModal.js';
import { Input } from '../../components/ui/Input.js';
import { Select } from '../../components/ui/Select.js';
import { Textarea } from '../../components/ui/Textarea.js';
import { Button } from '../../components/ui/Button.js';
import { useToast } from '../../context/ToastContext.js';
import { Plus, Search, Calendar, Filter, Loader2, Edit2, Trash2 } from 'lucide-react';

export const AdminReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [tables, setTables] = useState<DiningTableDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State for Create/Edit
  const [formData, setFormData] = useState<any>({
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    guests: 2,
    name: '',
    email: '',
    phone: '',
    specialRequest: '',
    seatingPreference: 'Main Dining Room',
    source: 'Admin',
    status: 'Confirmed',
    tableId: '',
    internalNotes: '',
  });

  const { success, error } = useToast();

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([
      reservationsApi.getAllAdmin({
        date: filterDate || undefined,
        status: filterStatus === 'all' ? undefined : filterStatus,
        search: searchQuery || undefined,
      }),
      tablesApi.getTables(true),
    ])
      .then(([resRes, resTables]) => {
        if (resRes.success) setReservations(resRes.data || []);
        if (resTables.success) setTables(resTables.data || []);
      })
      .catch((err) => error(err.message))
      .finally(() => setLoading(false));
  }, [filterDate, filterStatus, searchQuery, error]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Create Dialog
  const handleOpenCreate = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: '19:00',
      guests: 2,
      name: '',
      email: '',
      phone: '',
      specialRequest: '',
      seatingPreference: 'Main Dining Room',
      source: 'Phone',
      status: 'Confirmed',
      tableId: tables.length > 0 ? tables[0]._id : '',
      internalNotes: '',
    });
    setIsCreateOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (res: any) => {
    setEditingReservation(res);
    setFormData({
      date: res.date,
      time: res.time,
      guests: res.guests,
      name: res.name,
      email: res.email,
      phone: res.phone,
      specialRequest: res.specialRequest || '',
      seatingPreference: res.seatingPreference || 'Main Dining Room',
      source: res.source,
      status: res.status,
      tableId: res.table?._id || res.table || '',
      internalNotes: res.internalNotes || '',
    });
    setIsEditOpen(true);
  };

  // Submit Create
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await reservationsApi.createAdminReservation(formData);
      if (res.success) {
        success('Reservation created.');
        setIsCreateOpen(false);
        loadData();
      }
    } catch (err: any) {
      error(err.message || 'Failed to create reservation.');
    }
  };

  // Submit Update
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReservation) return;

    try {
      const res = await reservationsApi.updateAdminReservation(editingReservation._id, {
        ...formData,
        table: formData.tableId || undefined,
      });
      if (res.success) {
        success('Reservation updated.');
        setIsEditOpen(false);
        loadData();
      }
    } catch (err: any) {
      error(err.message || 'Failed to update reservation.');
    }
  };

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await reservationsApi.deleteAdminReservation(deleteId);
      success('Reservation deleted.');
      setDeleteId(null);
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to delete reservation.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] font-sans font-medium">
            Seating Management
          </span>
          <h1 className="font-serif text-3xl text-white">Table Reservations</h1>
        </div>

        <Button onClick={handleOpenCreate} size="md">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          <span>New Seating</span>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#141419] p-4 border border-white/10 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference, guest, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1A1A22] border border-white/10 text-xs text-white pl-9 pr-3 py-2 outline-none"
            />
          </div>

          {/* Date Filter */}
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-[#1A1A22] border border-white/10 text-xs text-white px-3 py-2 outline-none font-mono"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="text-[11px] text-stone-400 hover:text-white"
            >
              Clear Date
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {['all', 'Confirmed', 'Pending', 'Seated', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs font-sans uppercase tracking-wider transition-colors whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-[#C5A880] text-[#0D0D0E] font-medium'
                  : 'text-stone-400 hover:text-white bg-[#1A1A22] border border-white/5'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Reservations Table */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#C5A880]" />
        </div>
      ) : reservations.length === 0 ? (
        <div className="py-16 text-center bg-[#141419] border border-white/5 space-y-2">
          <p className="font-serif text-xl text-white">No reservations found.</p>
          <p className="text-xs text-stone-400">Try adjusting your filters or record a new seating.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#141419] border border-white/10">
          <table className="w-full text-left text-xs text-[#D1CCC0]">
            <thead className="bg-[#181820] text-stone-400 uppercase tracking-wider text-[10px] border-b border-white/10 font-sans">
              <tr>
                <th className="py-3 px-4">Ref Code</th>
                <th className="py-3 px-4">Guest</th>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Party</th>
                <th className="py-3 px-4">Table</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {reservations.map((res) => (
                <tr key={res._id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#E0CEB5]">
                    {res.reference}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-white">{res.name}</p>
                    <p className="text-[11px] text-stone-400">{res.phone}</p>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <p className="text-white">{res.date}</p>
                    <p className="text-[11px] text-stone-400">{res.time}</p>
                  </td>
                  <td className="py-3 px-4 text-white font-medium">
                    {res.guests} Covers
                  </td>
                  <td className="py-3 px-4">
                    {res.table ? (
                      <span className="font-mono text-white bg-[#1E1E28] px-2 py-0.5 border border-white/5">
                        {typeof res.table === 'object' ? res.table.tableNumber : res.table}
                      </span>
                    ) : (
                      <span className="text-stone-500 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-[10px] font-sans uppercase tracking-wider border ${
                        res.status === 'Confirmed'
                          ? 'border-emerald-600/50 bg-emerald-950/40 text-emerald-300'
                          : res.status === 'Seated'
                          ? 'border-blue-600/50 bg-blue-950/40 text-blue-300'
                          : res.status === 'Completed'
                          ? 'border-stone-600/50 bg-stone-900/40 text-stone-300'
                          : res.status === 'Cancelled'
                          ? 'border-rose-600/50 bg-rose-950/40 text-rose-300'
                          : 'border-amber-600/50 bg-amber-950/40 text-amber-300'
                      }`}
                    >
                      {res.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[11px] text-stone-400">
                    {res.source || 'Website'}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(res)}
                      className="p-1 text-stone-400 hover:text-white transition-colors"
                      title="Edit reservation"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(res._id)}
                      className="p-1 text-rose-400 hover:text-rose-200 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Record New Reservation"
        subtitle="Direct phone or walk-in seating allocation"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <Input
              label="Time"
              type="time"
              required
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Guest Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Party Size"
              type="number"
              min="1"
              max="20"
              required
              value={formData.guests}
              onChange={(e) => setFormData({ ...formData, guests: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Assigned Table"
              value={formData.tableId}
              onChange={(e) => setFormData({ ...formData, tableId: e.target.value })}
            >
              <option value="">Auto-Assign Best Table</option>
              {tables.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.tableNumber} ({t.capacity}p · {t.zone})
                </option>
              ))}
            </Select>

            <Select
              label="Booking Source"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            >
              <option value="Phone">Telephone Concierge</option>
              <option value="Walk-in">Walk-in Patron</option>
              <option value="Admin">Management VIP</option>
              <option value="Website">Website</option>
            </Select>
          </div>

          <Textarea
            label="Internal Host Notes"
            rows={2}
            value={formData.internalNotes}
            onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
          />

          <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Reservation</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Reservation · ${editingReservation?.reference}`}
        maxWidth="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Operational Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Seated">Seated at Table</option>
              <option value="Completed">Service Completed</option>
              <option value="No-show">No-Show</option>
              <option value="Cancelled">Cancelled</option>
            </Select>

            <Select
              label="Assigned Table"
              value={formData.tableId}
              onChange={(e) => setFormData({ ...formData, tableId: e.target.value })}
            >
              <option value="">Unassigned</option>
              {tables.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.tableNumber} ({t.capacity}p · {t.zone})
                </option>
              ))}
            </Select>

            <Input
              label="Party Size"
              type="number"
              min="1"
              value={formData.guests}
              onChange={(e) => setFormData({ ...formData, guests: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <Input
              label="Time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Guest Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <Textarea
            label="Internal Notes"
            rows={2}
            value={formData.internalNotes}
            onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
          />

          <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
            <Button variant="ghost" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Reservation</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Reservation"
        message="Are you sure you want to permanently delete this reservation record from the database?"
        isLoading={isDeleting}
      />
    </div>
  );
};
