import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ProfileForm() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.user_metadata?.first_name || "",
    lastName: user?.user_metadata?.last_name || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
        },
      });

      if (error) throw error;
      toast.success("Cập nhật thông tin thành công!");
    } catch (error: any) {
      toast.error("Lỗi cập nhật: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Họ</Label>
          <Input 
            id="firstName" 
            value={formData.firstName} 
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Tên</Label>
          <Input 
            id="lastName" 
            value={formData.lastName} 
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={user?.email} disabled className="bg-secondary/50" />
        <p className="text-[10px] text-muted-foreground italic">* Không thể thay đổi email đăng nhập</p>
      </div>

      <Button type="submit" className="btn-hero w-full md:w-auto" disabled={isLoading}>
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Lưu Thay Đổi
      </Button>
    </form>
  );
}