"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function TrendingKeywordsManager() {
  const [keywords, setKeywords] = useState<any[]>([]);
  const [newKeyword, setNewKeyword] = useState("");

  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    const { data } = await supabase.from('trending_keywords').select('*').order('created_at');
    setKeywords(data || []);
  };

  const handleAdd = async () => {
    if (!newKeyword.trim()) return;
    await supabase.from('trending_keywords').insert({ keyword: newKeyword.trim() });
    setNewKeyword("");
    fetchKeywords();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('trending_keywords').delete().eq('id', id);
    fetchKeywords();
  };

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm max-w-2xl mt-6">
      <div className="flex gap-4 mb-6">
        <Input placeholder="Nhập từ khóa mới..." value={newKeyword} onChange={e => setNewKeyword(e.target.value)} />
        <Button onClick={handleAdd} className="btn-hero"><Plus className="w-4 h-4 mr-2" /> Thêm</Button>
      </div>
      <div className="flex flex-wrap gap-3">
        {keywords.map(t => (
          <Badge key={t.id} variant="secondary" className="px-3 py-1.5 text-sm gap-2">
            {t.keyword}
            <button onClick={() => handleDelete(t.id)} className="hover:text-destructive"><X className="w-3 h-3" /></button>
          </Badge>
        ))}
      </div>
    </div>
  );
}