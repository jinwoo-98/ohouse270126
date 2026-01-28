"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Truck } from "lucide-react";

interface ShippingInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  content?: string;
}

export function ShippingInfoDialog({ isOpen, onClose, title, content }: ShippingInfoDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none rounded-3xl shadow-elevated z-[120]">
        <div className="bg-charcoal p-8 text-cream relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors text-cream/60 hover:text-cream"
          >
            <X className="w-5 h-5" />
          </button>
          
          <DialogHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto text-primary mb-2">
              <Truck className="w-8 h-8" />
            </div>
            <DialogTitle className="text-2xl md:text-3xl font-bold tracking-tight uppercase">
              {title || "Chính Sách Vận Chuyển"}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-8 md:p-10 bg-white">
          <div 
            className="prose prose-stone max-w-none text-muted-foreground leading-relaxed
              prose-ul:list-disc prose-ul:pl-5 prose-li:mb-4 prose-a:text-primary prose-a:font-bold prose-a:underline"
            dangerouslySetInnerHTML={{ __html: content || "" }}
          />
          
          <div className="mt-10 pt-6 border-t border-border/40">
            <Button 
              onClick={onClose}
              className="w-full btn-hero h-14 rounded-2xl shadow-gold text-sm font-bold"
            >
              TÔI ĐÃ HIỂU
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}