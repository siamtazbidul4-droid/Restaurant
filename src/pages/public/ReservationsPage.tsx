import React, { useState, useEffect, useCallback } from 'react';
import { reservationsApi, AvailabilityResult } from '../../api/reservations.api.js';
import { SectionHeading } from '../../components/common/SectionHeading.js';
import { Input } from '../../components/ui/Input.js';
import { Select } from '../../components/ui/Select.js';
import { Textarea } from '../../components/ui/Textarea.js';
import { Button } from '../../components/ui/Button.js';
import { useToast } from '../../context/ToastContext.js';
import { Calendar, Users, Clock, CheckCircle2, Search, AlertCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ReservationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'book' | 'lookup'>('book');

  // Booking Form State
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(defaultDate);
  const [guests, setGuests] = useState(2);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Guest Details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [seatingPreference, setSeatingPreference] = useState('Main Dining Room');
  const [specialRequest, setSpecialRequest] = useState('');
  const [dietaryRequirements, setDietaryRequirements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Completed Confirmation State
  const [confirmedReservation, setConfirmedReservation] = useState<any | null>(null);

  // Lookup State
  const [lookupRef, setLookupRef] = useState('');
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const { success, error } = useToast();

  // Check Availability
  const fetchAvailability = useCallback(async (d: string, g: number) => {
    try {
      setCheckingAvailability(true);
      const res = await reservationsApi.checkAvailability(d, g);
      if (res.success) {
        setAvailability(res.data);
        if (res.data.availableSlots?.length > 0) {
          setSelectedTime(res.data.availableSlots[0]);
        } else {
          setSelectedTime('');
        }
      }
    } catch (err: any) {
      error(err.message || 'Unable to check availability at this time.');
    } finally {
      setCheckingAvailability(false);
    }
  }, [error]);

  useEffect(() => {
    if (activeTab === 'book') {
      fetchAvailability(date, guests);
    }
  }, [date, guests, activeTab, fetchAvailability]);

  // Handle Booking Submit
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTime) {
      error('Please select an available seating time.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await reservationsApi.createReservation({
        date,
        time: selectedTime,
        guests,
        name,
        email,
        phone,
        seatingPreference,
        specialRequest,
        dietaryRequirements: dietaryRequirements ? dietaryRequirements.split(',').map((s) => s.trim()) : [],
      });

      if (res.success && res.data) {
        setConfirmedReservation(res.data);
        success('Your table has been reserved. A confirmation reference has been generated.');
      }
    } catch (err: any) {
      error(err.message || 'Reservation could not be completed.');
      // Refresh availability in case slot was taken
      fetchAvailability(date, guests);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Lookup
  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupRef.trim()) return;

    try {
      setIsLookingUp(true);
      setLookupResult(null);
      const res = await reservationsApi.lookupByReference(lookupRef.trim());
      if (res.success && res.data) {
        setLookupResult(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Reservation reference not found.');
    } finally {
      setIsLookingUp(false);
    }
  };

  // Handle Cancellation
  const handleCancelReservation = async () => {
    if (!lookupResult?.reference) return;

    try {
      setIsCancelling(true);
      const res = await reservationsApi.cancelByReference(lookupResult.reference, cancelReason);
      if (res.success) {
        success('Your reservation has been cancelled.');
        setLookupResult((prev: any) => ({ ...prev, status: 'Cancelled' }));
      }
    } catch (err: any) {
      error(err.message || 'Failed to cancel reservation.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Today date format
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-28 pb-24 space-y-12">
      {/* Header */}
      <SectionHeading
        kicker="Table Reservations"
        title="Reserve Your Epicurean Experience"
        subtitle="Dinner service Tuesday through Sunday. We recommend booking two weeks in advance for weekend seatings."
      />

      {/* Tabs: New Booking vs Lookup */}
      <div className="flex justify-center border-b border-white/10">
        <button
          onClick={() => {
            setActiveTab('book');
            setConfirmedReservation(null);
          }}
          className={`px-8 py-3 text-xs font-sans uppercase tracking-[0.2em] transition-all ${
            activeTab === 'book'
              ? 'text-[#C5A880] border-b-2 border-[#C5A880] font-semibold'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          Book a Table
        </button>
        <button
          onClick={() => setActiveTab('lookup')}
          className={`px-8 py-3 text-xs font-sans uppercase tracking-[0.2em] transition-all ${
            activeTab === 'lookup'
              ? 'text-[#C5A880] border-b-2 border-[#C5A880] font-semibold'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          Manage Existing Reservation
        </button>
      </div>

      {activeTab === 'book' ? (
        confirmedReservation ? (
          /* Confirmation Screen */
          <div className="bg-[#141419] border border-[#C5A880]/40 p-8 sm:p-12 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-[#C5A880]/10 border border-[#C5A880]/40 flex items-center justify-center mx-auto text-[#C5A880]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880]">
                Reservation Confirmed
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-white">
                We Look Forward to Welcoming You
              </h2>
            </div>

            {/* Reference Badge */}
            <div className="bg-[#1B1B24] border border-white/10 p-5 max-w-sm mx-auto space-y-1">
              <span className="text-[11px] text-stone-400 uppercase tracking-widest">
                Booking Reference Code
              </span>
              <p className="font-mono text-2xl font-bold tracking-widest text-[#E0CEB5]">
                {confirmedReservation.reference}
              </p>
              <p className="text-[11px] text-stone-500">Please retain this code for reference or arrival.</p>
            </div>

            {/* Summary Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-white/10 text-xs">
              <div>
                <span className="text-stone-400 block mb-1 uppercase tracking-wider text-[10px]">Date</span>
                <span className="font-mono text-white text-sm">{confirmedReservation.date}</span>
              </div>
              <div>
                <span className="text-stone-400 block mb-1 uppercase tracking-wider text-[10px]">Time</span>
                <span className="font-mono text-white text-sm">{confirmedReservation.time}</span>
              </div>
              <div>
                <span className="text-stone-400 block mb-1 uppercase tracking-wider text-[10px]">Guests</span>
                <span className="text-white text-sm">{confirmedReservation.guests} Persons</span>
              </div>
              <div>
                <span className="text-stone-400 block mb-1 uppercase tracking-wider text-[10px]">Guest Name</span>
                <span className="text-white text-sm truncate block">{confirmedReservation.name}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-xs text-[#D1CCC0] max-w-md mx-auto leading-relaxed">
                A confirmation has been recorded in our reservation books. For parties larger than 8 or special cellar buyouts, our sommelier team is available by telephone.
              </p>

              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setConfirmedReservation(null);
                    fetchAvailability(date, guests);
                  }}
                >
                  Book Another Date
                </Button>
                <Link
                  to="/menu"
                  className="px-6 py-2.5 text-xs font-sans uppercase tracking-[0.2em] bg-[#C5A880] text-[#0D0D0E] font-medium hover:bg-[#E0CEB5] transition-colors"
                >
                  Explore Tasting Menu
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Real Reservation Engine Form */
          <form onSubmit={handleBookingSubmit} className="space-y-8 bg-[#141419] border border-white/10 p-6 sm:p-10">
            {/* Step 1: Date & Guests Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-white/10">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#D1CCC0] mb-1.5 font-sans">
                  Dining Date <span className="text-[#C5A880]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={todayStr}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full bg-[#1A1A22] border border-white/15 focus:border-[#C5A880] text-sm text-white px-3.5 py-2.5 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#D1CCC0] mb-1.5 font-sans">
                  Party Size <span className="text-[#C5A880]">*</span>
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full bg-[#1A1A22] border border-white/15 focus:border-[#C5A880] text-sm text-white px-3.5 py-2.5 outline-none font-sans"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num} className="bg-[#1A1A22] text-white">
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-stone-400 mt-1">
                  For parties of 9+, please submit a{' '}
                  <Link to="/private-dining" className="text-[#C5A880] hover:underline">
                    Private Dining Inquiry
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Step 2: Time Slots (Real calculated availability) */}
            <div className="space-y-3 pb-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <label className="block text-xs uppercase tracking-wider text-[#D1CCC0] font-sans">
                  Available Seating Times <span className="text-[#C5A880]">*</span>
                </label>
                {checkingAvailability && (
                  <span className="text-xs text-[#C5A880] animate-pulse">
                    Calculating availability...
                  </span>
                )}
              </div>

              {availability && !availability.available ? (
                <div className="p-4 bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">No Available Seatings for Selected Date</p>
                    <p className="text-stone-400 mt-0.5">{availability.reason}</p>
                  </div>
                </div>
              ) : availability?.availableSlots?.length === 0 ? (
                <p className="text-xs text-stone-400">All seatings for this date are fully committed.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {availability?.availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`py-2 px-3 text-xs font-mono font-medium tracking-wider transition-all border ${
                        selectedTime === slot
                          ? 'bg-[#C5A880] text-[#0D0D0E] border-[#C5A880] shadow-md'
                          : 'bg-[#1A1A22] text-[#F6F4EE] border-white/10 hover:border-[#C5A880]/50'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Step 3: Guest Contact & Preferences */}
            <div className="space-y-4">
              <h3 className="font-serif text-xl text-white">Guest Information</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  required
                  placeholder="e.g. Lady Genevieve Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  label="Email Address"
                  type="email"
                  required
                  placeholder="genevieve@estate.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Mobile Phone"
                  type="tel"
                  required
                  placeholder="+1 (555) 019-2834"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  helperText="Used for reservation reminders"
                />
                <Select
                  label="Seating Preference"
                  value={seatingPreference}
                  onChange={(e) => setSeatingPreference(e.target.value)}
                >
                  <option value="Main Dining Room">Main Dining Room</option>
                  <option value="Window Banquette">Window Banquette (Subject to availability)</option>
                  <option value="Mezzanine Booth">Mezzanine Booth</option>
                  <option value="Private Sommelier Cellar">Private Sommelier Cellar (Min 6 guests)</option>
                </Select>
              </div>

              <Input
                label="Dietary Restrictions / Allergies"
                placeholder="e.g. Shellfish allergy, vegetarian tasting for 1 guest"
                value={dietaryRequirements}
                onChange={(e) => setDietaryRequirements(e.target.value)}
                helperText="Separate multiple with commas"
              />

              <Textarea
                label="Special Occasion / Requests"
                placeholder="Celebrating milestone anniversary, quiet table, etc."
                value={specialRequest}
                onChange={(e) => setSpecialRequest(e.target.value)}
                rows={2}
              />
            </div>

            {/* Terms and Submit */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="text-[11px] text-stone-400 space-y-1 leading-relaxed">
                <p>• Tables are held for 15 minutes past scheduled seating time.</p>
                <p>• Cancellations requested at least 24 hours prior are graciously received without penalty.</p>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
                disabled={!selectedTime || !availability?.available}
              >
                Confirm Reservation
              </Button>
            </div>
          </form>
        )
      ) : (
        /* Tab 2: Manage Existing Reservation */
        <div className="space-y-8 bg-[#141419] border border-white/10 p-6 sm:p-10">
          <form onSubmit={handleLookupSubmit} className="space-y-4">
            <h3 className="font-serif text-2xl text-white">Find Your Reservation</h3>
            <p className="text-xs text-[#D1CCC0] leading-relaxed">
              Enter your unique booking reference code (e.g., AURL-8F42K) to inspect or cancel your seating.
            </p>

            <div className="flex gap-3">
              <Input
                placeholder="AURL-XXXXX"
                value={lookupRef}
                onChange={(e) => setLookupRef(e.target.value.toUpperCase())}
                className="font-mono uppercase tracking-widest text-center"
              />
              <Button type="submit" isLoading={isLookingUp}>
                Search
              </Button>
            </div>
          </form>

          {/* Lookup Result View */}
          {lookupResult && (
            <div className="border border-white/10 p-6 bg-[#16161C] space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-stone-400">
                    Booking Reference
                  </span>
                  <p className="font-mono text-xl font-bold text-[#E0CEB5]">{lookupResult.reference}</p>
                </div>
                <div>
                  <span
                    className={`inline-block px-3 py-1 text-xs uppercase tracking-wider font-semibold border ${
                      lookupResult.status === 'Confirmed'
                        ? 'border-emerald-600/60 bg-emerald-950/40 text-emerald-300'
                        : lookupResult.status === 'Cancelled'
                        ? 'border-rose-700/60 bg-rose-950/40 text-rose-300'
                        : 'border-[#C5A880]/60 bg-[#C5A880]/10 text-[#C5A880]'
                    }`}
                  >
                    {lookupResult.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-stone-400 block mb-1 text-[10px] uppercase">Guest</span>
                  <span className="text-white font-medium">{lookupResult.name}</span>
                </div>
                <div>
                  <span className="text-stone-400 block mb-1 text-[10px] uppercase">Date</span>
                  <span className="font-mono text-white">{lookupResult.date}</span>
                </div>
                <div>
                  <span className="text-stone-400 block mb-1 text-[10px] uppercase">Time</span>
                  <span className="font-mono text-white">{lookupResult.time}</span>
                </div>
                <div>
                  <span className="text-stone-400 block mb-1 text-[10px] uppercase">Party Size</span>
                  <span className="text-white">{lookupResult.guests} Guests</span>
                </div>
              </div>

              {lookupResult.specialRequest && (
                <div className="text-xs pt-2">
                  <span className="text-stone-400 block mb-0.5 text-[10px] uppercase">Special Requests</span>
                  <p className="text-stone-300 italic">{lookupResult.specialRequest}</p>
                </div>
              )}

              {/* Cancellation Form if still active */}
              {lookupResult.status !== 'Cancelled' && (
                <div className="pt-6 border-t border-white/10 space-y-3">
                  <h4 className="text-xs uppercase tracking-wider text-rose-300 font-medium">
                    Cancel Reservation
                  </h4>
                  <Input
                    placeholder="Reason for cancellation (optional)"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleCancelReservation}
                    isLoading={isCancelling}
                  >
                    Confirm Cancellation
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
