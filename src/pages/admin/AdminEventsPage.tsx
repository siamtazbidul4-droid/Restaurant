import React, { useEffect, useState } from 'react';
import { eventsApi, PrivateEventInquiryDto } from '../../api/events.api.js';
import { Modal } from '../../components/ui/Modal.js';
import { ConfirmModal } from '../../components/ui/ConfirmModal.js';
import { Select } from '../../components/ui/Select.js';
import { Textarea } from '../../components/ui/Textarea.js';
import { Button } from '../../components/ui/Button.js';
import { useToast } from '../../context/ToastContext.js';
import { Loader2, Edit2, Trash2, Calendar, Users, Phone, Mail } from 'lucide-react';

export const AdminEventsPage: React.FC = () => {
  const [inquiries, setInquiries] = useState<PrivateEventInquiryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedInquiry, setSelectedInquiry] = useState<PrivateEventInquiryDto | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { success, error } = useToast();

  const loadInquiries = () => {
    setLoading(true);
    eventsApi
      .getAdminInquiries(statusFilter === 'all' ? undefined : statusFilter)
      .then((res) => {
        if (res.success) setInquiries(res.data);
      })
      .catch((err) => error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInquiries();
  }, [statusFilter]);

  const handleOpenDetail = (inq: PrivateEventInquiryDto) => {
    setSelectedInquiry(inq);
    setEditStatus(inq.status);
    setEditNotes(inq.internalNotes || '');
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;
    try {
      setIsUpdating(true);
      await eventsApi.updateInquiry(selectedInquiry._id, {
        status: editStatus,
        internalNotes: editNotes,
      });
      success('Inquiry updated.');
      setSelectedInquiry(null);
      loadInquiries();
    } catch (err: any) {
      error(err.message || 'Update failed.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await eventsApi.deleteInquiry(deleteId);
      success('Inquiry removed.');
      setDeleteId(null);
      loadInquiries();
    } catch (err: any) {
      error(err.message || 'Delete failed.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] font-sans font-medium">
            VIP Inquiries
          </span>
          <h1 className="font-serif text-3xl text-white">Private Dining & Events</h1>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['all', 'New', 'Contacted', 'In Discussion', 'Proposal Sent', 'Confirmed', 'Declined'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-sans uppercase tracking-wider whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? 'bg-[#C5A880] text-[#0D0D0E] font-medium'
                  : 'text-stone-400 hover:text-white bg-[#1A1A22] border border-white/5'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#C5A880]" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="py-16 text-center bg-[#141419] border border-white/5 space-y-2">
          <p className="font-serif text-xl text-white">No inquiries found.</p>
          <p className="text-xs text-stone-400">All private event inquiries have been processed.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#141419] border border-white/10">
          <table className="w-full text-left text-xs text-[#D1CCC0]">
            <thead className="bg-[#181820] text-stone-400 uppercase tracking-wider text-[10px] border-b border-white/10 font-sans">
              <tr>
                <th className="py-3 px-4">Patron</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Guests</th>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Budget</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {inquiries.map((inq) => (
                <tr key={inq._id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium text-white">{inq.name}</p>
                    <p className="text-[11px] text-stone-400">{inq.email}</p>
                  </td>
                  <td className="py-3 px-4 text-stone-200">{inq.eventType}</td>
                  <td className="py-3 px-4 font-mono text-white">{inq.guestCount} Guests</td>
                  <td className="py-3 px-4 font-mono">
                    <p className="text-white">{inq.preferredDate}</p>
                    <p className="text-[11px] text-stone-400">{inq.preferredTime}</p>
                  </td>
                  <td className="py-3 px-4 text-stone-300">{inq.budgetRange || 'Unspecified'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-[10px] font-sans uppercase tracking-wider border ${
                        inq.status === 'New'
                          ? 'border-[#C5A880] bg-[#C5A880]/15 text-[#C5A880] font-semibold'
                          : inq.status === 'Confirmed'
                          ? 'border-emerald-600/50 bg-emerald-950/40 text-emerald-300'
                          : 'border-white/15 bg-white/5 text-stone-300'
                      }`}
                    >
                      {inq.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenDetail(inq)}
                      className="p-1.5 text-stone-400 hover:text-white"
                      title="Inspect / Edit Status"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(inq._id)}
                      className="p-1.5 text-rose-400 hover:text-rose-200"
                      title="Delete"
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

      {/* Inquiry Detail & Status Update Modal */}
      {selectedInquiry && (
        <Modal
          isOpen={Boolean(selectedInquiry)}
          onClose={() => setSelectedInquiry(null)}
          title={`Event Inquiry · ${selectedInquiry.name}`}
          subtitle={`${selectedInquiry.eventType} · ${selectedInquiry.guestCount} Guests`}
          maxWidth="lg"
        >
          <form onSubmit={handleUpdateSubmit} className="space-y-5">
            {/* Patron Contact Card */}
            <div className="p-4 bg-[#181822] border border-white/5 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase">Telephone</span>
                <a href={`tel:${selectedInquiry.phone}`} className="text-[#C5A880] font-mono">
                  {selectedInquiry.phone}
                </a>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase">Email</span>
                <a href={`mailto:${selectedInquiry.email}`} className="text-[#C5A880] truncate block">
                  {selectedInquiry.email}
                </a>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase">Date & Time</span>
                <span className="text-white font-mono">
                  {selectedInquiry.preferredDate} at {selectedInquiry.preferredTime}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase">Budget Range</span>
                <span className="text-white">{selectedInquiry.budgetRange || 'None specified'}</span>
              </div>
            </div>

            {selectedInquiry.specialRequirements && (
              <div className="text-xs">
                <span className="text-stone-400 block text-[10px] uppercase font-sans mb-1">
                  Special Requirements
                </span>
                <p className="text-stone-200 italic p-3 bg-[#16161D] border border-white/5">
                  {selectedInquiry.specialRequirements}
                </p>
              </div>
            )}

            {selectedInquiry.message && (
              <div className="text-xs">
                <span className="text-stone-400 block text-[10px] uppercase font-sans mb-1">
                  Guest Vision / Message
                </span>
                <p className="text-stone-200 leading-relaxed p-3 bg-[#16161D] border border-white/5">
                  {selectedInquiry.message}
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-white/10 space-y-3">
              <Select
                label="Update Inquiry Status"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <option value="New">New Inquiry</option>
                <option value="Contacted">Patron Contacted</option>
                <option value="In Discussion">In Active Discussion</option>
                <option value="Proposal Sent">Formal Proposal Sent</option>
                <option value="Confirmed">Event Confirmed</option>
                <option value="Declined">Declined</option>
                <option value="Completed">Service Completed</option>
              </Select>

              <Textarea
                label="Internal Director Notes"
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Log phone calls, custom menus, sommelier selections..."
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
              <Button variant="ghost" onClick={() => setSelectedInquiry(null)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isUpdating}>
                Save Status & Notes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Event Inquiry"
        message="Are you sure you wish to permanently delete this inquiry record?"
        isLoading={isDeleting}
      />
    </div>
  );
};
