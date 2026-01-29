import { useState } from "react";
import { Star, Loader2, Image as ImageIcon, CheckCircle2, AlertCircle, Send } from "lucide-react";
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
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, contact_phone, contact_email, order_items(product_id)')
        .or(`contact_phone.eq.${verifyInfo},contact_email.eq.${verifyInfo}`);

      if (error) throw error;

      const hasBought = orders?.some(order => 
        order.order_items.some((item: any) => item.product_id === product.id)
      );

      if (hasBought) {
        setCustomerName(verifyInfo.includes('@') ? verifyInfo.split('@')[0] : verifyInfo);
        setStep('write');
        toast.success("Xác thực đơn hàng thành công!");
      } else {
        toast.error("Không tìm thấy đơn hàng chứa sản phẩm này.");
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
    setStep('verify');
    setIsSubmitting(false);
  };

  return (
    <section className="mb-24 scroll-mt-24" id="reviews">
      <div className="flex flex-col items-center text-center mb-12">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-3">Customer Feedback</span>
        <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-widest text-charcoal mb-4">Đánh Giá Từ Khách Hàng</h2>
        <div className="flex flex-col items-center gap-2">
          <div className="flex text-amber-400 gap-1">
            {[...Array(5)].map((_, i) => <Star key={i} className={cn("w-6 h-6", i < Math.floor(displayRating) ? "fill-current" : "text-gray-200")} />)}
          </div>
          <p className="text-sm font-bold text-charcoal">
            {displayRating}/5 <span className="text-muted-foreground font-normal ml-1">({displayReviewCount} nhận xét)</span>
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {reviews.length === 0 ? (
            <div className="text-center py-16 bg-secondary/10 rounded-3xl border border-dashed border-border/50">
              <p className="text-muted-foreground italic">Hãy là người đầu tiên sở hữu và đánh giá sản phẩm này.</p>
            </div>
          ) : (
            <>
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-white p-6 rounded-2xl border border-border/40 shadow-subtle">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {rev.user_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-charcoal">{rev.user_name}</p>
                        <div className="flex text-amber-400 text-[10px] mt-0.5">
                          {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-gray-200'}`} />)}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">{new Date(rev.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-13">{rev.comment}</p>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-charcoal p-8 rounded-[32px] h-fit shadow-elevated border border-white/5 sticky top-24">
            <h3 className="font-bold mb-6 text-cream uppercase tracking-widest text-sm text-center">Gửi đánh giá thực tế</h3>
            
            {step === 'verify' ? (
              <form onSubmit={handleVerify} className="space-y-5">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-[11px] text-taupe mb-4 flex gap-3 leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0 text-primary" />
                  <p>Nhập SĐT hoặc Email bạn đã mua hàng để xác thực đánh giá "Người mua thực".</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-taupe tracking-widest">Thông tin mua hàng</Label>
                  <Input 
                    value={verifyInfo} 
                    onChange={(e) => setVerifyInfo(e.target.value)} 
                    placeholder="SĐT hoặc Email..."
                    className="h-12 rounded-xl bg-white/5 border-white/10 text-cream focus:border-primary"
                    required
                  />
                </div>
                <Button type="submit" className="w-full btn-hero h-12 text-xs shadow-gold" disabled={isVerifying}>
                  {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "TIẾP TỤC"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2 text-primary text-[10px] font-bold bg-primary/10 p-3 rounded-xl border border-primary/20 mb-4 uppercase tracking-widest justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Chào {customerName}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-taupe tracking-widest text-center block">Điểm hài lòng</label>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: i })}
                        className="focus:outline-none transition-all hover:scale-125"
                      >
                        <Star className={`w-7 h-7 ${i <= newReview.rating ? 'fill-amber-400 text-amber-400' : 'text-white/20'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-taupe tracking-widest">Lời nhắn cho OHOUSE</label>
                  <Textarea 
                    placeholder="Cảm nhận của bạn..." 
                    rows={4} 
                    className="rounded-xl border-white/10 bg-white/5 text-cream focus:border-primary resize-none" 
                    value={newReview.comment} 
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} 
                    required
                  />
                </div>
                <Button type="submit" className="w-full btn-hero h-12 shadow-gold" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />} 
                  GỬI NHẬN XÉT
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}