import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowRight, Utensils, Star, Clock, MapPin,
  CalendarDays, ShieldCheck, ChevronRight, Plus, Eye
} from 'lucide-react';
import { publicService, menuService } from '../services/restaurantService';
import { MenuItem, Category, Testimonial } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart, tableNumber } = useCart();
  const toast = useToast();

  const [websiteContent, setWebsiteContent] = useState<Record<string, any>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredDishes, setFeaturedDishes] = useState<MenuItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [locationInfo, setLocationInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [content, cats, dishes, reviews, loc] = await Promise.all([
          publicService.getWebsiteContent().catch(() => ({})),
          menuService.getCategories().catch(() => []),
          menuService.getFeaturedItems().catch(() => []),
          publicService.getTestimonials().catch(() => []),
          publicService.getLocation().catch(() => ({})),
        ]);
        setWebsiteContent(content);
        setCategories(cats);
        setFeaturedDishes(dishes);
        setTestimonials(reviews);
        setLocationInfo(loc);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const hero = websiteContent?.hero || {
    title: 'Artisanal Dining & Botanical Elixirs',
    subtitle: 'Where ancient culinary traditions harmonize with progressive gastronomy in the heart of Bengaluru.',
    content: 'Sensory nuances, wood-fired hearths, and heritage grains.',
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80',
    button_text: 'Explore Our Menu',
    button_url: '/menu',
  };

  const story = websiteContent?.story || {
    title: 'Our Philosophy of Flavor',
    subtitle: 'Honoring Indian Terroir with Modern Technique',
    content: 'Founded on the principles of mindful provenance and elevated culinary artistry, Saffron & Sage brings you an unforgettable dining experience crafted with locally sourced heritage grains, cold-pressed oils, and farm-fresh botanicals.',
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
  };

  return (
    <div className="space-y-24 pb-20">
      {/* 1. Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#173D2D]">
        {/* Ambient Hero Image with Gradient Overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src={hero.image_url}
            alt="Saffron & Sage Fine Dining"
            className="w-full h-full object-cover opacity-35 scale-105 transform motion-safe:animate-pulse-slow"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#173D2D] via-[#173D2D]/60 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#173D2D_80%)]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[#F7F3E8] py-20 animate-fade-in">
          {tableNumber ? (
            <div className="inline-flex items-center gap-2 bg-[#C6A15B]/20 border border-[#C6A15B] text-[#C6A15B] px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wide uppercase mb-6 backdrop-blur-sm">
              <Utensils className="w-4 h-4" />
              Ordering from Table {tableNumber}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#C6A15B]" />
              Artisanal Hospitality & Table QR Ordering
            </div>
          )}

          <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
            {hero.title}
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-[#F7F3E8]/85 font-light leading-relaxed mb-10">
            {hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={hero.button_url || '/menu'}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#C6A15B] text-[#173D2D] font-bold text-sm tracking-wider uppercase hover:bg-[#b59048] transition-all shadow-xl hover:shadow-[#C6A15B]/30 flex items-center justify-center gap-3"
            >
              <span>{hero.button_text || 'Explore Our Menu'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/reservations"
              className="w-full sm:w-auto px-8 py-4 rounded-xl border-2 border-[#F7F3E8] text-[#F7F3E8] font-bold text-sm tracking-wider uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <CalendarDays className="w-4 h-4 text-[#C6A15B]" />
              <span>Reserve a Table</span>
            </Link>
          </div>

          {/* Quick Hours Pill */}
          <div className="mt-14 inline-flex items-center gap-3 text-xs text-[#F7F3E8]/70 border border-white/15 px-5 py-2 rounded-full backdrop-blur-xs">
            <Clock className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span>Open Today: 12:00 PM – 11:30 PM • Valet Parking Available</span>
          </div>
        </div>
      </section>

      {/* 2. Restaurant Story & Philosophy */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-[#E8E2D5]">
              <img
                src={story.image_url}
                alt={story.title}
                className="w-full h-[450px] object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Decorative Gold Badge */}
            <div className="absolute -bottom-6 -right-6 bg-[#173D2D] text-[#C6A15B] p-6 rounded-2xl shadow-xl border border-[#C6A15B]/40 hidden sm:block max-w-[220px]">
              <p className="font-heading font-bold text-3xl">100%</p>
              <p className="text-xs text-[#F7F3E8] mt-1 font-medium">
                Locally Foraged & Single-Estate Sourced
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-[#C6A15B] text-xs font-bold tracking-widest uppercase">
              <Utensils className="w-4 h-4" />
              <span>Our Culinary Philosophy</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold text-[#173D2D] leading-tight">
              {story.title}
            </h2>
            <h3 className="text-lg font-semibold text-[#C6A15B] italic">
              {story.subtitle}
            </h3>
            <p className="text-[#77786F] text-base leading-relaxed">
              {story.content}
            </p>
            <div className="pt-4 flex items-center gap-6">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#173D2D] hover:text-[#C6A15B] transition-colors border-b-2 border-[#C6A15B] pb-1"
              >
                <span>Discover Our Complete Heritage</span>
                <ChevronRight className="w-4 h-4 text-[#C6A15B]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Menu Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[#C6A15B] text-xs font-bold tracking-widest uppercase block mb-2">
            Artisanal Offerings
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#173D2D]">
            Curated Categories
          </h2>
          <p className="text-[#77786F] text-sm mt-3">
            From clay-oven roasted morsels to ancient slow-cooked curries and infused botanical elixirs.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/menu?category=${cat.slug}`}
              className="group bg-white rounded-2xl p-4 border border-[#E8E2D5] hover:border-[#C6A15B] transition-all hover:shadow-lg flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-[#E8E2D5] group-hover:border-[#C6A15B] transition-colors">
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=400&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h4 className="font-heading text-sm font-bold text-[#242820] group-hover:text-[#173D2D] line-clamp-1">
                {cat.name}
              </h4>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured & Bestselling Dishes */}
      <section className="bg-[#F7F3E8] py-20 border-y border-[#E8E2D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-[#C6A15B] text-xs font-bold tracking-widest uppercase block mb-2">
                Executive Chef's Selections
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#173D2D]">
                Signature Specialties
              </h2>
            </div>
            <Link
              to="/menu"
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-bold text-[#173D2D] hover:text-[#C6A15B] transition-colors"
            >
              <span>Explore All Dishes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredDishes.slice(0, 6).map((dish) => (
              <div
                key={dish.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#E8E2D5] hover:border-[#C6A15B]/50 transition-all shadow-sm hover:shadow-xl flex flex-col group"
              >
                {/* Dish Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={dish.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Dietary Badge */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs p-1.5 rounded-lg border border-[#E8E2D5]">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        dish.is_veg ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    />
                  </div>

                  {dish.is_bestseller && (
                    <span className="absolute top-3 right-3 bg-[#173D2D] text-[#C6A15B] text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow">
                      Bestseller
                    </span>
                  )}
                </div>

                {/* Dish Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-heading text-lg font-bold text-[#242820] group-hover:text-[#173D2D] transition-colors">
                        {dish.name}
                      </h4>
                      <span className="font-bold text-[#173D2D] text-lg shrink-0">
                        ₹{dish.base_price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-[#77786F] line-clamp-2 leading-relaxed mb-4">
                      {dish.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E8E2D5] flex items-center justify-between gap-3">
                    <Link
                      to={`/menu/${dish.slug}`}
                      className="text-xs font-semibold text-[#77786F] hover:text-[#173D2D] flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </Link>

                    <button
                      onClick={() => {
                        addToCart(dish);
                        toast.success(`Added ${dish.name} to cart.`);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#173D2D] text-[#F7F3E8] text-xs font-bold hover:bg-[#123023] transition-all flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#C6A15B]" />
                      <span>Add to Order</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Approved Testimonials */}
      {testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-[#C6A15B] text-xs font-bold tracking-widest uppercase block mb-2">
              Patron Experiences
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#173D2D]">
              Words from Our Guests
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-2xl p-8 border border-[#E8E2D5] shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 text-[#C6A15B] mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-[#242820] italic leading-relaxed mb-6">
                    "{t.comment}"
                  </p>
                </div>
                <div>
                  <h5 className="font-heading font-bold text-sm text-[#173D2D]">
                    {t.customer_name}
                  </h5>
                  {t.customer_title && (
                    <p className="text-xs text-[#77786F]">{t.customer_title}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Reservation Banner CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#173D2D] rounded-3xl p-8 sm:p-14 text-center text-[#F7F3E8] relative overflow-hidden shadow-2xl border border-[#C6A15B]/30">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="text-[#C6A15B] text-xs font-bold tracking-widest uppercase">
              Table Bookings & Intimate Soirées
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Reserve Your Table at Saffron & Sage
            </h2>
            <p className="text-sm sm:text-base text-[#F7F3E8]/80 leading-relaxed">
              Whether dining in our secluded courtyard or celebrating an anniversary in our private salon, reserve seamlessly with instant verification.
            </p>
            <div className="pt-2">
              <Link
                to="/reservations"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#C6A15B] text-[#173D2D] font-bold text-sm tracking-wider uppercase hover:bg-[#b59048] transition-all shadow-lg"
              >
                <span>Reserve a Table Online</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Location & Interactive Map Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-3xl p-8 border border-[#E8E2D5] shadow-sm items-center">
          <div className="space-y-6">
            <span className="text-[#C6A15B] text-xs font-bold tracking-widest uppercase">
              Visit Us in Bengaluru
            </span>
            <h2 className="font-heading text-3xl font-bold text-[#173D2D]">
              Hospitality & Coordinates
            </h2>
            <div className="space-y-4 text-sm text-[#77786F]">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#C6A15B] shrink-0 mt-0.5" />
                <span>{locationInfo.address || 'Plot 42, Heritage Boulevard, Indiranagar, Bengaluru 560038'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#C6A15B] shrink-0" />
                <span>{locationInfo.opening_hours || 'Mon - Sun: 12:00 PM – 11:30 PM'}</span>
              </div>
            </div>
            <div className="pt-2">
              <Link
                to="/location"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#173D2D] hover:text-[#C6A15B] transition-colors"
              >
                <span>View Directions & Parking Guide</span>
                <ChevronRight className="w-4 h-4 text-[#C6A15B]" />
              </Link>
            </div>
          </div>

          {/* Map Preview Embed */}
          <div className="h-64 sm:h-80 rounded-2xl overflow-hidden border border-[#E8E2D5] shadow-inner">
            <iframe
              title="Restaurant Location Map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              src={locationInfo.map_embed_url || "https://maps.google.com/maps?q=12.9716,77.6412&hl=en&z=15&output=embed"}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
