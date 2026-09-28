import React, { useEffect, useState } from 'react';
import { settingsApi, RestaurantSettingsDto, OpeningDayDto } from '../../api/settings.api.js';
import { Input } from '../../components/ui/Input.js';
import { Textarea } from '../../components/ui/Textarea.js';
import { Button } from '../../components/ui/Button.js';
import { useToast } from '../../context/ToastContext.js';
import { Loader2, Plus, X } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<RestaurantSettingsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newBlockedDate, setNewBlockedDate] = useState('');

  const { success, error } = useToast();

  useEffect(() => {
    settingsApi
      .getSettings()
      .then((res) => {
        if (res.success) setSettings(res.data);
      })
      .catch((err) => error(err.message))
      .finally(() => setLoading(false));
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setIsSaving(true);
      const res = await settingsApi.updateSettings(settings);
      if (res.success) {
        success('Restaurant settings saved.');
      }
    } catch (err: any) {
      error(err.message || 'Failed to update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleHourChange = (index: number, field: keyof OpeningDayDto, value: any) => {
    if (!settings) return;
    const updated = [...settings.openingHours];
    updated[index] = { ...updated[index], [field]: value };
    setSettings({ ...settings, openingHours: updated });
  };

  const handleAddBlockedDate = () => {
    if (!newBlockedDate || !settings) return;
    if (settings.blockedDates?.includes(newBlockedDate)) {
      error('Date is already blocked.');
      return;
    }
    const updated = [...(settings.blockedDates || []), newBlockedDate];
    setSettings({ ...settings, blockedDates: updated });
    setNewBlockedDate('');
    success(`Blocked ${newBlockedDate}.`);
  };

  const handleRemoveBlockedDate = (d: string) => {
    if (!settings) return;
    const updated = settings.blockedDates.filter((date) => date !== d);
    setSettings({ ...settings, blockedDates: updated });
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5A880]" />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-6 text-left max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] font-sans font-medium">
            System Configuration
          </span>
          <h1 className="font-serif text-3xl text-white">Restaurant Settings & Service Hours</h1>
        </div>

        <Button onClick={handleSubmit} isLoading={isSaving} size="md">
          Save All Settings
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Identity & Marketing Copy */}
        <div className="bg-[#141419] border border-white/10 p-6 sm:p-8 space-y-4">
          <h3 className="font-serif text-xl text-white border-b border-white/10 pb-3">
            Brand Identity & Public Copy
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Restaurant Brand Name"
              required
              value={settings.restaurantName}
              onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
            />
            <Input
              label="Tagline"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Homepage Hero Headline"
              value={settings.heroHeadline}
              onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
            />
            <Input
              label="Homepage Hero Subheadline"
              value={settings.heroSubheadline}
              onChange={(e) => setSettings({ ...settings, heroSubheadline: e.target.value })}
            />
          </div>

          <Textarea
            label="About Description (Editorial story)"
            rows={3}
            value={settings.description}
            onChange={(e) => setSettings({ ...settings, description: e.target.value })}
          />
        </div>

        {/* Operating Hours Matrix */}
        <div className="bg-[#141419] border border-white/10 p-6 sm:p-8 space-y-4">
          <h3 className="font-serif text-xl text-white border-b border-white/10 pb-3">
            Weekly Dinner Service Schedule
          </h3>
          <p className="text-xs text-[#D1CCC0]">
            The reservation engine uses these hours to dynamically calculate available seating time intervals.
          </p>

          <div className="divide-y divide-white/5">
            {settings.openingHours?.map((day, idx) => (
              <div
                key={day.day}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="w-32 font-medium text-white flex items-center gap-2">
                  <span className="font-serif text-sm">{day.day}</span>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={day.isClosed}
                      onChange={(e) => handleHourChange(idx, 'isClosed', e.target.checked)}
                      className="accent-[#C5A880]"
                    />
                    <span className={day.isClosed ? 'text-rose-400 font-medium' : 'text-stone-400'}>
                      Closed for service
                    </span>
                  </label>

                  {!day.isClosed && (
                    <div className="flex items-center gap-2 font-mono">
                      <span>Open:</span>
                      <input
                        type="time"
                        value={day.openTime}
                        onChange={(e) => handleHourChange(idx, 'openTime', e.target.value)}
                        className="bg-[#1A1A22] border border-white/10 text-white px-2 py-1 outline-none text-xs"
                      />
                      <span>Close:</span>
                      <input
                        type="time"
                        value={day.closeTime}
                        onChange={(e) => handleHourChange(idx, 'closeTime', e.target.value)}
                        className="bg-[#1A1A22] border border-white/10 text-white px-2 py-1 outline-none text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Blocked Dates Manager */}
        <div className="bg-[#141419] border border-white/10 p-6 sm:p-8 space-y-4">
          <h3 className="font-serif text-xl text-white border-b border-white/10 pb-3">
            Blocked Dates (Private Buyouts & Special Closures)
          </h3>
          <p className="text-xs text-[#D1CCC0]">
            The reservation engine will prevent public bookings on these dates.
          </p>

          <div className="flex gap-3 max-w-sm">
            <Input
              type="date"
              value={newBlockedDate}
              onChange={(e) => setNewBlockedDate(e.target.value)}
            />
            <Button type="button" onClick={handleAddBlockedDate} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              <span>Block Date</span>
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {settings.blockedDates?.length === 0 ? (
              <p className="text-xs text-stone-500">No blocked dates registered.</p>
            ) : (
              settings.blockedDates?.map((d) => (
                <span
                  key={d}
                  className="bg-[#1E1E28] border border-white/10 px-3 py-1.5 text-xs font-mono text-white flex items-center gap-2"
                >
                  <span>{d}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBlockedDate(d)}
                    className="text-stone-400 hover:text-rose-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Operational Rules & Policies */}
        <div className="bg-[#141419] border border-white/10 p-6 sm:p-8 space-y-4">
          <h3 className="font-serif text-xl text-white border-b border-white/10 pb-3">
            Reservation Rules & Protocol
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Standard Seating Duration (Minutes)"
              type="number"
              min="30"
              max="240"
              value={settings.defaultReservationDuration}
              onChange={(e) =>
                setSettings({ ...settings, defaultReservationDuration: Number(e.target.value) })
              }
            />
            <Input
              label="Max Party Size Online"
              type="number"
              min="1"
              max="16"
              value={settings.maxPartySizeOnline}
              onChange={(e) =>
                setSettings({ ...settings, maxPartySizeOnline: Number(e.target.value) })
              }
            />
            <Input
              label="Min Notice Before Service (Hours)"
              type="number"
              min="1"
              max="48"
              value={settings.minAdvanceNoticeHours}
              onChange={(e) =>
                setSettings({ ...settings, minAdvanceNoticeHours: Number(e.target.value) })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Textarea
              label="Reservation Policy"
              rows={2}
              value={settings.reservationPolicy}
              onChange={(e) => setSettings({ ...settings, reservationPolicy: e.target.value })}
            />
            <Textarea
              label="Cancellation Policy"
              rows={2}
              value={settings.cancellationPolicy}
              onChange={(e) => setSettings({ ...settings, cancellationPolicy: e.target.value })}
            />
          </div>
        </div>

        {/* Contact & Physical Address */}
        <div className="bg-[#141419] border border-white/10 p-6 sm:p-8 space-y-4">
          <h3 className="font-serif text-xl text-white border-b border-white/10 pb-3">
            Location, Phone & Valet Protocol
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Street Address"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            />
            <Input
              label="City & Postal Code"
              value={`${settings.city}, ${settings.postalCode}`}
              onChange={(e) => setSettings({ ...settings, city: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Concierge Phone"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
            />
            <Input
              label="Official Email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            />
          </div>

          <Input
            label="Valet Parking Details"
            value={settings.parkingInformation}
            onChange={(e) => setSettings({ ...settings, parkingInformation: e.target.value })}
          />

          <Input
            label="Dress Code Guideline"
            value={settings.dressCode}
            onChange={(e) => setSettings({ ...settings, dressCode: e.target.value })}
          />
        </div>

        <div className="flex justify-end pb-8">
          <Button type="submit" size="lg" isLoading={isSaving}>
            Save All Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
