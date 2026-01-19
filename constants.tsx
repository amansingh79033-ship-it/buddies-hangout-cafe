
import React from 'react';
import { MenuItem, Book, Founder } from './types';

// Fix: Added missing 'available' property to each MenuItem as required by the interface definition
export const INITIAL_MENU: MenuItem[] = [
  { id: '1', name: 'Paneer Tikka Sliders', price: '₹349', category: 'Snacks', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=400', available: true },
  { id: '2', name: 'Masala Truffle Fries', price: '₹229', category: 'Snacks', image: 'https://images.unsplash.com/photo-1573082818143-2410bc47fe2e?auto=format&fit=crop&q=80&w=400', available: true },
  { id: '3', name: 'Fresh Watermelon Chill', price: '₹189', category: 'Beverages', image: 'https://images.unsplash.com/photo-1554260533-33e721013a7c?auto=format&fit=crop&q=80&w=400', available: true },
  { id: '4', name: 'Kesar Pista Shake', price: '₹249', category: 'Beverages', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=400', available: true },
  { id: '5', name: 'Blueberry Cheesecake', price: '₹299', category: 'Desserts', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=400', available: true },
  { id: '6', name: 'Zesty Nimbu Masala', price: '₹129', category: 'Beverages', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400', available: true },
  { id: '7', name: 'Vada Pav Sliders', price: '₹199', category: 'Snacks', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=400', available: true },
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

export const DEFAULT_QR = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://buddiescafe.space/menu';

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