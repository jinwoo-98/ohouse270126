import { List } from "lucide-react";
import { USPManager } from "@/components/admin/homepage/USPManager";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function USPPage() {
  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild><Link to="/admin/homepage"><ArrowLeft className="w-4 h-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <List className="w-6 h-6 text-primary" /> Quản Lý USP Bar
          </h1>
          <p className="text-muted-foreground text-sm">Quản lý các cam kết thương hiệu (Unique Selling Points) hiển thị dưới banner.</p>
        </div>
      </div>
      <USPManager />
    </div>
  );
}