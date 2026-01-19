
export interface MenuItem {
  id: string;
  name: string;
  price: string;
  category: 'Snacks' | 'Beverages' | 'Desserts';
  image: string;
  available: boolean;
  isSpecial?: boolean;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export interface CafeEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  price?: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventName: string;
  timestamp: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  summary: string;
  content: string;
}

export interface PromoCode {
  code: string;
  discount: string;
  shortDescription: string;
  fullDetails: string;
  isActive: boolean;
}

export interface Founder {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
}

export enum OrderStatus {
  PENDING = 'Pending',
  PREPARING = 'Preparing',
  READY = 'Ready',
  COMPLETED = 'Completed'
}

export interface Order {
  id: string;
  items: MenuItem[];
  cartItems?: CartItem[];
  total: string;
  status: OrderStatus;
  tableNumber: string;
  createdAt: string;
  estimatedTime?: string;
}

export interface AdminSettings {
  password: string;
  qrCodeUrl: string;
  lastUpdated: string;
  promo: PromoCode;
}

export enum View {
  HOME = 'home',
  MENU = 'menu',
  PERFORM = 'perform',
  READ = 'read',
  ADMIN = 'admin',
  ABOUT = 'about',
  FEEDBACK = 'feedback',
  CHECKOUT = 'checkout',
  HISTORY = 'history'
}
