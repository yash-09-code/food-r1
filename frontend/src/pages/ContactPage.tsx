import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const ContactPage: React.FC = () => {
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Dining Inquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please complete all required fields.');
      return;
    }
    setSubmitted(true);
    toast.success('Your message has been dispatched to our guest relations team.');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[#C6A15B] text-xs font-bold tracking-widest uppercase block mb-1">
          Concierge & Guest Relations
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#173D2D]">
          Get in Touch
        </h1>
        <p className="text-sm text-[#77786F] mt-2">
          Inquire regarding private dining salon buyouts, corporate masterclasses, and bespoke tasting menus.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Card */}
        <div className="bg-[#173D2D] text-[#F7F3E8] rounded-3xl p-8 border border-[#C6A15B]/30 shadow-xl space-y-8">
          <div>
            <h3 className="font-heading text-2xl font-bold text-white mb-2">
              Saffron & Sage
            </h3>
            <p className="text-xs text-[#F7F3E8]/80 leading-relaxed">
              We welcome private inquiries, press requests, and tailored catering requirements.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#C6A15B] shrink-0 mt-0.5" />
              <span>Plot 42, Heritage Boulevard, Indiranagar, Bengaluru 560038</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#C6A15B] shrink-0" />
              <span>+91 80 4965 2100</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#C6A15B] shrink-0" />
              <span>reservations@saffronsage.in</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#C6A15B] shrink-0" />
              <span>Daily: 12:00 PM – 11:30 PM</span>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-[#E8E2D5] shadow-xs">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-[#173D2D]">
                Message Received
              </h3>
              <p className="text-xs text-[#77786F] max-w-md mx-auto">
                Thank you for contacting us, {name}. A member of our concierge team will respond within 4 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-5 py-2.5 rounded-xl border border-[#173D2D] text-xs font-bold text-[#173D2D]"
              >
                Send Another Note
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-heading font-bold text-xl text-[#173D2D]">
                Send an Inquiry
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#173D2D]">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Gayatri Sen"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#E8E2D5] bg-[#FCFAF5] focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#173D2D]">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. gayatri@example.com"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#E8E2D5] bg-[#FCFAF5] focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#173D2D]">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#E8E2D5] bg-[#FCFAF5] focus:outline-none focus:border-[#C6A15B]"
                >
                  <option value="General Dining Inquiry">General Dining Inquiry</option>
                  <option value="Private Salon Buyout">Private Salon Buyout & Group Booking</option>
                  <option value="Press & Collaborations">Press & Media Collaborations</option>
                  <option value="Chef Tasting Menu Special">Chef Tasting Menu Questions</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#173D2D]">Message *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your event date, number of attendees, or special requests..."
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#E8E2D5] bg-[#FCFAF5] focus:outline-none focus:border-[#C6A15B]"
                />
              </div>

              <button
                type="submit"
                className="px-8 py-3.5 rounded-xl bg-[#173D2D] text-[#F7F3E8] font-bold text-xs uppercase tracking-wider hover:bg-[#123023] transition-all shadow flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5 text-[#C6A15B]" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
