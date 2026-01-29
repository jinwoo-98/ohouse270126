import { useState } from "react";
import { Star, Loader2, AlertCircle, ChevronDown, ChevronUp, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ReviewItem } from "./ReviewItem";
import { motion, AnimatePresence } from "framer-motion";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ReviewImageGallery } from "./ReviewImageGallery";

interface ProductReviewsProps {
  reviews: any[];
  product: any;
  displayRating: number;
  displayReviewCount: number;
  onSubmitReview: (rating: number, comment: string, name: string, imageUrl?: string) => Promise<void>;
}

export function StarRating({ rating, size = "w-4 h-4" }: { rating: number, size?: string }) {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => {
        const fillAmount = Math.max(0, Math.min(1, rating - i));
        return (
          <div key={i} className={cn("relative shrink-0", size)}>
            <Star className={cn("text-gray-300 fill-gray-300", size)} />
            <Star 
              className={cn("absolute inset-0 text-amber-400 fill-amber-400 transition-all duration-300", size)} 
              style={{ clipPath: `inset(0 ${100 - fillAmount * 100}% 0 0)` }}
            />
          </div>
        );
      })}
    </div>
  );
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
  
  const [newReview, setNewReview] = useState({ rating: 5, comment: "", image_url: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showAll, setShowAll] = useState(false);
  const INITIAL_COUNT = 2; 
  const visibleReviews = showAll ? reviews : reviews.slice(0, INITIAL_COUNT);
  const hasMore = reviews.length > INITIAL_COUNT;

  // Sử dụng số lượng thực tế từ DB nếu danh sách reviews đã load xong
  const finalReviewCount = reviews.length > 0 ? reviews.length : displayReviewCount;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyInfo) return;
    
    setIsVerifying(true);
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, contact_phone, contact_email, status, order_items(product_id)')
        .eq('status', 'delivered')
        .or(`contact_phone.eq.${verifyInfo},contact_email.eq.${verifyInfo}`);

      if (error) throw error;

      const hasBought = orders?.some(order => 
        order.order_items.some((item: any) => item.product_id === product.id)
      );

      if (hasBought) {
        setCustomerName(verifyInfo.includes('@') ? verifyInfo.split('@')[0] : "Khách hàng");
        setStep('write');
        toast.success("Xác thực thành công! Bạn có thể viết đánh giá.");
      } else {
        toast.error("Bạn cần có đơn hàng 'Đã giao' chứa sản phẩm này để đánh giá.");
      }
    } catch (error) {
      toast.error("Lỗi xác thực hệ thống.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmitReview(newReview.rating, newReview.comment, customerName, newReview.image_url);
    setNewReview({ rating: 5, comment: "", image_url: "" });
    setStep('verify');
    setIsSubmitting(false);
  };

  return (
    <section className="mb-24 scroll-mt-24" id="reviews">
      <div className="flex flex-col items-center text-center mb-12">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-3">Customer Feedback</span>
        <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-widest text-charcoal mb-4">Đánh Giá Từ Khách Hàng</h2>
        <div className="flex flex-col items-center gap-2">
          <StarRating rating={displayRating} size="w-7 h-7" />
          <p className="text-sm font-bold text-charcoal mt-2">
            {displayRating}/5 <span className="text-muted-foreground font-normal ml-1">({finalReviewCount} nhận xét)</span>
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 flex flex-col">
          {/* Nút mở gallery ảnh thực tế */}
          <ReviewImageGallery reviews={reviews} />

          {reviews.length === 0 ? (
            <div className="text-center py-16 bg-secondary/10 rounded-3xl border border-dashed border-border/50">
              <p className="text-muted-foreground italic">Hiện chưa có nhận xét nào cho sản phẩm này.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div 
                className={cn(
                  "space-y-6 transition-all duration-500 pr-2 custom-scrollbar",
                  showAll ? "max-h-[900px] overflow-y-auto" : "max-h-none overflow-visible"
                )}
              >
                <AnimatePresence mode="popLayout">
                  {visibleReviews.map((rev) => (
                    <motion.div
                      key={rev.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      layout
                    >
                      <ReviewItem review={rev} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAll(!showAll);
                      if (showAll) {
                        const el = document.getElementById('reviews');
                        if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
                      }
                    }}
                    className="h-12 px-8 rounded-full border-primary/30 text-primary font-bold text-[11px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-subtle group"
                  >
                    {showAll ? (
                      <>Thu gọn danh sách <ChevronUp className="w-4 h-4 ml-2" /></>
                    ) : (
                      <>Xem toàn bộ {reviews.length} đánh giá <ChevronDown className="w-4 h-4 ml-2 group-hover:translate-y-1 transition-transform" /></>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-charcoal p-8 rounded-[32px] shadow-elevated border border-white/5 sticky top-24">
            <h3 className="font-bold mb-6 text-cream uppercase tracking-widest text-sm text-center">Gửi đánh giá của bạn</h3>
            
            {step === 'verify' ? (
              <form onSubmit={handleVerify} className="space-y-5">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-[11px] text-taupe mb-4 flex gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0 text-primary" />
                  <p>Nhập SĐT hoặc Email đã mua hàng thành công để bắt đầu đánh giá.</p>
                </div>
                <Input 
                  value={verifyInfo} 
                  onChange={(e) => setVerifyInfo(e.target.value)} 
                  placeholder="SĐT hoặc Email..."
                  className="h-12 bg-white/5 border-white/10 text-cream"
                  required
                />
                <Button type="submit" className="w-full btn-hero h-12 shadow-gold" disabled={isVerifying}>
                  {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "XÁC THỰC ĐƠN HÀNG"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="text-center">
                  <Badge className="bg-primary/20 text-primary border-none mb-4">Người mua: {customerName}</Badge>
                  <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button key={i} type="button" onClick={() => setNewReview({ ...newReview, rating: i })}>
                        <Star className={`w-8 h-8 transition-all ${i <= newReview.rating ? 'fill-amber-400 text-amber-400' : 'text-white/20 fill-white/10'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-taupe tracking-widest flex items-center gap-2">
                    <ImageIcon className="w-3 h-3" /> Ảnh thực tế (Tùy chọn)
                  </Label>
                  <ImageUpload 
                    value={newReview.image_url} 
                    onChange={(url) => setNewReview({ ...newReview, image_url: url as string })} 
                  />
                </div>

                <Textarea 
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..." 
                  rows={4} 
                  className="bg-white/5 text-cream border-white/10" 
                  value={newReview.comment} 
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} 
                  required
                />
                <Button type="submit" className="w-full btn-hero h-12 shadow-gold" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "GỬI ĐÁNH GIÁ THỰC TẾ"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}