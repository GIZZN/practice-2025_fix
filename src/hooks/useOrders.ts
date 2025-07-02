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
const LAST_ORDER_ID_KEY = 'last_order_id';

const getLastOrderId = (): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const lastId = localStorage.getItem(LAST_ORDER_ID_KEY);
    return lastId ? parseInt(lastId, 10) : 8000; // Начинаем с 8000
  } catch {
    return 8000;
  }
};

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
  const [lastOrderId, setLastOrderId] = useState<number>(getLastOrderId);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving orders:', error);
    }
  }, [orders]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(LAST_ORDER_ID_KEY, lastOrderId.toString());
    } catch (error) {
      console.error('Error saving last order ID:', error);
    }
  }, [lastOrderId]);

  const addOrder = (items: OrderItem[], deliveryDetails: DeliveryDetails) => {
    const nextId = lastOrderId + 1;
    setLastOrderId(nextId);

    const newOrder: Order = {
      id: nextId.toString(),
      items,
      deliveryDetails,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const findOrder = (orderId: string): Order | null => {
    // Пробуем найти заказ по точному совпадению
    let order = orders.find(order => order.id === orderId);
    
    if (!order) {
      // Если не нашли, пробуем преобразовать строку в число и искать снова
      const numericId = parseInt(orderId, 10);
      if (!isNaN(numericId)) {
        order = orders.find(order => parseInt(order.id, 10) === numericId);
      }
    }
    
    return order || null;
  };

  return {
    orders,
    addOrder,
    findOrder
  };
} 