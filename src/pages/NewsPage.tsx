import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Clock } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import heroLivingRoom from "@/assets/hero-living-room.jpg";
import heroDiningRoom from "@/assets/hero-dining-room.jpg";
import heroBedroom from "@/assets/hero-bedroom.jpg";
import heroBathroom from "@/assets/hero-bathroom.jpg";

const featuredNews = {
  id: 1,
  title: "Xu Hướng Nội Thất 2024: Sự Kết Hợp Hoàn Hảo Giữa Hiện Đại Và Cổ Điển",
  excerpt: "Khám phá những xu hướng thiết kế nội thất nổi bật nhất năm 2024, từ phong cách tối giản đến sự trở lại mạnh mẽ của các yếu tố cổ điển.",
  image: heroLivingRoom,
  date: "15/01/2024",
  readTime: "5 phút đọc",
  category: "Xu Hướng",
};

const news = [
  {
    id: 2,
    title: "Cách Chọn Sofa Phù Hợp Với Không Gian Phòng Khách",
    excerpt: "Hướng dẫn chi tiết cách lựa chọn sofa hoàn hảo cho không gian sống của bạn.",
    image: heroDiningRoom,
    date: "12/01/2024",
    readTime: "4 phút đọc",
    category: "Hướng Dẫn",
  },
  {
    id: 3,
    title: "OHOUSE Khai Trương Showroom Mới Tại Đà Nẵng",
    excerpt: "Showroom mới với diện tích 1000m2 trưng bày hàng nghìn sản phẩm nội thất cao cấp.",
    image: heroBedroom,
    date: "08/01/2024",
    readTime: "3 phút đọc",
    category: "Tin Tức",
  },
  {
    id: 4,
    title: "Bí Quyết Bố Trí Phòng Ngủ Theo Phong Thủy",
    excerpt: "Những nguyên tắc phong thủy cơ bản giúp phòng ngủ của bạn tràn đầy năng lượng tích cực.",
    image: heroBathroom,
    date: "05/01/2024",
    readTime: "6 phút đọc",
    category: "Phong Thủy",
  },
  {
    id: 5,
    title: "Chương Trình Sale Đầu Năm - Giảm Đến 50%",
    excerpt: "Cơ hội sở hữu nội thất cao cấp với mức giá ưu đãi nhất trong năm.",
    image: heroLivingRoom,
    date: "01/01/2024",
    readTime: "2 phút đọc",
    category: "Khuyến Mãi",
  },
  {
    id: 6,
    title: "Gỗ Óc Chó - Chất Liệu Hoàn Hảo Cho Nội Thất Cao Cấp",
    excerpt: "Tìm hiểu về đặc tính và ưu điểm vượt trội của gỗ óc chó trong thiết kế nội thất.",
    image: heroDiningRoom,
    date: "28/12/2023",
    readTime: "5 phút đọc",
    category: "Chất Liệu",
  },
];

export default function NewsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container-luxury">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Tin Tức & Bài Viết</h1>
          <p className="text-muted-foreground mb-8">Cập nhật xu hướng và kiến thức nội thất mới nhất</p>

          {/* Featured Article */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Link to={`/tin-tuc/${featuredNews.id}`} className="group block">
              <div className="grid md:grid-cols-2 gap-6 bg-card rounded-lg overflow-hidden shadow-subtle hover:shadow-medium transition-shadow">
                <div className="aspect-[16/10] md:aspect-auto img-zoom">
                  <img 
                    src={featuredNews.image} 
                    alt={featuredNews.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium w-fit mb-4">
                    {featuredNews.category}
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                    {featuredNews.title}
                  </h2>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {featuredNews.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {featuredNews.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {featuredNews.readTime}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* News Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link to={`/tin-tuc/${article.id}`} className="group block card-luxury h-full">
                  <div className="aspect-[16/10] img-zoom">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">
                      {article.category}
                    </span>
                    <h3 className="text-lg font-semibold mt-3 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {article.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline">
              Xem Thêm Bài Viết
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
