import React, { useState } from 'react';
import { contactApi } from '../../api/contact.api.js';
import { SectionHeading } from '../../components/common/SectionHeading.js';
import { Input } from '../../components/ui/Input.js';
import { Textarea } from '../../components/ui/Textarea.js';
import { Button } from '../../components/ui/Button.js';
import { useToast } from '../../context/ToastContext.js';
import { MapPin, Phone, Mail, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const res = await contactApi.sendMessage({
        name,
        email,
        phone,
        subject,
        message,
      });

      if (res.success) {
        setIsSubmitted(true);
        success('Your message has been sent to our concierge team.');
      }
    } catch (err: any) {
      error(err.message || 'Failed to send message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 max-w-7xl mx-auto px-5 sm:px-8 pt-28 pb-24 text-left">
      <SectionHeading
        kicker="Guest Relations & Concierge"
        title="Connect With Aurelia"
        subtitle="Our host team and sommelier staff are at your service for reservations, private inquiries, or custom dining arrangements."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Hospitality Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 bg-[#141419] border border-white/10 space-y-6">
            <h3 className="font-serif text-2xl text-white">Direct Inquiries</h3>

            <div className="space-y-4 text-xs text-[#D1CCC0]">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block uppercase tracking-wider text-[11px]">Location</strong>
                  <p>442 Mayfair Boulevard, Upper East Side</p>
                  <p>New York, NY 10021</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block uppercase tracking-wider text-[11px]">Telephone</strong>
                  <a href="tel:+12125550198" className="text-[#C5A880] hover:underline">
                    +1 (212) 555-0198
                  </a>
                  <p className="text-[10px] text-stone-500">Concierge lines answered daily from 12:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block uppercase tracking-wider text-[11px]">Electronic Mail</strong>
                  <a href="mailto:concierge@aurelia-dining.com" className="hover:text-white">
                    concierge@aurelia-dining.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block uppercase tracking-wider text-[11px]">Service Hours</strong>
                  <p>Tuesday – Thursday: 17:30 – 23:00</p>
                  <p>Friday – Saturday: 17:00 – 00:00</p>
                  <p>Sunday: 17:30 – 22:30</p>
                  <p className="text-stone-500 text-[10px]">Closed Mondays for cellar upkeep</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block uppercase tracking-wider text-[11px]">Attire & Valet</strong>
                  <p>Smart elegant attire requested. Complimentary private valet at our porte-cochère.</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5">
              <a
                href="https://maps.google.com/?q=442+Mayfair+Blvd+New+York+NY"
                target="_blank"
                rel="noreferrer"
                className="inline-block px-5 py-2 text-xs font-sans uppercase tracking-[0.2em] border border-[#C5A880]/60 text-[#E0CEB5] hover:bg-[#C5A880] hover:text-[#0D0D0E] transition-all"
              >
                View on Google Maps →
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7 bg-[#141419] border border-white/10 p-8 sm:p-10">
          {isSubmitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#C5A880]/10 border border-[#C5A880]/40 flex items-center justify-center mx-auto text-[#C5A880]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-3xl text-white">Message Dispatched</h3>
              <p className="text-xs text-[#D1CCC0] max-w-sm mx-auto leading-relaxed">
                Thank you for contacting Aurelia. Our concierge host will respond promptly to your inquiry.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsSubmitted(false);
                  setSubject('');
                  setMessage('');
                }}
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="border-b border-white/10 pb-3">
                <h3 className="font-serif text-2xl text-white">Guest Concierge Message</h3>
                <p className="text-xs text-[#D1CCC0] mt-0.5">
                  Direct message to our front-of-house directors.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Julian Montgomery"
                />
                <Input
                  label="Email Address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="julian@montgomery.com"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Telephone (Optional)"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (212) 555-0182"
                />
                <Input
                  label="Subject"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Wine pairing inquiry, dietary, etc."
                />
              </div>

              <Textarea
                label="Your Message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How may our concierge team assist your upcoming visit?"
              />

              <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
                Send Message to Concierge
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
