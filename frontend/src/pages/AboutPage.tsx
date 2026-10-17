import React from 'react';
import { Sparkles, Utensils, Award, Leaf, ShieldCheck } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-[#C6A15B] text-xs font-bold tracking-widest uppercase block">
          Our Lineage & Vision
        </span>
        <h1 className="font-heading text-4xl sm:text-6xl font-bold text-[#173D2D]">
          The Story of Saffron & Sage
        </h1>
        <p className="text-base text-[#77786F] leading-relaxed">
          Bridging the soul of ancient royal Indian dining halls with the disciplined finesse of progressive contemporary gastronomy.
        </p>
      </div>

      {/* Hero Visual Banner */}
      <div className="relative rounded-3xl overflow-hidden h-[420px] shadow-2xl border-2 border-[#E8E2D5]">
        <img
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80"
          alt="Culinary hearth"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-8 sm:p-12 text-[#F7F3E8]">
          <div className="max-w-xl space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-[#C6A15B]">
              Mindful Gastronomy
            </span>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold">
              Rooted in Native Botanical Terroir
            </h3>
            <p className="text-xs text-[#F7F3E8]/80 leading-relaxed">
              Every dish is seasoned with cold-pressed oils, wild morels hand-foraged from Kashmir, and heirloom grains nurtured across biodiversity estates.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-[#E8E2D5] shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F7F3E8] text-[#C6A15B] flex items-center justify-center font-bold">
            <Leaf className="w-6 h-6" />
          </div>
          <h4 className="font-heading font-bold text-xl text-[#173D2D]">Single-Estate Sourcing</h4>
          <p className="text-xs text-[#77786F] leading-relaxed">
            Our saffron is gathered from the high-altitude plateaus of Pampore, our black pepper from the shaded hills of Wayanad, and our whole grains directly from indigenous seed conservationists.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-[#E8E2D5] shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F7F3E8] text-[#C6A15B] flex items-center justify-center font-bold">
            <Utensils className="w-6 h-6" />
          </div>
          <h4 className="font-heading font-bold text-xl text-[#173D2D]">Ancestral Craft</h4>
          <p className="text-xs text-[#77786F] leading-relaxed">
            From our 24-hour charcoal-simmered black lentils to dough-sealed dum clay vessels, we protect slow, mindful techniques that cannot be hastened by modern machinery.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-[#E8E2D5] shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F7F3E8] text-[#C6A15B] flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h4 className="font-heading font-bold text-xl text-[#173D2D]">Modern Hospitality</h4>
          <p className="text-xs text-[#77786F] leading-relaxed">
            Guests enjoy contact-free table ordering via our smart QR system, seamless digital settlements, and attentive tableside service in equal measure.
          </p>
        </div>
      </div>
    </div>
  );
};
