import { LayoutGrid } from "lucide-react";
import { HeaderMenuManager } from "@/components/admin/homepage/HeaderMenuManager";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CategoryMenuPage() {
  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild><Link to="/admin/content"><ArrowLeft className="w-4 h-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-primary" /> Quản Lý Danh Mục & Menu
          </h1>
          <p className="text-muted-foreground text-sm">Quản lý danh mục hiển thị trên trang chủ và cấu hình Header/Footer.</p>
        </div>
      </div>
      <HeaderMenuManager />
    </div>
  );
}