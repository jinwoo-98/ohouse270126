import { Settings2, Image as ImageIcon, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatNumberWithDots, parseNumberFromDots } from "@/lib/utils";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";

interface VariantListProps {
  variants: any[];
  setVariants: React.Dispatch<React.SetStateAction<any[]>>;
  onEditGallery: (variantIndex: number) => void;
}

export function VariantList({ variants, setVariants, onEditGallery }: VariantListProps) {
  const updateVariantField = (index: number, field: string, value: any) => {
    let finalValue = value;
    if (field === 'price' || field === 'original_price') {
      finalValue = parseNumberFromDots(value);
    }
    setVariants(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: finalValue };
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3">
        <Settings2 className="w-5 h-5 text-primary" />
        <p className="text-xs font-medium text-charcoal">Giá bán và Giá gốc hiển thị trên web sẽ lấy từ <b>biến thể đầu tiên</b> trong bảng bên dưới.</p>
      </div>
      <div className="border border-border rounded-2xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-muted-foreground font-bold uppercase tracking-wider border-b">
              <tr>
                <th className="p-4 w-24">Ảnh</th>
                <th className="p-4">Phân loại</th>
                <th className="p-4 w-40 text-primary">Giá bán *</th>
                <th className="p-4 w-40">Giá gốc</th>
                <th className="p-4 w-32">SKU</th>
                <th className="p-4 w-32">Gallery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {variants.map((v, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-2">
                    <div className="w-16 h-16 rounded-lg overflow-hidden">
                      <ImageUpload 
                        value={v.image_url || ""}
                        onChange={(url) => updateVariantField(idx, 'image_url', url)}
                        aspectRatio="aspect-square"
                      />
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(v.tier_values).map(([k, val]: any) => (
                        <Badge key={k} variant="secondary" className="text-[9px] bg-gray-100">{k}: {val}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="p-4"><Input type="text" value={formatNumberWithDots(v.price)} onChange={e => updateVariantField(idx, 'price', e.target.value)} className="h-10 text-sm font-bold text-primary rounded-lg" /></td>
                  <td className="p-4"><Input type="text" value={formatNumberWithDots(v.original_price)} onChange={e => updateVariantField(idx, 'original_price', e.target.value)} className="h-10 text-sm rounded-lg" /></td>
                  <td className="p-4"><Input type="text" value={v.sku} onChange={e => updateVariantField(idx, 'sku', e.target.value)} className="h-10 text-sm rounded-lg font-mono" /></td>
                  <td className="p-4">
                    <Button type="button" variant="outline" size="sm" onClick={() => onEditGallery(idx)} className="h-9 gap-2 text-xs">
                      <Camera className="w-3 h-3" />
                      ({(v.gallery_urls || []).length})
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}