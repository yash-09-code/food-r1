import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, Clock, Calendar, Navigation, Car, AlertTriangle } from 'lucide-react';
import { publicService } from '../services/restaurantService';

export const LocationPage: React.FC = () => {
  const [location, setLocation] = useState<any>({});

  useEffect(() => {
    publicService.getLocation().then(setLocation).catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[#C6A15B] text-xs font-bold tracking-widest uppercase block mb-1">
          Coordinates & Directions
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#173D2D]">
          Location & Hours
        </h1>
        <p className="text-sm text-[#77786F] mt-2">
          Nestled along Indiranagar's heritage boulevard with dedicated valet parking and tranquil courtyards.
        </p>
      </div>

      {location.temporary_closure_notice && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 p-4 rounded-2xl flex items-center gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>{location.temporary_closure_notice}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Info Column */}
        <div className="bg-white rounded-3xl p-8 border border-[#E8E2D5] shadow-xs space-y-8">
          <div className="space-y-6">
            <h3 className="font-heading font-bold text-2xl text-[#173D2D]">
              {location.restaurant_name || 'Saffron & Sage Fine Dining'}
            </h3>

            <div className="space-y-4 text-sm text-[#242820]">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#F7F3E8] text-[#C6A15B] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-[#173D2D]">Physical Address</strong>
                  <span className="text-xs text-[#77786F] leading-relaxed">
                    {location.address || 'Plot 42, Heritage Boulevard, Indiranagar, Bengaluru, Karnataka 560038'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#F7F3E8] text-[#C6A15B] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-[#173D2D]">Operating Hours</strong>
                  <span className="text-xs text-[#77786F]">
                    {location.opening_hours || 'Mon - Sun: 12:00 PM – 11:30 PM'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#F7F3E8] text-[#C6A15B] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-[#173D2D]">Telephone Helpline</strong>
                  <span className="text-xs text-[#77786F]">{location.phone || '+91 80 4965 2100'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#F7F3E8] text-[#C6A15B] flex items-center justify-center shrink-0">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-[#173D2D]">Valet & Parking</strong>
                  <span className="text-xs text-[#77786F]">
                    Complimentary valet parking available at our main entrance for all patrons.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#E8E2D5] flex gap-3">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude || '12.9716'},${location.longitude || '77.6412'}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3 px-5 rounded-xl bg-[#173D2D] text-[#F7F3E8] text-xs font-bold uppercase tracking-wider hover:bg-[#123023] flex items-center justify-center gap-2 shadow"
            >
              <Navigation className="w-4 h-4 text-[#C6A15B]" />
              <span>Get Driving Directions</span>
            </a>
          </div>
        </div>

        {/* Embedded Interactive Map */}
        <div className="bg-white rounded-3xl p-4 border border-[#E8E2D5] shadow-xs">
          <div className="h-[460px] rounded-2xl overflow-hidden border border-[#E8E2D5]">
            <iframe
              title="Restaurant Google Map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              src={location.map_embed_url || "https://maps.google.com/maps?q=12.9716,77.6412&hl=en&z=15&output=embed"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
