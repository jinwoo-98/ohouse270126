"use client";

import { Star, Gift, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export function PointsDashboard() {
  const currentPoints = 1250;
  const pointsToNextTier = 5000;
  const progress = (currentPoints / pointsToNextTier) * 100;

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-charcoal text-cream p-8 rounded-3xl shadow-elevated border border-white/5 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
          <p className="text-sm font-bold uppercase tracking-widest text-taupe mb-2">Điểm Tích Lũy</p>
          <div className="flex items-baseline gap-3">
            <p className="text-5xl font-bold">{currentPoints.toLocaleString('vi-VN')}</p>
            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
          </div>
          <p className="text-xs text-taupe mt-4">Điểm sẽ hết hạn sau 12 tháng không phát sinh giao dịch.</p>
        </div>
        <div className="bg-primary/5 p-8 rounded-3xl border border-primary/20">
          <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Hạng Thành Viên</p>
          <p className="text-3xl font-bold text-charcoal mb-4">GOLD MEMBER</p>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-3">
            Còn <span className="font-bold text-primary">{(pointsToNextTier - currentPoints).toLocaleString('vi-VN')}</span> điểm nữa để lên hạng Diamond
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" /> Đổi Quà Tặng
        </h3>
        <div className="text-center py-16 bg-secondary/20 rounded-2xl border border-dashed border-border">
          <p className="text-muted-foreground font-medium">Tính năng đổi quà tặng hấp dẫn sắp ra mắt.</p>
          <p className="text-xs text-muted-foreground mt-2">Hãy tích cực mua sắm để sẵn sàng đổi những phần quà giá trị nhé!</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <HelpCircle className="w-5 h-5 text-blue-600" />
        <p className="text-xs text-blue-800">
          Mọi thắc mắc về chương trình thành viên, vui lòng liên hệ hotline <strong className="font-bold">1900 888 999</strong> để được hỗ trợ.
        </p>
      </div>
    </div>
  );
}