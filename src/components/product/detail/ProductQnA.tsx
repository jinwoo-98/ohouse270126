import { Bot, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductQnAProps {
  productName: string;
  onOpenChat: () => void;
}

export function ProductQnA({ productName, onOpenChat }: ProductQnAProps) {
  return (
    <section className="mb-16 py-10 border-y border-dashed border-border/50">
      <div className="flex flex-col items-center text-center">
        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
          <Bot className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold uppercase tracking-widest text-charcoal mb-2">Hỏi Đáp Về Sản Phẩm</h2>
        <p className="text-muted-foreground max-w-lg mb-6">
          Bạn cần thêm thông tin về kích thước, chất liệu hay bảo hành của <strong>{productName}</strong>? 
          Trợ lý AI của OHOUSE sẵn sàng giải đáp ngay lập tức.
        </p>
        <Button onClick={onOpenChat} className="btn-hero h-12 px-8 rounded-full shadow-gold">
          <MessageCircle className="w-4 h-4 mr-2" /> Chat Ngay Với AI
        </Button>
      </div>
    </section>
  );
}