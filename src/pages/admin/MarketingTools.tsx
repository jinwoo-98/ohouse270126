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

// Kho nội dung đánh giá phong phú hơn để tránh trùng lặp
const REVIEW_POOLS: Record<string, string[]> = {
  sofa: [
    "Sofa êm cực kỳ, hoàn thiện tỉ mỉ. Ohousr làm ăn uy tín thật sự 👍",
    "Đệm ngồi rất thik, vải nhung sờ mướt tay lắm nhen. Màu sang hơn ảnh 😍",
    "Form ghế đẹp, ngồi ko bị lún sâu quá, rất vừa vặn với pk nhà mình",
    "Vải bọc xịn xò, đường may chắc chắn. Giao hàng hơi chậm tí nhưng sp okela",
    "Mua cái sofa này xong nhìn cái phòng khách đẳng cấp hẳn luôn ✨✨",
    "Hàng đẹp, ngồi rất sướng. Da thật có khác, sờ vào mát tay cực kỳ nhen mng",
    "Shop tư vấn nhiệt tình, chọn đc mẫu sofa ưng ý hết nấc ntn 😂",
    "Đẹp hơn mong đợi nhiều luôn á. Lắp đặt nhanh gọn, thợ lễ phép",
    "Vừa nhận đc hàng xong, sofa dày dặn chắc nịch. Đáng đồng tiền bát gạo",
    "Màu sắc nhã nhặn, hợp nội thất nhà mình. Sẽ ủng hộ shop thêm nhen",
    "Chất lượng 10/10 nhen shop ơi, sp quá tuyệt vời luôn 💯"
  ],
  table_stand: [
    "Kệ tivi gỗ chắc chắn, mặt đá vân rất đẹp nha. Đóng gói kỹ ko trầy xước",
    "Bàn ăn đẹp quáaaaa, nhìn xịn xò hẳn. Ai đến cũng khen mẫu này lạ",
    "Rất ưbg mẫu bàn trà này, kích thước chuẩn, hoàn thiện cực sắc nét 💯",
    "Gỗ thơm, sơn phủ mượt. Mấy cái ngăn kéo mở rất êm ko bị kẹt",
    "Hàng chuẩn như showroom, mặt đá dày dặn chắc nịch luôn mng ạ",
    "Bàn ăn mặt đá sang trọng cực. Nhà mình ai cũng thik món này nhất",
    "Đóng gói siêu kỹ luôn, tháo ra mệt nghỉ luôn á 😂 nhưng bù lại sp ko vết xước",
    "Vân đá tự nhiên đẹp xuất sắc, chân inox mạ vàng nhìn rất luxury",
    "Lắp đặt chuyên nghiệp, bàn ăn chắc chắn ko bị rung lắc tí nào",
    "Đúng gu mình lun, tối giản mà đẳng cấp nhen. Cảm ơn shop nhìu",
    "Kệ tivi thiết kế hiện đại, để đồ decor vào nhìn sang hẳn luôn á"
  ],
  bed: [
    "Giường chắc chắn, lắp xong nằm thử thấy êm ru ko bị kêu cọt kẹt",
    "Mẫu giường luxury thật sự, bọc da rất tỉ mỉ. Đáng tiền bát gạo 💯💯",
    "Giường to rộng, gỗ dày dặn. Mấy bạn thợ lắp đặt nhiệt tình lắm nhen",
    "Từ ngày đổi giường này ngủ ngon hẳn luôn 😂 sp quá xuất sắc!",
    "Hàng đẹp, đóng thùng gỗ cẩn thận. Rất hài lòng với dịch vụ Ohouse",
    "Đệm đầu giường êm, đọc sách thoải mái ko bị mỏi lưng. Da xịn mịn",
    "Kiểu dáng tân cổ điển đẹp mê mẩn nhen mng. Màu kem rất sang",
    "Giường chắc, giát giường nan cong nằm thik cực kỳ luôn",
    "Shop giao đúng hẹn, nhân viên lắp đặt tận tâm. Sp đẹp như mẫu",
    "Nâng tầm phòng ngủ luôn á, nhìn như khách sạn 5 sao vậy 😍",
    "Thích nhất cái mùi gỗ tự nhiên của giường này. Thơm nhẹ nhàng"
  ],
  lighting: [
    "Đèn chùm lấp lánh lung linh luôn mng ơi ✨ treo lên cái phòng khách sang chảnh hẳn",
    "Pha lê xịn, ánh sáng dịu ko bị chói mắt. Shop đóng gói cực kỳ cẩn thận",
    "Lắp đặt hơi lâu tí nhưng thành quả quá mỹ mãn. Đèn đẹp 10/10 😍",
    "Mẫu đèn hiện đại, tinh tế. Sẽ ủng hộ shop thêm mấy mẫu đèn ngủ nữa",
    "Ánh sáng vàng ấm cúng, nhìn rất chill nha mng. Đáng mua ạ 👍",
    "Đèn đẹp dã man, lắp vào căn hộ nhìn lung linh hẳn lên nhen",
    "Pha lê K9 bắt sáng cực tốt, đêm bật đèn nhìn mê ly luôn ạ",
    "Giá hơi chát tí nhưng tiền nào của nấy, nhìn rất đẳng cấp nhen",
    "Mng nên mua nhé, mẫu này treo sảnh hay phòng khách đều ok",
    "Shop hướng dẫn lắp tận tình. Sp chất lượng, đóng gói 5 lớp luôn 😂",
    "Đèn chùm này là điểm nhấn hoàn hảo cho nhà mình rồi ✨"
  ],
  generic: [
    "Hàng đẹp lắm mng ơi, nên mua nhaaa 😍 sp đóng gói kỹ lắm",
    "Sp tốt, đúng mô tả. Sẽ giới thiệu cho bạn bè ủng hộ shop",
    "Giao hàng nhanh vãi, nhân viên lắp đặt nhiệt tình tận tâm 👍👍",
    "Sp chuẩn auth, hoàn thiện tốt. Tiền nào của nấy thật sự",
    "Mng nên mua nhé, shop này làm đồ nội thất đỉnh thật sự ❤️❤️",
    "Chưa bao giờ thất vọng khi mua đồ ở Ohouse. Chất lượng luôn đi đầu",
    "Sp đẹp sắc nét, màu sắc chuẩn như hình. Rất hài lòng nhen",
    "Ưng cái bụng ghê, sp nhìn ngoài còn đẹp hơn trong ảnh cơ",
    "Dịch vụ khách hàng tốt, sp chất lượng. 5 sao ko nói nhiều ⭐⭐⭐⭐⭐",
    "Giao hàng tỉnh mà nhanh bất ngờ. Sp an toàn ko móp méo",
    "Đồ nội thất ohouse thì khỏi bàn r, lúc nào cũng xịn xò hết"
  ]
};

const EXTRA_FLAIR = ["!", "!!", " ❤️", " 😍", " ✨", " 👍", " 💯", " nhen", " ạ", " nha mng", "...", " (y)"];

export default function MarketingTools() {
  const [loading, setLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [selectionType, setSelectionType] = useState<"category" | "product">("category");
  const [targetId, setTargetId] = useState("all");
  const [updateZeroOnly, setUpdateZeroOnly] = useState(false);

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
  
  const shuffleArray = (array: any[]) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const generateVnName = () => {
    return `${getRandomItem(VN_LAST_NAMES)} ${getRandomItem(VN_MID_NAMES)} ${getRandomItem(VN_FIRST_NAMES)}`;
  };

  const getDiverseComments = (productName: string, count: number) => {
    const name = productName.toLowerCase();
    let basePool: string[] = [];
    
    if (name.includes('sofa') || name.includes('ghế')) basePool = REVIEW_POOLS.sofa;
    else if (name.includes('bàn') || name.includes('kệ') || name.includes('tủ')) basePool = REVIEW_POOLS.table_stand;
    else if (name.includes('giường') || name.includes('nệm')) basePool = REVIEW_POOLS.bed;
    else if (name.includes('đèn')) basePool = REVIEW_POOLS.lighting;
    else basePool = REVIEW_POOLS.generic;

    const shuffled = shuffleArray(basePool);
    const results: string[] = [];

    for (let i = 0; i < count; i++) {
      // Lấy câu gốc theo vòng lặp pool
      let comment = shuffled[i % shuffled.length];
      
      // Nếu là vòng lặp thứ 2 trở đi hoặc đơn giản là muốn tăng tính duy nhất
      // Thêm hậu tố ngẫu nhiên để text ko bao giờ giống hệt nhau
      if (i >= shuffled.length || Math.random() > 0.5) {
        comment += getRandomItem(EXTRA_FLAIR);
      }

      results.push(comment);
    }
    
    return results;
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
    if (!confirm(`Xác nhận sinh nội dung đánh giá duy nhất trong khoảng ${daysBack} ngày qua?`)) return;

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

        // Xóa đánh giá cũ để làm mới hoàn toàn
        await supabase.from('reviews').delete().eq('product_id', p.id);

        const comments = getDiverseComments(p.name, count);
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
            comment: comments[i], // Sử dụng câu đã qua xử lý duy nhất
            created_at: date.toISOString()
          });
        }
        if (newReviews.length > 0) await supabase.from('reviews').insert(newReviews);
      }
      toast.success(`Đã sinh đánh giá đa dạng và không trùng lặp thành công!`);
    } catch (e: any) { toast.error(e.message); } finally { setReviewLoading(false); }
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
                  <p className="text-sm text-taupe leading-relaxed">Hệ thống sẽ tự động xáo trộn và biến đổi các nhận xét theo loại sản phẩm để đảm bảo không có sự trùng lặp giống hệt nhau trên cùng một trang.</p>
                  
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> Khoảng thời gian phát tán (Số ngày về trước)
                    </Label>
                    <Input 
                      type="number" 
                      value={stats.review_days_back} 
                      onChange={e => setStats({...stats, review_days_back: e.target.value})} 
                      placeholder="Ví dụ: 60"
                      className="h-12 bg-white/10 border-white/20 text-cream placeholder:text-taupe focus:border-primary"
                    />
                  </div>
                </div>

                <Button onClick={handleGenerateReviews} disabled={reviewLoading} variant="outline" className="w-full h-14 border-primary/40 hover:bg-primary text-primary hover:text-white rounded-2xl text-sm font-bold uppercase">
                  {reviewLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 mr-2" />} Sinh nội dung đánh giá theo ngữ cảnh
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}