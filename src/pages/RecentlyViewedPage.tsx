"use client";

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { History, ArrowLeft, ShoppingBag, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

interface Product {
  id: string | number;
  name: string;
  price: number;
  image: string;
  slug?: string;
}

export default function RecentlyViewedPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const saved = localStorage.getItem("ohouse_recent_views");
    if (saved) {
      setProducts(JSON.parse(saved));
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("ohouse_recent_views");
    setProducts([]);
  };

  function formatPrice(price: number) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container-luxury">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Link to="/tai-khoan" className="p-2 hover:bg-secondary rounded-full lg:hidden">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <History className="w-6 h-6 text-primary" />
                Lịch sử xem
              </h1>
            </div>
            {products.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearHistory} className="text-destructive hover:bg-destructive/10">
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa lịch sử
              </Button>
            )}
          </div>

          {products.length === 0 ? (
            <div className="text-center py-24 bg-card rounded-2xl border border-dashed border-border">
              <History className="w-16 h-16 mx-auto text-muted-foreground/20 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Chưa có lịch sử xem</h2>
              <p className="text-muted-foreground mb-6">Các sản phẩm bạn vừa xem sẽ xuất hiện tại đây.</p>
              <Button asChild><Link to="/noi-that">Khám phá sản phẩm</Link></Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group card-luxury bg-card"
                >
                  <Link to={`/san-pham/${product.slug || product.id}`} className="block relative aspect-square overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                  </Link>
                  <div className="p-4">
                    <Link to={`/san-pham/${product.slug || product.id}`}>
                      <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors h-10 mb-2">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between mt-auto">
                      <p className="text-primary font-bold">{formatPrice(product.price)}</p>
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => addToCart({ ...product, quantity: 1 })}
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}