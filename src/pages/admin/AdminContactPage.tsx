import React, { useEffect, useState } from 'react';
import { contactApi, ContactMessageDto } from '../../api/contact.api.js';
import { Modal } from '../../components/ui/Modal.js';
import { ConfirmModal } from '../../components/ui/ConfirmModal.js';
import { Select } from '../../components/ui/Select.js';
import { Textarea } from '../../components/ui/Textarea.js';
import { Button } from '../../components/ui/Button.js';
import { useToast } from '../../context/ToastContext.js';
import { Loader2, Edit2, Trash2, Mail, Phone } from 'lucide-react';

export const AdminContactPage: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedMessage, setSelectedMessage] = useState<ContactMessageDto | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { success, error } = useToast();

  const loadMessages = () => {
    setLoading(true);
    contactApi
      .getAdminMessages(statusFilter === 'all' ? undefined : statusFilter)
      .then((res) => {
        if (res.success) setMessages(res.data);
      })
      .catch((err) => error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMessages();
  }, [statusFilter]);

  const handleOpenDetail = (msg: ContactMessageDto) => {
    setSelectedMessage(msg);
    setEditStatus(msg.status);
    setEditNotes(msg.internalNotes || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage) return;

    try {
      setIsUpdating(true);
      await contactApi.updateMessage(selectedMessage._id, {
        status: editStatus,
        internalNotes: editNotes,
      });
      success('Message record updated.');
      setSelectedMessage(null);
      loadMessages();
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
      await contactApi.deleteMessage(deleteId);
      success('Message removed.');
      setDeleteId(null);
      loadMessages();
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
            Front of House
          </span>
          <h1 className="font-serif text-3xl text-white">Concierge Inquiries</h1>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['all', 'New', 'In Progress', 'Resolved', 'Archived'].map((s) => (
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
      ) : messages.length === 0 ? (
        <div className="py-16 text-center bg-[#141419] border border-white/5 space-y-2">
          <p className="font-serif text-xl text-white">No messages found.</p>
          <p className="text-xs text-stone-400">All guest messages have been answered or archived.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#141419] border border-white/10">
          <table className="w-full text-left text-xs text-[#D1CCC0]">
            <thead className="bg-[#181820] text-stone-400 uppercase tracking-wider text-[10px] border-b border-white/10 font-sans">
              <tr>
                <th className="py-3 px-4">Guest</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Message Snippet</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {messages.map((msg) => (
                <tr key={msg._id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium text-white">{msg.name}</p>
                    <p className="text-[11px] text-stone-400">{msg.email}</p>
                  </td>
                  <td className="py-3 px-4 font-medium text-stone-200">{msg.subject}</td>
                  <td className="py-3 px-4 text-stone-400 max-w-xs truncate">{msg.message}</td>
                  <td className="py-3 px-4 font-mono text-stone-400">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-[10px] font-sans uppercase tracking-wider border ${
                        msg.status === 'New'
                          ? 'border-[#C5A880] bg-[#C5A880]/15 text-[#C5A880] font-semibold'
                          : msg.status === 'Resolved'
                          ? 'border-emerald-600/50 bg-emerald-950/40 text-emerald-300'
                          : 'border-white/15 bg-white/5 text-stone-300'
                      }`}
                    >
                      {msg.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenDetail(msg)}
                      className="p-1.5 text-stone-400 hover:text-white"
                      title="Inspect message"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(msg._id)}
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

      {/* Detail Modal */}
      {selectedMessage && (
        <Modal
          isOpen={Boolean(selectedMessage)}
          onClose={() => setSelectedMessage(null)}
          title={selectedMessage.subject}
          subtitle={`From ${selectedMessage.name} (${selectedMessage.email})`}
          maxWidth="md"
        >
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="p-4 bg-[#181822] border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>Phone: {selectedMessage.phone || 'None provided'}</span>
                <span className="font-mono">{new Date(selectedMessage.createdAt).toLocaleString()}</span>
              </div>
              <div className="pt-2 text-stone-200 leading-relaxed whitespace-pre-wrap border-t border-white/5">
                {selectedMessage.message}
              </div>
            </div>

            <Select
              label="Status"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
            >
              <option value="New">New</option>
              <option value="In Progress">In Progress / Contacted</option>
              <option value="Resolved">Resolved</option>
              <option value="Archived">Archived</option>
            </Select>

            <Textarea
              label="Internal Host Notes"
              rows={2}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Note down response or outcome..."
            />

            <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
              <Button variant="ghost" onClick={() => setSelectedMessage(null)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isUpdating}>
                Update Message
              </Button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Guest Message"
        message="Are you sure you want to permanently remove this message?"
        isLoading={isDeleting}
      />
    </div>
  );
};
