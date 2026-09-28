import React, { useState } from 'react';
import { SectionHeading } from '../../components/common/SectionHeading.js';
import { Link, useSearchParams } from 'react-router-dom';

export const LegalPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const TABS = ['privacy', 'terms', 'cancellation'] as const;
  type Tab = (typeof TABS)[number];
  const rawTab = searchParams.get('tab');
  const initialTab: Tab = TABS.find((t) => t === rawTab) ?? 'privacy';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  return (
    <div className="space-y-12 max-w-4xl mx-auto px-5 sm:px-8 pt-28 pb-24 text-left">
      <SectionHeading
        kicker="Hospitality Policies"
        title="Terms & Privacy Charter"
        subtitle="Our policies reflect our dedication to mutual discretion, punctuality, and guest comfort."
        align="left"
      />

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-6 overflow-x-auto text-xs font-sans uppercase tracking-[0.2em]">
        <button
          onClick={() => setActiveTab('privacy')}
          className={`py-3 transition-colors ${
            activeTab === 'privacy'
              ? 'text-[#C5A880] border-b-2 border-[#C5A880] font-semibold'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          Privacy Policy
        </button>
        <button
          onClick={() => setActiveTab('terms')}
          className={`py-3 transition-colors ${
            activeTab === 'terms'
              ? 'text-[#C5A880] border-b-2 border-[#C5A880] font-semibold'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          Terms of Service
        </button>
        <button
          onClick={() => setActiveTab('cancellation')}
          className={`py-3 transition-colors ${
            activeTab === 'cancellation'
              ? 'text-[#C5A880] border-b-2 border-[#C5A880] font-semibold'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          Reservation & Cancellation Policy
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-8 sm:p-10 bg-[#141419] border border-white/10 space-y-6 text-xs sm:text-sm text-[#D1CCC0] font-sans leading-relaxed">
        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <h3 className="font-serif text-2xl text-white">Privacy Charter & Discretion</h3>
            <p>
              Aurelia Haute Gastronomy treats guest information with uncompromising discretion. Any personal details, including your contact information, dining preferences, and event specifications, are stored in encrypted environments solely to facilitate reservations and bespoke dining experiences.
            </p>
            <p>
              We do not sell, rent, or distribute guest lists or contact data to any third-party marketing entities.
            </p>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="space-y-4">
            <h3 className="font-serif text-2xl text-white">Terms of Hospitality Service</h3>
            <p>
              By accessing this digital platform and confirming dining reservations, patrons agree to conduct themselves in accordance with our house standards of decorum and smart elegant dress code.
            </p>
            <p>
              Aurelia reserves the right to reassign or adjust table layouts in circumstances of operational necessity, while ensuring equivalent luxury accommodations.
            </p>
          </div>
        )}

        {activeTab === 'cancellation' && (
          <div className="space-y-4">
            <h3 className="font-serif text-2xl text-white">Reservation & Modification Charter</h3>
            <p>
              Due to our hyper-seasonal procurement and limited seatings each evening, we graciously request at least 24 hours advance notice for standard table cancellations or party size reductions.
            </p>
            <p>
              Private Salon buyouts (Salon Écrin) require 72 hours advance notice for modifications. Reservations are held for up to 15 minutes past the scheduled seating time before tables are released.
            </p>
            <div className="pt-2">
              <Link to="/reservations" className="text-[#C5A880] underline underline-offset-4">
                Manage your reservation online →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
