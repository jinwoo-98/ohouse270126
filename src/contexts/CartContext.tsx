import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

interface CartItem {
  id: number | string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string; // Tên phân loại tổng hợp (VD: Đỏ, L)
  variant_id?: string; // ID của dòng variant trong database
  slug?: string;
  tier_values?: Record<string, string>; // Chi tiết: { Màu: Đỏ, Size: L }
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number | string, variant_id?: string) => void;
  updateQuantity: (id: number | string, quantity: number, variant_id?: string) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("ohouse_cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("ohouse_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      // Tìm sản phẩm trùng ID và trùng Variant ID (nếu có)
      const existingIndex = prev.findIndex(i => 
        i.id === item.id && i.variant_id === item.variant_id
      );

      if (existingIndex > -1) {
        toast.success(`Đã cập nhật số lượng ${item.name}`);
        const newItems = [...prev];
        newItems[existingIndex].quantity += item.quantity;
        return newItems;
      }
      
      toast.success(`Đã thêm ${item.name} vào giỏ hàng`);
      return [...prev, item];
    });
  };

  const removeFromCart = (id: number | string, variant_id?: string) => {
    setCartItems(prev => prev.filter(item => !(item.id === id && item.variant_id === variant_id)));
    toast.info("Đã xóa sản phẩm khỏi giỏ hàng");
  };

  const updateQuantity = (id: number | string, quantity: number, variant_id?: string) => {
    if (quantity < 1) return;
    setCartItems(prev => prev.map(item => 
      (item.id === id && item.variant_id === variant_id) 
        ? { ...item, quantity } 
        : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("ohouse_cart");
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};