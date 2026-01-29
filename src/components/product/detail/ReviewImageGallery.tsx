"use client";

import { useState } from "react";
import { ImageIcon, X, Maximize2, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ReviewImageGalleryProps {
  reviews: any[];
}

export function ReviewImageGallery({ reviews }: ReviewImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Lọc các đánh giá có hình ảnh
  const reviewsWithImages = reviews.filter(r => r.image_url);

  if (reviewsWithImages.length === 0) return null;

  return (
    <div className="mb-8">
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="group h-14 px-8 rounded-2xl border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all shadow-subtle flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Ảnh thực tế</p>
              <p className="text-xs font-bold leading-none">Xem {reviewsWithImages.length} hình ảnh từ khách hàng</p>
            </div>
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden border-none rounded-[32px] shadow-elevated z-[150]">
          <div className="bg-charcoal p-6 md:p-8 text-white">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold uppercase tracking-widest">Góc Nhìn Thực Tế</DialogTitle>
                  <p className="text-[10px] text-taupe uppercase tracking-[0.2em] mt-1">Hình ảnh được chia sẻ bởi cộng đồng OHOUSE</p>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-6 md:p-10 bg-white overflow-y-auto custom-scrollbar max-h-[calc(90vh-120px)]">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {reviewsWithImages.map((rev, idx) => (
                <motion.div
                  key={rev.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-border/40 group cursor-zoom-in shadow-sm hover:shadow-medium transition-all"
                  onClick={() => setSelectedImage(rev.image_url)}
                >
                  <img 
                    src={rev.image_url} 
                    alt={`Review by ${rev.user_name}`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors flex items-center justify-center">
                    <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all" />
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-md p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                    <p className="text-[9px] font-bold text-charcoal truncate">{rev.user_name}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox cho ảnh lẻ trong gallery */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-transparent shadow-none flex items-center justify-center z-[200]">
          {selectedImage && (
            <div className="relative w-full h-full flex items-center justify-center p-4">
              {/* Nút đóng cố định ở góc màn hình, tránh đè lên header */}
              <button 
                onClick={() => setSelectedImage(null)}
                className="fixed top-6 right-6 md:top-10 md:right-10 p-3 bg-charcoal/60 backdrop-blur-md text-white rounded-full hover:bg-charcoal transition-all z-[210] shadow-elevated border border-white/20 group"
              >
                <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
              
              <motion.img 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                src={selectedImage} 
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10" 
                alt="Enlarged review" 
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}