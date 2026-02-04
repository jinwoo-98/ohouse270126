"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Search, Loader2, Link as LinkIcon, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface LookbookListProps {
  searchTerm: string;
}

export function LookbookList({ searchTerm }: LookbookListProps) {
  const [looks, setLooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Sử dụng * để lấy tất cả cột, bao gồm slug nếu có
    const { data: l } = await supabase.from('shop_looks').select('*, shop_look_items(*)').order('display_order');
    // Lấy danh mục
    const { data: c } = await supabase.from('categories').select('id, slug, name, parent_id, menu_location');
    
    setLooks(l || []);
    setCategories(c || []);
    setLoading(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    const toastId = toast.loading("Đang xóa Lookbook...");
    try {
      await supabase.from('shop_looks').delete().eq('id', deleteId);
      toast.success("Đã xóa Lookbook thành công.", { id: toastId });
      fetchData();
    } catch (e) {
      toast.error("Lỗi xóa Lookbook.", { id: toastId });
    } finally {
      setDeleteId(null);
    }
  };

  // Sử dụng useMemo để lọc dựa trên searchTerm từ prop
  const filteredLooks = useMemo(() => {
    if (!searchTerm) return looks;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return looks.filter(l => 
      l.title?.toLowerCase().includes(lowerCaseSearch) ||
      l.category_id?.toLowerCase().includes(lowerCaseSearch) ||
      l.slug?.toLowerCase().includes(lowerCaseSearch) // Lọc theo slug
    );
  }, [looks, searchTerm]);

  // Lấy danh mục cha chính (menu_location = 'main')
  const mainCategories = useMemo(() => 
    categories.filter(c => !c.parent_id && c.menu_location === 'main'),
    [categories]
  );

  // Nhóm Lookbook theo slug danh mục cha (category_id trong lookbook là slug)
  const looksByCategorySlug = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    filteredLooks.forEach(look => {
      // Tìm danh mục cha của lookbook (dựa trên category_id là slug)
      const cat = categories.find(c => c.slug === look.category_id);
      let parentSlug = cat?.slug;
      
      if (cat?.parent_id) {
        const parent = categories.find(c => c.id === cat.parent_id);
        parentSlug = parent?.slug;
      }
      
      if (parentSlug) {
        if (!grouped[parentSlug]) {
          grouped[parentSlug] = [];
        }
        grouped[parentSlug].push(look);
      }
    });
    return grouped;
  }, [filteredLooks, categories]);

  // Lấy danh sách các slug danh mục cha có Lookbook
  const categoriesWithLooks = useMemo(() => {
    return mainCategories.filter(cat => looksByCategorySlug[cat.slug]?.length > 0);
  }, [mainCategories, looksByCategorySlug]);


  return (
    <div className="space-y-6 mt-6">
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : categoriesWithLooks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-border text-muted-foreground italic">Chưa có Lookbook nào được tạo hoặc gán vào danh mục chính.</div>
      ) : (
        <Accordion type="multiple" defaultValue={[]} className="w-full space-y-4">
          {categoriesWithLooks.map(cat => {
            const childLooks = looksByCategorySlug[cat.slug] || [];

            return (
              <AccordionItem key={cat.slug} value={cat.slug} className="border-none">
                <AccordionTrigger className="bg-white p-4 rounded-2xl border shadow-sm hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Folder className="w-5 h-5 text-primary" />
                    <span className="font-bold text-charcoal">{cat.name}</span>
                    <Badge variant="secondary">{childLooks.length}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pl-8">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {childLooks.map(look => (
                      <div key={look.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden group">
                        <div className="relative aspect-square">
                          <img src={look.image_url} className="w-full h-full object-cover" alt={look.title} />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                            <Button size="sm" variant="secondary" asChild>
                              <Link to={`/admin/content/looks/edit/${look.id}`}><Edit className="w-4 h-4 mr-2" /> Chỉnh sửa</Link>
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 text-center flex flex-col items-center">
                          <h3 className="font-bold text-sm line-clamp-1">{look.title}</h3>
                          <code className="text-[10px] text-muted-foreground block mt-1 font-mono">/{look.slug || look.id}</code>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" /> {look.shop_look_items?.length || 0} sản phẩm
                          </p>
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 mt-3" onClick={() => setDeleteId(look.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      <ConfirmDialog 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa Lookbook"
        description="Hành động này sẽ xóa vĩnh viễn Lookbook và các sản phẩm gắn thẻ khỏi hệ thống."
        confirmText="Vẫn xóa Lookbook"
      />
    </div>
  );
}