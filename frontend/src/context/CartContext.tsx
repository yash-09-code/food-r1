import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, MenuItem, Variant, Addon, RestaurantTable } from '../types';

interface CartContextType {
  items: CartItem[];
  tableNumber: string | null;
  tableData: RestaurantTable | null;
  isCartOpen: boolean;
  totalItems: number;
  subtotal: number;
  addToCart: (item: MenuItem, variant?: Variant, addons?: Addon[], quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  setTable: (tableNum: string, data?: RestaurantTable) => void;
  clearTable: () => void;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [tableNumber, setTableNumberState] = useState<string | null>(() => {
    return localStorage.getItem('active_table_number') || null;
  });

  const [tableData, setTableData] = useState<RestaurantTable | null>(() => {
    try {
      const saved = localStorage.getItem('active_table_data');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (tableNumber) {
      localStorage.setItem('active_table_number', tableNumber);
    } else {
      localStorage.removeItem('active_table_number');
    }
  }, [tableNumber]);

  useEffect(() => {
    if (tableData) {
      localStorage.setItem('active_table_data', JSON.stringify(tableData));
    } else {
      localStorage.removeItem('active_table_data');
    }
  }, [tableData]);

  const setTable = (tableNum: string, data?: RestaurantTable) => {
    const formatted = tableNum.trim().toUpperCase();
    setTableNumberState(formatted);
    if (data) setTableData(data);
  };

  const clearTable = () => {
    setTableNumberState(null);
    setTableData(null);
  };

  const addToCart = (
    item: MenuItem,
    variant?: Variant,
    addons: Addon[] = [],
    quantity: number = 1
  ) => {
    const variantId = variant?.name || 'standard';
    const sortedAddons = [...addons].sort((a, b) => a.name.localeCompare(b.name));
    const addonsKey = sortedAddons.map((a) => a.name).join('+');
    const cartItemId = `${item.id}-${variantId}-${addonsKey}`;

    const unitPrice =
      item.base_price +
      (variant?.price_adjustment || 0) +
      addons.reduce((acc, a) => acc + a.price, 0);

    setItems((prev) => {
      const existing = prev.find((i) => i.id === cartItemId);
      if (existing) {
        return prev.map((i) =>
          i.id === cartItemId
            ? {
                ...i,
                quantity: i.quantity + quantity,
                subtotal: Math.round((i.quantity + quantity) * unitPrice * 100) / 100,
              }
            : i
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          menu_item_id: item.id,
          name: item.name,
          image_url: item.image_url,
          variant,
          addons,
          unit_price: Math.round(unitPrice * 100) / 100,
          quantity,
          subtotal: Math.round(quantity * unitPrice * 100) / 100,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.id === cartItemId) {
            const newQty = i.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...i,
              quantity: newQty,
              subtotal: Math.round(newQty * i.unit_price * 100) / 100,
            };
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = Math.round(items.reduce((acc, i) => acc + i.subtotal, 0) * 100) / 100;

  return (
    <CartContext.Provider
      value={{
        items,
        tableNumber,
        tableData,
        isCartOpen,
        totalItems,
        subtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        setTable,
        clearTable,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
