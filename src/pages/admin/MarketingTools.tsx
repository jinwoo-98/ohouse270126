import { useState, useEffect } from "react";
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
  Search,
  Filter
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

export default function MarketingTools() {
  const [loading, setLoading] = useState(false);
  const [selectionType, setSelectionType] = useState<"category" | "product">("category");
  const [targetId, setTargetId] = useState("all");
  const [updateZeroOnly, setUpdateZeroOnly] = useState(false);

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
      // 1. Lấy danh sách sản phẩm mục tiêu
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

      // 2. Lọc hàng chưa có lượt bán nếu được yêu cầu
      const filteredProducts = updateZeroOnly 
        ? products.filter(p => !p.fake_sold || p.fake_sold === 0) 
        : products;

      if (filteredProducts.length === 0) {
        toast.info("Không có sản phẩm nào đang có lượt bán bằng 0.");
        return;
      }

      // 3. Thực hiện cập nhật từng sản phẩm với số liệu ngẫu nhiên
      // Chúng ta dùng loop để mỗi sản phẩm có 1 con số khác nhau
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

      toast.success(`Đã cập nhật thành công ${filteredProducts.length} sản phẩm với số liệu ngẫu nhiên!`);
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Chiến Dịch Marketing Hàng Loạt
        </h1>
        <p className="text-muted-foreground text-sm">Điều phối hiển thị và "chim mồi" số liệu một cách tự nhiên cho hệ thống.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Bước 1: Phạm vi tác động */}
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
                          {/* Parent category itself */}
                          <SelectItem value={parent.dropdownKey!}>— Tất cả {parent.name}</SelectItem>
                          {/* Child categories */}
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

        {/* Bước 2: Cấu hình số liệu ngẫu nhiên */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-8 flex items-center gap-2">
              <Zap className="w-4 h-4" /> 2. Thiết lập khoảng số liệu ngẫu nhiên
            </h3>
            
            <div className="grid gap-8">
              {/* Lượt bán */}
              <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-4">
                <Label className="md:col-span-1 flex items-center gap-2 text-xs font-bold uppercase">
                  <ShoppingBag className="w-4 h-4 text-emerald-500" /> Lượt bán
                </Label>
                <div className="md:col-span-4 flex items-center gap-4">
                  <Input 
                    type="number" 
                    placeholder="Tối thiểu" 
                    value={stats.min_sold}
                    onChange={(e) => setStats({...stats, min_sold: e.target.value})}
                    className="h-12 rounded-xl"
                  />
                  <span className="text-muted-foreground">đến</span>
                  <Input 
                    type="number" 
                    placeholder="Tối đa" 
                    value={stats.max_sold}
                    onChange={(e) => setStats({...stats, max_sold: e.target.value})}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              {/* Đánh giá */}
              <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-4">
                <Label className="md:col-span-1 flex items-center gap-2 text-xs font-bold uppercase">
                  <Star className="w-4 h-4 text-amber-500" /> Số ĐG
                </Label>
                <div className="md:col-span-4 flex items-center gap-4">
                  <Input 
                    type="number" 
                    placeholder="Tối thiểu" 
                    value={stats.min_reviews}
                    onChange={(e) => setStats({...stats, min_reviews: e.target.value})}
                    className="h-12 rounded-xl"
                  />
                  <span className="text-muted-foreground">đến</span>
                  <Input 
                    type="number" 
                    placeholder="Tối đa" 
                    value={stats.max_reviews}
                    onChange={(e) => setStats({...stats, max_reviews: e.target.value})}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              {/* Điểm sao */}
              <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-4">
                <Label className="md:col-span-1 flex items-center gap-2 text-xs font-bold uppercase">
                  ⭐ Điểm sao
                </Label>
                <div className="md:col-span-4 flex items-center gap-4">
                  <Input 
                    type="number" 
                    step="0.1"
                    placeholder="Min (4.0)" 
                    value={stats.min_rating}
                    onChange={(e) => setStats({...stats, min_rating: e.target.value})}
                    className="h-12 rounded-xl"
                  />
                  <span className="text-muted-foreground">đến</span>
                  <Input 
                    type="number" 
                    step="0.1"
                    placeholder="Max (5.0)" 
                    value={stats.max_rating}
                    onChange={(e) => setStats({...stats, max_rating: e.target.value})}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              {/* Thứ tự hiển thị */}
              <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-4 pt-6 border-t border-dashed">
                <Label className="md:col-span-1 text-xs font-bold uppercase">Ưu tiên (Fix)</Label>
                <div className="md:col-span-4">
                  <Input 
                    type="number" 
                    placeholder="Nhập 1 để đưa lên đầu, mặc định 1000" 
                    value={stats.display_order}
                    onChange={(e) => setStats({...stats, display_order: e.target.value})}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="mt-12">
              <Button 
                onClick={handleBulkUpdate} 
                disabled={loading} 
                className="w-full btn-hero h-14 shadow-gold rounded-2xl flex items-center justify-center gap-3 text-sm font-bold"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                XÁC NHẬN CHẠY CHIẾN DỊCH MARKETING
              </Button>
              <p className="text-[10px] text-center text-muted-foreground mt-4 italic">
                * Hệ thống sẽ tự động gieo số khác nhau cho mỗi sản phẩm để đảm bảo tính tự nhiên.
              </p>
            </div>
          </div>

          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-900 uppercase tracking-wide">Mẹo Marketing</h4>
              <p className="text-xs text-amber-700 leading-relaxed">
                Nên chọn <strong>"Chỉ hàng chưa có lượt bán"</strong> cho các sản phẩm mới đăng, gieo lượt bán từ 10-30 và đánh giá 4.8-5.0 sao để tăng uy tín tức thì. 
                Sản phẩm nổi bật nên đặt **Thứ tự hiển thị** nhỏ hơn 100.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}