import React, { useState } from 'react';
import {
  CalendarDays, Clock, Users, Utensils, CheckCircle2,
  Sparkles, ArrowRight, ShieldCheck, MapPin
} from 'lucide-react';
import { reservationService } from '../services/restaurantService';
import { Reservation } from '../types';
import { useToast } from '../context/ToastContext';

export const ReservationsPage: React.FC = () => {
  const toast = useToast();

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [reservationDate, setReservationDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [reservationTime, setReservationTime] = useState('19:30');
  const [guestCount, setGuestCount] = useState(2);
  const [seatingPreference, setSeatingPreference] = useState('Courtyard Terrace');
  const [specialRequests, setSpecialRequests] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Reservation | null>(null);

  const timeSlots = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
  ];

  const seatingOptions = [
    'Courtyard Terrace',
    'Main Dining Hall',
    'Private Dining Salon',
    'Botanical Garden Alcove'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
      toast.error('Please fill in all guest contact details.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Verify availability
      const avail = await reservationService.checkAvailability(
        reservationDate,
        reservationTime,
        guestCount
      );
      if (!avail.is_available) {
        toast.error(`Dining room capacity exceeded for ${reservationTime}. Remaining seats: ${avail.remaining_capacity}`);
        return;
      }

      // 2. Book
      const booking = await reservationService.bookReservation({
        guest_name: guestName.trim(),
        guest_email: guestEmail.trim(),
        guest_phone: guestPhone.trim(),
        reservation_date: reservationDate,
        reservation_time: reservationTime,
        guest_count: guestCount,
        seating_preference: seatingPreference,
        special_requests: specialRequests.trim() || undefined,
      });

      setConfirmedBooking(booking);
      toast.success(`Table reserved! Code: ${booking.reservation_code}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete reservation. Please select another time slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[#C6A15B] text-xs font-bold tracking-widest uppercase block mb-1">
          Intimate Soirées & Celebrations
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#173D2D]">
          Reserve a Dining Table
        </h1>
        <p className="text-sm text-[#77786F] mt-2">
          Experience sensory storytelling and bespoke hospitality. We recommend booking at least 24 hours in advance.
        </p>
      </div>

      {confirmedBooking ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E8E2D5] shadow-xl text-center max-w-xl mx-auto space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C6A15B] block mb-1">
              Table Confirmed
            </span>
            <h2 className="font-heading text-3xl font-bold text-[#173D2D]">
              We Look Forward to Welcoming You
            </h2>
            <p className="text-xs text-[#77786F] mt-2">
              A confirmation has been recorded under your reservation code.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FCFAF5] border border-[#E8E2D5] text-left space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-[#77786F]">Reservation Code:</span>
              <strong className="text-[#173D2D] font-mono text-sm">{confirmedBooking.reservation_code}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#77786F]">Guest Name:</span>
              <strong className="text-[#242820]">{confirmedBooking.guest_name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#77786F]">Date & Time:</span>
              <strong className="text-[#242820]">{confirmedBooking.reservation_date} at {confirmedBooking.reservation_time}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#77786F]">Party Size:</span>
              <strong className="text-[#242820]">{confirmedBooking.guest_count} Guests</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#77786F]">Seating:</span>
              <strong className="text-[#C6A15B]">{confirmedBooking.seating_preference}</strong>
            </div>
          </div>

          <button
            onClick={() => setConfirmedBooking(null)}
            className="px-6 py-3 rounded-xl bg-[#173D2D] text-[#F7F3E8] text-xs font-bold uppercase tracking-wider hover:bg-[#123023] transition-colors"
          >
            Book Another Table
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Form Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D5] shadow-xs space-y-6">
              <h3 className="font-heading font-bold text-lg text-[#173D2D]">
                Reservation Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#173D2D] flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-[#C6A15B]" />
                    <span>Dining Date *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={reservationDate}
                    onChange={(e) => setReservationDate(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#E8E2D5] bg-[#FCFAF5] focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#173D2D] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#C6A15B]" />
                    <span>Number of Guests *</span>
                  </label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#E8E2D5] bg-[#FCFAF5] focus:outline-none focus:border-[#C6A15B]"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Time Slots */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#173D2D] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C6A15B]" />
                  <span>Preferred Time Slot *</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setReservationTime(slot)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        reservationTime === slot
                          ? 'border-[#173D2D] bg-[#173D2D] text-[#F7F3E8] shadow'
                          : 'border-[#E8E2D5] bg-[#FCFAF5] text-[#242820] hover:bg-stone-100'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seating Preference */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#173D2D] flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-[#C6A15B]" />
                  <span>Seating Ambiance</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {seatingOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setSeatingPreference(opt)}
                      className={`p-3 text-xs rounded-xl border text-left transition-all ${
                        seatingPreference === opt
                          ? 'border-[#C6A15B] bg-[#C6A15B]/10 font-bold text-[#173D2D]'
                          : 'border-[#E8E2D5] bg-[#FCFAF5] text-[#77786F] hover:bg-stone-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guest Details */}
              <div className="pt-4 border-t border-[#E8E2D5] space-y-4">
                <h4 className="font-heading font-bold text-sm text-[#173D2D]">
                  Guest Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Full Name *"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#E8E2D5] bg-[#FCFAF5] focus:outline-none focus:border-[#C6A15B]"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Mobile Phone *"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#E8E2D5] bg-[#FCFAF5] focus:outline-none focus:border-[#C6A15B]"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address *"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="sm:col-span-2 w-full px-4 py-2.5 text-xs rounded-xl border border-[#E8E2D5] bg-[#FCFAF5] focus:outline-none focus:border-[#C6A15B]"
                  />
                  <textarea
                    rows={2}
                    placeholder="Special celebration requests, anniversary, dietary allergies..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="sm:col-span-2 w-full px-4 py-2 text-xs rounded-xl border border-[#E8E2D5] bg-[#FCFAF5] focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Summary & Booking Confirmation */}
          <div className="space-y-6">
            <div className="bg-[#173D2D] text-[#F7F3E8] rounded-3xl p-6 sm:p-8 border border-[#C6A15B]/30 shadow-xl space-y-6">
              <h3 className="font-heading font-bold text-lg text-white pb-3 border-b border-white/10">
                Reservation Summary
              </h3>

              <div className="space-y-3 text-xs text-[#F7F3E8]/80">
                <div className="flex justify-between">
                  <span>Selected Date:</span>
                  <strong className="text-white">{reservationDate}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <strong className="text-[#C6A15B]">{reservationTime}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Party:</span>
                  <strong className="text-white">{guestCount} Guests</strong>
                </div>
                <div className="flex justify-between">
                  <span>Ambience:</span>
                  <strong className="text-white">{seatingPreference}</strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] leading-relaxed text-[#F7F3E8]/70">
                We hold tables for 15 minutes past the reserved hour. Dress code: Elegant Casual.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-[#C6A15B] text-[#173D2D] font-bold text-xs uppercase tracking-wider hover:bg-[#b59048] disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? 'Verifying Availability...' : 'Confirm Table Reservation'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
