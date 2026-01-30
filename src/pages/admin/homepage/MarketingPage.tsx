import { TrendingUp } from "lucide-react";
import { TrendingKeywordsManager } from "@/components/admin/homepage/TrendingKeywordsManager";
import { ProductBadgeManager } from "@/components/admin/homepage/ProductBadgeManager";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function MarketingPage() {
  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild><Link to="/admin/content"><ArrowLeft className="w-4 h-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" /> Quản Lý Từ Khóa & Sản Phẩm Badge
          </h1>
          <p className="text-muted-foreground text-sm">Thiết lập các từ khóa tìm kiếm xu hướng và gắn nhãn Flash Sale/Nổi bật.</p>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-bold mb-4">Từ Khóa Tìm Kiếm</h2>
          <TrendingKeywordsManager />
        </div>
        <div className="lg:col-span-1">
          <h2 className="text-xl font-bold mb-4">Gắn Nhãn Sản Phẩm</h2>
          <ProductBadgeManager />
        </div>
      </div>
    </div>
  );
}