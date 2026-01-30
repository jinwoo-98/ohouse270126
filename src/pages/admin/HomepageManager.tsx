import { MonitorPlay } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SlideManager } from "@/components/admin/homepage/SlideManager";
import { HeaderMenuManager } from "@/components/admin/homepage/HeaderMenuManager";
import { ProductBadgeManager } from "@/components/admin/homepage/ProductBadgeManager";
import { ShopTheLookManager } from "@/components/admin/homepage/ShopTheLookManager";
import { TrendingKeywordsManager } from "@/components/admin/homepage/TrendingKeywordsManager";
import { SectionConfigManager } from "@/components/admin/homepage/SectionConfigManager";
import { USPManager } from "@/components/admin/homepage/USPManager";

export default function HomepageManager() {
  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MonitorPlay className="w-6 h-6 text-primary" /> Quản Lý Trang Chủ
        </h1>
        <p className="text-muted-foreground text-sm">Tùy chỉnh nội dung hiển thị trên trang chủ và thanh menu.</p>
      </div>

      <Tabs defaultValue="slides" className="w-full">
        <TabsList className="bg-white border p-1 rounded-xl h-12 w-full justify-start overflow-x-auto no-scrollbar">
          <TabsTrigger value="slides" className="rounded-lg h-10 px-4 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs uppercase">Slideshow</TabsTrigger>
          <TabsTrigger value="sections" className="rounded-lg h-10 px-4 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs uppercase">Văn Bản & Màu Sắc</TabsTrigger>
          <TabsTrigger value="categories_menu" className="rounded-lg h-10 px-4 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs uppercase">Danh mục & Menu</TabsTrigger>
          <TabsTrigger value="usp" className="rounded-lg h-10 px-4 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs uppercase">USP Bar</TabsTrigger>
          <TabsTrigger value="flash_featured" className="rounded-lg h-10 px-4 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs uppercase">Sản phẩm Badge</TabsTrigger>
          <TabsTrigger value="looks" className="rounded-lg h-10 px-4 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs uppercase">Shop The Look</TabsTrigger>
          <TabsTrigger value="trending" className="rounded-lg h-10 px-4 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs uppercase">Từ khóa</TabsTrigger>
        </TabsList>

        <TabsContent value="slides"><SlideManager /></TabsContent>
        <TabsContent value="sections"><SectionConfigManager /></TabsContent>
        <TabsContent value="categories_menu"><HeaderMenuManager /></TabsContent>
        <TabsContent value="usp"><USPManager /></TabsContent>
        <TabsContent value="flash_featured"><ProductBadgeManager /></TabsContent>
        <TabsContent value="looks"><ShopTheLookManager /></TabsContent>
        <TabsContent value="trending"><TrendingKeywordsManager /></TabsContent>
      </Tabs>
    </div>
  );
}