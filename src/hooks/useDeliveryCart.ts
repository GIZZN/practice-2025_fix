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

const STORAGE_KEY = 'delivery_cart_items';

const getInitialState = (): OrderItem[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const savedItems = localStorage.getItem(STORAGE_KEY);
    return savedItems ? JSON.parse(savedItems) : [];
  } catch (error) {
    console.error('Error loading cart items:', error);
    return [];
  }
};

export function useDeliveryCart() {
  const [items, setItems] = useState<OrderItem[]>(getInitialState);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart items:', error);
    }
  }, [items]);

  const addItem = (item: Omit<OrderItem, 'id'>) => {
    setItems(prev => [...prev, { ...item, id: Date.now().toString() }]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, change: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + change) };
      }
      return item;
    }));
  };

  const clearCart = () => {
    if (window.confirm('Вы уверены, что хотите очистить корзину?')) {
      setItems([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueMarketplaces = new Set(items.map(item => item.marketplace)).size;

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    uniqueMarketplaces,
  };
} 