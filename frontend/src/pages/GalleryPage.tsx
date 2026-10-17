import React, { useEffect, useState } from 'react';
import { publicService } from '../services/restaurantService';
import { GalleryImage } from '../types';

export const GalleryPage: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    publicService.getGallery()
      .then(setImages)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const categories = ['All', 'Ambience', 'Dishes', 'Cocktails', 'Kitchen'];

  const filtered = selectedCategory === 'All'
    ? images
    : images.filter((img) => img.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[#C6A15B] text-xs font-bold tracking-widest uppercase block mb-1">
          Visual Anthology
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#173D2D]">
          Atmosphere & Culinary Plating
        </h1>
        <p className="text-sm text-[#77786F] mt-2">
          An intimate look into our heritage dining salon, courtyard hearths, and handcrafted botanical cocktails.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-[#173D2D] text-[#F7F3E8] shadow-md'
                : 'bg-white text-[#77786F] border border-[#E8E2D5] hover:border-[#C6A15B]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-4/3 rounded-3xl bg-white border border-[#E8E2D5] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-3xl overflow-hidden aspect-4/3 border border-[#E8E2D5] bg-stone-100 shadow-xs hover:shadow-xl transition-all"
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 text-[#F7F3E8]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#C6A15B]">
                  {item.category}
                </span>
                <h4 className="font-heading font-bold text-lg text-white">
                  {item.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
