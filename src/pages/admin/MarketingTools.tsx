import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  ShoppingBag, 
  Star, 
  Layers, 
  Zap, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  Filter,
  ListOrdered
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { mainCategories, productCategories } from "@/constants/header-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MarketingTools() {
  const [loading, setLoading] = useState(false);
  const [selectionType, setSelectionType] = useState<"category" | "product">("category");
  const [targetId, setTargetId] = useState("all");
  const [updateZeroOnly, setUpdateZeroOnly] = useState(false);

  // Sorting State
  const [sortCategory, setSortCategory] = useState("");
  const [productsToSort, setProductsToSort] = useState<any[]>([]);
  const [sortLoading, setSortLoading] = useState(false);

  // Stats Range State
  const [stats, setStats] = useState({
    min_sold: "", max_sold: "",
    min_reviews: "", max_reviews: "",
    min_rating: "4.5", max_rating: "5.0",
    display_order: ""
  });

  const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const getRandomFloat = (min: number, max: number) => {
    return (Math.random() * (max - min) + min).toFixed(1);
  };

  const handleBulkUpdate = async () => {
    if (!confirm("Hệ thống sẽ tính toán số liệu ngẫu nhiên cho từng sản phẩm. Bạn chắc chắn chứ?")) return;
    
    setLoading(true);
    try {
      let query = supabase.from('products').select('id, fake_sold');

      if (selectionType === 'category' && targetId !== 'all') {
        query = query.eq('category_id', targetId);
      } else if (selectionType === 'product' && targetId !== 'all') {
        query = query.eq('id', targetId);
      }

      const { data: products, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      if (!products || products.length === 0) {
        toast.info("Không tìm thấy sản phẩm nào phù hợp điều kiện.");
        return;
      }

      const filteredProducts = updateZeroOnly 
        ? products.filter(p => !p.fake_sold || p.fake_sold === 0) 
        : products;

      if (filteredProducts.length === 0) {
        toast.info("Không có sản phẩm nào đang có lượt bán bằng 0.");
        return;
      }

      const updatePromises = filteredProducts.map(p => {
        const payload: any = { updated_at: new Date() };
        
        if (stats.min_sold && stats.max_sold) {
          payload.fake_sold = getRandomInt(parseInt(stats.min_sold), parseInt(stats.max_sold));
        }
        
        if (stats.min_reviews && stats.max_reviews) {
          payload.fake_review_count = getRandomInt(parseInt(stats.min_reviews), parseInt(stats.max_reviews));
        }

        if (stats.min_rating && stats.max_rating) {
          payload.fake_rating = parseFloat(getRandomFloat(parseFloat(stats.min_rating), parseFloat(stats.max_rating)));
        }

        if (stats.display_order) {
          payload.display_order = parseInt(stats.display_order);
        }

        return supabase.from('products').update(payload).eq('id', p.id);
      });

      await Promise.all(updatePromises);

      toast.success(`Đã cập nhật thành công ${filteredProducts.length} sản phẩm!`);
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsForSorting = async (categorySlug: string) => {
    setSortLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('id, name, display_order, image_url')
        .order('display_order', { ascending: true });

      if (categorySlug) {
        // Tìm category ID nếu cần, hoặc dùng slug trực tiếp như hiện tại
        // Logic tìm con:
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .single();

        if (categoryData) {
           const { data: children } = await supabase.from('categories').select('slug').eq('parent_id', categoryData.id);
           const slugs = [categorySlug, ...(children?.map(c => c.slug) || [])];
           query = query.in('category_id', slugs);
        } else {
           query = query.eq('category_id', categorySlug);
        }
      }

      const { data } = await query.limit(50); // Lấy 50 sp đầu để sắp xếp
      setProductsToSort(data || []);
    } finally {
      setSortLoading(false);
    }
  };

  const handleUpdateOrder = async (id: string, newOrder: string) => {
    const order = parseInt(newOrder);
    if (isNaN(order)) return;

    // Optimistic update
    setProductsToSort(prev => prev.map(p => p.id === id ? { ...p, display_order: order } : p).sort((a, b) => a.display_order - b.display_order));

    await supabase.from('products').update({ display_order: order }).eq('id', id);
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Chiến Dịch Marketing & Sắp Xếp
        </h1>
        <p className="text-muted-foreground text-sm">Quản lý số liệu ảo và thứ tự ưu tiên hiển thị sản phẩm.</p>
      </div>

      <Tabs defaultValue="marketing" className="space-y-6">
        <TabsList className="bg-white border p-1 rounded-xl h-12 w-full justify-start">
          <TabsTrigger value="marketing" className="rounded-lg h-10 px-6 data-[state=active]:bg-primary data-[state=active]:text-white uppercase font-bold text-xs">Tạo số liệu ảo</TabsTrigger>
          <TabsTrigger value="sorting" className="rounded-lg h-10 px-6 data-[state=active]:bg-primary data-[state=active]:text-white uppercase font-bold text-xs">Sắp xếp vị trí</TabsTrigger>
        </TabsList>

        <TabsContent value="marketing">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6 h-full">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <Filter className="w-4 h-4" /> 1. Phạm vi tác động
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Chọn loại đối tượng</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant={selectionType === 'category' ? 'default' : 'outline'} 
                        size="sm" 
                        onClick={() => { setSelectionType('category'); setTargetId('all'); }}
                        className="text-[10px] h-9"
                      >
                        Theo Danh Mục
                      </Button>
                      <Button 
                        variant={selectionType === 'product' ? 'default' : 'outline'} 
                        size="sm" 
                        onClick={() => { setSelectionType('product'); setTargetId('all'); }}
                        className="text-[10px] h-9"
                      >
                        Sản Phẩm Đơn
                      </Button>
                    </div>
                  </div>

                  {selectionType === 'category' ? (
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Danh mục mục tiêu</Label>
                      <Select value={targetId} onValueChange={setTargetId}>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="all">Toàn bộ website</SelectItem>
                          {mainCategories.filter(c => c.dropdownKey).map(parent => (
                            <SelectGroup key={parent.dropdownKey}>
                              <SelectLabel className="text-primary font-bold">{parent.name}</SelectLabel>
                              <SelectItem value={parent.dropdownKey!}>— Tất cả {parent.name}</SelectItem>
                              {productCategories[parent.dropdownKey!]?.map(child => (
                                <SelectItem key={child.href} value={child.href.replace('/', '')}>
                                  &nbsp;&nbsp;&nbsp;{child.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Mã sản phẩm (ID)</Label>
                      <Input 
                        placeholder="Dán ID sản phẩm vào đây..." 
                        value={targetId === 'all' ? '' : targetId}
                        onChange={(e) => setTargetId(e.target.value)}
                        className="h-11 rounded-xl font-mono text-xs"
                      />
                    </div>
                  )}

                  <div className="pt-4 border-t border-border/50">
                    <div className="flex items-center space-x-3 p-3 bg-secondary/30 rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => setUpdateZeroOnly(!updateZeroOnly)}>
                      <Checkbox checked={updateZeroOnly} onCheckedChange={(val) => setUpdateZeroOnly(!!val)} />
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold">Chỉ hàng chưa có lượt bán</span>
                        <span className="text-[9px] text-muted-foreground italic">Giúp kích cầu sản phẩm mới đăng</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-2xl border shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-8 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> 2. Thiết lập số liệu ngẫu nhiên
                </h3>
                
                <div className="grid gap-8">
                  {/* Fields for fake stats */}
                  <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-4">
                    <Label className="md:col-span-1 flex items-center gap-2 text-xs font-bold uppercase"><ShoppingBag className="w-4 h-4 text-emerald-500" /> Lượt bán</Label>
                    <div className="md:col-span-4 flex items-center gap-4">
                      <Input type="number" placeholder="Min" value={stats.min_sold} onChange={(e) => setStats({...stats, min_sold: e.target.value})} className="h-12 rounded-xl" />
                      <span className="text-muted-foreground">-</span>
                      <Input type="number" placeholder="Max" value={stats.max_sold} onChange={(e) => setStats({...stats, max_sold: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-4">
                    <Label className="md:col-span-1 flex items-center gap-2 text-xs font-bold uppercase"><Star className="w-4 h-4 text-amber-500" /> Số ĐG</Label>
                    <div className="md:col-span-4 flex items-center gap-4">
                      <Input type="number" placeholder="Min" value={stats.min_reviews} onChange={(e) => setStats({...stats, min_reviews: e.target.value})} className="h-12 rounded-xl" />
                      <span className="text-muted-foreground">-</span>
                      <Input type="number" placeholder="Max" value={stats.max_reviews} onChange={(e) => setStats({...stats, max_reviews: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-4">
                    <Label className="md:col-span-1 flex items-center gap-2 text-xs font-bold uppercase">⭐ Điểm sao</Label>
                    <div className="md:col-span-4 flex items-center gap-4">
                      <Input type="number" step="0.1" placeholder="4.0" value={stats.min_rating} onChange={(e) => setStats({...stats, min_rating: e.target.value})} className="h-12 rounded-xl" />
                      <span className="text-muted-foreground">-</span>
                      <Input type="number" step="0.1" placeholder="5.0" value={stats.max_rating} onChange={(e) => setStats({...stats, max_rating: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                  </div>
                </div>

                <div className="mt-12">
                  <Button onClick={handleBulkUpdate} disabled={loading} className="w-full btn-hero h-14 shadow-gold rounded-2xl flex items-center justify-center gap-3 text-sm font-bold">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    XÁC NHẬN CHẠY
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sorting">
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex items-center gap-6 mb-8 p-4 bg-secondary/20 rounded-xl">
              <div className="flex-1">
                <Label className="text-xs font-bold uppercase tracking-widest mb-2 block">Chọn danh mục để sắp xếp</Label>
                <Select value={sortCategory} onValueChange={(val) => { setSortCategory(val); fetchProductsForSorting(val); }}>
                  <SelectTrigger className="h-12 bg-white rounded-xl">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {mainCategories.filter(c => c.dropdownKey).map(parent => (
                      <SelectGroup key={parent.dropdownKey}>
                        <SelectLabel className="text-primary font-bold">{parent.name}</SelectLabel>
                        <SelectItem value={parent.dropdownKey!}>— Tất cả {parent.name}</SelectItem>
                        {productCategories[parent.dropdownKey!]?.map(child => (
                          <SelectItem key={child.href} value={child.href.replace('/', '')}>&nbsp;&nbsp;&nbsp;{child.name}</SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mt-6">
                  * Nhập số thứ tự từ 1-20 để đưa sản phẩm lên đầu danh sách.<br/>
                  * Mặc định sản phẩm mới sẽ có thứ tự 1000.
                </p>
              </div>
            </div>

            {sortLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
            ) : productsToSort.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">Vui lòng chọn danh mục để bắt đầu sắp xếp.</div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-secondary/50 rounded-lg text-[10px] uppercase font-bold text-muted-foreground">
                  <div className="col-span-1 text-center">Vị trí</div>
                  <div className="col-span-1">Hình ảnh</div>
                  <div className="col-span-10">Tên sản phẩm</div>
                </div>
                {productsToSort.map((product) => (
                  <div key={product.id} className="grid grid-cols-12 gap-4 items-center p-2 border border-border rounded-lg bg-white hover:shadow-md transition-all">
                    <div className="col-span-1">
                      <Input 
                        type="number" 
                        className={`h-10 text-center font-bold ${product.display_order <= 20 ? 'text-primary border-primary bg-primary/5' : 'text-muted-foreground'}`}
                        value={product.display_order}
                        onChange={(e) => handleUpdateOrder(product.id, e.target.value)}
                      />
                    </div>
                    <div className="col-span-1">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-border">
                        <img src={product.image_url} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="col-span-10 font-medium text-sm text-charcoal">{product.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}