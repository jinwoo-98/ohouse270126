"use client";

import { useState } from "react";
import { Plus, Trash2, Tag, Lightbulb, X, ImageIcon, Images, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    newConfig[index].values = [];
    setTierConfig(newConfig);
  };

  const toggleValueToTier = (index: number, label: string) => {
    const newConfig = [...tierConfig];
    const existingIdx = newConfig[index].values.findIndex(v => v.label === label);
    
    if (existingIdx > -1) {
      newConfig[index].values.splice(existingIdx, 1);
    } else {
      newConfig[index].values.push({ label, image_url: "", gallery_urls: [] });
    }
    setTierConfig(newConfig);
  };

  const addManualValue = (index: number) => {
    const label = (tempValue[index] || "").trim();
    if (!label) return;
    
    const newConfig = [...tierConfig];
    if (!newConfig[index].values.some(v => v.label === label)) {
      newConfig[index].values.push({ label, image_url: "", gallery_urls: [] });
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

      {tierConfig.length === 0 && (
        <div className="py-12 border-2 border-dashed border-border/60 rounded-2xl text-center bg-secondary/10">
          <p className="text-xs text-muted-foreground italic">Sản phẩm này chưa có phân loại. Nhấn nút phía trên để bắt đầu.</p>
        </div>
      )}

      {tierConfig.map((tier, idx) => {
        const matchedOpt = variantOptions.find(a => a.name === tier.name);
        const availableValues = matchedOpt?.options || [];

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
                <Label className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Chọn tên nhóm phân loại</Label>
                <Select value={tier.name} onValueChange={(val) => updateTierName(idx, val)}>
                  <SelectTrigger className="h-11 bg-white rounded-xl font-bold">
                    <SelectValue placeholder="Chọn nhóm (Màu sắc, Kích thước...)" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {variantOptions.map(opt => (
                      <SelectItem key={opt.id} value={opt.name}>{opt.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Thêm giá trị khác (Nếu cần)</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Nhập giá trị mới..." 
                    className="h-11 bg-white rounded-xl"
                    value={tempValue[idx] || ""}
                    onChange={(e) => setTempValue({ ...tempValue, [idx]: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addManualValue(idx))}
                  />
                  <Button type="button" size="icon" variant="secondary" onClick={() => addManualValue(idx)} className="h-11 w-11 rounded-xl shrink-0"><Plus className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>

            {tier.name && availableValues.length > 0 && (
              <div className="space-y-3 mb-8 p-4 bg-white/50 rounded-xl border border-white/50">
                <Label className="text-[9px] font-bold uppercase text-primary tracking-widest flex items-center gap-2">
                  <Lightbulb className="w-3.5 h-3.5" /> Click để chọn nhanh các giá trị có sẵn:
                </Label>
                <div className="flex flex-wrap gap-2">
                  {availableValues.map((val: string) => {
                    const isSelected = tier.values.some(v => v.label === val);
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => toggleValueToTier(idx, val)}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-2",
                          isSelected 
                            ? "bg-primary text-white border-primary shadow-sm" 
                            : "bg-white text-charcoal border-border hover:border-primary/40"
                        )}
                      >
                        {val}
                        {isSelected && <Check className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-4 pt-6 border-t border-dashed border-border/40">
              <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Cấu hình ảnh cho từng giá trị:</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {tier.values.map((v, vIdx) => (
                  <div key={vIdx} className="relative flex flex-col bg-white rounded-2xl border border-border/60 shadow-sm group overflow-hidden animate-fade-in">
                    <div className="aspect-square bg-secondary/30 border-b border-dashed border-border/60 relative">
                      <img 
                        src={v.image_url || "/placeholder.svg"} 
                        className="w-full h-full object-cover opacity-50" 
                        alt=""
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button 
                          type="button"
                          variant="secondary" 
                          size="sm" 
                          onClick={() => setEditingGallery({ tierIdx: idx, valIdx: vIdx })}
                          className="h-8 px-3 text-[9px] font-bold uppercase rounded-lg shadow-lg"
                        >
                          <Images className="w-3 h-3 mr-1.5" />
                          Sửa Ảnh ({(v.gallery_urls?.length || 0) + (v.image_url ? 1 : 0)})
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-2 bg-gray-50/50">
                      <p className="text-[11px] font-bold text-charcoal truncate text-center">{v.label}</p>
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
          </div>
        );
      })}

      {/* Dialog quản lý Ảnh Chính & Phụ cho từng giá trị */}
      <Dialog open={editingGallery !== null} onOpenChange={(open) => !open && setEditingGallery(null)}>
        <DialogContent className="max-w-4xl rounded-[32px] p-0 overflow-hidden border-none shadow-elevated z-[160]">
          {editingGallery && (
            <>
              <div className="bg-charcoal p-6 text-white">
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                      <Images className="w-5 h-5" />
                    </div>
                    <div>
                      <DialogTitle className="text-lg font-bold">Thiết lập hình ảnh: {tierConfig[editingGallery.tierIdx].values[editingGallery.valIdx].label}</DialogTitle>
                      <p className="text-[10px] text-taupe uppercase tracking-widest mt-1">Phân loại: {tierConfig[editingGallery.tierIdx].name}</p>
                    </div>
                  </div>
                </DialogHeader>
              </div>
              
              <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-10">
                {/* Ảnh chính */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary fill-primary" />
                    <Label className="text-xs font-bold uppercase tracking-widest">Ảnh đại diện chính (Ảnh sẽ hiện khi click chọn)</Label>
                  </div>
                  <div className="max-w-[240px]">
                    <ImageUpload 
                      aspectRatio="aspect-square"
                      value={tierConfig[editingGallery.tierIdx].values[editingGallery.valIdx].image_url || ""} 
                      onChange={(url) => updateValueField(editingGallery.tierIdx, editingGallery.valIdx, 'image_url', url as string)} 
                    />
                  </div>
                </div>

                {/* Ảnh phụ */}
                <div className="space-y-4 pt-8 border-t border-dashed">
                  <div className="flex items-center gap-2">
                    <Images className="w-4 h-4 text-primary" />
                    <Label className="text-xs font-bold uppercase tracking-widest">Bộ sưu tập ảnh phụ (Gallery)</Label>
                  </div>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mb-4">
                    {(tierConfig[editingGallery.tierIdx].values[editingGallery.valIdx].gallery_urls || []).map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border group shadow-sm">
                        <img src={url} className="w-full h-full object-cover" alt="" />
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
                  
                  <div className="p-6 border-2 border-dashed border-border rounded-2xl bg-secondary/10">
                    <ImageUpload 
                      multiple 
                      value={tierConfig[editingGallery.tierIdx].values[editingGallery.valIdx].gallery_urls || []} 
                      onChange={(urls) => updateValueField(editingGallery.tierIdx, editingGallery.valIdx, 'gallery_urls', urls as string[])} 
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="p-6 bg-gray-50 border-t">
                <Button onClick={() => setEditingGallery(null)} className="btn-hero h-12 px-10 rounded-xl shadow-gold">HOÀN TẤT THIẾT LẬP</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}