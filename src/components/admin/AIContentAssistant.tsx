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

    setResult("");
    setIsGenerating(true);
    
    setTimeout(() => {
      let mockResponse = "";
      const title = contextTitle || "Nội thất cao cấp";
      const isLongRequest = prompt.toLowerCase().includes("dài") || prompt.toLowerCase().includes("chi tiết") || prompt.toLowerCase().includes("sâu");
      
      if (contentType === 'news') {
        mockResponse = `
<h2>${title}: Xu Hướng Kiến Trúc Đẳng Cấp Năm 2024</h2>
<p>Trong kỷ nguyên mới của ngành thiết kế nội thất, <strong>${title}</strong> không chỉ đơn thuần là việc sắp xếp đồ đạc mà còn là nghệ thuật thể hiện phong cách sống của gia chủ. Tại OHOUSE, chúng tôi luôn đi tiên phong trong việc cập nhật những tinh hoa thiết kế từ Châu Âu để áp dụng vào không gian sống Việt.</p>

<h3>1. Tầm quan trọng của sự hài hòa trong không gian</h3>
<p>Một không gian sống lý tưởng cần đạt được sự cân bằng giữa công năng và thẩm mỹ. Việc ứng dụng ${title} giúp tối ưu hóa diện tích sử dụng, đồng thời tạo ra những điểm nhấn thị giác ấn tượng. Chúng tôi chú trọng vào việc sử dụng ánh sáng tự nhiên và các gam màu trung tính để tạo cảm giác thư giãn tuyệt đối.</p>

<h3>2. Lựa chọn vật liệu cao cấp - Chìa khóa của sự sang trọng</h3>
<p>Để hiện thực hóa ý tưởng về ${title}, việc lựa chọn vật liệu đóng vai trò quyết định. OHOUSE ưu tiên các loại gỗ tự nhiên như Gỗ Óc Chó Bắc Mỹ, Gỗ Sồi Nga kết hợp cùng đá Sintered Stone và da bò thật nhập khẩu từ Ý. Sự kết hợp giữa vân gỗ ấm áp và bề mặt đá lạnh tạo nên một bản giao hưởng vật liệu đầy tinh tế.</p>

${isLongRequest ? `
<h3>3. Công nghệ thông minh và sự bền vững</h3>
<p>Không dừng lại ở vẻ bề ngoài, nội dung chi tiết về ${title} còn bao gồm cả tính bền vững. Các sản phẩm của chúng tôi sử dụng sơn Inchem 7 lớp chống trầy xước, đảm bảo độ bền màu lên đến hàng chục năm. Ngoài ra, việc tích hợp các phụ kiện thông minh từ Blum, Hafele giúp trải nghiệm sử dụng trở nên mượt mà và đẳng cấp hơn bao giờ hết.</p>

<h3>4. Tầm nhìn và sứ mệnh kiến tạo</h3>
<p>Chúng tôi hiểu rằng mỗi ngôi nhà là một câu chuyện riêng. Vì vậy, trong từng bài viết và dự án về ${title}, đội ngũ kiến trúc sư luôn dành thời gian nghiên cứu kỹ lưỡng thói quen sinh hoạt của gia chủ để đưa ra những giải pháp tối ưu nhất, mang đậm dấu ấn cá nhân.</p>
` : ""}

<p>Kết luận, việc đầu tư vào <strong>${title}</strong> chính là đầu tư vào chất lượng cuộc sống lâu dài. Hãy để OHOUSE đồng hành cùng bạn trên hành trình xây dựng tổ ấm trong mơ.</p>`;
      } else if (contentType === 'project') {
        mockResponse = `
<h1>Dự Án Tiêu Biểu: ${title}</h1>
<p>Dự án <strong>${title}</strong> là một minh chứng điển hình cho triết lý thiết kế "Sang trọng từ sự tối giản" mà OHOUSE đang theo đuổi. Công trình được hoàn thiện sau 6 tháng tư vấn, thiết kế và thi công tỉ mỉ đến từng chi tiết nhỏ nhất.</p>

<div className="grid md:grid-cols-2 gap-4 my-6">
  <div className="p-4 bg-secondary/50 rounded-xl"><strong>Phong cách:</strong> Modern Luxury & Neoclassic</div>
  <div className="p-4 bg-secondary/50 rounded-xl"><strong>Diện tích:</strong> Phân khúc cao cấp</div>
</div>

<h3>Ý tưởng thiết kế chủ đạo</h3>
<p>Gia chủ mong muốn một không gian mở, kết nối các thành viên trong gia đình nhưng vẫn đảm bảo sự riêng tư cần thiết. Với dự án ${title}, chúng tôi đã sử dụng giải pháp thông tầng và vách kính lớn để tận dụng tối đa ánh sáng tự nhiên. Mọi góc nhìn trong căn nhà đều được tính toán để trở thành một "khung tranh" sống động.</p>

<h3>Chi tiết các không gian chức năng</h3>
<p><strong>Phòng khách:</strong> Tâm điểm là bộ sofa da bò Ý màu nâu hạt dẻ phối cùng bàn trà mặt đá Marble trắng Volakas. Hệ tủ tivi được thiết kế kịch trần bằng gỗ óc chó tạo vẻ uy nghi và sang trọng.</p>
<p><strong>Phòng ăn:</strong> Sử dụng bộ bàn ăn 8 ghế phong cách hoàng gia, kết hợp đèn chùm pha lê cao cấp tạo không gian ấm cúng cho những bữa tiệc gia đình.</p>

${isLongRequest ? `
<h3>Giải pháp kỹ thuật và vật liệu đặc biệt</h3>
<p>Trong quá trình thi công ${title}, chúng tôi đã áp dụng công nghệ xử lý gỗ tiên tiến để đảm bảo không bị cong vênh dưới thời tiết khắc nghiệt. Toàn bộ hệ thống điện thông minh (Smart Home) được tích hợp ngầm, giúp gia chủ điều khiển toàn bộ thiết bị chỉ qua một chạm trên smartphone.</p>
<p>Sự hài lòng của khách hàng sau khi nhận bàn giao dự án ${title} chính là động lực lớn nhất để đội ngũ OHOUSE tiếp tục sáng tạo và cống hiến.</p>
` : ""}
`;
      } else {
        mockResponse = `
<h2>Thông Tin Chi Tiết Về ${title}</h2>
<p>Chào mừng quý khách đến với chuyên mục hỗ trợ của OHOUSE. Dưới đây là các thông tin chi tiết và chính thức về <strong>${title}</strong>. Chúng tôi hy vọng những nội dung này sẽ giúp quý khách hiểu rõ hơn về quy trình làm việc cũng như các cam kết chất lượng của chúng tôi.</p>

<h3>1. Quy trình thực hiện chuyên nghiệp</h3>
<p>Đối với mọi nội dung liên quan đến ${title}, chúng tôi áp dụng quy trình kiểm soát chặt chẽ gồm 5 bước: Tiếp nhận yêu cầu - Khảo sát thực tế - Lên phương án 3D - Phê duyệt vật liệu - Thi công và bàn giao. Mỗi bước đều có biên bản nghiệm thu rõ ràng để đảm bảo quyền lợi khách hàng.</p>

<h3>2. Cam kết từ OHOUSE</h3>
<p>Chúng tôi tự hào mang đến dịch vụ ${title} với sự tận tâm cao nhất. Đội ngũ nhân sự được đào tạo bài bản, có kiến thức sâu rộng về phong thủy và kiến trúc hiện đại sẽ trực tiếp tư vấn cho quý khách.</p>

${isLongRequest ? `
<h3>3. Các lưu ý quan trọng khi tham khảo ${title}</h3>
<p>Quý khách nên lưu ý rằng các thông tin về ${title} có thể thay đổi tùy theo điều kiện thực tế của từng công trình và yêu cầu cụ thể của chủ đầu tư. Để có được báo giá và phương án chính xác nhất, chúng tôi khuyến khích quý khách đặt lịch hẹn tư vấn trực tiếp tại Showroom hoặc yêu cầu kiến trúc sư khảo sát tận nơi.</p>
<p>Mọi thắc mắc bổ sung về ${title}, quý khách vui lòng liên hệ bộ phận CSKH qua hotline 1900 888 999 để được phản hồi trong vòng 2 giờ làm việc.</p>
` : ""}
`;
      }

      setResult(mockResponse);
      setIsGenerating(false);
      toast.success("AI đã soạn thảo xong nội dung dài!");
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
              placeholder="Gợi ý: 'viết thật dài và chi tiết', 'phân tích sâu về gỗ óc chó', 'viết phong cách tối giản'..." 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="rounded-xl border-border/60 focus:border-primary min-h-[80px]"
            />
          </div>

          {isGenerating ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4 bg-secondary/20 rounded-2xl border border-dashed border-primary/20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <div className="text-center">
                <p className="text-sm font-bold text-charcoal uppercase tracking-widest">AI đang phân tích và soạn thảo nội dung dài...</p>
                <p className="text-[10px] text-muted-foreground mt-1 italic">Nội dung đang được tối ưu hóa theo yêu cầu của bạn</p>
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