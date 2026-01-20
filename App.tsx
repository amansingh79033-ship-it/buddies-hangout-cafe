
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import Lenis from 'lenis';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { 
  Utensils, 
  Settings, 
  Plus, 
  LogOut,
  Globe,
  CheckCircle2,
  Trash2,
  X,
  ChevronLeft,
  Loader2,
  ShoppingCart,
  Check,
  Mic,
  MicOff,
  History,
  LayoutGrid,
  ChefHat,
  Menu as Hamburger,
  Save,
  ImageIcon,
  QrCode,
  Lock,
  Edit,
  Volume2,
  VolumeX,
  Music,
  Zap,
  Star,
  Ticket,
  Flame,
  Award,
  Users,
  Palette,
  BookOpen,
  Upload,
  Calendar,
  UserPlus,
  Clock,
  Book as BookIcon,
  ArrowRight,
  Download,
  Minus,
  FileText,
  MapPin
} from 'lucide-react';
import { View, MenuItem, Order, OrderStatus, AdminSettings, PromoCode, CafeEvent, EventRegistration, Book, CartItem } from './types';
import { INITIAL_MENU, SPONSOR_LOGO, INITIAL_BOOKS } from './constants';

const BG_MUSIC_URL = 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3';

function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const STORAGE_KEYS = {
  MENU: 'buddies_menu_v11',
  ORDERS: 'buddies_orders_v11',
  CART: 'buddies_cart_v11',
  SETTINGS: 'buddies_settings_v11',
  VISITORS: 'buddies_visitors_v11',
  EVENTS: 'buddies_events_v11',
  REGISTRATIONS: 'buddies_registrations_v11'
};

const getStored = <T,>(key: string, fallback: T): T => {
  const saved = localStorage.getItem(key);
  try { return saved ? JSON.parse(saved) : fallback; } catch { return fallback; }
};

const INITIAL_EVENTS: CafeEvent[] = [
  { id: 'ev-1', title: 'Neon Jazz Night', date: '2024-05-20', description: 'Live jazz performance under neon lights.', price: 'Free Entry' },
  { id: 'ev-2', title: 'Acoustic Soul Sessions', date: '2024-05-22', description: 'Soulful acoustic covers with premium vibes.', price: '₹199' },
  { id: 'ev-3', title: 'DJ Low-Fi Beats', date: '2024-05-25', description: 'Late night lo-fi chill hop set.', price: 'Free Entry' }
];

const ThreeBackground = ({ color }: { color: string }) => {
  const knotRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const iconsGroupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 12;

    const knotGeo = new THREE.TorusKnotGeometry(10, 3, 128, 16);
    const knotMat = new THREE.MeshBasicMaterial({ color: color, wireframe: true, transparent: true, opacity: 0.1 });
    const knot = new THREE.Mesh(knotGeo, knotMat);
    knotRef.current = knot;
    scene.add(knot);

    const iconsGroup = new THREE.Group();
    iconsGroupRef.current = iconsGroup;
    scene.add(iconsGroup);

    // Food-themed snack and fruit geometries
    const createBurgerGeometry = () => {
      const group = new THREE.Group();
      
      // Bottom bun
      const bottomBun = new THREE.SphereGeometry(0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const bottomBunMesh = new THREE.Mesh(bottomBun, new THREE.MeshBasicMaterial({ color: '#e6bc5c' }));
      bottomBunMesh.position.y = -0.15;
      group.add(bottomBunMesh);
      
      // Patty
      const patty = new THREE.CylinderGeometry(0.25, 0.25, 0.1, 16);
      const pattyMesh = new THREE.Mesh(patty, new THREE.MeshBasicMaterial({ color: '#5d2c18' }));
      group.add(pattyMesh);
      
      // Top bun
      const topBun = new THREE.SphereGeometry(0.3, 16, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
      const topBunMesh = new THREE.Mesh(topBun, new THREE.MeshBasicMaterial({ color: '#e6bc5c' }));
      topBunMesh.position.y = 0.15;
      group.add(topBunMesh);
      
      return group;
    };

    const createPizzaSliceGeometry = () => {
      const group = new THREE.Group();
      
      // Base
      const base = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16);
      const baseMesh = new THREE.Mesh(base, new THREE.MeshBasicMaterial({ color: '#e6bc5c' }));
      group.add(baseMesh);
      
      // Pepperoni
      for (let i = 0; i < 5; i++) {
        const pepperoni = new THREE.CylinderGeometry(0.05, 0.05, 0.02, 8);
        const pepperoniMesh = new THREE.Mesh(pepperoni, new THREE.MeshBasicMaterial({ color: '#d62828' }));
        pepperoniMesh.position.set(
          (Math.random() - 0.5) * 0.4,
          0.03,
          (Math.random() - 0.5) * 0.4
        );
        group.add(pepperoniMesh);
      }
      
      return group;
    };

    const createAppleGeometry = () => {
      const group = new THREE.Group();
      
      // Apple body
      const appleBody = new THREE.SphereGeometry(0.25, 16, 16);
      const appleMesh = new THREE.Mesh(appleBody, new THREE.MeshBasicMaterial({ color: '#ff6b6b' }));
      group.add(appleMesh);
      
      // Stem
      const stem = new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8);
      const stemMesh = new THREE.Mesh(stem, new THREE.MeshBasicMaterial({ color: '#8b4513' }));
      stemMesh.position.y = 0.3;
      group.add(stemMesh);
      
      return group;
    };

    const createBananaGeometry = () => {
      const group = new THREE.Group();
      
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.2, 0, 0),
        new THREE.Vector3(0, 0.1, 0),
        new THREE.Vector3(0.2, 0, 0)
      ]);
      
      const bananaGeo = new THREE.TubeGeometry(curve, 16, 0.15, 8, false);
      const bananaMesh = new THREE.Mesh(bananaGeo, new THREE.MeshBasicMaterial({ color: '#ffd700' }));
      group.add(bananaMesh);
      
      return group;
    };

    const createCoffeeCupGeometry = () => {
      const group = new THREE.Group();
      
      // Cup
      const cup = new THREE.CylinderGeometry(0.2, 0.25, 0.3, 16);
      const cupMesh = new THREE.Mesh(cup, new THREE.MeshBasicMaterial({ color: '#8b4513' }));
      group.add(cupMesh);
      
      // Handle
      const handleCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.3, 0.1, 0),
        new THREE.Vector3(0.4, 0.15, 0),
        new THREE.Vector3(0.3, 0.2, 0)
      ]);
      const handleGeo = new THREE.TubeGeometry(handleCurve, 8, 0.05, 8, false);
      const handleMesh = new THREE.Mesh(handleGeo, new THREE.MeshBasicMaterial({ color: '#8b4513' }));
      group.add(handleMesh);
      
      return group;
    };

    const createIceCreamGeometry = () => {
      const group = new THREE.Group();
      
      // Cone
      const cone = new THREE.ConeGeometry(0.2, 0.3, 16);
      const coneMesh = new THREE.Mesh(cone, new THREE.MeshBasicMaterial({ color: '#d2691e' }));
      coneMesh.rotation.x = Math.PI;
      coneMesh.position.y = -0.15;
      group.add(coneMesh);
      
      // Ice cream scoop
      const scoop = new THREE.SphereGeometry(0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const scoopMesh = new THREE.Mesh(scoop, new THREE.MeshBasicMaterial({ color: '#ff69b4' }));
      scoopMesh.position.y = 0.1;
      group.add(scoopMesh);
      
      return group;
    };

    const iconGeos = [
      createBurgerGeometry(),
      createPizzaSliceGeometry(),
      createAppleGeometry(),
      createBananaGeometry(),
      createCoffeeCupGeometry(),
      createIceCreamGeometry(),
      new THREE.SphereGeometry(0.2, 16, 16), // Generic sphere for variety
      new THREE.TorusGeometry(0.2, 0.05, 12, 24) // Donut shape
    ];

    for (let i = 0; i < 50; i++) {
      const geoIndex = Math.floor(Math.random() * iconGeos.length);
      const geo = iconGeos[geoIndex];
      
      // Clone geometry to avoid sharing between meshes
      let mesh;
      if (geo instanceof THREE.Group) {
        // For groups, clone the entire group
        mesh = geo.clone();
        mesh.traverse(child => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshBasicMaterial({ 
              color: color, 
              wireframe: true, 
              transparent: true, 
              opacity: 0.3 
            });
          }
        });
      } else {
        // For single geometries
        const mat = new THREE.MeshBasicMaterial({ 
          color: color, 
          wireframe: true, 
          transparent: true, 
          opacity: 0.3 
        });
        mesh = new THREE.Mesh(geo.clone(), mat);
      }
      
      mesh.position.set(
        (Math.random() - 0.5) * 50, 
        (Math.random() - 0.5) * 50, 
        (Math.random() - 0.5) * 30
      );
      mesh.rotation.set(
        Math.random() * Math.PI, 
        Math.random() * Math.PI, 
        Math.random() * Math.PI
      );
      
      // Enhanced user data for more dynamic movement
      mesh.userData = { 
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.03,
          y: (Math.random() - 0.5) * 0.03,
          z: (Math.random() - 0.5) * 0.03
        },
        floatSpeed: (Math.random() - 0.5) * 0.008,
        originalPosition: mesh.position.clone(),
        bobOffset: Math.random() * Math.PI * 2,
        // Cursor interaction properties
        mouseInfluence: 0,
        targetScale: 1
      };
      
      iconsGroup.add(mesh);
    }

    const particlesGeometry = new THREE.BufferGeometry();
    const count = 1500;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * 50;
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({ size: 0.05, color: color, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    particlesRef.current = particles;
    scene.add(particles);

    let mouseX = 0, mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      
      knot.rotation.y += 0.0005; 
      knot.rotation.x += 0.0002;
      particles.rotation.y += 0.0002;
      
      iconsGroup.children.forEach(icon => {
        // Enhanced rotation with individual axis speeds
        icon.rotation.x += icon.userData.rotSpeed.x;
        icon.rotation.y += icon.userData.rotSpeed.y;
        icon.rotation.z += icon.userData.rotSpeed.z;
        
        // Bobbing motion with individual offsets
        const bobHeight = Math.sin(time * 0.5 + icon.userData.bobOffset) * 0.3;
        icon.position.y = icon.userData.originalPosition.y + bobHeight;
        
        // Cursor interaction - calculate distance to mouse position
        const screenPos = icon.position.clone().project(camera);
        const mouseDistance = Math.sqrt(
          Math.pow(screenPos.x - mouseX, 2) + 
          Math.pow(screenPos.y - (-mouseY), 2)
        );
        
        // Smooth influence based on proximity
        const maxDistance = 0.8;
        const influence = Math.max(0, 1 - (mouseDistance / maxDistance));
        
        // Apply mouse influence to scaling and movement
        icon.userData.mouseInfluence += (influence - icon.userData.mouseInfluence) * 0.1;
        icon.userData.targetScale = 1 + icon.userData.mouseInfluence * 0.5;
        
        // Scale animation
        const currentScale = icon.scale.x;
        const targetScale = icon.userData.targetScale;
        icon.scale.setScalar(currentScale + (targetScale - currentScale) * 0.1);
        
        // Subtle position attraction toward cursor when close
        if (icon.userData.mouseInfluence > 0.1) {
          const attractionStrength = icon.userData.mouseInfluence * 0.002;
          const worldMouseX = mouseX * 15;
          const worldMouseY = -mouseY * 10;
          
          icon.position.x += (worldMouseX - icon.position.x) * attractionStrength;
          icon.position.z += (0 - icon.position.z) * attractionStrength * 0.5;
        }
        
        // Gentle color pulsing when interacting
        if (icon instanceof THREE.Mesh) {
          const pulseIntensity = icon.userData.mouseInfluence * 0.3;
          ((icon.material as THREE.MeshBasicMaterial).color as THREE.Color).lerp(
            new THREE.Color(color), 
            1 - pulseIntensity
          );
        } else if (icon instanceof THREE.Group) {
          icon.traverse(child => {
            if (child instanceof THREE.Mesh) {
              const pulseIntensity = icon.userData.mouseInfluence * 0.3;
              ((child.material as THREE.MeshBasicMaterial).color as THREE.Color).lerp(
                new THREE.Color(color), 
                1 - pulseIntensity
              );
            }
          });
        }
      });

      camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 1.5 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => { 
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (knotRef.current) (knotRef.current.material as THREE.MeshBasicMaterial).color.set(color);
    if (particlesRef.current) (particlesRef.current.material as THREE.PointsMaterial).color.set(color);
    if (iconsGroupRef.current) {
      iconsGroupRef.current.children.forEach(icon => {
        if (icon instanceof THREE.Mesh) {
          ((icon.material as THREE.MeshBasicMaterial).color as THREE.Color).lerp(new THREE.Color(color), 0.1);
        } else if (icon instanceof THREE.Group) {
          icon.traverse(child => {
            if (child instanceof THREE.Mesh) {
              ((child.material as THREE.MeshBasicMaterial).color as THREE.Color).lerp(new THREE.Color(color), 0.1);
            }
          });
        }
      });
    }
  }, [color]);

  return null;
};

// Lenis utility functions for global scroll control
const scrollToTop = () => {
  const lenis = (window as any).lenis;
  if (lenis) {
    lenis.scrollTo(0, { offset: 0, duration: 1.5, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const scrollToElement = (selector: string, offset: number = 0) => {
  const lenis = (window as any).lenis;
  const element = document.querySelector(selector);
  if (lenis && element) {
    lenis.scrollTo(element, { offset, duration: 1.2 });
  } else if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const stopScroll = () => {
  const lenis = (window as any).lenis;
  if (lenis) {
    lenis.stop();
  }
};

const startScroll = () => {
  const lenis = (window as any).lenis;
  if (lenis) {
    lenis.start();
  }
};

const Tooltip = ({ message }: { message: string }) => (
  <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[110] bg-red-600 text-white px-6 py-3 rounded-full font-syncopate font-black text-[10px] uppercase tracking-widest shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-in slide-in-from-top-4 fade-in">
    {message}
  </div>
);

export default function App() {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSecondaryOpen, setIsSecondaryOpen] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [vibe, setVibe] = useState('#ef4444');
  const [cartAnimate, setCartAnimate] = useState(false);
  
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [menu, setMenu] = useState<MenuItem[]>(() => getStored(STORAGE_KEYS.MENU, INITIAL_MENU));
  const [orders, setOrders] = useState<Order[]>(() => getStored(STORAGE_KEYS.ORDERS, []));
  const [cart, setCart] = useState<CartItem[]>(() => getStored(STORAGE_KEYS.CART, []));
  const [events, setEvents] = useState<CafeEvent[]>(() => getStored(STORAGE_KEYS.EVENTS, INITIAL_EVENTS));
  const [registrations, setRegistrations] = useState<EventRegistration[]>(() => getStored(STORAGE_KEYS.REGISTRATIONS, []));
  const [settings, setSettings] = useState<AdminSettings>(() => getStored(STORAGE_KEYS.SETTINGS, {
    password: 'admin890',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://buddycafehangout.vercel.app/menu',
    lastUpdated: new Date().toISOString(),
    promo: {
        code: 'WELCOME50',
        discount: '50% OFF',
        shortDescription: 'Get 50% off on your first order!',
        fullDetails: 'Applicable on all snacks and beverages. Max discount ₹200. Valid for new users only.',
        isActive: false
    }
  }));

  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [timers, setTimers] = useState<{[orderId: string]: ReturnType<typeof setTimeout>}>({});
  const sessionRef = useRef<any>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);

  const activeOrder = useMemo(() => orders.find(o => o.status === OrderStatus.PENDING), [orders]);
  const isLocked = !!activeOrder && !isAdmin;

  useEffect(() => {
    if (cart.length > 0) {
      setCartAnimate(true);
      const timer = setTimeout(() => setCartAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cart.length]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
    window.dispatchEvent(new Event('storage'));
  }, [menu, orders, cart, settings, events, registrations]);

  useEffect(() => {
    const handleStorageSync = () => {
      setMenu(getStored(STORAGE_KEYS.MENU, INITIAL_MENU));
      setOrders(getStored(STORAGE_KEYS.ORDERS, []));
      setSettings(getStored(STORAGE_KEYS.SETTINGS, settings));
      setEvents(getStored(STORAGE_KEYS.EVENTS, INITIAL_EVENTS));
      setRegistrations(getStored(STORAGE_KEYS.REGISTRATIONS, []));
    };
    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, []);
  
  // Cleanup timers when component unmounts
  useEffect(() => {
    return () => {
      Object.values(timers).forEach(timer => clearTimeout(timer));
    };
  }, [timers]);

  // Global Lenis smooth scroll setup with enhanced animations
  useEffect(() => {
    // Function to update scroll-based animations
    const updateScrollAnimations = (scrollValue: number) => {
      // Parallax effect for background elements
      const parallaxElements = document.querySelectorAll('.parallax-element');
      parallaxElements.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-parallax-speed') || '0.5');
        const yPos = -(scrollValue * speed);
        (el as HTMLElement).style.transform = `translateY(${yPos}px)`;
      });
      
      // Fade-in elements as they come into view
      const fadeElements = document.querySelectorAll('.scroll-fade');
      fadeElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
        
        if (isVisible) {
          const scrollPercentage = Math.max(0, Math.min(1, 1 - (rect.top / window.innerHeight)));
          (el as HTMLElement).style.opacity = Math.min(1, scrollPercentage * 2).toString();
          (el as HTMLElement).style.transform = `translateY(${50 * (1 - scrollPercentage)}px)`;
        }
      });
      
      // Scale elements based on scroll position
      const scaleElements = document.querySelectorAll('.scroll-scale');
      scaleElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
        
        if (isVisible) {
          const scrollPercentage = Math.max(0, Math.min(1, 1 - (rect.top / window.innerHeight)));
          const scaleValue = 0.8 + (0.2 * scrollPercentage);
          (el as HTMLElement).style.transform = `scale(${scaleValue})`;
        }
      });
    };
    
    // Configure Lenis for global smooth scrolling with enhanced settings
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    // Enhanced scroll event handler with animation effects
    const handleScroll = (e: any) => {
      // Update scroll position for animations
      lenis.raf(Date.now());
      
      // Trigger scroll animations
      updateScrollAnimations(lenis.scroll);
    };

    // Animation frame loop with scroll tracking
    function raf(time: number) {
      lenis.raf(time);
      
      // Update scroll animations based on scroll position
      updateScrollAnimations(lenis.scroll);
      
      requestAnimationFrame(raf);
    }
    
    requestAnimationFrame(raf);

    // Add global scroll listeners
    document.addEventListener('wheel', handleScroll, { passive: false });
    document.addEventListener('touchmove', handleScroll, { passive: false });
    
    // Store lenis instance globally for access from anywhere
    (window as any).lenis = lenis;

    return () => {
      lenis.destroy();
      document.removeEventListener('wheel', handleScroll);
      document.removeEventListener('touchmove', handleScroll);
      delete (window as any).lenis;
    };
  }, []);

  const triggerTooltip = useCallback((msg: string) => {
    setTooltip(msg);
    setTimeout(() => setTooltip(null), 3000);
  }, []);

  const navigateTo = useCallback((view: View) => {
    // Enhanced lock logic: restrict all views except admin login when locked and not admin
    if (isLocked && !isAdmin && view !== View.ADMIN) {
      triggerTooltip("Access Restricted: Order in Progress. Admin access only.");
      // Force redirect to a waiting screen or show login prompt
      if (currentView !== View.HOME) {
        setCurrentView(View.HOME);
      }
      return;
    }
    setCurrentView(view);
    setIsCartOpen(false);
    setIsSecondaryOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [isLocked, isAdmin, triggerTooltip, currentView]);

  const toggleMute = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(BG_MUSIC_URL);
      audioRef.current.loop = true;
    }
    audioRef.current.volume = 1.0;
    if (isMuted) {
      audioRef.current.play().catch(console.error);
      setIsMuted(false);
    } else {
      audioRef.current.pause();
      setIsMuted(true);
    }
  };

  const registerAttendance = (ev: CafeEvent) => {
    const reg: EventRegistration = {
      id: `REG-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      eventId: ev.id,
      eventName: ev.title,
      timestamp: new Date().toLocaleString()
    };
    setRegistrations(prev => [reg, ...prev]);
    triggerTooltip(`Registered for ${ev.title}!`);
  };

  const handleAddToCart = useCallback((item: MenuItem, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { item, quantity }];
    });
  }, []);

  const toggleVoiceControl = async () => {
    if (isVoiceActive) {
      if (sessionRef.current) sessionRef.current.close();
      setIsVoiceActive(false);
      triggerTooltip('Voice Hub: OFF');
      return;
    }
    
    setIsConnecting(true);
    try {
      if (!inputContextRef.current) inputContextRef.current = new AudioContext({ sampleRate: 16000 });
      if (!outputContextRef.current) outputContextRef.current = new AudioContext({ sampleRate: 24000 });
      await inputContextRef.current.resume();
      await outputContextRef.current.resume();

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const addToCartTool: FunctionDeclaration = {
        name: 'addToCart',
        parameters: {
          type: Type.OBJECT,
          description: 'Add an item to the cart or increase quantity of an existing item.',
          properties: { 
            itemName: { type: Type.STRING, description: 'Name of the menu item' },
            quantity: { type: Type.NUMBER, description: 'Quantity to add, default is 1' }
          },
          required: ['itemName']
        }
      };

      const navigateToViewTool: FunctionDeclaration = {
        name: 'navigateToView',
        parameters: {
          type: Type.OBJECT,
          description: 'Navigate the user to allowed pages: Home, Menu, Story, History, Checkout.',
          properties: { 
            view: { type: Type.STRING, description: 'Target view: home, menu, story, history, checkout' } 
          },
          required: ['view']
        }
      };

      const recommendItemsTool: FunctionDeclaration = {
        name: 'recommendItems',
        parameters: {
          type: Type.OBJECT,
          description: 'Advise the user on what else they can add to their cart.',
          properties: { suggestionReason: { type: Type.STRING } }
        }
      };

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsVoiceActive(true);
            triggerTooltip('Voice Hub: ONLINE');
            const source = inputContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const data = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(data.length);
              for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputContextRef.current!.destination);
          },
          onmessage: async (m: LiveServerMessage) => {
            if (m.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
              const base64 = m.serverContent.modelTurn.parts[0].inlineData.data;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputContextRef.current!.currentTime);
              const buf = await decodeAudioData(decode(base64), outputContextRef.current!, 24000, 1);
              const src = outputContextRef.current!.createBufferSource();
              src.buffer = buf;
              src.connect(outputContextRef.current!.destination);
              src.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buf.duration;
            }
            if (m.toolCall) {
              for (const fc of m.toolCall.functionCalls) {
                if (fc.name === 'addToCart') {
                  const target = (fc.args as any).itemName.toLowerCase();
                  const qty = (fc.args as any).quantity || 1;
                  const found = menu.find(i => i.name.toLowerCase().includes(target));
                  if (found) {
                    handleAddToCart(found, qty);
                    triggerTooltip(`Voice Hub: ${found.name} x${qty} added!`);
                    sessionPromise.then(s => s.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: `Successfully added ${qty} ${found.name}.` } } }));
                  } else {
                    sessionPromise.then(s => s.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: `Menu item not found.` } } }));
                  }
                }
                if (fc.name === 'navigateToView') {
                  const viewStr = (fc.args as any).view.toLowerCase();
                  let v: View | null = null;
                  if (viewStr === 'home') v = View.HOME;
                  if (viewStr === 'menu') v = View.MENU;
                  if (viewStr === 'history') v = View.HISTORY;
                  if (viewStr === 'story') v = View.ABOUT;
                  if (viewStr === 'checkout') v = View.CHECKOUT;

                  if (v) {
                    navigateTo(v);
                    sessionPromise.then(s => s.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: `Navigating to ${viewStr}.` } } }));
                  } else {
                    sessionPromise.then(s => s.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: `Page ${viewStr} restricted or not found.` } } }));
                  }
                }
                if (fc.name === 'recommendItems') {
                  const suggestions = menu.filter(i => i.isSpecial || i.available).slice(0, 3).map(i => i.name).join(', ');
                  sessionPromise.then(s => s.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: `Advised adding: ${suggestions}.` } } }));
                }
              }
            }
          },
          onclose: () => setIsVoiceActive(false),
          onerror: () => setIsVoiceActive(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          tools: [{ functionDeclarations: [addToCartTool, navigateToViewTool, recommendItemsTool] }],
          systemInstruction: `Buddy's Hangout Cafe Concierge. Menu: ${menu.map(i => i.name).join(', ')}. Assist with cart quantities, advice, and navigation between Home, Menu, Story, History, and Checkout.`
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      setIsConnecting(false);
      triggerTooltip('Mic access error.');
    }
  };

  const exportInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const itemsHtml = order.cartItems ? 
      order.cartItems.map(ci => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee"><span>${ci.item.name} x ${ci.quantity}</span><span>₹${parseInt(ci.item.price.replace('₹','')) * ci.quantity}</span></div>`).join('') :
      order.items.map(i => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee"><span>${i.name}</span><span>${i.price}</span></div>`).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>BUDDY'S HANGOUT CAFE INVOICE ${order.id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; }
            .header { border-bottom: 3px solid #ef4444; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
            .total { font-size: 24px; font-weight: 900; color: #ef4444; text-align: right; margin-top: 30px; }
            .footer { margin-top: 60px; text-align: center; border-top: 1px solid #eee; padding-top: 20px; font-size: 10px; color: #999; }
          </style>
        </head>
        <body>
          <div class="header">
            <div><h1 style="margin:0;font-family:Syncopate">BUDDY'S HANGOUT CAFE</h1><p style="margin:5px 0 0 0">Order ${order.id}</p></div>
            <div style="text-align:right"><p style="margin:0">TABLE ${order.tableNumber}</p><p style="margin:5px 0 0 0">${order.createdAt}</p></div>
          </div>
          <div style="margin-top:40px">${itemsHtml}</div>
          <div class="total">GRAND TOTAL: ${order.total}</div>
          <div class="footer">STAY TUNED. SYNC GLOBALLY. NO SMOKING ALLOWED.</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const renderView = () => {
    // Show admin login screen when navigating to admin view while locked and not admin
    if (isLocked && !isAdmin && currentView === View.ADMIN) {
      return (
        <AdminLogin password={settings.password} onLogin={() => setIsAdmin(true)} />
      );
    }
    
    // Show admin-only access view when locked and not admin (and not on admin view)
    if (isLocked && !isAdmin) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-10 p-4">
          <div className="text-center max-w-md space-y-6">
            <div className="w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Lock className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-3xl font-syncopate font-black uppercase tracking-tighter text-red-500">ACCESS RESTRICTED</h2>
            <p className="text-gray-400 font-light">An order is currently in progress. Only admin access is permitted.</p>
            
            <div className="pt-6">
              <button 
                onClick={() => navigateTo(View.ADMIN)} 
                className="py-4 px-8 bg-red-600 hover:bg-red-700 rounded-full font-syncopate font-black uppercase text-[10px] transition-all"
              >
                Admin Login
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // Show waiting room for admin users when locked
    if (isLocked && isAdmin) {
      return (
        <div className="flex flex-col gap-10">
          <WaitingReadingRoom order={activeOrder!} books={INITIAL_BOOKS} />
          <div className="flex flex-col sm:flex-row justify-center gap-6 pb-20">
             <button onClick={() => navigateTo(View.CHECKOUT)} className="py-4 px-10 glass border-red-500/20 hover:bg-red-600 rounded-full font-syncopate font-black uppercase text-[10px] transition-all flex items-center gap-3">
               <History className="w-4 h-4" /> Go to Checkout & History
             </button>
             <button onClick={() => navigateTo(View.HOME)} className="py-4 px-10 glass border-white/10 hover:bg-white hover:text-black rounded-full font-syncopate font-black uppercase text-[10px] transition-all">
               Home
             </button>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case View.HOME: return <HomeView setView={navigateTo} promo={settings.promo} menu={menu} events={events} onRegister={registerAttendance} onAdd={handleAddToCart} onTriggerTooltip={triggerTooltip} />;
      case View.MENU: return <MenuView menu={menu} cart={cart} onAdd={handleAddToCart} onTriggerTooltip={triggerTooltip} />;
      case View.HISTORY: return <HistoryView orders={orders} onExport={exportInvoice} />;
      case View.ABOUT: return <OurStoryView />;
      case View.CHECKOUT: return (
        <CheckoutView 
          cart={cart} 
          orders={orders}
          qrCodeUrl={settings.qrCodeUrl} 
          onPay={() => {
            const totalVal = cart.reduce((acc, curr) => acc + (parseInt(curr.item.price.replace('₹', '')) * curr.quantity), 0);
            const newOrder: Order = {
              id: `BUD-${Date.now().toString().slice(-4)}`,
              items: cart.flatMap(ci => Array(ci.quantity).fill(ci.item)),
              cartItems: [...cart],
              total: `₹${totalVal}`,
              status: OrderStatus.PENDING,
              tableNumber: Math.floor(Math.random() * 20 + 1).toString(),
              createdAt: new Date().toLocaleTimeString(),
              estimatedTime: 'Pending Sync...'
            };
            setOrders(prev => [newOrder, ...prev]);
            setCart([]);
            navigateTo(View.HISTORY);
          }} 
          onCancel={() => navigateTo(View.MENU)} 
          onExport={exportInvoice}
        />
      );
      case View.ADMIN: return isAdmin ? (
        <AdminDashboard 
          orders={orders} 
          setOrders={setOrders} 
          menu={menu} 
          setMenu={setMenu} 
          events={events}
          setEvents={setEvents}
          registrations={registrations}
          setRegistrations={setRegistrations}
          settings={settings} 
          setSettings={setSettings} 
          onLogout={() => setIsAdmin(false)} 
          timers={timers}
          setTimers={setTimers}
        />
      ) : (
        <AdminLogin password={settings.password} onLogin={() => setIsAdmin(true)} />
      );
      default: return <HomeView setView={navigateTo} promo={settings.promo} menu={menu} events={events} onRegister={registerAttendance} onAdd={handleAddToCart} onTriggerTooltip={triggerTooltip} />;
    }
  };

  return (
    <div className="min-h-screen text-white relative transition-colors duration-700 bg-black overflow-hidden">
      <ThreeBackground color={vibe} />
      {tooltip && <Tooltip message={tooltip} />}
      
      <nav className={`fixed top-0 left-0 right-0 z-[60] glass px-4 sm:px-8 py-3.5 flex items-center justify-between transition-opacity ${isLocked ? 'opacity-40' : 'opacity-100'} relative`}>
        <div className="flex items-center space-x-3 cursor-pointer group trigger-btn" onClick={() => navigateTo(View.HOME)}>
          <div className="relative p-2.5 bg-red-600 rounded-xl group-hover:rotate-12 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-syncopate font-black text-lg tracking-tighter uppercase leading-none">BUDDY'S</span>
            <span className="text-[9px] font-syncopate uppercase tracking-widest text-red-500 font-bold">HANGOUT CAFE</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <button onClick={toggleMute} className="p-3 glass rounded-2xl border border-white/5 hover:border-red-500 transition-all trigger-btn">
            {isMuted ? <VolumeX className="w-5 h-5 text-gray-500" /> : <Volume2 className="w-5 h-5 text-red-500" />}
          </button>
          
          {cart.length > 0 && (
            <button 
              onClick={() => setIsCartOpen(true)} 
              className={`p-3 glass rounded-2xl border border-red-500/20 trigger-btn relative transition-all duration-300 animate-in fade-in slide-in-from-right-2 hover:border-red-500 ${cartAnimate ? 'scale-125 pulse-red' : 'scale-100'}`}
            >
              <ShoppingCart className="w-5 h-5 text-red-500" />
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-lg">{cart.reduce((a, b) => a + b.quantity, 0)}</span>
            </button>
          )}

          <button onClick={() => setIsSecondaryOpen(!isSecondaryOpen)} className="p-3 glass rounded-2xl border border-white/10 trigger-btn active:scale-95 transition-all">
            <Hamburger className="w-5 h-5" />
          </button>
        </div>
        
        {/* Curved bottom edge similar to qoder.com */}
        <div className="absolute bottom-0 left-0 right-0 h-4 overflow-hidden pointer-events-none">
          <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,10 C25,5 75,5 100,10 L100,0 L0,0 Z" fill="var(--glass-bg, rgba(0,0,0,0.3))" />
          </svg>
        </div>
      </nav>

      <CartOverlay isOpen={isCartOpen && !isLocked} cart={cart} setCart={setCart} onClose={() => setIsCartOpen(false)} onCheckout={() => navigateTo(View.CHECKOUT)} />
      
      <div className={`fixed inset-y-0 right-0 z-[100] w-full sm:w-[350px] glass border-l border-red-500/20 transition-transform duration-500 ease-in-out overlay-container ${isSecondaryOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col p-10 space-y-8 overflow-y-auto custom-scrollbar">
           <div className="flex justify-between items-center border-b border-white/5 pb-6">
              <h3 className="text-xl font-syncopate font-black uppercase tracking-widest text-red-500">OPTIONS</h3>
              <button onClick={() => setIsSecondaryOpen(false)} className="p-2 hover:bg-white/10 rounded-full"><X /></button>
           </div>
           
           <div className="flex flex-col gap-4">
           {[
             { l: 'HOME', v: View.HOME, i: Globe },
             { l: 'THE MENU', v: View.MENU, i: LayoutGrid },
             { l: 'OUR STORY', v: View.ABOUT, i: BookOpen },
             { l: 'HISTORY & INVOICE', v: View.HISTORY, i: History },
             { l: 'CHECKOUT', v: View.CHECKOUT, i: CheckCircle2 }
           ].map(item => (
             <button key={item.l} onClick={() => navigateTo(item.v)} className="flex items-center space-x-6 text-xl font-syncopate font-black uppercase tracking-tighter hover:text-red-500 transition-all text-left group">
               <div className="p-3 bg-white/5 rounded-xl group-hover:bg-red-500/10 group-hover:text-red-500 transition-all">
                 <item.i className="w-6 h-6" />
               </div>
               <span>{item.l}</span>
             </button>
           ))}
           </div>

           <div className="border-t border-white/5 pt-8 space-y-4">
              <button onClick={toggleVoiceControl} className="flex items-center space-x-6 text-xl font-syncopate font-black uppercase tracking-tighter hover:text-red-500 transition-all text-left group">
                <div className={`p-3 rounded-xl transition-all ${isVoiceActive ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-white/5 group-hover:bg-red-500/10 group-hover:text-red-500'}`}>
                  {isConnecting ? <Loader2 className="w-6 h-6 animate-spin" /> : isVoiceActive ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </div>
                <span>VOICE HUB</span>
              </button>
           </div>
        </div>
      </div>

      <main className={`pt-24 pb-20 px-4 sm:px-8 relative z-10 max-w-7xl mx-auto min-h-screen transition-opacity duration-300 ${isSecondaryOpen || isCartOpen ? 'opacity-30 pointer-events-none blur-sm' : 'opacity-100'}`}>
        {renderView()}
        {/* Timer Modal for orders with estimated time */}
        {activeOrder && activeOrder.estimatedTime && (
          <TimerModal 
            order={activeOrder} 
            isVisible={!!activeOrder.estimatedTime} 
            onClose={() => {}} // No close button since it's tied to active order
          />
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-50 py-5 px-8 flex flex-col sm:flex-row justify-between items-center bg-gradient-to-t from-black to-transparent pointer-events-none gap-4">
        <div className="flex items-center gap-3 opacity-60">
           <button onClick={() => navigateTo(View.ADMIN)} className="pointer-events-auto text-[9px] font-syncopate uppercase tracking-[0.2em] italic text-red-500/80 hover:text-red-500 transition-all">a curiousminds dev</button>
        </div>
        <div className="pointer-events-auto active:scale-95 transition-all opacity-50 hover:opacity-100 scale-75 sm:scale-100">
          <button 
            onClick={() => setVibe(vibe === '#ef4444' ? '#06b6d4' : vibe === '#06b6d4' ? '#f59e0b' : '#ef4444')}
            className="pointer-events-auto p-4 glass rounded-2xl border border-white/10 hover:border-red-500 shadow-xl"
          >
            <Palette className="w-6 h-6" style={{ color: vibe }} />
          </button>
        </div>
      </footer>
    </div>
  );
}

function WaitingReadingRoom({ order, books }: { order: Order, books: Book[] }) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  return (
    <div className="space-y-12 py-10 animate-in fade-in duration-700">
      <div className="glass p-10 rounded-[3rem] border-red-500/20 text-center space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-500 mb-4 animate-pulse"><Clock className="w-8 h-8" /></div>
          <h2 className="text-3xl font-syncopate font-black uppercase tracking-tighter text-red-500">YOUR JOURNEY HAS BEGUN</h2>
          <p className="text-xs font-syncopate font-black uppercase opacity-60">ORDER #{order.id} IS {order.status.toUpperCase()}</p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-10 pt-4">
          <div className="space-y-1"><p className="text-[9px] font-syncopate font-black uppercase opacity-40">ESTIMATED WAIT</p><p className="text-2xl font-syncopate font-black text-white">{order.estimatedTime || '---'}</p></div>
          <div className="space-y-1"><p className="text-[9px] font-syncopate font-black uppercase opacity-40">TABLE NO.</p><p className="text-2xl font-syncopate font-black text-white">{order.tableNumber}</p></div>
        </div>
      </div>
      <div className="space-y-8">
        <div className="flex items-center gap-3"><BookIcon className="w-6 h-6 text-red-500" /><h3 className="text-xl font-syncopate font-black uppercase tracking-widest">DIGITAL LIBRARY</h3></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {books.map(book => (
            <div key={book.id} onClick={() => setSelectedBook(book)} className="glass p-8 rounded-[3rem] border-white/5 hover:border-red-500/30 transition-all group cursor-pointer flex flex-col gap-6">
              <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl"><img src={book.cover} className="w-full h-full object-cover group-hover:scale-110 transition-all" alt={book.title} /></div>
              <div className="space-y-2"><h4 className="text-lg font-syncopate font-black uppercase tracking-tighter truncate">{book.title}</h4><p className="text-[10px] text-red-500 font-syncopate font-black uppercase">By {book.author}</p></div>
              <button className="mt-auto py-3 bg-white/5 group-hover:bg-red-600 rounded-xl text-[9px] font-syncopate font-black uppercase transition-all">READ NOW</button>
            </div>
          ))}
        </div>
      </div>
      {selectedBook && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={() => setSelectedBook(null)} />
          <div className="relative glass p-10 sm:p-14 rounded-[4rem] max-w-4xl w-full max-h-[85vh] overflow-y-auto custom-scrollbar border-red-500/20 space-y-10 animate-in zoom-in-95">
             <div className="flex justify-between items-start"><div><h3 className="text-3xl font-syncopate font-black text-red-500 uppercase">{selectedBook.title}</h3><p className="text-[10px] font-syncopate font-black uppercase opacity-60">WRITTEN BY {selectedBook.author}</p></div><button onClick={() => setSelectedBook(null)} className="p-3 bg-white/5 hover:bg-red-600/20 rounded-xl transition-all"><X /></button></div>
             <div className="text-lg text-gray-300 leading-relaxed font-playfair space-y-6">{selectedBook.content.split('\n').map((para, i) => <p key={i}>{para.trim()}</p>)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function HomeView({ setView, promo, menu, events, onRegister, onAdd, onTriggerTooltip }: any) {
  const visitors = useMemo(() => Math.floor(Math.random() * 20 + 30), []);
  const specials = useMemo(() => menu.filter((i: MenuItem) => i.isSpecial && i.available), [menu]);
  return (
    <div className="space-y-20 animate-in fade-in duration-1000 scroll-fade" data-scroll-fade="true">
      <div className="flex flex-col items-center justify-center py-6 sm:py-12 text-center space-y-8 scroll-fade" data-scroll-fade="true">
        {promo.isActive && <div className="w-full max-w-2xl py-3 px-6 bg-red-600 rounded-full flex items-center justify-center gap-3 animate-bounce shadow-[0_0_40px_rgba(239,68,68,0.4)]"><Ticket className="w-5 h-5 text-white" /><span className="font-syncopate font-black uppercase text-[10px] tracking-widest text-white">{promo.code} • {promo.shortDescription}</span></div>}
        <div className="relative mt-2"><h1 className="text-4xl sm:text-7xl font-syncopate font-black tracking-tighter uppercase leading-[0.9] neon-glow-red">BUDDY'S<br /><span className="text-red-500">HANGOUT CAFE</span></h1><div className="mt-3 inline-flex items-center gap-2 glass px-4 py-2 rounded-full border-white/5 opacity-60"><Users className="w-3 h-3 text-red-500" /><span className="text-[8px] font-syncopate font-black uppercase tracking-widest">{visitors} BUDDY'S HANGOUT CAFE ONLINE</span></div></div>
        <p className="max-w-xl text-gray-400 text-base sm:text-xl font-light">Experience real-time flavors and high-fidelity vibes globally.</p>
        <div className="flex flex-col sm:flex-row gap-5 w-full max-w-md"><button onClick={() => setView(View.MENU)} className="w-full py-5 bg-white text-black font-syncopate font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-400 hover:text-white hover:scale-105 transition-all duration-300 shadow-xl shadow-white/5"><LayoutGrid className="w-4 h-4" /> BROWSE MENU</button><button onClick={() => setView(View.HISTORY)} className="w-full py-5 glass text-red-500 border-red-500/20 font-syncopate font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-400 hover:text-white hover:border-blue-400/20 hover:scale-105 transition-all duration-300"><History className="w-4 h-4" /> RECENT ORDERS</button></div>
      </div>
      <section className="space-y-8 animate-in slide-in-from-bottom-5 scroll-fade" data-scroll-fade="true">
        <div className="flex items-center gap-3"><Star className="w-6 h-6 text-red-500 fill-red-500" /><h2 className="text-2xl font-syncopate font-black uppercase tracking-widest">TODAY'S SPECIAL</h2></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {specials.map((item: MenuItem) => (
            <div key={item.id} className="glass p-6 rounded-[2.5rem] border-red-500/10 flex flex-col sm:flex-row items-center gap-6 group hover:border-red-500/40 transition-all hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden flex-shrink-0 animate-pulse-subtle">
                <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt={item.name} />
              </div>
              <div className="flex-1 text-center sm:text-left space-y-2">
                <h3 className="text-xl font-bold uppercase">{item.name}</h3>
                <p className="text-2xl font-syncopate font-black text-red-500">{item.price}</p>
              </div>
              <button onClick={() => { onAdd(item); onTriggerTooltip(`${item.name} added!`); }} className="p-4 bg-red-600 rounded-full hover:scale-110 transition-all shadow-lg shadow-red-600/20 active:scale-95"><Plus className="w-6 h-6 text-white" /></button>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-8 scroll-fade" data-scroll-fade="true"><div className="flex items-center gap-3"><Music className="w-6 h-6 text-red-500" /><h2 className="text-2xl font-syncopate font-black uppercase tracking-widest">EVENTS SCHEDULE</h2></div><div className="grid grid-cols-1 lg:grid-cols-3 gap-6">{events.map((ev: CafeEvent) => <div key={ev.id} className="glass p-8 rounded-[3rem] border-red-500/10 space-y-6 group hover:bg-white/5 transition-all"><div className="flex justify-between items-start"><div className="p-3 bg-red-600/10 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-all"><Calendar className="w-6 h-6" /></div><div className="text-right"><p className="text-[10px] font-syncopate font-black text-red-500 uppercase">{ev.date}</p><p className="text-[10px] text-gray-500 font-bold uppercase">{ev.price || 'Free'}</p></div></div><h4 className="text-xl font-syncopate font-black uppercase tracking-tighter">{ev.title}</h4><button onClick={() => onRegister(ev)} className="w-full py-4 border border-red-500/20 rounded-2xl flex items-center justify-center gap-3 font-syncopate font-black uppercase text-[9px] hover:bg-red-600 transition-all active:scale-95"><UserPlus className="w-4 h-4" /> REGISTER ATTENDANCE</button></div>)}</div></section>
      <section className="space-y-8 animate-in slide-in-from-bottom-5 scroll-fade" data-scroll-fade="true">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-red-500" />
          <h2 className="text-2xl font-syncopate font-black uppercase tracking-widest">FIND US</h2>
        </div>
        <div className="glass p-8 rounded-[3rem] border-red-500/10 space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-syncopate font-black text-red-500 uppercase mb-2">Getting to Buddy's Hangout Cafe</h3>
            <p className="text-gray-400 text-sm mb-4">13 Jayappa, Yelahanka, near Reva Circle, Reddy Layout, Kattigenahalli, Bengaluru, Sathanur, Karnataka 560064</p>
            <button 
              onClick={() => {
                // Open Google Maps with directions to the cafe
                const cafeAddress = encodeURIComponent('13 Jayappa, Yelahanka, near Reva Circle, Reddy Layout, Kattigenahalli, Bengaluru, Sathanur, Karnataka 560064');
                const cafeUrl = 'https://www.google.com/maps/search/?api=1&query=' + cafeAddress;
                window.open(cafeUrl, '_blank');
              }}
              className="w-full py-4 bg-red-600 text-white font-syncopate font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all active:scale-95"
            >
              OPEN IN MAPS
            </button>
            <div className="mt-4 pt-4 border-t border-white/5">
              <a 
                href="https://share.google/u69OXrQAIYiwCn3Zc" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block py-3 px-6 bg-white/5 text-white font-syncopate font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                VIEW ON GOOGLE
              </a>
            </div>
          </div>
        </div>
      </section>
      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(0.98); }
        }
        .animate-pulse-subtle { animation: pulse-subtle 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function MenuView({ menu, cart, onAdd, onTriggerTooltip }: any) {
  const [animId, setAnimId] = useState<string | null>(null);
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <h2 className="text-4xl font-syncopate font-black uppercase border-b border-white/5 pb-6">FLAVORS</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
        {menu.map((item: MenuItem) => (
          <div key={item.id} className="group glass p-3 rounded-[2.5rem] border-white/5 hover:border-red-500/20 transition-all">
            <div className="relative overflow-hidden rounded-[2.2rem] aspect-square"><img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-duration-700" />{item.isSpecial && <div className="absolute top-4 right-4 bg-red-600 p-2 rounded-full shadow-lg"><Star className="w-3 h-3 text-white fill-white" /></div>}</div>
            <div className="p-4 space-y-3">
               <h3 className="text-sm sm:text-base font-bold uppercase truncate">{item.name}</h3>
               <div className="flex justify-between items-center"><span className="text-lg font-syncopate font-black text-red-500">{item.price}</span><button onClick={() => { onAdd(item); setAnimId(item.id); onTriggerTooltip(`${item.name} added!`); setTimeout(() => setAnimId(null), 1000); }} className={`p-3 rounded-xl transition-all ${animId === item.id ? 'bg-red-600 text-white' : 'bg-white/5 hover:bg-white hover:text-black'}`}>{animId === item.id ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}</button></div>
            </div>
          </div>
        ))}
      </div>
      <div className="pt-12 border-t border-white/5 mt-12">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center p-2 shadow-xl border-4 border-red-600/10">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://buddycafehangout.vercel.app/menu" className="w-full h-full object-contain" alt="Order from Menu" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-syncopate font-black uppercase tracking-widest text-red-500">SCAN & ORDER</h3>
            <p className="text-[10px] text-gray-500 font-syncopate font-bold uppercase mt-2">Direct access to our menu for seamless ordering</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryView({ orders, onExport }: { orders: Order[], onExport: (o: Order) => void }) {
  return (
    <div className="space-y-10 py-10 animate-in fade-in">
      <h2 className="text-4xl font-syncopate font-black uppercase border-b border-red-500/20 pb-6">TRANSACTION HISTORY</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {orders.length === 0 ? <p className="opacity-20 uppercase text-xs font-syncopate">No activity recorded.</p> : orders.map(o => (
          <div key={o.id} className="glass p-8 rounded-[2.5rem] border-white/5 space-y-5 hover:border-red-500/30 transition-all">
            <div className="flex justify-between items-center"><span className="text-xl font-syncopate font-black text-red-500">{o.id}</span><button onClick={() => onExport(o)} className="p-2 bg-red-600/10 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all"><Download className="w-4 h-4" /></button></div>
            <div className="flex justify-between items-center text-[10px] font-syncopate font-black uppercase opacity-40"><span>STATUS: {o.status}</span><span>{o.createdAt}</span></div>
            <div className="text-xs uppercase opacity-40 font-bold border-t border-white/5 pt-4">
              {o.cartItems ? o.cartItems.map((ci, idx) => <div key={idx} className="flex justify-between"><span>{ci.item.name} x {ci.quantity}</span><span>₹{parseInt(ci.item.price.replace('₹','')) * ci.quantity}</span></div>) : o.items.map((i, idx) => <div key={idx} className="flex justify-between"><span>{i.name}</span><span>{i.price}</span></div>)}
            </div>
            <div className="flex justify-between font-syncopate font-black text-lg text-red-500"><span>TOTAL</span><span>{o.total}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OurStoryView() {
  return (
    <div className="max-w-3xl mx-auto py-10 space-y-10 animate-in fade-in">
      <h2 className="text-4xl font-syncopate font-black uppercase border-b border-white/5 pb-6 text-red-500">OUR STORY</h2>
      <div className="glass p-10 rounded-[3rem] space-y-8 leading-relaxed text-gray-300">
        <p className="text-xl font-playfair italic">"A space where pixels meet the pulse of social interaction."</p>
        <p>Buddies Hangout Cafe was born from a simple observation: modern social spaces lack the immersion of the digital world. No smoking allowed. Experience real-time high-fidelity social connection.</p>
      </div>
    </div>
  );
}

function CartOverlay({ isOpen, cart, setCart, onClose, onCheckout }: any) {
  const total = cart.reduce((acc: number, curr: CartItem) => acc + (parseInt(curr.item.price.replace('₹', '')) * curr.quantity), 0);
  return (
    <div className={`fixed inset-y-0 right-0 z-[110] w-full sm:w-[420px] glass border-l border-red-500/20 transition-transform duration-500 ease-in-out overlay-container ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col p-8">
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
           <h3 className="text-2xl font-syncopate font-black text-red-500 uppercase">CART</h3>
           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X /></button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar">
          {cart.length === 0 ? <p className="text-center opacity-20 uppercase text-xs py-20 font-syncopate">Empty</p> : cart.map((ci: CartItem, idx: number) => (
            <div key={idx} className="flex gap-4 items-center glass p-4 rounded-3xl group">
              <img src={ci.item.image} className="w-16 h-16 rounded-2xl object-cover" />
              <div className="flex-1 min-w-0"><h5 className="font-bold text-xs uppercase truncate">{ci.item.name}</h5><p className="text-red-500 font-syncopate text-[10px] font-black">{ci.item.price} x {ci.quantity}</p></div>
              <div className="flex flex-col gap-1">
                <button onClick={() => setCart(cart.map((c:any, i:number) => i === idx ? {...c, quantity: c.quantity + 1} : c))} className="p-1 hover:bg-white/10 rounded-lg text-red-500"><Plus className="w-3 h-3" /></button>
                <button onClick={() => ci.quantity > 1 ? setCart(cart.map((c:any, i:number) => i === idx ? {...c, quantity: c.quantity - 1} : c)) : setCart(cart.filter((_:any, i:number) => i !== idx))} className="p-1 hover:bg-white/10 rounded-lg text-white"><Minus className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="mt-8 space-y-6 pt-8 border-t border-white/5">
             <div className="flex justify-between items-center"><span className="text-[10px] uppercase font-bold opacity-40 font-syncopate">TOTAL</span><span className="text-3xl font-syncopate font-black text-red-500">₹{total}</span></div>
             <button onClick={onCheckout} className="w-full py-5 bg-red-600 text-white font-syncopate font-black rounded-2xl uppercase tracking-widest text-[10px] active:scale-95 transition-all">CHECKOUT</button>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckoutView({ cart, orders, qrCodeUrl, onPay, onCancel, onExport }: any) {
  const [proc, setProc] = useState(false);
  const total = cart.reduce((acc:any, curr:CartItem) => acc + (parseInt(curr.item.price.replace('₹', '')) * curr.quantity), 0);
  return (
    <div className="max-w-4xl mx-auto py-10 space-y-16 animate-in zoom-in-95">
       <div className="flex flex-col sm:flex-row justify-between items-start gap-10">
          <div className="flex-1 w-full glass p-8 rounded-[3rem] space-y-8">
             <div className="flex justify-between items-center border-b border-white/5 pb-4"><h3 className="text-xl font-syncopate font-black text-red-500 uppercase">SUMMARY</h3><button onClick={onCancel} className="text-[10px] font-syncopate font-black uppercase opacity-40 hover:opacity-100 transition-all">Edit Cart</button></div>
             <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.length === 0 ? <p className="opacity-20 uppercase text-[9px] py-4">Cart is empty.</p> : cart.map((ci: CartItem, i: number) => (
                  <div key={i} className="flex justify-between text-xs uppercase opacity-60 font-bold"><span>{ci.item.name} x {ci.quantity}</span><span className="font-syncopate">₹{parseInt(ci.item.price.replace('₹','')) * ci.quantity}</span></div>
                ))}
             </div>
             <div className="pt-6 border-t border-white/5 flex justify-between items-end"><span className="text-[10px] uppercase font-syncopate opacity-30">GRAND TOTAL</span><span className="text-4xl font-syncopate font-black text-red-500">₹{total}</span></div>
             <button disabled={proc || cart.length === 0} onClick={() => { setProc(true); setTimeout(() => { onPay(); setProc(false); }, 1500); }} className="w-full py-6 bg-red-600 text-white font-syncopate font-black rounded-2xl uppercase tracking-widest text-[10px] active:scale-95 transition-all">{proc ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : 'PLACE ORDER & PAY'}</button>
          </div>
          <div className="w-full sm:w-[320px] glass p-8 rounded-[3rem] border-red-500/10 space-y-8 flex flex-col items-center">
             <div className="text-center space-y-4">
                <div className="w-48 h-48 bg-white rounded-2xl mx-auto flex items-center justify-center p-2 shadow-xl border-4 border-red-600/10"><img src={qrCodeUrl} className="w-full h-full object-contain" alt="Synced Payment QR" /></div>
                <h4 className="text-sm font-syncopate font-black uppercase tracking-widest">REAL-TIME SYNC QR</h4>
                <p className="text-[9px] text-gray-500 font-syncopate font-bold uppercase">SECURE GLOBAL SETTLEMENT</p>
             </div>
             <div className="w-full glass p-4 rounded-2xl border-white/5 text-center"><p className="text-[8px] font-syncopate font-black uppercase opacity-40">Scan & Pay Total Payable</p></div>
          </div>
       </div>

       <div className="space-y-8">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4"><History className="w-6 h-6 text-red-500" /><h3 className="text-xl font-syncopate font-black uppercase tracking-widest">RECENT ORDERS & INVOICES</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.length === 0 ? <p className="opacity-20 uppercase text-xs py-10 font-syncopate">No previous orders found.</p> : orders.slice(0, 4).map((o:any) => (
              <div key={o.id} className="glass p-8 rounded-[3rem] border-white/5 flex flex-col gap-4 group hover:border-red-500/20 transition-all">
                <div className="flex justify-between items-start"><div><p className="text-red-500 font-syncopate font-black text-lg">{o.id}</p><p className="text-[9px] font-syncopate font-black uppercase opacity-40">{o.createdAt} • {o.status}</p></div><button onClick={() => onExport(o)} className="p-3 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"><Download className="w-4 h-4" /></button></div>
                <div className="text-[10px] uppercase font-bold opacity-60 line-clamp-1">{o.cartItems ? o.cartItems.map((ci:any) => ci.item.name).join(', ') : o.items.map((i:any) => i.name).join(', ')}</div>
                <div className="pt-2 border-t border-white/5 flex justify-between items-center"><span className="text-[9px] opacity-40 uppercase">Total Paid</span><span className="font-syncopate font-black text-red-500">{o.total}</span></div>
              </div>
            ))}
          </div>
       </div>
    </div>
  );
}

function AdminLogin({ password, onLogin }: any) {
  const [v, setV] = useState('');
  return (
    <div className="max-w-md mx-auto py-20 glass p-10 rounded-[4rem] text-center space-y-8 animate-in zoom-in-95">
      <Lock className="w-16 h-16 text-red-500 mx-auto" /><h2 className="text-2xl font-syncopate font-black uppercase tracking-tighter">STAFF GATE</h2>
      <input type="password" value={v} onChange={(e) => setV(e.target.value)} placeholder="PASSCODE" className="w-full bg-white/5 border border-red-500/20 p-5 rounded-2xl text-center font-syncopate text-red-500 focus:outline-none" />
      <button onClick={() => { if (v === password) onLogin(); else alert('Denied'); }} className="w-full py-5 bg-red-600 text-white font-syncopate font-black rounded-2xl uppercase tracking-widest text-[10px] active:scale-95 shadow-lg">UNLOCK STATION</button>
    </div>
  );
}

function TimerModal({ order, isVisible, onClose }: { order: Order, isVisible: boolean, onClose: () => void }) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  
  // Calculate time left based on estimated time
  useEffect(() => {
    if (!order.estimatedTime || !isVisible) return;
    
    // Parse estimated time (format like "20 mins", "1 hour")
    const parseEstimatedTime = (timeStr: string): number => {
      if (!timeStr) return 0;
      
      const timeMatch = timeStr.match(/(\d+)\s*(min|minute|mins|hour|hours)/i);
      if (!timeMatch) return 0;
      
      const [, amount, unit] = timeMatch;
      const numAmount = parseInt(amount);
      
      if (unit.includes('hour')) {
        return numAmount * 60 * 60 * 1000; // hours to milliseconds
      } else {
        return numAmount * 60 * 1000; // minutes to milliseconds
      }
    };
    
    const totalTime = parseEstimatedTime(order.estimatedTime);
    if (totalTime <= 0) return;
    
    // Calculate start time (subtract elapsed time from total)
    const startTime = Date.now();
    
    const updateTimer = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, totalTime - elapsed);
      
      if (remaining <= 0) {
        setTimeLeft('00:00');
        return;
      }
      
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [order.estimatedTime, isVisible]);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-[100] w-80 glass border border-red-500/20 rounded-2xl p-6 shadow-2xl shadow-red-500/10">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-syncopate font-black text-red-500 uppercase">ORDER TIMER</h3>
          <p className="text-[10px] font-syncopate font-black uppercase opacity-60">{order.id}</p>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-full transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="text-center py-4">
          <div className="text-4xl font-syncopate font-black text-white mb-2">{timeLeft}</div>
          <p className="text-[10px] text-gray-400 font-syncopate font-black uppercase">TIME REMAINING</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400 font-syncopate uppercase">Status:</span>
            <span className="font-syncopate font-black text-red-500 uppercase">{order.status}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400 font-syncopate uppercase">Table:</span>
            <span className="font-syncopate font-black">{order.tableNumber}</span>
          </div>
          
          {order.estimatedTime && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 font-syncopate uppercase">Est. Time:</span>
              <span className="font-syncopate font-black">{order.estimatedTime}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-[9px] text-center text-gray-500 font-syncopate font-black uppercase">DRAG TO REPOSITION • MINIMIZE TO BACKGROUND</p>
      </div>
    </div>
  );
}

function AdminDashboard({ orders, setOrders, menu, setMenu, events, setEvents, registrations, setRegistrations, settings, setSettings, onLogout, timers, setTimers }: any) {
  // Function to sync data to server
  const syncDataToServer = useCallback((dataType: string, data: any) => {
    try {
      switch(dataType) {
        case 'orders':
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(data));
          break;
        case 'menu':
          localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(data));
          break;
        case 'events':
          localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(data));
          break;
        case 'registrations':
          localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(data));
          break;
        case 'settings':
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data));
          break;
      }
      console.log(`${dataType} synced to server`);
    } catch (error) {
      console.error(`Error syncing ${dataType} to server:`, error);
    }
  }, []);
  // Fetch fresh data from server for admin dashboard
  const fetchDataFromServer = useCallback(async () => {
    try {
      // In a real implementation, this would fetch from an actual backend API
      // For now, we'll simulate server data by getting from localStorage
      const serverOrders = getStored(STORAGE_KEYS.ORDERS, []);
      const serverMenu = getStored(STORAGE_KEYS.MENU, INITIAL_MENU);
      const serverEvents = getStored(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
      const serverRegs = getStored(STORAGE_KEYS.REGISTRATIONS, []);
      
      // Update local state with server data
      setOrders(serverOrders);
      setMenu(serverMenu);
      setEvents(serverEvents);
      setRegistrations(serverRegs);
    } catch (error) {
      console.error('Error fetching server data:', error);
    }
  }, [setOrders, setMenu, setEvents, setRegistrations]);
  
  // Refresh data periodically
  useEffect(() => {
    fetchDataFromServer();
    const interval = setInterval(fetchDataFromServer, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [fetchDataFromServer]);
  const [tab, setTab] = useState<'orders'|'menu'|'events'|'settings'|'attendance'>('orders');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) { const reader = new FileReader(); reader.onloadend = () => callback(reader.result as string); reader.readAsDataURL(file); }
  };

  return (
    <div className="space-y-10 animate-in fade-in">
      <div className="flex justify-between items-end border-b border-white/5 pb-8"><h2 className="text-4xl font-syncopate font-black uppercase">STATION</h2><div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
          {['orders', 'menu', 'events', 'attendance', 'settings'].map(t => <button key={t} onClick={() => setTab(t as any)} className={`text-[10px] font-syncopate font-black uppercase tracking-widest ${tab === t ? 'text-red-500' : 'opacity-30'}`}>{t}</button>)}
          <button onClick={onLogout} className="text-red-500/50 hover:text-red-500 transition-all ml-4 p-2"><LogOut className="w-5 h-5" /></button>
      </div></div>
      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.map((o:any) => (
            <div key={o.id} className="glass p-8 rounded-[3rem] border-white/5 space-y-6 animate-in slide-in-from-bottom-2">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                  <span className="text-2xl font-syncopate font-black text-red-500">{o.id}</span>
                  <p className="text-[9px] text-gray-500 uppercase font-bold">Table {o.tableNumber} • {o.createdAt}</p>
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  {Object.values(OrderStatus).map(s => (
                    <button key={s} onClick={() => {
                      // Clear any existing timer for this order
                      if (timers[o.id]) {
                        clearTimeout(timers[o.id]);
                        const newTimers = {...timers};
                        delete newTimers[o.id];
                        setTimers(newTimers);
                      }
                      
                      // Update order status
                      const updatedOrders = orders.map((x: any) => x.id === o.id ? {...x, status: s} : x);
                      setOrders(updatedOrders);
                      
                      // Sync to server
                      try {
                        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));
                        console.log('Orders synced to server');
                      } catch (error) {
                        console.error('Error syncing orders to server:', error);
                      }
                      
                      // Set timer if status is changed to PREPARING
                      if (s === OrderStatus.PREPARING) {
                        const timer = setTimeout(() => {
                          // Change status to READY after 2 minutes (120000 ms) as an example
                          setOrders(prev => prev.map(order => 
                            order.id === o.id ? {...order, status: OrderStatus.READY} : order
                          ));
                          
                          // Set another timer to change to COMPLETED after a delay
                          const readyTimer = setTimeout(() => {
                            setOrders(prev => prev.map(order => 
                              order.id === o.id ? {...order, status: OrderStatus.COMPLETED} : order
                            ));
                            
                            // Clean up timers
                            setTimers(prev => {
                              const newTimers = {...prev};
                              delete newTimers[o.id];
                              delete newTimers[`${o.id}_ready`];
                              return newTimers;
                            });
                          }, 120000); // 2 minutes in READY state
                          
                          setTimers(prev => ({...prev, [`${o.id}_ready`]: readyTimer}));
                        }, 120000); // 2 minutes in PREPARING state
                        
                        setTimers(prev => ({...prev, [o.id]: timer}));
                      }
                    }} className={`px-4 py-2 rounded-xl text-[9px] font-syncopate font-black uppercase transition-all ${o.status === s ? 'bg-red-600' : 'bg-white/5 opacity-40 hover:opacity-100'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-4 pt-4 border-t border-white/5">
                <div className="flex-1 flex flex-wrap gap-2">
                  {o.cartItems ? o.cartItems.map((ci: any, idx: number) => <span key={idx} className="bg-white/5 px-3 py-1.5 rounded-xl text-[9px] uppercase font-bold">{ci.item.name} x {ci.quantity}</span>) : o.items.map((i: any, idx: number) => <span key={idx} className="bg-white/5 px-2 py-1 rounded text-[8px] uppercase font-bold">{i.name}</span>)}
                </div>
                <div className="flex items-center gap-3">
                   <Clock className="w-4 h-4 text-red-500" />
                   <input type="text" placeholder="Estimated Time" value={o.estimatedTime || ''} onChange={(e) => {
                     const updatedOrders = orders.map((x: any) => x.id === o.id ? {...x, estimatedTime: e.target.value} : x);
                     setOrders(updatedOrders);
                                     
                     // Sync to server
                     try {
                       localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));
                       console.log('Orders synced to server');
                     } catch (error) {
                       console.error('Error syncing orders to server:', error);
                     }
                   }} className="bg-white/5 border border-white/10 p-3 rounded-xl text-[10px] font-syncopate uppercase focus:outline-none focus:border-red-500 transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === 'menu' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-syncopate font-black uppercase text-red-500">MENU MANAGEMENT</h3>
            <button 
              onClick={() => {
                const newItem: MenuItem = {
                  id: `item-${Date.now()}`,
                  name: 'New Item',
                  price: '₹100',
                  category: 'Snacks',
                  image: 'https://placehold.co/300x300?text=New+Item',
                  available: true,
                  isSpecial: false
                };
                const updatedMenu = [...menu, newItem];
                setMenu(updatedMenu);
                syncDataToServer('menu', updatedMenu);
                setEditingItem(newItem);
              }}
              className="px-4 py-2 bg-red-600 rounded-xl text-[10px] font-syncopate font-black uppercase"
            >
              ADD ITEM
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menu.map((item: MenuItem) => (
              <div key={item.id} className="glass p-6 rounded-[2.5rem] border-white/5 space-y-4">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                </div>
                {editingItem?.id === item.id ? (
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 p-2 rounded-xl text-sm focus:outline-none focus:border-red-500"
                      placeholder="Item Name"
                    />
                    <input 
                      type="text" 
                      value={editingItem.price}
                      onChange={(e) => setEditingItem({...editingItem, price: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 p-2 rounded-xl text-sm focus:outline-none focus:border-red-500"
                      placeholder="Price"
                    />
                    <input 
                      type="text" 
                      value={editingItem.image}
                      onChange={(e) => setEditingItem({...editingItem, image: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 p-2 rounded-xl text-sm focus:outline-none focus:border-red-500"
                      placeholder="Image URL"
                    />
                    <div className="relative">
                      <label className="block w-full py-3 bg-white/5 border border-white/10 rounded-xl text-center cursor-pointer hover:bg-white/10 transition-all group">
                        <Upload className="w-5 h-5 mx-auto mb-2 text-red-500 group-hover:scale-110 transition-all" />
                        <span className="text-[10px] font-syncopate font-black uppercase">UPLOAD IMAGE</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setEditingItem({...editingItem, image: reader.result as string});
                              };
                              reader.readAsDataURL(file);
                            }
                          }} 
                        />
                      </label>
                      {editingItem.image && (
                        <div className="mt-3 relative">
                          <img 
                            src={editingItem.image} 
                            alt="Preview" 
                            className="w-full h-32 object-cover rounded-xl border border-white/10"
                          />
                          <button 
                            onClick={() => setEditingItem({...editingItem, image: ''})}
                            className="absolute top-2 right-2 p-1 bg-red-600/80 text-white rounded-full hover:bg-red-600 transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <select 
                      value={editingItem.category}
                      onChange={(e) => setEditingItem({...editingItem, category: e.target.value as any})}
                      className="w-full bg-white/5 border border-white/10 p-2 rounded-xl text-sm focus:outline-none focus:border-red-500"
                    >
                      <option value="Snacks">Snacks</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Desserts">Desserts</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id={`available-${item.id}`}
                        checked={editingItem.available}
                        onChange={(e) => setEditingItem({...editingItem, available: e.target.checked})}
                        className="rounded"
                      />
                      <label htmlFor={`available-${item.id}`} className="text-sm">Available</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id={`special-${item.id}`}
                        checked={editingItem.isSpecial}
                        onChange={(e) => setEditingItem({...editingItem, isSpecial: e.target.checked})}
                        className="rounded"
                      />
                      <label htmlFor={`special-${item.id}`} className="text-sm">Special</label>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => {
                          const updatedMenu = menu.map(m => m.id === editingItem.id ? editingItem : m);
                          setMenu(updatedMenu);
                          syncDataToServer('menu', updatedMenu);
                          setEditingItem(null);
                        }}
                        className="flex-1 py-2 bg-green-600 rounded-xl text-[9px] font-syncopate font-black uppercase"
                      >
                        SAVE
                      </button>
                      <button 
                        onClick={() => setEditingItem(null)}
                        className="flex-1 py-2 bg-gray-600 rounded-xl text-[9px] font-syncopate font-black uppercase"
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h4 className="font-bold uppercase">{item.name}</h4>
                    <p className="text-red-500 font-syncopate font-black">{item.price}</p>
                    <p className="text-[10px] uppercase opacity-60">{item.category}</p>
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => setEditingItem(item)}
                        className="flex-1 py-2 bg-white/10 rounded-xl text-[9px] font-syncopate font-black uppercase hover:bg-white/20 transition-all"
                      >
                        EDIT
                      </button>
                      <button 
                        onClick={() => {
                          const updatedMenu = menu.filter(m => m.id !== item.id);
                          setMenu(updatedMenu);
                          syncDataToServer('menu', updatedMenu);
                        }}
                        className="flex-1 py-2 bg-red-600/20 text-red-500 rounded-xl text-[9px] font-syncopate font-black uppercase hover:bg-red-600 hover:text-white transition-all"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {tab === 'settings' && (
        <div className="max-w-md mx-auto space-y-8 glass p-10 rounded-[3rem] border-red-500/10">
          <div className="space-y-4">
            <h4 className="font-syncopate font-black text-red-500 uppercase text-xs">Payment QR Hub Sync</h4>
            <div className="flex flex-col items-center gap-6">
              {settings.qrCodeUrl && <div className="w-48 h-48 bg-white rounded-3xl overflow-hidden shadow-2xl p-2 border-2 border-red-600/10"><img src={settings.qrCodeUrl} className="w-full h-full object-contain" alt="Live QR Sync" /></div>}
              <label className="w-full py-6 border-2 border-dashed border-red-500/30 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-red-500/10 transition-all group">
                <Upload className="w-8 h-8 text-red-500 group-hover:scale-110 transition-all" />
                <span className="text-[10px] font-syncopate font-black uppercase tracking-widest">SYNC NEW QR ASSET</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => {
                  const updatedSettings = {...settings, qrCodeUrl: url};
                  setSettings(updatedSettings);
                  syncDataToServer('settings', updatedSettings);
                })} />
              </label>
            </div>
          </div>
          <div className="pt-6 border-t border-white/5">
             <p className="text-[9px] text-gray-500 uppercase font-bold text-center">Changes Sync Globally Across Checkout Pages</p>
          </div>
        </div>
      )}
      {tab === 'events' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-syncopate font-black uppercase text-red-500">EVENTS MANAGEMENT</h3>
            <button 
              onClick={() => {
                const newEvent: CafeEvent = {
                  id: `event-${Date.now()}`,
                  title: 'New Event',
                  date: new Date().toISOString().split('T')[0],
                  description: 'Event description',
                  price: 'Free'
                };
                const updatedEvents = [...events, newEvent];
                setEvents(updatedEvents);
                syncDataToServer('events', updatedEvents);
              }}
              className="px-4 py-2 bg-red-600 rounded-xl text-[10px] font-syncopate font-black uppercase"
            >
              ADD EVENT
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {events.map((event: CafeEvent) => (
              <div key={event.id} className="glass p-6 rounded-[2.5rem] border-white/5 space-y-4">
                <input 
                  type="text" 
                  value={event.title}
                  onChange={(e) => {
                    const updatedEvents = events.map(ev => ev.id === event.id ? {...ev, title: e.target.value} : ev);
                    setEvents(updatedEvents);
                    syncDataToServer('events', updatedEvents);
                  }}
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:outline-none focus:border-red-500"
                  placeholder="Event Title"
                />
                <input 
                  type="date" 
                  value={event.date}
                  onChange={(e) => {
                    const updatedEvents = events.map(ev => ev.id === event.id ? {...ev, date: e.target.value} : ev);
                    setEvents(updatedEvents);
                    syncDataToServer('events', updatedEvents);
                  }}
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:outline-none focus:border-red-500"
                />
                <textarea 
                  value={event.description}
                  onChange={(e) => {
                    const updatedEvents = events.map(ev => ev.id === event.id ? {...ev, description: e.target.value} : ev);
                    setEvents(updatedEvents);
                    syncDataToServer('events', updatedEvents);
                  }}
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:outline-none focus:border-red-500 min-h-[100px]"
                  placeholder="Event Description"
                />
                <input 
                  type="text" 
                  value={event.price || ''}
                  onChange={(e) => {
                    const updatedEvents = events.map(ev => ev.id === event.id ? {...ev, price: e.target.value} : ev);
                    setEvents(updatedEvents);
                    syncDataToServer('events', updatedEvents);
                  }}
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:outline-none focus:border-red-500"
                  placeholder="Price (optional)"
                />
                <button 
                  onClick={() => {
                    const updatedEvents = events.filter(ev => ev.id !== event.id);
                    setEvents(updatedEvents);
                    syncDataToServer('events', updatedEvents);
                  }}
                  className="w-full py-3 bg-red-600/20 text-red-500 rounded-xl text-[10px] font-syncopate font-black uppercase hover:bg-red-600 hover:text-white transition-all"
                >
                  DELETE EVENT
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {tab === 'attendance' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-syncopate font-black uppercase text-red-500">ATTENDANCE RECORDS</h3>
          
          <div className="space-y-4">
            {registrations.length === 0 ? (
              <p className="text-center opacity-60 py-10">No attendance records found.</p>
            ) : (
              registrations.map((reg: EventRegistration) => (
                <div key={reg.id} className="glass p-6 rounded-[2.5rem] border-white/5 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold uppercase">{reg.eventName}</h4>
                    <p className="text-[10px] opacity-60">Registration ID: {reg.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-syncopate font-black uppercase opacity-60">{reg.timestamp}</p>
                    <button 
                      onClick={() => setRegistrations(registrations.filter(r => r.id !== reg.id))}
                      className="mt-2 px-3 py-1 bg-red-600/20 text-red-500 rounded-lg text-[8px] font-syncopate font-black uppercase hover:bg-red-600 hover:text-white transition-all"
                    >
                      REMOVE
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
