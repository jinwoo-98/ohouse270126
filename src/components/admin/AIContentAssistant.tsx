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
  contentType: 'news' | 'project' | 'page';
}

export function AIContentAssistant({ onInsert, contextTitle, contentType }: AIContentAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");

  const generateContent = async () => {
    if (!contextTitle && !prompt) {
      toast.error("Vui lòng nhập tiêu đề hoặc yêu cầu cụ thể.");
      return;
    }

    // Xóa kết quả cũ để hiển thị trạng thái loading
    setResult("");
    setIsGenerating(true);
    
    // Giả lập logic AI trả về nội dung chất lượng cao theo phong cách OHOUSE
    setTimeout(() => {
      let mockResponse = "";
      const title = contextTitle || "Nội thất cao cấp";

      if (contentType === 'news') {
        mockResponse = `<h2>${title}</h2>
<p>Trong thế giới nội thất hiện đại, <strong>${title}</strong> đang trở thành xu hướng dẫn đầu, mang lại không gian sống đẳng cấp và tinh tế cho mọi gia đình. Tại OHOUSE, chúng tôi tin rằng mỗi chi tiết nhỏ đều góp phần tạo nên một kiệt tác nghệ thuật trong ngôi nhà của bạn.</p>
<h3>1. Sự tinh tế trong thiết kế</h3>
<p>Thiết kế mang phong cách này chú trọng vào sự tối giản nhưng không kém phần sang trọng. Các vật liệu cao cấp như gỗ óc chó, đá tự nhiên và da thật được kết hợp hài hòa, tạo nên cảm giác ấm cúng và quyền quý.</p>
<h3>2. Công năng vượt trội</h3>
<p>Không chỉ dừng lại ở vẻ đẹp bên ngoài, công năng sử dụng cũng được tối ưu hóa. Từng món đồ nội thất đều được nghiên cứu kỹ lưỡng về nhân trắc học, đảm bảo sự thoải mái tuyệt đối cho người sử dụng.</p>
<p>Hãy cùng OHOUSE khám phá thêm nhiều ý tưởng sáng tạo cho không gian sống của bạn trong các bài viết tiếp theo.</p>`;
      } else if (contentType === 'project') {
        mockResponse = `<h3>Tổng quan dự án: ${title}</h3>
<p>Dự án <strong>${title}</strong> là một trong những công trình tiêu biểu mà đội ngũ kiến trúc sư OHOUSE tâm huyết thực hiện. Với mục tiêu kiến tạo một không gian sống "Đẳng cấp - Riêng tư - Sang trọng", chúng tôi đã sử dụng những giải pháp thiết kế thông minh nhất.</p>
<ul>
  <li><strong>Phong cách:</strong> Modern Luxury kết hợp Classic.</li>
  <li><strong>Vật liệu chủ đạo:</strong> Gỗ óc chó Bắc Mỹ, Inox mạ PVD và Đá Marble Ý.</li>
  <li><strong>Điểm nhấn:</strong> Hệ thống ánh sáng thông minh giúp tôn vinh các đường nét kiến trúc vào ban đêm.</li>
</ul>
<p>Mỗi căn phòng trong dự án đều được cá nhân hóa theo phong cách sống của gia chủ, tạo nên một bản sắc riêng không thể trộn lẫn.</p>`;
      } else {
        mockResponse = `<h2>${title}</h2>
<p>Chào mừng quý khách đến với trang thông tin của OHOUSE. Nội dung dưới đây trình bày chi tiết về <strong>${title}</strong> nhằm giúp khách hàng có cái nhìn rõ nét và tin tưởng nhất khi sử dụng dịch vụ của chúng tôi.</p>
<p>Chúng tôi cam kết minh bạch, tận tâm và chuyên nghiệp trong mọi quy trình làm việc. Nếu có bất kỳ thắc mắc nào, quý khách vui lòng liên hệ hotline 1900 888 999 để được hỗ trợ trực tiếp.</p>`;
      }

      setResult(mockResponse);
      setIsGenerating(false);
      toast.success("AI đã soạn thảo xong nội dung!");
    }, 2000);
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
            <Label className="text-xs font-bold uppercase text-muted-foreground">Chủ đề bài viết</Label>
            <div className="p-3 bg-secondary/50 rounded-xl font-bold text-charcoal border border-border/50">
              {contextTitle || "Chưa có tiêu đề"}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Yêu cầu bổ sung (Tùy chọn)</Label>
            <Textarea 
              placeholder="Ví dụ: Viết theo phong cách tối giản, tập trung vào chất liệu gỗ sồi..." 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="rounded-xl border-border/60 focus:border-primary min-h-[80px]"
            />
          </div>

          {isGenerating ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4 bg-secondary/20 rounded-2xl border border-dashed border-primary/20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <div className="text-center">
                <p className="text-sm font-bold text-charcoal uppercase tracking-widest">AI đang soạn thảo...</p>
                <p className="text-[10px] text-muted-foreground mt-1 italic">Vui lòng đợi trong giây lát</p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-3 animate-fade-in">
              <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center justify-between">
                Kết quả gợi ý 
                <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={generateContent}>
                  <RotateCcw className="w-3 h-3" /> Thử lại
                </Button>
              </Label>
              <div className="bg-secondary/30 p-4 rounded-xl border border-dashed border-primary/20 max-h-64 overflow-y-auto text-sm text-muted-foreground leading-relaxed prose prose-sm">
                <div dangerouslySetInnerHTML={{ __html: result }} />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 rounded-xl h-12 text-xs font-bold" onClick={() => setResult("")}>
                  Hủy bỏ
                </Button>
                <Button className="flex-[2] btn-hero rounded-xl h-12 text-xs font-bold" onClick={handleInsert}>
                  Sử dụng nội dung này
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              onClick={generateContent} 
              disabled={isGenerating} 
              className="w-full btn-hero h-14 rounded-2xl shadow-gold"
            >
              <Send className="w-4 h-4 mr-2" />
              BẮT ĐẦU VIẾT BÀI
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}