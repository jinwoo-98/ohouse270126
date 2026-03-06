"use client";

import { useState } from "react";
import { Plus, Trash2, Tag, Lightbulb, X, ImageIcon, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface VariantValue {
  label: string;
  image_url?: string;
  gallery_urls?: string[];
}

interface VariantTier {
  name: string;
  values: VariantValue[];
}

interface VariantConfigSectionProps {
  variantOptions: any[]; 
  tierConfig: VariantTier[];
  setTierConfig: (config: VariantTier[]) => void;
}

export function VariantConfigSection({ variantOptions, tierConfig, setTierConfig }: VariantConfigSectionProps) {
  const [tempValue, setTempValue] = useState<Record<number, string>>({});
  const [editingGallery, setEditingGallery] = useState<{ tierIdx: number, valIdx: number } | null>(null);

  const addTier = () => {
    if (tierConfig.length >= 3) {
      toast.error("Tối đa 3 cấp phân loại.");
      return;
    }
    setTierConfig([...tierConfig, { name: "", values: [] }]);
  };

  const updateTierName = (index: number, name: string) => {
    const newConfig = [...tierConfig];
    newConfig[index].name = name;
    setTierConfig(newConfig);
  };

  const addValueToTier = (index: number, val?: string) => {
    const labelToAdd = (val || tempValue[index] || "").trim();
    if (!labelToAdd) return;

    const newConfig = [...tierConfig];
    if (!newConfig[index].values.some(v => v.label === labelToAdd)) {
      newConfig[index].values = [...newConfig[index].values, { label: labelToAdd, image_url: "", gallery_urls: [] }];
      setTierConfig(newConfig);
    }
    setTempValue({ ...tempValue, [index]: "" });
  };

  const updateValueField = (tierIdx: number, valIdx: number, field: string, value: any) => {
    const newConfig = [...tierConfig];
    newConfig[tierIdx].values[valIdx] = { ...newConfig[tierIdx].values[valIdx], [field]: value };
    setTierConfig(newConfig);
  };

  const removeValue = (tierIdx: number, valIdx: number) => {
    const newConfig = [...tierConfig];
    newConfig[tierIdx].values.splice(valIdx, 1);
    setTierConfig(newConfig);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-border space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Cấu hình phân loại biến thể</h3>
        </div>
        <Button 
          type="button"
          size="sm" 
          variant="outline" 
          onClick={addTier} 
          className="text-[10px] font-bold uppercase h-8 rounded-lg border-primary/20 text-primary hover:bg-primary/5"
        >
          <Plus className="w-3 h-3 mr-1" /> Thêm nhóm phân loại
        </Button>
      </div>

      {tierConfig.map((tier, idx) => {
        const matchedOpt = variantOptions.find(a => a.name.toLowerCase() === tier.name.toLowerCase());
        const suggestions = matchedOpt?.options || [];

        return (
          <div key={idx} className="p-6 bg-secondary/30 rounded-2xl border border-border/50 relative animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <Badge className="bg-primary text-white border-none h-6 px-3">Nhóm {idx + 1}</Badge>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  const n = [...tierConfig]; n.splice(idx, 1); setTierConfig(n);
                }} 
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <Label className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Tên nhóm phân loại</Label>
                <Input 
                  value={tier.name} 
                  onChange={(e) => updateTierName(idx, e.target.value)}
                  placeholder="VD: Màu sắc, Kích thước..."
                  className="h-11 bg-white rounded-xl font-bold"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Thêm giá trị</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Nhập giá trị..." 
                    className="h-11 bg-white rounded-xl"
                    value={tempValue[idx] || ""}
                    onChange={(e) => setTempValue({ ...tempValue, [idx]: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addValueToTier(idx))}
                  />
                  <Button type="button" size="icon" variant="secondary" onClick={() => addValueToTier(idx)} className="h-11 w-11 rounded-xl shrink-0"><Plus className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {tier.values.map((v, vIdx) => (
                <div key={vIdx} className="relative flex flex-col bg-white rounded-2xl border border-border/60 shadow-sm group overflow-hidden animate-fade-in">
                  <div className="aspect-square bg-secondary/30 border-b border-dashed border-border/60 relative">
                    <ImageUpload 
                      value={v.image_url || ""} 
                      onChange={(url) => updateValueField(idx, vIdx, 'image_url', url as string)}
                      aspectRatio="aspect-square"
                    />
                  </div>
                  
                  <div className="p-2 space-y-2 bg-gray-50/50">
                    <p className="text-[11px] font-bold text-charcoal truncate text-center">{v.label}</p>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEditingGallery({ tierIdx: idx, valIdx: vIdx })}
                      className="w-full h-7 text-[9px] font-bold uppercase gap-1.5 rounded-lg border-primary/20 text-primary hover:bg-primary/5"
                    >
                      <Images className="w-3 h-3" />
                      Gallery ({(v.gallery_urls || []).length})
                    </Button>
                  </div>

                  <button 
                    type="button" 
                    onClick={() => removeValue(idx, vIdx)}
                    className="absolute top-1.5 right-1.5 p-1.5 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-10 shadow-sm"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Dialog quản lý Gallery cho từng giá trị */}
      <Dialog open={editingGallery !== null} onOpenChange={(open) => !open && setEditingGallery(null)}>
        <DialogContent className="max-w-3xl rounded-3xl p-0 overflow-hidden border-none shadow-elevated z-[160]">
          {editingGallery && (
            <>
              <div className="bg-charcoal p-6 text-white">
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                      <Images className="w-5 h-5" />
                    </div>
                    <div>
                      <DialogTitle className="text-lg font-bold">Bộ sưu tập ảnh: {tierConfig[editingGallery.tierIdx].values[editingGallery.valIdx].label}</DialogTitle>
                      <p className="text-[10px] text-taupe uppercase tracking-widest mt-1">Phân loại: {tierConfig[editingGallery.tierIdx].name}</p>
                    </div>
                  </div>
                </DialogHeader>
              </div>
              <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {(tierConfig[editingGallery.tierIdx].values[editingGallery.valIdx].gallery_urls || []).map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border group">
                      <img src={url} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => {
                          const current = [...(tierConfig[editingGallery.tierIdx].values[editingGallery.valIdx].gallery_urls || [])];
                          current.splice(i, 1);
                          updateValueField(editingGallery.tierIdx, editingGallery.valIdx, 'gallery_urls', current);
                        }}
                        className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-dashed">
                  <ImageUpload 
                    multiple 
                    value={tierConfig[editingGallery.tierIdx].values[editingGallery.valIdx].gallery_urls || []} 
                    onChange={(urls) => updateValueField(editingGallery.tierIdx, editingGallery.valIdx, 'gallery_urls', urls as string[])} 
                  />
                </div>
              </div>
              <DialogFooter className="p-6 bg-gray-50 border-t">
                <Button onClick={() => setEditingGallery(null)} className="btn-hero h-12 px-10 rounded-xl shadow-gold">XÁC NHẬN & ĐÓNG</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}