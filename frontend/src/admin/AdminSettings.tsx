import React, { useEffect, useState } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck, DollarSign } from 'lucide-react';
import { adminService } from '../services/restaurantService';
import { useToast } from '../context/ToastContext';

export const AdminSettings: React.FC = () => {
  const toast = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSettings();
      const map: Record<string, string> = {};
      data.forEach((item: any) => {
        map[item.key] = item.value;
      });
      setSettings(map);
    } catch (err) {
      toast.error('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (key: string, val: string) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminService.updateSettingsBatch(settings);
      toast.success('Restaurant settings and tax configurations saved.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-[#77786F]">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      <div>
        <span className="text-xs font-bold text-[#C6A15B] uppercase tracking-wider">
          Configuration & Taxation
        </span>
        <h2 className="font-heading text-2xl font-bold text-[#173D2D]">
          Restaurant & Billing Settings
        </h2>
        <p className="text-xs text-[#77786F] mt-1">
          Adjust GST percentage, packaging rates, address coordinates, and operating hours.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D5] shadow-xs space-y-6 text-xs">
        {/* General Identity */}
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-base text-[#173D2D] pb-2 border-b border-[#E8E2D5]">
            Brand & Contact Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[#173D2D]">Restaurant Name</label>
              <input
                type="text"
                value={settings.restaurant_name || ''}
                onChange={(e) => handleChange('restaurant_name', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCFAF5]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#173D2D]">Telephone Helpline</label>
              <input
                type="text"
                value={settings.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCFAF5]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#173D2D]">Official Email</label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCFAF5]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#173D2D]">Operating Hours</label>
              <input
                type="text"
                value={settings.opening_hours || ''}
                onChange={(e) => handleChange('opening_hours', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCFAF5]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-[#173D2D]">Full Physical Address</label>
              <input
                type="text"
                value={settings.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCFAF5]"
              />
            </div>
          </div>
        </div>

        {/* Taxes & Fees */}
        <div className="space-y-4 pt-4 border-t border-[#E8E2D5]">
          <h3 className="font-heading font-bold text-base text-[#173D2D] pb-2 border-b border-[#E8E2D5]">
            Taxation & Service Surcharges
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[#173D2D]">GST Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={settings.tax_rate_percent || '5.0'}
                onChange={(e) => handleChange('tax_rate_percent', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCFAF5] font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#173D2D]">Packaging Fee (₹)</label>
              <input
                type="number"
                step="1"
                value={settings.packaging_fee || '25.0'}
                onChange={(e) => handleChange('packaging_fee', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCFAF5]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#173D2D]">Delivery Fee (₹)</label>
              <input
                type="number"
                step="1"
                value={settings.delivery_fee || '40.0'}
                onChange={(e) => handleChange('delivery_fee', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCFAF5]"
              />
            </div>
          </div>
        </div>

        {/* Map Coordinates */}
        <div className="space-y-4 pt-4 border-t border-[#E8E2D5]">
          <h3 className="font-heading font-bold text-base text-[#173D2D] pb-2 border-b border-[#E8E2D5]">
            Google Maps Coordinates & Embed
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[#173D2D]">Latitude</label>
              <input
                type="text"
                value={settings.latitude || ''}
                onChange={(e) => handleChange('latitude', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCFAF5]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#173D2D]">Longitude</label>
              <input
                type="text"
                value={settings.longitude || ''}
                onChange={(e) => handleChange('longitude', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCFAF5]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-[#173D2D]">Google Maps Embed Iframe URL</label>
              <input
                type="text"
                value={settings.map_embed_url || ''}
                onChange={(e) => handleChange('map_embed_url', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCFAF5]"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 rounded-xl bg-[#173D2D] text-[#F7F3E8] font-bold uppercase tracking-wider hover:bg-[#123023] disabled:opacity-50 transition-all shadow flex items-center gap-2"
        >
          <Save className="w-4 h-4 text-[#C6A15B]" />
          <span>{isSubmitting ? 'Saving Settings...' : 'Save All Settings'}</span>
        </button>
      </form>
    </div>
  );
};
