"use client";

import { useState } from "react";
import { Sparkles, Loader2, Copy, Check, Send, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AIContentAssistantProps {
  onInsert: (content: string) => void;
  contextTitle: string;
  contentType: 'news' | 'project' | 'page' | 'product';
}

export function AIContentAssistant({ onInsert, contextTitle, contentType }: AIContentAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");

  const generateContent = async () => {
    if (!contextTitle && !prompt) {
      toast.error("Vui lòng nhập tên sản phẩm hoặc yêu cầu cụ thể.");
      return;
    }

    setResult("");
    setIsGenerating(true);
    
    setTimeout(() => {
      let mockResponse = "";
      const title = contextTitle || "Sản phẩm nội thất";
      const isLongRequest = prompt.toLowerCase().includes("dài") || prompt.toLowerCase().includes("chi tiết") || prompt.toLowerCase().includes("sâu");
      
      if (contentType === 'product') {
        mockResponse = `
<h3>Giới thiệu về ${title}</h3>
<p><strong>${title}</strong> là mẫu nội thất tiêu biểu trong bộ sưu tập mới nhất của OHOUSE, được thiết kế để mang lại sự cân bằng hoàn hảo giữa tính thẩm mỹ hiện đại và công năng sử dụng vượt trội. Với những đường nét tinh tế, sản phẩm không chỉ là món đồ nội thất mà còn là một tác phẩm nghệ thuật nâng tầm không gian sống của bạn.</p>

<h3>Đặc điểm nổi bật</h3>
<ul>
  <li><strong>Chất liệu thượng hạng:</strong> Tuyển chọn từ những vật liệu tốt nhất, đảm bảo độ bền đẹp theo thời gian.</li>
  <li><strong>Thiết kế Ergonomic:</strong> Được tính toán kỹ lưỡng về kích thước để mang lại trải nghiệm sử dụng thoải mái nhất.</li>
  <li><strong>Sự tinh xảo:</strong> Từng chi tiết nhỏ được gia công tỉ mỉ bởi đội ngũ thợ lành nghề.</li>
  <li><strong>Đa dạng không gian:</strong> Phù hợp với nhiều phong cách từ hiện đại, tối giản đến sang trọng.</li>
</ul>

${isLongRequest ? `
<h3>Chi tiết kỹ thuật và cấu trúc</h3>
<p>Sản phẩm sử dụng khung sườn chắc chắn kết hợp cùng lớp hoàn thiện bề mặt cao cấp, chống trầy xước và bám bẩn hiệu quả. Quy trình sản xuất áp dụng tiêu chuẩn xuất khẩu Châu Âu, đảm bảo an toàn tuyệt đối cho sức khỏe người dùng.</p>

<h3>Gợi ý phối đồ</h3>
<p>Để tối ưu hóa vẻ đẹp của ${title}, bạn có thể kết hợp cùng các món đồ decor cùng tông màu trung tính hoặc tạo điểm nhấn bằng các phụ kiện kim loại mạ vàng sang trọng.</p>
` : ""}
`;
      } else if (contentType === 'news') {
        mockResponse = `<h2>${title}: Xu Hướng Đẳng Cấp</h2><p>...</p>`;
      } else if (contentType === 'project') {
        mockResponse = `<h1>Dự Án: ${title}</h1><p>...</p>`;
      } else {
        mockResponse = `<h2>Thông Tin: ${title}</h2><p>...</p>`;
      }

      setResult(mockResponse);
      setIsGenerating(false);
      toast.success("AI đã soạn thảo xong nội dung!");
    }, 1500);
  };

  const handleInsert = () => {
    onInsert(result);
    setIsOpen(false);
    setResult("");
    setPrompt("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-primary/30 text-primary hover:bg-primary/5 h-9 rounded-xl">
          <Sparkles className="w-4 h-4" />
          Viết bằng AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-none shadow-elevated z-[130]">
        <div className="bg-charcoal p-6 text-cream flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">OHOUSE AI Assistant</DialogTitle>
              <p className="text-[10px] text-taupe uppercase tracking-widest">Soạn thảo nội dung thông minh</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Chủ đề / Tên sản phẩm</Label>
            <div className="p-3 bg-secondary/50 rounded-xl font-bold text-charcoal border border-border/50">
              {contextTitle || "Chưa có tiêu đề"}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Yêu cầu bổ sung (Tùy chọn)</Label>
            <Textarea 
              placeholder="Gợi ý: 'viết thật dài và chi tiết', 'phong cách hiện đại', 'nhấn mạnh vào chất liệu gỗ'..." 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="rounded-xl border-border/60 focus:border-primary min-h-[80px]"
            />
          </div>

          {isGenerating ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4 bg-secondary/20 rounded-2xl border border-dashed border-primary/20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <div className="text-center">
                <p className="text-sm font-bold text-charcoal uppercase tracking-widest">AI đang soạn thảo nội dung...</p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-3 animate-fade-in">
              <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center justify-between">Kết quả gợi ý</Label>
              <div className="bg-secondary/30 p-4 rounded-xl border border-dashed border-primary/20 max-h-64 overflow-y-auto text-sm text-muted-foreground leading-relaxed prose prose-sm">
                <div dangerouslySetInnerHTML={{ __html: result }} />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 rounded-xl h-12 text-xs font-bold" onClick={() => setResult("")}>Hủy</Button>
                <Button className="flex-[2] btn-hero rounded-xl h-12 text-xs font-bold" onClick={handleInsert}>Sử dụng nội dung này</Button>
              </div>
            </div>
          ) : (
            <Button onClick={generateContent} disabled={isGenerating} className="w-full btn-hero h-14 rounded-2xl shadow-gold">
              <Send className="w-4 h-4 mr-2" /> BẮT ĐẦU VIẾT
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}