import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin.api.js';
import { Loader2, History, Filter } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resourceFilter, setResourceFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    adminApi
      .getAuditLogs({ resource: resourceFilter === 'all' ? undefined : resourceFilter })
      .then((res) => {
        if (res.success) setLogs(res.data);
      })
      .finally(() => setLoading(false));
  }, [resourceFilter]);

  const resources = [
    'all',
    'Reservation',
    'MenuItem',
    'MenuCategory',
    'DiningTable',
    'PrivateEventInquiry',
    'ContactMessage',
    'Chef',
    'Media',
    'RestaurantSettings',
    'AdminUser',
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] font-sans font-medium">
            System Observability
          </span>
          <h1 className="font-serif text-3xl text-white">Security & Audit Trail</h1>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-stone-400 shrink-0" />
          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="bg-[#1A1A22] border border-white/15 text-xs text-white px-3 py-1.5 outline-none"
          >
            {resources.map((r) => (
              <option key={r} value={r}>
                {r === 'all' ? 'All Resources' : r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs text-[#D1CCC0] max-w-2xl leading-relaxed">
        Immutable cryptographic log of all mutations, table assignments, and administrative access records across the platform.
      </p>

      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#C5A880]" />
        </div>
      ) : logs.length === 0 ? (
        <div className="py-16 text-center bg-[#141419] border border-white/5 space-y-2">
          <History className="w-8 h-8 text-stone-500 mx-auto" />
          <p className="font-serif text-xl text-white">No audit records found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#141419] border border-white/10">
          <table className="w-full text-left text-xs text-[#D1CCC0]">
            <thead className="bg-[#181820] text-stone-400 uppercase tracking-wider text-[10px] border-b border-white/10 font-sans">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-stone-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-sans text-white font-medium">
                    {log.actor}
                  </td>
                  <td className="py-3 px-4 text-[#C5A880] font-semibold">{log.action}</td>
                  <td className="py-3 px-4 text-stone-300 font-sans">{log.resource}</td>
                  <td className="py-3 px-4 text-stone-400 font-mono text-[10px] max-w-xs truncate">
                    {log.metadata ? JSON.stringify(log.metadata) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
