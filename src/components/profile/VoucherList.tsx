"use client";

import { Ticket, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

const mockVouchers = [
  { code: "OHOUSE500", desc: "Giảm 500.000đ cho đơn hàng đầu tiên từ 5.000.000đ", expiry: "31/12/2024", type: 'cash' },
  { code: "FREESHIPMAX", desc: "Miễn phí vận chuyển toàn quốc cho đơn hàng từ 10.000.000đ", expiry: "31/12/2024", type: 'ship' },
  { code: "GOLDVIP10", desc: "Ưu đãi 10% cho thành viên Gold (tối đa 1.000.000đ)", expiry: "Vô thời hạn", type: 'percent' },
  { code: "SINHNHAT", desc: "Quà tặng đặc biệt tháng sinh nhật", expiry: "30/11/2024", type: 'gift', used: true },
];

export function VoucherList() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã: ${code}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {mockVouchers.map((v) => (
          <div 
            key={v.code} 
            className={`relative group overflow-hidden flex items-center gap-5 p-5 border border-dashed rounded-2xl transition-colors ${
              v.used ? 'bg-secondary/30 border-border/50 opacity-60' : 'bg-primary/5 border-primary/40 hover:bg-primary/10'
            }`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${
              v.used ? 'bg-white border-border/50 text-muted-foreground' : 'bg-white border-primary/10 text-primary'
            }`}>
              <Ticket className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg leading-tight tracking-tight text-charcoal">{v.code}</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{v.desc}</p>
              <p className="text-[10px] font-bold text-primary mt-2">HSD: {v.expiry}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleCopy(v.code)}
              disabled={v.used}
              className={`absolute top-4 right-4 h-9 w-9 rounded-lg transition-all ${
                v.used ? 'bg-muted text-muted-foreground' : 'bg-white text-primary hover:bg-primary hover:text-white'
              }`}
            >
              {copiedCode === v.code ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            {v.used && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <span className="px-4 py-1 bg-muted text-muted-foreground text-xs font-bold uppercase tracking-widest rounded-full border">Đã sử dụng</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}