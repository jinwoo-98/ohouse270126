import { MonitorPlay } from "lucide-react";
import { SlideManager } from "@/components/admin/homepage/SlideManager";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SlidePage() {
  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild><Link to="/admin/content"><ArrowLeft className="w-4 h-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MonitorPlay className="w-6 h-6 text-primary" /> Quản Lý Slideshow
          </h1>
          <p className="text-muted-foreground text-sm">Thiết lập các banner lớn xoay vòng ở đầu trang chủ.</p>
        </div>
      </div>
      <SlideManager />
    </div>
  );
}