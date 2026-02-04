import { Layers, Zap, Palette, ListFilter } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

interface LookbookFilterSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  groupedFilters: { style: string[], material: string[], color: string[] };
}

export function LookbookFilterSection({ formData, setFormData, groupedFilters }: LookbookFilterSectionProps) {
  return (
    <div className="space-y-4 bg-white p-6 rounded-3xl border shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2"><ListFilter className="w-4 h-4" /> Bộ lọc Lookbook</h3>
      
      <div className="space-y-2">
        <Label className="flex items-center gap-2"><Layers className="w-3 h-3" /> Phong cách</Label>
        <Select value={formData.style} onValueChange={val => setFormData({...formData, style: val})}>
          <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Chọn phong cách..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">-- Không chọn --</SelectItem>
            {groupedFilters.style.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label className="flex items-center gap-2"><Zap className="w-3 h-3" /> Chất liệu</Label>
        <Select value={formData.material} onValueChange={val => setFormData({...formData, material: val})}>
          <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Chọn chất liệu..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">-- Không chọn --</SelectItem>
            {groupedFilters.material.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label className="flex items-center gap-2"><Palette className="w-3 h-3" /> Màu sắc chủ đạo</Label>
        <Select value={formData.color} onValueChange={val => setFormData({...formData, color: val})}>
          <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Chọn màu sắc..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">-- Không chọn --</SelectItem>
            {groupedFilters.color.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      
      <p className="text-[10px] text-muted-foreground italic">
        Các trường này dùng để lọc Lookbook trên trang Cảm hứng. 
        <Link to="/admin/content/looks/filters" className="text-primary underline ml-1">Quản lý tùy chọn tại đây</Link>.
      </p>
    </div>
  );
}