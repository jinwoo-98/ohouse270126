import { useState } from "react";
import { Star, Bot, Send, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ProductReviewsProps {
  reviews: any[];
  product: any;
  user: any;
  displayRating: number;
  displayReviewCount: number;
  onSubmitReview: (rating: number, comment: string) => Promise<void>;
  onOpenAIChat: () => void;
}

export function ProductReviews({ 
  reviews, 
  product, 
  user,
  displayRating, 
  displayReviewCount, 
  onSubmitReview, 
  onOpenAIChat 
}: ProductReviewsProps) {
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsReviewLoading(true);
    await onSubmitReview(newReview.rating, newReview.comment);
    setNewReview({ rating: 5, comment: "" });
    setIsReviewLoading(false);
  };

  return (
    <section className="mb-16 scroll-mt-24" id="reviews">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-widest text-charcoal mb-2">Đánh Giá Từ Khách Hàng</h2>
          <div className="flex items-center gap-3">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className={cn("w-5 h-5", i < Math.floor(displayRating) ? "fill-current" : "text-gray-300")} />)}
            </div>
            <span className="font-bold text-lg">{displayRating}/5</span>
            <span className="text-muted-foreground">({displayReviewCount} đánh giá)</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 border-primary/20 text-primary hover:bg-primary/5" onClick={onOpenAIChat}>
            <Bot className="w-4 h-4" /> Hỏi AI về sản phẩm
          </Button>
          <Button className="btn-hero h-10 px-6 text-xs" onClick={() => document.getElementById('write-review')?.scrollIntoView({ behavior: 'smooth' })}>
            Viết đánh giá
          </Button>
        </div>
      </div>

      {/* Media Gallery from Reviews (Placeholder) */}
      <div className="mb-10">
        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" /> Hình ảnh thực tế ({reviews.length > 0 ? reviews.length : 0})
        </h4>
        <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
          {reviews.length > 0 ? reviews.slice(0, 6).map((rev, i) => (
            <div key={i} className="w-32 h-32 shrink-0 rounded-xl overflow-hidden border border-border bg-gray-100 relative group cursor-pointer">
              {/* Placeholder image logic - In real app, review table should have images */}
              <img src={product.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-bold">Xem ảnh</span>
              </div>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground italic">Chưa có hình ảnh đánh giá nào.</p>
          )}
        </div>
      </div>

      {/* Review List */}
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-secondary/10 rounded-2xl border border-dashed border-border">
              <p className="text-muted-foreground mb-4">Chưa có đánh giá nào cho sản phẩm này.</p>
              <p className="text-sm text-primary font-bold">Hãy là người đầu tiên chia sẻ trải nghiệm!</p>
            </div>
          ) : (
            <>
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {rev.user_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-charcoal">{rev.user_name}</p>
                        <div className="flex text-amber-400 text-[10px]">
                          {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-gray-200'}`} />)}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(rev.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{rev.comment}</p>
                </div>
              ))}
              {reviews.length > 3 && (
                <div className="text-center pt-4">
                  <Button variant="outline" className="rounded-full px-8">Xem thêm đánh giá</Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Quick Review Form */}
        <div className="bg-secondary/20 p-6 rounded-2xl h-fit border border-border/50 sticky top-24" id="write-review">
          <h3 className="font-bold mb-4 text-charcoal">Gửi đánh giá của bạn</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Mức độ hài lòng</label>
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
            <Textarea 
              placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..." 
              rows={4} 
              className="rounded-xl border-none shadow-sm resize-none bg-white" 
              value={newReview.comment} 
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} 
            />
            <Button type="submit" className="w-full btn-hero h-12 shadow-gold" disabled={isReviewLoading || !user}>
              {isReviewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />} 
              {user ? "Gửi Đánh Giá" : "Đăng nhập để đánh giá"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}