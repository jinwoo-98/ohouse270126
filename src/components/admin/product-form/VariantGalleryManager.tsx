"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { X, Save, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VariantGalleryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  variant: any | null;
  onSave: (galleryUrls: string[]) => void;
}

export function VariantGalleryManager({ isOpen, onClose, variant, onSave }: VariantGalleryManagerProps) {
  const [gallery, setGallery] = useState<string[]>([]);

  useEffect(() => {
    if (variant) {
      setGallery(variant.gallery_urls || []);
    }
  }, [variant]);

  const handleSave = () => {
    onSave(gallery);
    onClose();
  };

  const handleRemove = (urlToRemove: string) => {
    setGallery(gallery.filter(url => url !== urlToRemove));
  };

  if (!variant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl rounded-3xl p-0 overflow-hidden border-none shadow-elevated">
        <DialogHeader className="p-6 border-b bg-secondary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Quản lý Gallery cho Biến thể</DialogTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(variant.tier_values).map(([key, val]: any) => (
                  <Badge key={key} variant="secondary" className="bg-primary/10 text-primary border-none">{key}: {val}</Badge>
                ))}
              </div>
            </div>
          </div>
        </DialogHeader>
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {gallery.map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border group shadow-sm">
                <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                <button onClick={() => handleRemove(url)} className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-dashed">
            <ImageUpload multiple value={gallery} onChange={(urls) => setGallery(urls as string[])} />
          </div>
        </div>
        <DialogFooter className="p-6 bg-gray-50 border-t">
          <Button variant="ghost" onClick={onClose} className="rounded-xl h-12">Hủy</Button>
          <Button onClick={handleSave} className="btn-hero h-12 rounded-xl"><Save className="w-4 h-4 mr-2" /> Lưu Gallery</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}