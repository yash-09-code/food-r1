import React, { useEffect, useState } from 'react';
import { Globe, Save, Check, Image, Sparkles } from 'lucide-react';
import { adminService } from '../services/restaurantService';
import { useToast } from '../context/ToastContext';

export const AdminWebsite: React.FC = () => {
  const toast = useToast();
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Hero Fields
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSub, setHeroSub] = useState('');
  const [heroImg, setHeroImg] = useState('');
  const [heroBtnText, setHeroBtnText] = useState('');

  // Story Fields
  const [storyTitle, setStoryTitle] = useState('');
  const [storySub, setStorySub] = useState('');
  const [storyContent, setStoryContent] = useState('');
  const [storyImg, setStoryImg] = useState('');

  // Announcement Fields
  const [annTitle, setAnnTitle] = useState('');
  const [annSub, setAnnSub] = useState('');

  const loadContent = async () => {
    setLoading(true);
    try {
      const data = await adminService.getWebsiteContent();
      setSections(data);
      const h = data.find((s: any) => s.section_key === 'hero');
      if (h) {
        setHeroTitle(h.title || '');
        setHeroSub(h.subtitle || '');
        setHeroImg(h.image_url || '');
        setHeroBtnText(h.button_text || '');
      }
      const st = data.find((s: any) => s.section_key === 'story');
      if (st) {
        setStoryTitle(st.title || '');
        setStorySub(st.subtitle || '');
        setStoryContent(st.content || '');
        setStoryImg(st.image_url || '');
      }
      const an = data.find((s: any) => s.section_key === 'announcement');
      if (an) {
        setAnnTitle(an.title || '');
        setAnnSub(an.subtitle || '');
      }
    } catch (err) {
      toast.error('Failed to load website content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.updateWebsiteContent('hero', {
        title: heroTitle,
        subtitle: heroSub,
        image_url: heroImg,
        button_text: heroBtnText,
      });
      toast.success('Hero section updated on live website.');
    } catch (err: any) {
      toast.error('Failed to update hero section.');
    }
  };

  const handleSaveStory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.updateWebsiteContent('story', {
        title: storyTitle,
        subtitle: storySub,
        content: storyContent,
        image_url: storyImg,
      });
      toast.success('Culinary story updated on live website.');
    } catch (err: any) {
      toast.error('Failed to update story section.');
    }
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.updateWebsiteContent('announcement', {
        title: annTitle,
        subtitle: annSub,
      });
      toast.success('Top announcement banner updated.');
    } catch (err: any) {
      toast.error('Failed to update announcement.');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-[#77786F]">Loading CMS contents...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div>
        <span className="text-xs font-bold text-[#C6A15B] uppercase tracking-wider">
          Content Management System
        </span>
        <h2 className="font-heading text-2xl font-bold text-[#173D2D]">
          Website Visuals & Text Content
        </h2>
        <p className="text-xs text-[#77786F] mt-1">
          Edit brand headlines, hero imagery, story narratives, and promotional alerts without writing code.
        </p>
      </div>

      {/* Hero Section Form */}
      <form onSubmit={handleSaveHero} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D5] shadow-xs space-y-4 text-xs">
        <h3 className="font-heading font-bold text-lg text-[#173D2D] pb-3 border-b border-[#E8E2D5]">
          1. Homepage Hero Banner
        </h3>

        <div className="space-y-1">
          <label className="font-bold text-[#173D2D]">Main Title / Headline</label>
          <input
            type="text"
            value={heroTitle}
            onChange={(e) => setHeroTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCFAF5]"
          />
        </div>

        <div className="space-y-1">
          <label className="font-bold text-[#173D2D]">Subtitle / Ambience Lead</label>
          <textarea
            rows={2}
            value={heroSub}
            onChange={(e) => setHeroSub(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCFAF5]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="font-bold text-[#173D2D]">Hero Background Image URL</label>
            <input
              type="text"
              value={heroImg}
              onChange={(e) => setHeroImg(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCFAF5]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#173D2D]">CTA Button Text</label>
            <input
              type="text"
              value={heroBtnText}
              onChange={(e) => setHeroBtnText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCFAF5]"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-[#173D2D] text-[#F7F3E8] font-bold uppercase tracking-wider hover:bg-[#123023] flex items-center gap-1.5 shadow"
        >
          <Save className="w-3.5 h-3.5 text-[#C6A15B]" />
          <span>Save Hero Changes</span>
        </button>
      </form>

      {/* Story Section Form */}
      <form onSubmit={handleSaveStory} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D5] shadow-xs space-y-4 text-xs">
        <h3 className="font-heading font-bold text-lg text-[#173D2D] pb-3 border-b border-[#E8E2D5]">
          2. Culinary Philosophy & Heritage Story
        </h3>

        <div className="space-y-1">
          <label className="font-bold text-[#173D2D]">Story Heading</label>
          <input
            type="text"
            value={storyTitle}
            onChange={(e) => setStoryTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCFAF5]"
          />
        </div>

        <div className="space-y-1">
          <label className="font-bold text-[#173D2D]">Story Subtitle</label>
          <input
            type="text"
            value={storySub}
            onChange={(e) => setStorySub(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCFAF5]"
          />
        </div>

        <div className="space-y-1">
          <label className="font-bold text-[#173D2D]">Story Narrative Body</label>
          <textarea
            rows={4}
            value={storyContent}
            onChange={(e) => setStoryContent(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCFAF5]"
          />
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-[#173D2D] text-[#F7F3E8] font-bold uppercase tracking-wider hover:bg-[#123023] flex items-center gap-1.5 shadow"
        >
          <Save className="w-3.5 h-3.5 text-[#C6A15B]" />
          <span>Save Story Changes</span>
        </button>
      </form>

      {/* Announcement Bar Form */}
      <form onSubmit={handleSaveAnnouncement} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D5] shadow-xs space-y-4 text-xs">
        <h3 className="font-heading font-bold text-lg text-[#173D2D] pb-3 border-b border-[#E8E2D5]">
          3. Top Announcement & Promotion Ribbon
        </h3>

        <div className="space-y-1">
          <label className="font-bold text-[#173D2D]">Announcement Title</label>
          <input
            type="text"
            value={annTitle}
            onChange={(e) => setAnnTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCFAF5]"
          />
        </div>

        <div className="space-y-1">
          <label className="font-bold text-[#173D2D]">Subtitle / Offer Details</label>
          <input
            type="text"
            value={annSub}
            onChange={(e) => setAnnSub(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCFAF5]"
          />
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-[#173D2D] text-[#F7F3E8] font-bold uppercase tracking-wider hover:bg-[#123023] flex items-center gap-1.5 shadow"
        >
          <Save className="w-3.5 h-3.5 text-[#C6A15B]" />
          <span>Save Announcement</span>
        </button>
      </form>
    </div>
  );
};
