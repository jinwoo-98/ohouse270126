import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface OrderTrackingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrderTrackingDialog({ isOpen, onClose }: OrderTrackingDialogProps) {
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      toast.error("Vui lòng nhập số điện thoại hoặc email.");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.info(`Đang tra cứu đơn hàng cho: ${identifier}`);
      setIdentifier("");
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tra Cứu Đơn Hàng</DialogTitle>
          <DialogDescription>
            Nhập số điện thoại hoặc email bạn đã dùng để đặt hàng.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleTrackOrder} className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="identifier">Số điện thoại / Email</Label>
            <Input
              id="identifier"
              placeholder="Ví dụ: 0909xxxxxx hoặc email@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="btn-hero" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            Tra Cứu
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}