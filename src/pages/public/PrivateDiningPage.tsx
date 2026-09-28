import React, { useState } from 'react';
import { eventsApi } from '../../api/events.api.js';
import { SectionHeading } from '../../components/common/SectionHeading.js';
import { Input } from '../../components/ui/Input.js';
import { Select } from '../../components/ui/Select.js';
import { Textarea } from '../../components/ui/Textarea.js';
import { Button } from '../../components/ui/Button.js';
import { useToast } from '../../context/ToastContext.js';
import { CheckCircle2, Wine, Users, Calendar } from 'lucide-react';

export const PrivateDiningPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [eventType, setEventType] = useState('Corporate Dinner');
  const [guestCount, setGuestCount] = useState(10);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('18:30');
  const [budgetRange, setBudgetRange] = useState('$5,000 – $10,000');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!preferredDate) {
      error('Please select your preferred event date.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await eventsApi.submitInquiry({
        name,
        phone,
        email,
        eventType,
        guestCount: Number(guestCount),
        preferredDate,
        preferredTime,
        budgetRange,
        specialRequirements,
        message,
      });

      if (res.success) {
        setIsSubmitted(true);
        success('Your private dining inquiry has been submitted. Our Event Director will contact you within 24 hours.');
      }
    } catch (err: any) {
      error(err.message || 'Failed to submit inquiry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-20 max-w-7xl mx-auto px-5 sm:px-8 pt-28 pb-24 text-left">
      <SectionHeading
        kicker="Exclusive Hospitality"
        title="Private Dining & Celebrations"
        subtitle="Intimate gatherings and milestone corporate evenings hosted in our secluded subterranean wine cellar and private dining salons."
      />

      {/* Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#141419] border border-white/10 p-6 sm:p-10">
        <div className="aspect-[16/10] bg-[#16161C] border border-white/5 overflow-hidden">
          <img
            src="/images/private_dining.jpg"
            alt="Private Dining Cellar"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="space-y-4">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-sans">
            Salon Écrin
          </span>
          <h3 className="font-serif text-3xl text-white">The Subterranean Cellar</h3>
          <p className="text-xs sm:text-sm text-[#D1CCC0] leading-relaxed font-sans">
            Seated within our climate-controlled vault among 2,500 grand crus, Salon Écrin features a bespoke English dark walnut table set with Georg Jensen silver and Baccarat stemware. Accommodates 6 to 12 esteemed guests for multi-course bespoke degustations.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
            <div className="flex items-center gap-2 text-stone-300">
              <Users className="w-4 h-4 text-[#C5A880]" />
              <span>Up to 12 Guests</span>
            </div>
            <div className="flex items-center gap-2 text-stone-300">
              <Wine className="w-4 h-4 text-[#C5A880]" />
              <span>Dedicated Sommelier</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Form */}
      <div className="max-w-3xl mx-auto bg-[#141419] border border-white/10 p-8 sm:p-12">
        {isSubmitted ? (
          <div className="text-center space-y-4 py-8">
            <div className="w-14 h-14 rounded-full bg-[#C5A880]/10 border border-[#C5A880]/40 flex items-center justify-center mx-auto text-[#C5A880]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-3xl text-white">Inquiry Received</h3>
            <p className="text-xs sm:text-sm text-[#D1CCC0] max-w-md mx-auto leading-relaxed">
              Thank you, {name}. Our Private Dining & Events Director will review your specifications and prepare a custom proposal within 24 hours.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsSubmitted(false);
                setMessage('');
              }}
            >
              Submit Another Inquiry
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h3 className="font-serif text-2xl text-white">Private Event Inquiry</h3>
              <p className="text-xs text-[#D1CCC0] mt-1">
                Please provide your preliminary requirements below.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Eleanor Sinclair"
              />
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="eleanor@sinclair.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Phone Number"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (212) 555-0199"
              />
              <Select
                label="Event Type"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                <option value="Corporate Dinner">Corporate Dinner</option>
                <option value="Anniversary">Anniversary Celebration</option>
                <option value="Birthday">Birthday Gathering</option>
                <option value="Wedding">Intimate Wedding Dinner</option>
                <option value="Private Party">Private Tasting Party</option>
                <option value="Business Gathering">Executive Board Dinner</option>
                <option value="Other">Other Bespoke Event</option>
              </Select>
              <Input
                label="Estimated Guests"
                type="number"
                min="1"
                max="65"
                required
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Preferred Date"
                type="date"
                min={todayStr}
                required
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
              />
              <Input
                label="Preferred Time"
                type="time"
                required
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
              />
              <Select
                label="Budget Range"
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
              >
                <option value="$3,000 – $5,000">$3,000 – $5,000</option>
                <option value="$5,000 – $10,000">$5,000 – $10,000</option>
                <option value="$10,000 – $20,000">$10,000 – $20,000</option>
                <option value="$20,000+">$20,000+ (Full Buyout)</option>
              </Select>
            </div>

            <Input
              label="Special Requirements (Sommelier pairing, AV, Floral)"
              value={specialRequirements}
              onChange={(e) => setSpecialRequirements(e.target.value)}
              placeholder="e.g. Grand Cru Burgundy pairing requested, custom printed menus"
            />

            <Textarea
              label="Additional Notes / Vision"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Tell us about the evening you envision..."
            />

            <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
              Submit Private Dining Inquiry
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
