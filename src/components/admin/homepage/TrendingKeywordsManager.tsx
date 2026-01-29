"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";
import { mainCategories } from "@/constants/header-data";

export function TrendingKeywordsManager() {
  const [keywords, setKeywords] = useState<any[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dbCategories, setDbCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchKeywords();
    fetchCategories();
  }, []);

  const fetchKeywords = async () => {
    // Fetch keywords with category info
    const { data } = await supabase
      .from('trending_keywords')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });
    setKeywords(data || []);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name, slug, parent_id').order('name');
    setDbCategories(data || []);
  };

  const handleAdd = async () => {
    if (!newKeyword.trim()) return;
    
    const payload: any = { keyword: newKeyword.trim() };
    if (selectedCategory !== "all") {
      payload.category_id = selectedCategory;
    }

    await supabase.from('trending_keywords').insert(payload);
    setNewKeyword("");
    fetchKeywords();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('trending_keywords').delete().eq('id', id);
    fetchKeywords();
  };

  // Group categories for select
  const parentCats = dbCategories.filter(c => !c.parent_id);

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm max-w-4xl mt-6">
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-1">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-10 rounded-xl">
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              <SelectItem value="all">-- Trang chủ / Tất cả --</SelectItem>
              {parentCats.map(parent => (
                <SelectGroup key={parent.id}>
                  <SelectLabel className="font-bold">{parent.name}</SelectLabel>
                  <SelectItem value={parent.id}>-- Chung cho {parent.name}</SelectItem>
                  {dbCategories.filter(c => c.parent_id === parent.id).map(child => (
                    <SelectItem key={child.id} value={child.id}>&nbsp;&nbsp;&nbsp;{child.name}</SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Input 
            placeholder="Nhập từ khóa (VD: Sofa da bò, Bàn ăn thông minh...)" 
            value={newKeyword} 
            onChange={e => setNewKeyword(e.target.value)} 
            className="h-10 rounded-xl"
          />
        </div>
        <div className="md:col-span-1">
          <Button onClick={handleAdd} className="btn-hero h-10 w-full"><Plus className="w-4 h-4 mr-2" /> Thêm</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Danh sách từ khóa đang hiển thị</h4>
        <div className="flex flex-wrap gap-3">
          {keywords.map(t => (
            <Badge key={t.id} variant="secondary" className="pl-3 pr-1 py-1.5 text-sm gap-2 bg-secondary/50 border border-border">
              <span className="font-bold text-charcoal">{t.keyword}</span>
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground bg-white px-1.5 py-0.5 rounded border">
                {t.categories?.name || "Trang chủ"}
              </span>
              <button onClick={() => handleDelete(t.id)} className="hover:bg-destructive hover:text-white rounded-full p-0.5 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}