"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export function ProductBadgeManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('id, name, is_sale, is_featured, image_url');
    setProducts(data || []);
  };

  const toggleFlag = async (id: string, field: 'is_sale' | 'is_featured', current: boolean) => {
    await supabase.from('products').update({ [field]: !current }).eq('id', id);
    setProducts(products.map(p => p.id === id ? { ...p, [field]: !current } : p));
    toast.success("Đã cập nhật trạng thái sản phẩm");
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm mt-6">
      <div className="flex items-center gap-4 mb-6">
        <Search className="w-5 h-5 text-muted-foreground" />
        <Input placeholder="Tìm sản phẩm để gắn nhãn..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="max-w-sm" />
      </div>
      <div className="h-[500px] overflow-y-auto custom-scrollbar">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-white z-10 border-b">
            <tr className="text-xs uppercase text-muted-foreground">
              <th className="py-3 pl-4">Sản phẩm</th>
              <th className="py-3 text-center">Flash Sale</th>
              <th className="py-3 text-center">Nổi Bật</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.slice(0, 50).map(p => (
              <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                <td className="py-3 pl-4">
                  <div className="flex items-center gap-3">
                    <img src={p.image_url} className="w-10 h-10 rounded-lg object-cover" />
                    <span className="text-sm font-medium line-clamp-1">{p.name}</span>
                  </div>
                </td>
                <td className="py-3 text-center">
                  <Switch checked={p.is_sale} onCheckedChange={() => toggleFlag(p.id, 'is_sale', p.is_sale)} />
                </td>
                <td className="py-3 text-center">
                  <Switch checked={p.is_featured} onCheckedChange={() => toggleFlag(p.id, 'is_featured', p.is_featured)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}