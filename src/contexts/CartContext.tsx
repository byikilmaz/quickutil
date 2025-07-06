'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  period: 'monthly' | 'annual';
  features: string[];
  originalPrice?: number; // Aylık fiyatı göstermek için
  specialOffer?: boolean; // Özel %10 ekstra indirim flag'i
  baseAnnualPrice?: number; // Orijinal yıllık fiyat (indirim öncesi)
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  isInCart: (planName: string, period: string) => boolean;
  hasMonthlyItems: () => boolean;
  applySpecialOffer: (itemId: string, baseAnnualPrice: number) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Local storage'dan yükle
  useEffect(() => {
    const savedCart = localStorage.getItem('quickutil-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Cart loading error:', error);
      }
    }
  }, []);

  // Local storage'a kaydet
  useEffect(() => {
    localStorage.setItem('quickutil-cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems(prevItems => {
      // Aynı plan varsa güncelle
      const existingIndex = prevItems.findIndex(
        existingItem => existingItem.name === item.name
      );
      
      if (existingIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingIndex] = item;
        return updatedItems;
      }
      
      // Yeni item ekle
      return [...prevItems, item];
    });
  };

  const removeItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<CartItem>) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const isInCart = (planName: string, period: string) => {
    return items.some(item => 
      item.name.toLowerCase().includes(planName.toLowerCase()) && 
      item.period === period
    );
  };

  // Aylık item var mı kontrol et
  const hasMonthlyItems = () => {
    return items.some(item => item.period === 'monthly');
  };

  // Özel teklif uygula - Yıllık plana geçir + %10 ekstra indirim
  const applySpecialOffer = (itemId: string, baseAnnualPrice: number) => {
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          // %10 ekstra indirim uygula
          const specialPrice = baseAnnualPrice * 0.9; // %10 indirim
          
          return {
            ...item,
            period: 'annual',
            price: specialPrice,
            specialOffer: true,
            baseAnnualPrice: baseAnnualPrice,
            description: 'Özel Yıllık Teklif - Size özel %10 ekstra indirim!'
          };
        }
        return item;
      })
    );
  };

  const itemCount = items.length;
  const totalPrice = items.reduce((total, item) => total + item.price, 0);

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      totalPrice,
      addItem,
      removeItem,
      updateItem,
      clearCart,
      isInCart,
      hasMonthlyItems,
      applySpecialOffer
    }}>
      {children}
    </CartContext.Provider>
  );
}; 