import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

interface WishlistItem {
  id: number | string;
  name: string;
  price: number;
  image: string;
  originalPrice?: number;
  inStock?: boolean;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  toggleWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: number | string) => void;
  isInWishlist: (id: number | string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    const saved = localStorage.getItem("ohouse_wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("ohouse_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (item: WishlistItem) => {
    const exists = wishlist.some(i => i.id === item.id);
    if (exists) {
      setWishlist(prev => prev.filter(i => i.id !== item.id));
      toast.info(`Đã bỏ ${item.name} khỏi danh sách yêu thích`);
    } else {
      setWishlist(prev => [...prev, item]);
      toast.success(`Đã thêm ${item.name} vào danh sách yêu thích`);
    }
  };

  const removeFromWishlist = (id: number | string) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
  };

  const isInWishlist = (id: number | string) => wishlist.some(item => item.id === id);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, removeFromWishlist, isInWishlist, wishlistCount: wishlist.length }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
  return context;
};