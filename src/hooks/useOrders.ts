import { useState, useEffect } from 'react';

interface OrderItem {
  id: string;
  marketplace: string;
  link: string;
  quantity: number;
  size?: string;
  color?: string;
  notes?: string;
}

interface DeliveryDetails {
  address: string;
  date: string;
  time: string;
  notes: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  deliveryDetails: DeliveryDetails;
  status: 'pending' | 'processing' | 'delivered';
  createdAt: string;
}

const STORAGE_KEY = 'user_orders';

const getInitialState = (): Order[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const savedOrders = localStorage.getItem(STORAGE_KEY);
    return savedOrders ? JSON.parse(savedOrders) : [];
  } catch (error) {
    console.error('Error loading orders:', error);
    return [];
  }
};

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(getInitialState);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving orders:', error);
    }
  }, [orders]);

  const addOrder = (items: OrderItem[], deliveryDetails: DeliveryDetails) => {
    const newOrder: Order = {
      id: Date.now().toString(),
      items,
      deliveryDetails,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  return {
    orders,
    addOrder
  };
} 