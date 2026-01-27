import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ChevronRight, ArrowLeft, Facebook, Twitter, Link as LinkIcon } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import heroLivingRoom from "@/assets/hero-living-room.jpg";

// Mock data cho bài viết
const NEWS_CONTENT = {
  title: "Xu Hướng Nội Thất 2024: Sự Kết Hợp Hoàn Hảo Giữa Hiện Đại Và Cổ Điển",
  category: "Xu Hướng",
  date: "15/01/2024",
  readTime: "5 phút đọc",
  image: heroLivingRoom,
  author: "Admin OHOUSE",
  content: `
    <p className="mb-4">Năm 2024 đánh dấu một bước chuyển mình mạnh mẽ trong ngành thiết kế nội thất. Không còn là những không gian tối giản thuần túy hay cổ điển rườm rà, xu hướng năm nay tập trung vào việc tạo ra sự cân bằng tinh tế giữa sự tiện nghi hiện đại và những giá trị vượt thời gian.</p>
    
    <h3 className="text-xl font-bold mt-8 mb-4">1. Sự lên ngôi của các vật liệu tự nhiên</h3>
    <p className="mb-4">Gỗ óc chó, đá cẩm thạch và mây tre đan tiếp tục là những lựa chọn hàng đầu. Sự thô mộc của thiên nhiên mang lại cảm giác ấm cúng và an yên cho ngôi nhà giữa nhịp sống đô thị hối hả.</p>
    
    <h3 className="text-xl font-bold mt-8 mb-4">2. Màu sắc trung tính nhưng ấm áp</h3>
    <p className="mb-4">Thay vì những tông màu lạnh, bảng màu năm nay ưu tiên các sắc thái như be, taupe, và nâu đất. Những gam màu này tạo nên một phông nền hoàn hảo để tôn vinh những món đồ nội thất cao cấp.</p>
    
    <h3 className="text-xl font-bold mt-8 mb-4">3. Thiết kế thông minh và đa năng</h3>
    <p className="mb-4">Với việc không gian sống ngày càng trở nên quý giá, những món đồ nội thất tích hợp nhiều công năng đang trở thành "vị cứu tinh" cho các căn hộ hiện đại.</p>
  `
};

export default function NewsDetailPage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container-luxury max-w-4xl">
          <Link to="/tin-tuc" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại tin tức
          </Link>

          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-lg overflow-hidden shadow-subtle p-6 md:p-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                {NEWS_CONTENT.category}
              </span>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {NEWS_CONTENT.date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {NEWS_CONTENT.readTime}</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-8 leading-tight">{NEWS_CONTENT.title}</h1>

            <div className="aspect-[21/9] rounded-xl overflow-hidden mb-10">
              <img src={NEWS_CONTENT.image} alt={NEWS_CONTENT.title} className="w-full h-full object-cover" />
            </div>

            <div 
              className="prose prose-stone max-w-none text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: NEWS_CONTENT.content }}
            />

            <div className="mt-12 pt-8 border-t border-border flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center font-bold text-primary">O</div>
                <div>
                  <p className="text-sm font-bold">{NEWS_CONTENT.author}</p>
                  <p className="text-xs text-muted-foreground">Chuyên gia nội thất</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium mr-2">Chia sẻ:</span>
                <Button variant="outline" size="icon" className="rounded-full w-8 h-8"><Facebook className="w-4 h-4" /></Button>
                <Button variant="outline" size="icon" className="rounded-full w-8 h-8"><Twitter className="w-4 h-4" /></Button>
                <Button variant="outline" size="icon" className="rounded-full w-8 h-8"><LinkIcon className="w-4 h-4" /></Button>
              </div>
            </div>
          </motion.article>
        </div>
      </main>

      <Footer />
    </div>
  );
}