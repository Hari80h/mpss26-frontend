'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../lib/store';
import { calculateProfileCompletion } from '../../lib/mockData';
import { ArrowLeft, Camera, RefreshCw, Save, Trash2 } from 'lucide-react';

export const DelegateEditProfile: React.FC = () => {
  const router = useRouter();
  const { currentUser, updateCurrentUser, setActiveDelegateTab, showToast } = useStore();
  
  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    designation: currentUser.designation || '',
    company: currentUser.company || '',
    bio: currentUser.bio || '',
    linkedin: currentUser.linkedin || '',
    twitter: currentUser.twitter || '',
    email: currentUser.email || '',
    mobile: currentUser.mobile || '',
    avatar: currentUser.avatar || '',
  });

  const completionPercentage = calculateProfileCompletion(formData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        showToast('Image size should be under 3MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, avatar: reader.result as string }));
          showToast('Profile photo updated ✓', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearAll = () => {
    setFormData({
      name: '',
      designation: '',
      company: '',
      bio: '',
      linkedin: '',
      twitter: '',
      email: '',
      mobile: '',
      avatar: '',
    });
    showToast('All profile fields cleared', 'info');
  };

  const handleFillDemo = () => {
    setFormData({
      name: 'Hari Gupta',
      designation: 'CEO',
      company: 'EventSphere',
      bio: 'Founder & CEO building next-gen event engagement platforms.',
      linkedin: 'https://linkedin.com/in/harigupta',
      twitter: 'https://x.com/harigupta',
      email: 'hari@eventsphere.com',
      mobile: '+91 98765 43210',
      avatar: '/images/avatars/hari-gupta.png',
    });
    showToast('Demo profile loaded (100% complete)', 'success');
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateCurrentUser(formData);
      router.push('/delegate/profile');
    } catch {
      // toast shown by store
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-[#F6F4F0] flex flex-col relative h-full">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] px-3 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => router.push('/delegate/profile')}
            className="p-1.5 -ml-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#181818]" />
          </button>
          <h1 className="text-[15px] font-bold text-[#181818] tracking-tight">Edit Profile</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#181818] hover:bg-[#333] text-white text-[11.5px] font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="p-3 pb-4 overflow-y-auto space-y-3">
        
        {/* Compact Profile Completion */}
        <div className="bg-white py-2 px-3 rounded-[12px] border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold mb-1">
            <span className="text-[#6B6B6B] uppercase tracking-wider text-[10px]">Profile Completion</span>
            <span className={completionPercentage === 100 ? "text-[#16A34A] font-bold" : "text-[#181818]"}>
              {completionPercentage}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                completionPercentage === 100 ? 'bg-[#16A34A]' : 'bg-[#181818]'
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Centered Compact Profile Photo */}
        <div className="flex flex-col items-center justify-center py-1">
          <div className="relative">
            {formData.avatar ? (
              <img 
                src={formData.avatar} 
                alt="Profile Preview" 
                className="w-16 h-16 rounded-full object-cover border border-[#DEDCD7] shadow-xs" 
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#F6F4F0] border border-[#DEDCD7] text-[#181818] flex items-center justify-center font-bold text-lg shadow-xs">
                {formData.name ? formData.name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2) : '?'}
              </div>
            )}
            <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#181818] hover:bg-[#333] text-white rounded-full flex items-center justify-center shadow-md transition-colors cursor-pointer">
              <Camera className="w-3.5 h-3.5" />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handlePhotoUpload} 
              />
            </label>
          </div>
          <div className="flex items-center gap-2 mt-2 text-[12px]">
            <label className="font-semibold text-[#181818] hover:underline cursor-pointer">
              Change Photo
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handlePhotoUpload} 
              />
            </label>
            {formData.avatar && (
              <>
                <span className="text-[#D1D5DB]">·</span>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, avatar: '' }))}
                  className="font-medium text-[#DC2626] hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white p-3 rounded-[14px] border border-[#E5E7EB] shadow-xs space-y-2.5">
          <h2 className="text-[12.5px] font-bold text-[#181818] border-b border-[#F3F4F6] pb-2">Basic Info</h2>
          
          <div className="space-y-1">
            <label className="text-[11.5px] font-semibold text-[#6B6B6B]">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Hari Gupta"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-[#DEDCD7] text-[12.5px] focus:outline-none focus:ring-1 focus:ring-[#181818]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11.5px] font-semibold text-[#6B6B6B]">Designation / Job Title</label>
            <input
              type="text"
              name="designation"
              placeholder="e.g. CEO"
              value={formData.designation}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-[#DEDCD7] text-[12.5px] focus:outline-none focus:ring-1 focus:ring-[#181818]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11.5px] font-semibold text-[#6B6B6B]">Company Name</label>
            <input
              type="text"
              name="company"
              placeholder="e.g. EventSphere"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-[#DEDCD7] text-[12.5px] focus:outline-none focus:ring-1 focus:ring-[#181818]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11.5px] font-semibold text-[#6B6B6B]">Bio</label>
            <textarea
              name="bio"
              placeholder="A brief bio about yourself and your work..."
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[#DEDCD7] text-[12.5px] focus:outline-none focus:ring-1 focus:ring-[#181818] resize-none"
            />
          </div>
        </div>

        {/* Contact & Social Links */}
        <div className="bg-white p-3 rounded-[14px] border border-[#E5E7EB] shadow-xs space-y-3">
          <div className="border-b border-[#F3F4F6] pb-2">
            <h2 className="text-[12.5px] font-bold text-[#181818]">Contact & Social Information</h2>
            <p className="text-[11px] text-[#6B6B6B] mt-0.5">
              Add your contact details and LinkedIn to connect with attendees.
            </p>
          </div>
          
          <div className="space-y-1">
            <label className="text-[11.5px] font-semibold text-[#181818]">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="e.g. skvishvakarma@iiti.ac.in"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-[#DEDCD7] text-[12.5px] focus:outline-none focus:ring-1 focus:ring-[#181818]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11.5px] font-semibold text-[#181818]">Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              placeholder="e.g. +91 97137 22841"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-[#DEDCD7] text-[12.5px] focus:outline-none focus:ring-1 focus:ring-[#181818]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11.5px] font-semibold text-[#181818]">LinkedIn Profile</label>
            <input
              type="text"
              name="linkedin"
              placeholder="https://linkedin.com/in/username"
              value={formData.linkedin}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-[#DEDCD7] text-[12.5px] focus:outline-none focus:ring-1 focus:ring-[#181818]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11.5px] font-semibold text-[#181818]">Twitter / X Handle</label>
            <input
              type="text"
              name="twitter"
              placeholder="https://x.com/DrVishvakarma?lang=en"
              value={formData.twitter}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-[#DEDCD7] text-[12.5px] focus:outline-none focus:ring-1 focus:ring-[#181818]"
            />
          </div>
        </div>

        {/* Quick Testing Tools: Clear All & Fill Demo */}
        <div className="pt-1 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleClearAll}
            className="flex-1 py-2 px-3 rounded-xl border border-red-200 text-[#DC2626] hover:bg-red-50 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All (0%)</span>
          </button>

          <button
            type="button"
            onClick={handleFillDemo}
            className="flex-1 py-2 px-3 rounded-xl border border-[#DEDCD7] text-[#181818] hover:bg-gray-100 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Fill Demo (100%)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
