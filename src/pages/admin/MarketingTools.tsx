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
  Save,
  RefreshCw,
  MessageSquareQuote
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
import { cn } from "@/lib/utils";

// Dữ liệu mẫu để sinh fake reviews
const VN_LAST_NAMES = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"];
const VN_MID_NAMES = ["Văn", "Thị", "Hồng", "Minh", "Anh", "Quang", "Xuân", "Thanh", "Đức", "Trọng", "Kim", "Ngọc"];
const VN_FIRST_NAMES = ["An", "Bình", "Chi", "Dũng", "Giang", "Hương", "Khánh", "Linh", "Nam", "Oanh", "Phúc", "Quyên", "Sơn", "Thảo", "Uyên", "Vinh", "Yến", "Tùng", "Lâm", "Hải"];

const REVIEW_COMMENTS = [
  "Sản phẩm rất đẹp, đúng như mô tả. Giao hàng nhanh.",
  "Chất lượng tuyệt vời, gỗ rất chắc chắn. Rất hài lòng.",
  "Đóng gói cẩn thận, nhân viên lắp đặt nhiệt tình. 5 sao!",
  "Màu sắc sang trọng, phù hợp với phòng khách nhà mình.",
  "Giá cả hợp lý so với chất lượng. Sẽ ủng hộ shop tiếp.",
  "Hàng đẹp, giao đúng hẹn. Cảm ơn shop.",
  "Rất ưng ý với bộ sản phẩm này. Đẳng cấp thực sự.",
  "Sofa ngồi rất êm, hoàn thiện cực kỳ tỉ mỉ.",
  "Thiết kế hiện đại, chắc chắn hơn mình nghĩ nhiều.",
  "Dịch vụ chăm sóc khách hàng của OHOUSE rất chuyên nghiệp.",
  "Mới nhận hàng sáng nay, lắp đặt xong nhìn mê luôn.",
  "Chất liệu cao cấp, sờ vào thấy khác biệt hẳn.",
  "Đáng đồng tiền bát gạo, mọi người nên mua nhé.",
  "Tìm mãi mới được mẫu ưng ý thế này, cảm ơn đội ngũ tư vấn.",
  "Giao hàng tỉnh mà cũng rất nhanh, đóng thùng gỗ cẩn thận."
];

export default function MarketingTools() {
  const [loading, setLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [selectionType, setSelectionType] = useState<"category" | "product">("category");
  const [targetId, setTargetId] = useState("all");
  const [updateZeroOnly, setUpdateZeroOnly] = useState(false);

  // Sorting State
  const [sortCategory, setSortCategory] = useState("");
  const [productsToSort, setProductsToSort] = useState<any[]>([]);
  const [sortLoading, setSortLoading] = useState(false);
  const [savingSort, setSavingSort] = useState(false);

  // Stats Range State
  const [stats, setStats] = useState({
    min_sold: "50", max_sold: "200",
    min_reviews: "10", max_reviews: "30",
    min_rating: "4.8", max_rating: "5.0",
    display_order: ""
  });

  const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const getRandomFloat = (min: number, max: number) => (Math.random() * (max - min) + min).toFixed(1);
  const getRandomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

  const generateVnName = () => {
    return `${getRandomItem(VN_LAST_NAMES)} ${getRandomItem(VN_MID_NAMES)} ${getRandomItem(VN_FIRST_NAMES)}`;
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

      const updatePromises = filteredProducts.map(p => {
        const payload: any = { updated_at: new Date() };
        if (stats.min_sold && stats.max_sold) payload.fake_sold = getRandomInt(parseInt(stats.min_sold), parseInt(stats.max_sold));
        if (stats.min_reviews && stats.max_reviews) payload.fake_review_count = getRandomInt(parseInt(stats.min_reviews), parseInt(stats.max_reviews));
        if (stats.min_rating && stats.max_rating) payload.fake_rating = parseFloat(getRandomFloat(parseFloat(stats.min_rating), parseFloat(stats.max_rating)));
        if (stats.display_order) payload.display_order = parseInt(stats.display_order);
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

  const handleGenerateReviews = async () => {
    if (!confirm("Hệ thống sẽ xóa các đánh giá cũ và sinh nội dung mới dựa trên 'Số lượt đánh giá' hiện tại của mỗi sản phẩm. Tiếp tục?")) return;

    setReviewLoading(true);
    try {
      // 1. Lấy sản phẩm
      let query = supabase.from('products').select('id, name, fake_review_count, fake_rating');
      if (selectionType === 'category' && targetId !== 'all') query = query.eq('category_id', targetId);
      else if (selectionType === 'product' && targetId !== 'all') query = query.eq('id', targetId);

      const { data: products } = await query;
      if (!products || products.length === 0) {
        toast.info("Không có sản phẩm nào.");
        return;
      }

      // 2. Với mỗi sản phẩm, sinh nội dung đánh giá
      for (const p of products) {
        const count = p.fake_review_count || 0;
        if (count === 0) continue;

        // Xóa đánh giá cũ trước khi sinh mới (tùy chọn)
        await supabase.from('reviews').delete().eq('product_id', p.id);

        const newReviews = [];
        for (let i = 0; i < count; i++) {
          const randomDays = getRandomInt(1, 90);
          const createdAt = new Date();
          createdAt.setDate(createdAt.getDate() - randomDays);
          createdAt.setHours(getRandomInt(8, 22), getRandomInt(0, 59));

          newReviews.push({
            product_id: p.id,
            user_name: generateVnName(),
            rating: Math.round(p.fake_rating || 5),
            comment: getRandomItem(REVIEW_COMMENTS),
            created_at: createdAt.toISOString()
          });
        }

        // Insert theo batch để tối ưu
        if (newReviews.length > 0) {
          await supabase.from('reviews').insert(newReviews);
        }
      }

      toast.success("Đã sinh nội dung đánh giá thành công cho các sản phẩm!");
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const fetchProductsForSorting = async (categorySlug: string) => {
    setSortLoading(true);
    try {
      let query = supabase.from('products').select('id, name, display_order, image_url');
      if (categorySlug) {
        const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).single();
        if (cat) {
           const { data: children } = await supabase.from('categories').select('slug').eq('parent_id', cat.id);
           const slugs = [categorySlug, ...(children?.map(c => c.slug) || [])];
           query = query.in('category_id', slugs);
        } else {
           query = query.eq('category_id', categorySlug);
        }
      }
      const { data } = await query.order('display_order', { ascending: true }).limit(100);
      setProductsToSort(data || []);
    } finally {
      setSortLoading(false);
    }
  };

  const saveSortingPositions = async () => {
    setSavingSort(true);
    try {
      const promises = productsToSort.map(p => 
        supabase.from('products').update({ display_order: p.display_order }).eq('id', p.id)
      );
      await Promise.all(promises);
      toast.success("Đã lưu vị trí sắp xếp mới!");
    } catch (e) {
      toast.error("Lỗi khi lưu vị trí");
    } finally {
      setSavingSort(false);
    }
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
        <TabsList className="bg-white border p-1 rounded-xl h-12 w-full justify-start shadow-sm">
          <TabsTrigger value="marketing" className="rounded-lg h-10 px-6 data-[state=active]:bg-primary data-[state=active]:text-white uppercase font-bold text-xs">Số liệu & Đánh giá</TabsTrigger>
          <TabsTrigger value="sorting" className="rounded-lg h-10 px-6 data-[state=active]:bg-primary data-[state=active]:text-white uppercase font-bold text-xs">Sắp xếp vị trí</TabsTrigger>
        </TabsList>

        <TabsContent value="marketing" className="animate-fade-in">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <Filter className="w-4 h-4" /> 1. Phạm vi tác động
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Chọn đối tượng</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant={selectionType === 'category' ? 'default' : 'outline'} size="sm" onClick={() => setSelectionType('category')} className="text-[10px] h-9">Danh Mục</Button>
                      <Button variant={selectionType === 'product' ? 'default' : 'outline'} size="sm" onClick={() => setSelectionType('product')} className="text-[10px] h-9">Sản Phẩm</Button>
                    </div>
                  </div>
                  {selectionType === 'category' ? (
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
                              <SelectItem key={child.href} value={child.href.replace('/', '')}>&nbsp;&nbsp;&nbsp;{child.name}</SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input placeholder="Dán ID sản phẩm..." value={targetId === 'all' ? '' : targetId} onChange={e => setTargetId(e.target.value)} className="h-11 rounded-xl font-mono text-xs" />
                  )}
                  <div className="flex items-center space-x-3 p-3 bg-secondary/30 rounded-xl cursor-pointer" onClick={() => setUpdateZeroOnly(!updateZeroOnly)}>
                    <Checkbox checked={updateZeroOnly} onCheckedChange={(val) => setUpdateZeroOnly(!!val)} />
                    <div className="flex flex-col"><span className="text-[11px] font-bold">Chỉ hàng có lượt bán bằng 0</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-2xl border shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-8 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> 2. Thiết lập thông số ảo
                </h3>
                <div className="grid gap-6">
                  <div className="grid grid-cols-5 items-center gap-4">
                    <Label className="col-span-1 text-xs font-bold uppercase">Lượt bán</Label>
                    <div className="col-span-4 flex items-center gap-4">
                      <Input type="number" placeholder="Min" value={stats.min_sold} onChange={e => setStats({...stats, min_sold: e.target.value})} className="h-12 rounded-xl" />
                      <Input type="number" placeholder="Max" value={stats.max_sold} onChange={e => setStats({...stats, max_sold: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-5 items-center gap-4">
                    <Label className="col-span-1 text-xs font-bold uppercase">Lượt đánh giá</Label>
                    <div className="col-span-4 flex items-center gap-4">
                      <Input type="number" placeholder="Min" value={stats.min_reviews} onChange={e => setStats({...stats, min_reviews: e.target.value})} className="h-12 rounded-xl" />
                      <Input type="number" placeholder="Max" value={stats.max_reviews} onChange={e => setStats({...stats, max_reviews: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-5 items-center gap-4">
                    <Label className="col-span-1 text-xs font-bold uppercase">Điểm sao</Label>
                    <div className="col-span-4 flex items-center gap-4">
                      <Input type="number" step="0.1" placeholder="Min (4.5)" value={stats.min_rating} onChange={e => setStats({...stats, min_rating: e.target.value})} className="h-12 rounded-xl" />
                      <Input type="number" step="0.1" placeholder="Max (5.0)" value={stats.max_rating} onChange={e => setStats({...stats, max_rating: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                  </div>
                </div>
                <Button onClick={handleBulkUpdate} disabled={loading} className="w-full mt-10 btn-hero h-14 shadow-gold rounded-2xl text-sm font-bold uppercase">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5 mr-2" />} Cập nhật thông số hàng loạt
                </Button>
              </div>

              <div className="bg-charcoal p-8 rounded-3xl border shadow-elevated text-cream">
                 <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                  <MessageSquareQuote className="w-5 h-5" /> 3. Nội dung đánh giá thực tế
                </h3>
                <p className="text-sm text-taupe mb-8 leading-relaxed">
                  Tính năng này sẽ tự động tạo các bản ghi đánh giá chi tiết (tên khách hàng, nội dung khen, ngày giờ) cho sản phẩm dựa trên số lượng "Lượt đánh giá ảo" đã thiết lập ở bước 2.
                </p>
                <Button onClick={handleGenerateReviews} disabled={reviewLoading} variant="outline" className="w-full h-14 border-primary/40 hover:bg-primary text-primary hover:text-white rounded-2xl text-sm font-bold uppercase">
                  {reviewLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 mr-2" />} 
                  Sinh nội dung đánh giá hàng loạt
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sorting" className="animate-fade-in">
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
              <div className="flex-1 w-full">
                <Select value={sortCategory} onValueChange={(val) => { setSortCategory(val); fetchProductsForSorting(val); }}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Chọn danh mục để bắt đầu sắp xếp..." /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {mainCategories.filter(c => c.dropdownKey).map(parent => (
                      <SelectGroup key={parent.dropdownKey}>
                        <SelectLabel className="font-bold text-primary">{parent.name}</SelectLabel>
                        <SelectItem value={parent.dropdownKey!}>— Tất cả {parent.name}</SelectItem>
                        {productCategories[parent.dropdownKey!]?.map(child => (
                          <SelectItem key={child.href} value={child.href.replace('/', '')}>&nbsp;&nbsp;&nbsp;{child.name}</SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl" onClick={() => fetchProductsForSorting(sortCategory)} disabled={!sortCategory || sortLoading}>
                  <RefreshCw className={cn("w-5 h-5", sortLoading && "animate-spin")} />
                </Button>
                <Button className="btn-hero h-12 px-8 rounded-xl shadow-gold" onClick={saveSortingPositions} disabled={productsToSort.length === 0 || savingSort}>
                  {savingSort ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} LƯU VỊ TRÍ
                </Button>
              </div>
            </div>

            {sortLoading ? (
              <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
            ) : productsToSort.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground border-2 border-dashed border-border rounded-2xl">Vui lòng chọn danh mục.</div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {productsToSort.map((product) => (
                  <div key={product.id} className="grid grid-cols-12 gap-4 items-center p-3 border border-border rounded-xl bg-card hover:border-primary/40 transition-all">
                    <div className="col-span-2">
                      <Input 
                        type="number" 
                        value={product.display_order}
                        onChange={(e) => setProductsToSort(prev => prev.map(p => p.id === product.id ? { ...p, display_order: parseInt(e.target.value) || 0 } : p))}
                        className="h-10 text-center font-bold"
                      />
                    </div>
                    <div className="col-span-1">
                      <img src={product.image_url} className="w-10 h-10 rounded-lg object-cover border" />
                    </div>
                    <div className="col-span-9 font-medium text-sm text-charcoal">{product.name}</div>
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