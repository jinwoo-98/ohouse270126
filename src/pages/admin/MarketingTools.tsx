import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  Zap, 
  Loader2, 
  Filter,
  RefreshCw,
  MessageSquareQuote,
  Save,
  Clock
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

const VN_LAST_NAMES = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"];
const VN_MID_NAMES = ["Văn", "Thị", "Hồng", "Minh", "Anh", "Quang", "Xuân", "Thanh", "Đức", "Trọng", "Kim", "Ngọc"];
const VN_FIRST_NAMES = ["An", "Bình", "Chi", "Dũng", "Giang", "Hương", "Khánh", "Linh", "Nam", "Oanh", "Phúc", "Quyên", "Sơn", "Thảo", "Uyên", "Vinh", "Yến", "Tùng", "Lâm", "Hải"];

// Danh sách comment được cải tiến chân thực hơn
const REVIEW_COMMENTS = [
  "Hàng đẹp lắm mng ơi, nên mua nhaaa 😍 sp đóng gói kỹ, ko trầy xước tí nào luôn",
  "Rất ưbg mẫu này luôn ạ. Gỗ chắc chắn, màu sang hơn trên ảnh nhiều ✨✨",
  "Giao hàng nhanh vãi, mới đặt hôm kia mà nay có r. Nhân viên lắp đặt nhiệt tình lắm 👍👍",
  "Sp tốt, đúng mô tả. Đáng tiền bát gạo 💯💯💯",
  "Màu này hợp phong thủy nhà mình cực, ai đến cũng khen. Cảm ơn shop nhen!",
  "Đẹp quáaaaa, nhìn xịn xò hẳn cái phòng khách. Ưng cái bụng ghê",
  "Sofa êm cực kỳ, hoàn thiện tỉ mỉ. Ohousr làm ăn uy tín thật sự",
  "Ko uổng công chờ đợi, sp quá xuất sắc mng ạ. 5 saooooo ⭐⭐⭐⭐⭐",
  "Hàng chuẩn auth, gỗ thơm tự nhiên. Sẽ ủng hộ shop dài dài",
  "Xịn đét luôn, ko có điểm gì để chê. Đóng thùng gỗ cẩn thận lắm ạ ❤️❤️",
  "Lắp xong cái mê luôn, mẫu mã hiện đại, chắc chắn. Shop tư vấn có tâm lắm",
  "Đẹp hơn mong đợi, sp okela lắm nha. Giao hàng tỉnh mà nhanh bất ngờ",
  "Chất liệu cao cấp sờ sướng tay cực. Ưng vãi chưởng 😂",
  "Mng nên mua nhé, shop này làm đồ nội thất đỉnh thật sự. Giá hơi cao tí nhưng sắt ra miếng",
  "Vừa nhận đc hàng xong, cảm nhận ban đầu là sp cực kỳ chất lượng. Sẽ giới thiệu cho bạn bè",
  "Sp 10/10 nha mng, ko mua là phí lắm. Shop phục vụ quá tốt 🔥🔥🔥",
  "Ship nhanh, đóng gói cẩn thận. Sp ko lỗi lầm gì, quá tuyệt vời!",
  "Chất lượng gỗ quá ok, vân đẹp. Ohouse số 1 luôn nhé 👍",
  "Lần đầu mua nội thất online mà ưng ntn. Đúng là tiền nào của nấy",
  "Sản phẩm sang chảnh, nâng tầm căn hộ luôn. Love itttt 😍✨"
];

export default function MarketingTools() {
  const [loading, setLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [selectionType, setSelectionType] = useState<"category" | "product">("category");
  const [targetId, setTargetId] = useState("all");
  const [updateZeroOnly, setUpdateZeroOnly] = useState(false);

  const [sortCategory, setSortCategory] = useState("");
  const [productsToSort, setProductsToSort] = useState<any[]>([]);
  const [sortLoading, setSortLoading] = useState(false);
  const [savingSort, setSavingSort] = useState(false);

  const [stats, setStats] = useState({
    min_sold: "50", max_sold: "200",
    min_reviews: "10", max_reviews: "30",
    min_rating: "4.8", max_rating: "5.0",
    review_days_back: "60",
    display_order: ""
  });

  const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const getRandomFloat = (min: number, max: number) => (Math.random() * (max - min) + min).toFixed(1);
  const getRandomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

  const generateVnName = () => {
    return `${getRandomItem(VN_LAST_NAMES)} ${getRandomItem(VN_MID_NAMES)} ${getRandomItem(VN_FIRST_NAMES)}`;
  };

  const handleBulkUpdate = async () => {
    if (!confirm("Hệ thống sẽ tính toán số liệu ngẫu nhiên cho từng sản phẩm. Tiếp tục?")) return;
    
    setLoading(true);
    try {
      let query = supabase.from('products').select('id, fake_sold');
      if (selectionType === 'category' && targetId !== 'all') query = query.eq('category_id', targetId);
      else if (selectionType === 'product' && targetId !== 'all') query = query.eq('id', targetId);

      const { data: products } = await query;
      if (!products || products.length === 0) { toast.info("Không tìm thấy sản phẩm."); return; }

      const filtered = updateZeroOnly ? products.filter(p => !p.fake_sold || p.fake_sold === 0) : products;

      const promises = filtered.map(p => {
        const payload: any = { updated_at: new Date() };
        payload.fake_sold = getRandomInt(parseInt(stats.min_sold), parseInt(stats.max_sold));
        payload.fake_review_count = getRandomInt(parseInt(stats.min_reviews), parseInt(stats.max_reviews));
        payload.fake_rating = parseFloat(getRandomFloat(parseFloat(stats.min_rating), parseFloat(stats.max_rating)));
        if (stats.display_order) payload.display_order = parseInt(stats.display_order);
        return supabase.from('products').update(payload).eq('id', p.id);
      });

      await Promise.all(promises);
      toast.success(`Đã cập nhật ${filtered.length} sản phẩm.`);
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  const handleGenerateReviews = async () => {
    const daysBack = parseInt(stats.review_days_back) || 30;
    if (!confirm(`Xác nhận sinh nội dung đánh giá ngẫu nhiên trong khoảng ${daysBack} ngày qua?`)) return;

    setReviewLoading(true);
    try {
      let query = supabase.from('products').select('id, name, fake_review_count, fake_rating');
      if (selectionType === 'category' && targetId !== 'all') query = query.eq('category_id', targetId);
      else if (selectionType === 'product' && targetId !== 'all') query = query.eq('id', targetId);

      const { data: products } = await query;
      if (!products || products.length === 0) { toast.info("Không có sản phẩm."); return; }

      for (const p of products) {
        const count = p.fake_review_count || 0;
        if (count === 0) continue;

        await supabase.from('reviews').delete().eq('product_id', p.id);

        const newReviews = [];
        for (let i = 0; i < count; i++) {
          const randomDays = getRandomInt(1, daysBack);
          const randomHours = getRandomInt(0, 23);
          const randomMins = getRandomInt(0, 59);
          
          const date = new Date();
          date.setDate(date.getDate() - randomDays);
          date.setHours(randomHours);
          date.setMinutes(randomMins);

          newReviews.push({
            product_id: p.id,
            user_name: generateVnName(),
            rating: Math.round(p.fake_rating || 5),
            comment: getRandomItem(REVIEW_COMMENTS),
            created_at: date.toISOString()
          });
        }
        if (newReviews.length > 0) await supabase.from('reviews').insert(newReviews);
      }
      toast.success(`Đã sinh đánh giá tự nhiên trong khoảng ${daysBack} ngày thành công!`);
    } catch (e: any) { toast.error(e.message); } finally { setReviewLoading(false); }
  };

  const fetchProductsForSorting = async (categorySlug: string) => {
    setSortLoading(true);
    try {
      const { data } = await supabase.from('products').select('id, name, display_order, image_url').eq('category_id', categorySlug).order('display_order', { ascending: true });
      setProductsToSort(data || []);
    } finally { setSortLoading(false); }
  };

  const saveSortingPositions = async () => {
    setSavingSort(true);
    try {
      await Promise.all(productsToSort.map(p => supabase.from('products').update({ display_order: p.display_order }).eq('id', p.id)));
      toast.success("Đã lưu vị trí!");
    } finally { setSavingSort(false); }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" /> Marketing & Sắp Xếp
        </h1>
        <p className="text-muted-foreground text-sm">Quản lý số liệu ảo và thứ tự hiển thị sản phẩm.</p>
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
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2"><Filter className="w-4 h-4" /> 1. Phạm vi tác động</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant={selectionType === 'category' ? 'default' : 'outline'} size="sm" onClick={() => setSelectionType('category')} className="text-[10px] h-9">Danh Mục</Button>
                    <Button variant={selectionType === 'product' ? 'default' : 'outline'} size="sm" onClick={() => setSelectionType('product')} className="text-[10px] h-9">Sản Phẩm</Button>
                  </div>
                  {selectionType === 'category' ? (
                    <Select value={targetId} onValueChange={setTargetId}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
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
                    <span className="text-[11px] font-bold">Chỉ hàng có lượt bán bằng 0</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-2xl border shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-8 flex items-center gap-2"><Zap className="w-4 h-4" /> 2. Thiết lập thông số ảo</h3>
                <div className="grid gap-6">
                  <div className="grid grid-cols-5 items-center gap-4">
                    <Label className="col-span-1 text-xs font-bold uppercase">Lượt bán</Label>
                    <div className="col-span-4 flex items-center gap-4">
                      <Input type="number" value={stats.min_sold} onChange={e => setStats({...stats, min_sold: e.target.value})} className="h-12 rounded-xl" />
                      <Input type="number" value={stats.max_sold} onChange={e => setStats({...stats, max_sold: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-5 items-center gap-4">
                    <Label className="col-span-1 text-xs font-bold uppercase">Lượt đánh giá</Label>
                    <div className="col-span-4 flex items-center gap-4">
                      <Input type="number" value={stats.min_reviews} onChange={e => setStats({...stats, min_reviews: e.target.value})} className="h-12 rounded-xl" />
                      <Input type="number" value={stats.max_reviews} onChange={e => setStats({...stats, max_reviews: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-5 items-center gap-4">
                    <Label className="col-span-1 text-xs font-bold uppercase">Điểm sao</Label>
                    <div className="col-span-4 flex items-center gap-4">
                      <Input type="number" step="0.1" value={stats.min_rating} onChange={e => setStats({...stats, min_rating: e.target.value})} className="h-12 rounded-xl" />
                      <Input type="number" step="0.1" value={stats.max_rating} onChange={e => setStats({...stats, max_rating: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                  </div>
                </div>
                <Button onClick={handleBulkUpdate} disabled={loading} className="w-full mt-10 btn-hero h-14 shadow-gold rounded-2xl text-sm font-bold uppercase">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5 mr-2" />} Cập nhật thông số hàng loạt
                </Button>
              </div>

              <div className="bg-charcoal p-8 rounded-3xl border shadow-elevated text-cream">
                 <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2"><MessageSquareQuote className="w-5 h-5" /> 3. Nội dung đánh giá thực tế</h3>
                
                <div className="space-y-4 mb-8">
                  <p className="text-sm text-taupe leading-relaxed">Hệ thống sẽ tự động tạo các bản ghi đánh giá chi tiết (tên khách hàng, nội dung khen, ngày giờ) dựa trên số lượng "Lượt đánh giá ảo" ở bước 2.</p>
                  
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> Khoảng thời gian phát tán (Số ngày về trước)
                    </Label>
                    <Input 
                      type="number" 
                      value={stats.review_days_back} 
                      onChange={e => setStats({...stats, review_days_back: e.target.value})} 
                      placeholder="Ví dụ: 60 (Sinh đánh giá rải rác trong 60 ngày qua)"
                      className="h-12 bg-white/10 border-white/20 text-cream placeholder:text-taupe focus:border-primary"
                    />
                    <p className="text-[10px] italic text-taupe">Gợi ý: 30-90 ngày để trông tự nhiên nhất.</p>
                  </div>
                </div>

                <Button onClick={handleGenerateReviews} disabled={reviewLoading} variant="outline" className="w-full h-14 border-primary/40 hover:bg-primary text-primary hover:text-white rounded-2xl text-sm font-bold uppercase">
                  {reviewLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 mr-2" />} Sinh nội dung đánh giá hàng loạt
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
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Chọn danh mục..." /></SelectTrigger>
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
              <Button className="btn-hero h-12 px-8 rounded-xl shadow-gold" onClick={saveSortingPositions} disabled={productsToSort.length === 0 || savingSort}>
                {savingSort ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} LƯU VỊ TRÍ
              </Button>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {productsToSort.map((product) => (
                <div key={product.id} className="grid grid-cols-12 gap-4 items-center p-3 border border-border rounded-xl bg-card hover:border-primary/40 transition-all">
                  <div className="col-span-2"><Input type="number" value={product.display_order} onChange={(e) => setProductsToSort(prev => prev.map(p => p.id === product.id ? { ...p, display_order: parseInt(e.target.value) || 0 } : p))} className="h-10 text-center font-bold" /></div>
                  <div className="col-span-1"><img src={product.image_url} className="w-10 h-10 rounded-lg object-cover border" /></div>
                  <div className="col-span-9 font-medium text-sm text-charcoal">{product.name}</div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}