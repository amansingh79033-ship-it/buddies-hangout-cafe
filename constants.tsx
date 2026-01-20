
import React from 'react';
import { MenuItem, Book, Founder } from './types';

// Fix: Added missing 'available' property to each MenuItem as required by the interface definition
export const INITIAL_MENU: MenuItem[] = [
  // Toasts & Sandwiches - categorized as Snacks
  { id: '1', name: 'Bread Jam', price: '₹40', category: 'Snacks', image: 'https://images.unsplash.com/photo-1603569283843-6aba9f46a010?auto=format&fit=crop&q=80&w=400', available: true },
  { id: '2', name: 'Bread Toast', price: '₹30', category: 'Snacks', image: 'https://images.unsplash.com/photo-1589370885509-2f04a162be2e?auto=format&fit=crop&q=80&w=400', available: true },
  { id: '3', name: 'Bread Butter', price: '₹40', category: 'Snacks', image: 'https://images.unsplash.com/photo-1506354666786-960f0477b6cc?auto=format&fit=crop&q=80&w=400', available: true },
  { id: '4', name: 'Bread with Peanut Butter', price: '₹40', category: 'Snacks', image: 'https://images.unsplash.com/photo-1622319080336-64014080dae1?auto=format&fit=crop&q=80&w=400', available: true },
  { id: '5', name: 'Bread with Nutella', price: '₹50', category: 'Snacks', image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=400', available: true },
  { id: '6', name: 'Garlic Bread', price: '₹40', category: 'Snacks', image: 'https://images.unsplash.com/photo-1589386350250-8b7e66b3d7e4?auto=format&fit=crop&q=80&w=400', available: true },
  { id: '7', name: 'Garlic Bread with Cheese', price: '₹60', category: 'Snacks', image: 'https://images.unsplash.com/photo-1622319080336-64014080dae1?auto=format&fit=crop&q=80&w=400', available: true },
  { id: '8', name: 'Bun Maska', price: '₹30', category: 'Snacks', image: 'https://images.unsplash.com/photo-1591946614722-2a5c7b5a17fe?auto=format&fit=crop&q=80&w=400', available: true },
  
  // Healthy Salads - categorized as Snacks
  { id: '9', name: 'Veg Salad', price: '₹30', category: 'Snacks', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400', available: true },
  
  // Add-Ons for Salads - categorized as Snacks
  { id: '10', name: 'Chickpea (Sundal)', price: '₹30', category: 'Snacks', image: 'https://images.unsplash.com/photo-1566599862423-09460587e3d5?auto=format&fit=crop&q=80&w=400', available: true },
  { id: '11', name: 'Cucumber', price: '₹30', category: 'Snacks', image: 'https://images.unsplash.com/photo-1542818212-9899bafcb9db?auto=format&fit=crop&q=80&w=400', available: true },
  { id: '12', name: 'Sweet Corn', price: '₹30', category: 'Snacks', image: 'https://images.unsplash.com/photo-1546803133-39701371ce41?auto=format&fit=crop&q=80&w=400', available: true },
  { id: '13', name: 'Green Gram', price: '₹30', category: 'Snacks', image: 'https://images.unsplash.com/photo-1603105037880-8802c0a1b3e9?auto=format&fit=crop&q=80&w=400', available: true },
  
  // Fruit Treats - categorized as Desserts
  { id: '14', name: 'Fruit Salad', price: '₹60', category: 'Desserts', image: 'https://images.unsplash.com/photo-1566599862423-09460587e3d5?auto=format&fit=crop&q=80&w=400', available: true },
  
  // Add-Ons for Fruit Treats - categorized as Desserts
  { id: '15', name: 'Ice Cream', price: '₹20', category: 'Desserts', image: 'https://images.unsplash.com/photo-1570293263471-3419e8f0ba0e?auto=format&fit=crop&q=80&w=400', available: true },
  { id: '16', name: 'Jelly', price: '₹10', category: 'Desserts', image: 'https://images.unsplash.com/photo-1566599862423-09460587e3d5?auto=format&fit=crop&q=80&w=400', available: true },
];

export const INITIAL_FOUNDERS: Founder[] = [
  {
    id: '1',
    name: 'Alex Chen',
    role: 'Creative Visionary',
    bio: 'Believes cafes should feel like high-fidelity concerts. Master of the modern aesthetic.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: '2',
    name: 'Maya Mobie',
    role: 'Experience Architect',
    bio: 'Dedicated to blending social spaces with seamless interactive tech.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600',
  }
];

export const INITIAL_BOOKS: Book[] = [
  { 
    id: '1', 
    title: 'The Cafe Culture', 
    author: 'A. Hangout', 
    cover: 'https://picsum.photos/seed/cafe/300/450', 
    summary: 'How spaces shape our social interactions.',
    content: `Chapter 1: The Third Space. 
    In modern sociology, the third space is the social surroundings separate from the two usual social environments of home and the workplace. Cafes have historically served as the cornerstone of intellectual exchange... 
    The smell of roasted beans, the soft hum of conversation, and the ambient music create a unique cognitive state where creativity flourishes.`
  },
  { 
    id: '2', 
    title: 'Digital Nomad Soul', 
    author: 'M. Mobie', 
    cover: 'https://picsum.photos/seed/nomad/300/450', 
    summary: 'Living and working in a connected world.',
    content: `Introduction: Freedom and Pixels.
    The era of the cubicle is ending. Today, the world is the office. From the beaches of Bali to the high-tech cafes of Tokyo, a new breed of worker is emerging. 
    But with freedom comes the need for community. Digital nomads seek 'Buddies'—spaces that offer both bandwidth and belonging.`
  },
];

export const DEFAULT_QR = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://buddycafehangout.vercel.app/menu';

export const SPONSOR_LOGO = (
  <div className="flex items-center space-x-3 opacity-90 hover:opacity-100 transition-opacity">
    <div className="flex flex-col text-[10px] font-syncopate tracking-[0.2em] leading-none text-right">
      <span className="text-gray-500">SUPPORTED BY</span>
      <span className="text-cyan-400 font-black">MOBIE</span>
    </div>
    <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center rotate-6 hover:rotate-0 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]">
      <span className="font-syncopate font-black text-white italic text-lg">M</span>
    </div>
  </div>
);