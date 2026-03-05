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
  Clock,
  Trash2,
  AlertCircle,
  HelpCircle,
  CheckCircle2
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useCategories } from "@/hooks/useCategories";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

const VN_LAST_NAMES = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"];
const VN_MID_NAMES = ["Văn", "Thị", "Hồng", "Minh", "Anh", "Quang", "Xuân", "Thanh", "Đức", "Trọng", "Kim", "Ngọc"];
const VN_FIRST_NAMES = ["An", "Bình", "Chi", "Dũng", "Giang", "Hương", "Khánh", "Linh", "Nam", "Oanh", "Phúc", "Quyên", "Sơn", "Thảo", "Uyên", "Vinh", "Yến", "Tùng", "Lâm", "Hải"];

const COMPONENT_POOLS = {
  intro: [
    "Vừa nhận đc hàng xong, cảm nhận ban đầu là sp cực kỳ chất lượng.",
    "Shop làm ăn uy tín thật sự, đóng gói siêu kỹ luôn mng ạ.",
    "Lần đầu mua nội thất online mà ưng ntn, ko uổng công chờ đợi.",
    "Hàng giao nhanh bất ngờ, mới đặt hôm trước mà hôm sau thợ đã alo lắp r.",
    "Đã nhận hàng nhen shop, sp đẹp y hệt hình quảng cáo luôn.",
    "Tìm hiểu mãi mới chốt mua ở Ohouse, công nhận tiền nào của nấy.",
    "Quá ư là hài lòng với dịch vụ bên này, từ tư vấn đến lắp đặt.",
    "Sp xịn xò lắm nha mng, đóng thùng gỗ cẩn thận ko một vết xước.",
    "Ấn tượng đầu tiên là thái độ nhân viên rất chuyên nghiệp nhen.",
    "Nhà mình ai cũng khen món này đẹp, nhìn căn phòng sang hẳn lên."
  ],
  body_sofa: [
    "Sofa êm cực kỳ, đệm mút k43 dày dặn nằm thử thấy sướng vãi luôn 😂. Vải bọc sờ mịn tay, ko bị nóng nực. Form dáng rất chuẩn, ko bị lún sâu quá đâu.",
    "Chất liệu da thật sờ vào mát lạnh nhen mng, đường may cực kỳ sắc nét luôn á. Khung gỗ chắc chắn ngồi mấy người ko nghe tiếng kêu gì hết. Màu sắc rất sang.",
    "Màu be này ở ngoài nhìn đẹp hơn trong ảnh nhìu, phối với pk nhà mình cực hợp. Gối tựa lưng cũng êm, ngồi xem tivi cả buổi ko thấy mỏi lưng tí nào nhen.",
    "Thiết kế hiện đại, tinh tế. Mấy cái chân inox mạ vàng nhìn luxury thật sự ✨. Đệm ngồi có độ đàn hồi tốt, ko lo bị xẹp lún sau thời gian dài sử dụng đâu ạ.",
    "Vải nhung kháng khuẩn sờ mướt tay lắm, màu xanh navy nhìn cực chảnh luôn 😍. Kích thước vừa vặn với căn hộ chung cư, tối ưu diện tích mà nhìn vẫn đẳng cấp."
  ],
  body_table_stand: [
    "Mặt đá thiêu kết vân đẹp xuất sắc, chống trầy xước tốt nhen mình thử cào nhẹ ko thấy dấu gì. Khung gỗ chắc nịch, ngăn kéo đóng mở êm ru ko kẹt tí nào.",
    "Bàn ăn đẹp quáaaaa, chân inox 304 mạ PVD nhìn sáng loáng luôn á. Mặt đá dày dặn, chịu nhiệt tốt nhen mng. Lắp xong cái bếp nhìn như nhà hàng 5 sao vậy.",
    "Kệ tivi thiết kế tối giản mà sang, gỗ MDF lõi xanh chống ẩm nên yên tâm dùng lâu dài. Các góc cạnh đc bo tròn tỉ mỉ, an toàn cho trẻ nhỏ trong nhà nhen.",
    "Vân gỗ tự nhiên nhìn rất mộc mà vẫn đẳng cấp. Shop hoàn thiện kỹ, bề mặt sơn Inchem mịn màng ko mùi hắc. Đóng gói 5 lớp tháo ra mệt nghỉ luôn 😂.",
    "Bàn trà đôi phối màu đen trắng nhìn cực hiện đại, hợp với cái sofa nhà mình. Khung thép sơn tĩnh điện chắc chắn, ko bị rung lắc khi để đồ nặng lên đâu."
  ],
  body_bed: [
    "Giường chắc chắn lắm nhen, lắp xong nằm thử thấy êm ru ko bị kêu cọt kẹt như giường cũ. Đầu giường bọc da cao cấp nhìn rất luxury, tựa lưng đọc sách phê pha.",
    "Mẫu giường này đẹp mê mẩn luôn mng ạ, phối màu kem nhìn nhã nhặn cực kỳ. Giát giường nan cong thông minh nằm thik lắm, lưng ko bị đau mỏi tí nào hết.",
    "Gỗ sồi Mỹ tự nhiên có khác, vân gỗ đẹp mà mùi thơm nhẹ nhàng lắm. Khung giường dày dặn, chịu lực tốt. Shop giao hàng đúng hẹn, lắp đặt nhanh gọn lẹ.",
    "Nệm nằm vừa vặn, ko bị hở đóng. Rất hài lòng với độ hoàn thiện của sản phẩm bên Ohouse.",
    "Thiết kế Ergonomic nằm rất thoải mái, độ cao giường vừa phải. Vải bọc đầu giường xịn mịn, ko bị xù lông hay bám bụi nhiều đâu nhen mng."
  ],
  body_lighting: [
    "Đèn chùm pha lê K9 lấp lánh lung linh luôn mng ơi ✨. Bật đèn lên cái phòng khách nhìn ảo diệu hẳn. Pha lê xịn nên bắt sáng cực tốt, ko bị đục hay mờ đâu.",
    "Ánh sáng vàng ấm cúng, nhìn rất chill nha mng. Mẫu đèn ngủ này tinh tế thật sự, để bàn trang điểm nhìn sang hẳn cái góc phòng. Sẽ mua thêm cái nữa 👍.",
    "Đèn đẹp dã man, đóng gói cực kỳ cẩn thận luôn, mỗi viên pha lê đều đc bọc riêng. Lắp đặt hơi kỳ công tí nhưng kết quả thì quá mỹ mãn, 10 điểm ko có nhưng.",
    "Chất liệu hợp kim mạ điện sáng bóng, ko lo bị gỉ sét theo thời gian. Chip LED tiết kiệm điện mà ánh sáng vẫn rất mạnh và đều màu nhen. Rất đáng tiền!",
    "Thiết kế phong cách Châu Âu đẳng cấp, tạo điểm nhấn hoàn hảo cho sảnh lớn nhà mình. Ai đến chơi cũng trầm trồ khen cái đèn này đẹp và độc lạ."
  ],
  body_generic: [
    "Sản phẩm đúng như mô tả, hoàn thiện sắc nét đến từng chi tiết nhỏ. Màu sắc chuẩn xác, ko bị lệch tone so với ảnh mẫu trên web. Rất tin tưởng Ohouse.",
    "Chất lượng vượt mong đợi nhen mng, tiền nào của nấy thật sự. Hàng cao cấp có khác, nhìn đẳng cấp hơn hẳn mấy loại rẻ tiền ngoài thị trường nhen.",
    "Dịch vụ hậu mãi tốt, shop gọi điện hỏi thăm tình hình sử dụng sp thường xuyên. Sẽ ủng hộ shop dài dài vì sự tận tâm và chất lượng tuyệt vời ntn.",
    "Mng nên mua nhé, ko phí tiền tí nào đâu ạ. Nội thất Ohouse làm ăn uy tín, sp bền đẹp chắc chắn. Chúc shop ngày càng phát triển hơn nữa nhen.",
    "Ưng cái bụng ghê luôn á, hàng đóng gói kỹ, ship tỉnh mà ko móp méo tí gì. Nhân viên tư vấn nhiệt tình, chọn đc món đồ ưng ý hết nấc 😂."
  ],
  outro: [
    "Sẽ giới thiệu cho bạn bè và người thân ủng hộ shop nhen.",
    "Chắc chắn sẽ quay lại mua thêm đồ decor bên này.",
    "Chúc shop buôn may bán đắt, làm ăn phát đạt nhen!",
    "Mng cứ yên tâm mà mua, ko thất vọng đâu ạ.",
    "Đánh giá 5 sao cho chất lượng và thái độ phục vụ của shop.",
    "Ohouse số 1 luôn nhé, quá tuyệt vời nhen mng.",
    "Rất đáng đồng tiền bát gạo, ko có gì để chê luôn.",
    "Cảm ơn shop rất nhiều vì sp đẹp ntn!",
    "Mọi người nên trải nghiệm dịch vụ ở đây nhen, đỉnh lắm.",
    "Love Ohouseeee, mãi đỉnh luôn nha shop ơi 😍✨."
  ],
  flair: ["!", "!!", " ❤️", " 😍", " ✨", " 👍", " 💯", " nhen", " ạ", " nha mng", "...", " (y)", " hihi", " nhé", " quá trời luôn"]
};

export default function MarketingTools() {
  const [loading, setLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [selectionType, setSelectionType] = useState<"category" | "product">("category");
  const [targetId, setTargetId] = useState("all");
  const [updateZeroOnly, setUpdateZeroOnly] = useState(false);
  const [deleteOldReviews, setDeleteOldReviews] = useState(true);
  const [randomizeWidely, setRandomizeWidely] = useState(false);

  const [confirmType, setConfirmType] = useState<'stats' | 'reviews' | null>(null);

  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();
  const mainCategories = categoriesData?.mainCategories || [];
  const productCategories = categoriesData?.productCategories || {};

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

  const getDiverseComments = (productName: string, count: number) => {
    const name = productName.toLowerCase();
    let bodyPool: string[] = [];
    
    if (name.includes('sofa') || name.includes('ghế')) bodyPool = COMPONENT_POOLS.body_sofa;
    else if (name.includes('bàn') || name.includes('kệ') || name.includes('tủ')) bodyPool = COMPONENT_POOLS.body_table_stand;
    else if (name.includes('giường') || name.includes('nệm')) bodyPool = COMPONENT_POOLS.body_bed;
    else if (name.includes('đèn')) bodyPool = COMPONENT_POOLS.body_lighting;
    else bodyPool = COMPONENT_POOLS.body_generic;

    const results: string[] = [];

    for (let i = 0; i < count; i++) {
      let finalComment = "";
      const rand = Math.random();

      if (rand < 0.4) {
        finalComment = `${getRandomItem(COMPONENT_POOLS.outro)}${getRandomItem(COMPONENT_POOLS.flair)}`;
      } else if (rand < 0.85) {
        finalComment = `${getRandomItem(COMPONENT_POOLS.intro)} ${getRandomItem(bodyPool)} ${getRandomItem(COMPONENT_POOLS.outro)}`;
      } else {
        finalComment = `${getRandomItem(COMPONENT_POOLS.intro)} ${getRandomItem(bodyPool)} ${getRandomItem(COMPONENT_POOLS.body_generic)} ${getRandomItem(COMPONENT_POOLS.outro)}${getRandomItem(COMPONENT_POOLS.flair)}`;
      }

      if (finalComment.length > 500) {
        finalComment = finalComment.substring(0, 497) + "...";
      }
      
      results.push(finalComment);
    }
    
    return results;
  };

  const handleBulkUpdate = async () => {
    const toastId = toast.loading("Đang tính toán và cập nhật chỉ số cho các sản phẩm...");
    setLoading(true);
    try {
      let query = supabase.from('products').select('id, fake_sold');
      if (selectionType === 'category' && targetId !== 'all') query = query.eq('category_id', targetId);
      else if (selectionType === 'product' && targetId !== 'all') query = query.eq('id', targetId);

      const { data: products } = await query;
      if (!products || products.length === 0) { 
        toast.error("Không tìm thấy sản phẩm phù hợp.", { id: toastId }); 
        return; 
      }

      const filtered = updateZeroOnly ? products.filter(p => !p.fake_sold || p.fake_sold === 0) : products;

      const promises = filtered.map(p => {
        const payload: any = { updated_at: new Date() };
        
        let minSold = parseInt(stats.min_sold);
        let maxSold = parseInt(stats.max_sold);
        let minReviews = parseInt(stats.min_reviews);
        let maxReviews = parseInt(stats.max_reviews);
        
        if (randomizeWidely) {
          minSold = Math.max(0, Math.floor(minSold * 0.5));
          maxSold = Math.floor(maxSold * 1.5);
          minReviews = Math.max(0, Math.floor(minReviews * 0.5));
          maxReviews = Math.floor(maxReviews * 1.5);
        }

        payload.fake_sold = getRandomInt(minSold, maxSold);
        payload.fake_review_count = getRandomInt(minReviews, maxReviews);
        payload.fake_rating = parseFloat(getRandomFloat(parseFloat(stats.min_rating), parseFloat(stats.max_rating)));
        if (stats.display_order) payload.display_order = parseInt(stats.display_order);
        return supabase.from('products').update(payload).eq('id', p.id);
      });

      await Promise.all(promises);
      toast.success(`Thành công! Đã cập nhật chỉ số ảo cho ${filtered.length} sản phẩm.`, { id: toastId });
    } catch (e: any) { 
      toast.error("Đã có lỗi xảy ra: " + e.message, { id: toastId }); 
    } finally { 
      setLoading(false); 
      setConfirmType(null);
    }
  };

  const handleGenerateReviews = async () => {
    const daysBack = parseInt(stats.review_days_back) || 60;
    const toastId = toast.loading("Đang khởi tạo dữ liệu đánh giá từ bộ mẫu có sẵn...");
    setReviewLoading(true);
    try {
      let query = supabase.from('products').select('id, name, fake_review_count, fake_rating');
      if (selectionType === 'category' && targetId !== 'all') query = query.eq('category_id', targetId);
      else if (selectionType === 'product' && targetId !== 'all') query = query.eq('id', targetId);

      const { data: products } = await query;
      if (!products || products.length === 0) { 
        toast.error("Không tìm thấy sản phẩm mục tiêu.", { id: toastId }); 
        return; 
      }

      for (const p of products) {
        if (deleteOldReviews) {
          await supabase.from('reviews').delete().eq('product_id', p.id);
        }

        let minReviews = parseInt(stats.min_reviews);
        let maxReviews = parseInt(stats.max_reviews);
        if (randomizeWidely) {
          minReviews = Math.max(1, Math.floor(minReviews * 0.5));
          maxReviews = Math.floor(maxReviews * 1.5);
        }
        const countToGenerate = getRandomInt(minReviews, maxReviews);
        
        const comments = getDiverseComments(p.name, countToGenerate);
        const newReviews = [];
        
        for (let i = 0; i < countToGenerate; i++) {
          const randomDays = getRandomInt(1, daysBack);
          const date = new Date();
          date.setDate(date.getDate() - randomDays);
          date.setHours(getRandomInt(0, 23), getRandomInt(0, 59));

          newReviews.push({
            product_id: p.id,
            user_name: generateVnName(),
            rating: Math.random() > 0.8 ? 4 : 5, 
            comment: comments[i], 
            created_at: date.toISOString()
          });
        }

        if (newReviews.length > 0) {
          await supabase.from('reviews').insert(newReviews);
          
          const { count: realTotal } = await supabase
            .from('reviews')
            .select('*', { count: 'exact', head: true })
            .eq('product_id', p.id);
          
          await supabase.from('products').update({ 
            fake_review_count: realTotal || countToGenerate,
            fake_rating: parseFloat(getRandomFloat(parseFloat(stats.min_rating), parseFloat(stats.max_rating)))
          }).eq('id', p.id);
        }
      }
      toast.success(`Hoàn tất! Đã tạo đánh giá mẫu cho ${products.length} sản phẩm.`, { id: toastId });
    } catch (e: any) { 
      toast.error("Lỗi: " + e.message, { id: toastId }); 
    } finally { 
      setReviewLoading(false); 
      setConfirmType(null);
    }
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
                        {isLoadingCategories ? <div className="p-2 text-xs text-muted-foreground">Đang tải...</div> : 
                          mainCategories.filter(c => c.dropdownKey).map(parent => (
                            <SelectGroup key={parent.dropdownKey}>
                              <SelectLabel className="text-primary font-bold">{parent.name}</SelectLabel>
                              <SelectItem value={parent.dropdownKey!}>— Tất cả {parent.name}</SelectItem>
                              {productCategories[parent.dropdownKey!]?.map(child => (
                                <SelectItem key={child.href} value={child.href.replace('/', '')}>&nbsp;&nbsp;&nbsp;{child.name}</SelectItem>
                              ))}
                            </SelectGroup>
                          ))
                        }
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
                  <div className="flex items-center space-x-3 p-4 bg-secondary/30 rounded-xl cursor-pointer mt-4" onClick={() => setRandomizeWidely(!randomizeWidely)}>
                    <Checkbox checked={randomizeWidely} onCheckedChange={(val) => setRandomizeWidely(!!val)} />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">Ngẫu nhiên hóa rộng</span>
                      <span className="text-[10px] text-muted-foreground italic">Tạo ra các số liệu đa dạng hơn, có thể vượt ra ngoài khoảng đã nhập.</span>
                    </div>
                  </div>
                </div>
                <Button onClick={() => setConfirmType('stats')} disabled={loading} className="w-full mt-10 btn-hero h-14 shadow-gold rounded-2xl text-sm font-bold uppercase">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5 mr-2" />} Cập nhật thông số hàng loạt
                </Button>
              </div>

              <div className="bg-charcoal p-8 rounded-3xl border shadow-elevated text-cream">
                 <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2"><MessageSquareQuote className="w-5 h-5" /> 3. Tạo đánh giá từ mẫu có sẵn (Không cần AI)</h3>
                
                <div className="space-y-4 mb-8">
                  <p className="text-sm text-taupe leading-relaxed">Hệ thống sẽ tự động ghép nối các câu đánh giá tiếng Việt chuyên về nội thất đã được biên soạn sẵn. Phương án này <b>không tốn phí API</b> và hoạt động ngay lập tức.</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" /> Khoảng thời gian phát tán
                      </Label>
                      <Input 
                        type="number" 
                        value={stats.review_days_back} 
                        onChange={e => setStats({...stats, review_days_back: e.target.value})} 
                        className="h-11 bg-white/10 border-white/20 text-cream"
                      />
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-destructive flex items-center gap-2">
                          <Trash2 className="w-3.5 h-3.5" /> Xóa đánh giá cũ
                        </Label>
                        <p className="text-[9px] text-taupe">Làm mới và đồng bộ lại số lượng</p>
                      </div>
                      <Switch checked={deleteOldReviews} onCheckedChange={deleteOldReviews => setDeleteOldReviews(deleteOldReviews)} />
                    </div>
                  </div>
                </div>

                <Button onClick={() => setConfirmType('reviews')} disabled={reviewLoading} variant="outline" className="w-full h-14 border-primary/40 hover:bg-primary text-primary hover:text-white rounded-2xl text-sm font-bold uppercase">
                  {reviewLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-2" />} Bắt đầu tạo đánh giá từ mẫu
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <ConfirmDialog 
        isOpen={confirmType === 'stats'}
        onClose={() => setConfirmType(null)}
        onConfirm={handleBulkUpdate}
        variant="warning"
        title="Xác nhận cập nhật chỉ số"
        description="Toàn bộ sản phẩm được chọn sẽ thay đổi các chỉ số lượt bán và đánh giá. Bạn có chắc chắn muốn thực hiện thay đổi hàng loạt này không?"
        confirmText="Xác nhận cập nhật"
      />

      <ConfirmDialog 
        isOpen={confirmType === 'reviews'}
        onClose={() => setConfirmType(null)}
        onConfirm={handleGenerateReviews}
        variant="warning"
        title="Xác nhận tạo đánh giá mẫu"
        description={`Hệ thống sẽ tự động tạo các bài đánh giá từ bộ mẫu nội thất tiếng Việt. ${deleteOldReviews ? 'Dữ liệu đánh giá cũ sẽ bị xóa hoàn toàn.' : ''}`}
        confirmText="Xác nhận thực hiện"
      />
    </div>
  );
}