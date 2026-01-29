import { useState } from "react";
import { Star, Loader2, Image as ImageIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProductReviewsProps {
  reviews: any[];
  product: any;
  displayRating: number;
  displayReviewCount: number;
  onSubmitReview: (rating: number, comment: string, name: string) => Promise<void>;
}

export function ProductReviews({ 
  reviews, 
  product, 
  displayRating, 
  displayReviewCount, 
  onSubmitReview
}: ProductReviewsProps) {
  const [step, setStep] = useState<'verify' | 'write'>('verify');
  const [verifyInfo, setVerifyInfo] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [customerName, setCustomerName] = useState("");
  
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyInfo) return;
    
    setIsVerifying(true);
    try {
      // Logic xác thực: Kiểm tra xem có đơn hàng nào chứa sản phẩm này và thông tin liên hệ trùng khớp
      // 1. Tìm đơn hàng khớp SĐT hoặc Email
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, contact_phone, contact_email, order_items(product_id)')
        .or(`contact_phone.eq.${verifyInfo},contact_email.eq.${verifyInfo}`);

      if (error) throw error;

      // 2. Kiểm tra xem trong các đơn hàng đó có chứa product_id hiện tại không
      const hasBought = orders?.some(order => 
        order.order_items.some((item: any) => item.product_id === product.id)
      );

      if (hasBought) {
        setCustomerName(verifyInfo.includes('@') ? verifyInfo.split('@')[0] : verifyInfo);
        setStep('write');
        toast.success("Xác thực đơn hàng thành công!");
      } else {
        toast.error("Không tìm thấy đơn hàng chứa sản phẩm này với thông tin bạn cung cấp.");
      }
    } catch (error) {
      toast.error("Lỗi xác thực. Vui lòng thử lại.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmitReview(newReview.rating, newReview.comment, customerName);
    setNewReview({ rating: 5, comment: "" });
    setStep('verify'); // Reset form
    setIsSubmitting(false);
  };

  return (
    <section className="mb-16 scroll-mt-24" id="reviews">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-border pb-6">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-widest text-charcoal mb-2">Đánh Giá Từ Khách Hàng</h2>
          <div className="flex items-center gap-3">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className={cn("w-5 h-5", i < Math.floor(displayRating) ? "fill-current" : "text-gray-200")} />)}
            </div>
            <span className="font-bold text-lg">{displayRating}/5</span>
            <span className="text-muted-foreground">({displayReviewCount} đánh giá)</span>
          </div>
        </div>
      </div>

      {/* Media Gallery from Reviews (Giả lập hiển thị ảnh từ review nếu có cột ảnh) */}
      <div className="mb-10">
        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" /> Hình ảnh thực tế từ khách hàng
        </h4>
        <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
          {reviews.length > 0 ? reviews.slice(0, 6).map((rev, i) => (
            <div key={i} className="w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-xl overflow-hidden border border-border bg-gray-100 relative group cursor-pointer">
              <img src={product.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-[10px] font-bold">Xem ảnh</span>
              </div>
            </div>
          )) : (
            <div className="w-full py-8 text-center bg-secondary/10 rounded-xl border border-dashed border-border/50">
              <p className="text-xs text-muted-foreground italic">Chưa có hình ảnh đánh giá nào.</p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Content & Form Layout */}
      <div className="grid lg:grid-cols-3 gap-12">
        {/* Left: Review List */}
        <div className="lg:col-span-2 space-y-6">
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-secondary/10 rounded-2xl border border-dashed border-border">
              <p className="text-muted-foreground mb-4">Chưa có đánh giá nào cho sản phẩm này.</p>
            </div>
          ) : (
            <>
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {rev.user_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-charcoal">{rev.user_name}</p>
                        <div className="flex text-amber-400 text-[10px] mt-0.5">
                          {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-gray-200'}`} />)}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(rev.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-13">{rev.comment}</p>
                </div>
              ))}
              {reviews.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline" className="rounded-full px-8">Xem thêm đánh giá</Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Review Form with Verification */}
        <div className="space-y-6">
          <div className="bg-secondary/20 p-6 rounded-2xl h-fit border border-border/50 sticky top-24">
            <h3 className="font-bold mb-4 text-charcoal uppercase tracking-wider text-sm">Viết đánh giá của bạn</h3>
            
            {step === 'verify' ? (
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-border/60 text-xs text-muted-foreground mb-4 flex gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0 text-primary" />
                  <p>Để đảm bảo tính xác thực, vui lòng nhập số điện thoại hoặc email bạn đã dùng để đặt mua sản phẩm này.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold">SĐT hoặc Email đặt hàng</Label>
                  <Input 
                    value={verifyInfo} 
                    onChange={(e) => setVerifyInfo(e.target.value)} 
                    placeholder="0909xxxxxx hoặc email@..."
                    className="h-11 rounded-xl bg-white"
                    required
                  />
                </div>
                <Button type="submit" className="w-full btn-hero h-11 text-xs shadow-gold" disabled={isVerifying}>
                  {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Xác thực & Viết đánh giá"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold bg-emerald-50 p-3 rounded-xl border border-emerald-100 mb-4">
                  <CheckCircle2 className="w-4 h-4" /> Xin chào, {customerName}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Mức độ hài lòng</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: i })}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star className={`w-8 h-8 ${i <= newReview.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Nội dung đánh giá</label>
                  <Textarea 
                    placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..." 
                    rows={4} 
                    className="rounded-xl border-none shadow-sm resize-none bg-white" 
                    value={newReview.comment} 
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} 
                    required
                  />
                </div>
                <Button type="submit" className="w-full btn-hero h-11 shadow-gold" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />} 
                  Gửi Đánh Giá
                </Button>
                <Button type="button" variant="ghost" className="w-full text-xs" onClick={() => setStep('verify')}>Quay lại xác thực</Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}