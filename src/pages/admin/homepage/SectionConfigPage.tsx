import { Palette } from "lucide-react";
import { SectionConfigManager } from "@/components/admin/homepage/SectionConfigManager";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SectionConfigPage() {
  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild><Link to="/admin/content"><ArrowLeft className="w-4 h-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="w-6 h-6 text-primary" /> Cấu Hình Văn Bản & Màu Sắc
          </h1>
          <p className="text-muted-foreground text-sm">Tùy chỉnh tiêu đề, mô tả và màu sắc cho các phần trên trang chủ.</p>
        </div>
      </div>
      <SectionConfigManager />
    </div>
  );
}