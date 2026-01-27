import { Link } from "react-router-dom";
import { User, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { accountMenuItems } from "@/constants/header-data";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HeaderAccountDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenAuth: () => void;
}

export function HeaderAccountDrawer({ isOpen, onOpenChange, onOpenAuth }: HeaderAccountDrawerProps) {
  const { user } = useAuth();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error("Đăng xuất thất bại.");
    else {
      toast.success("Đã đăng xuất.");
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 p-0 flex flex-col z-[100]">
        <SheetHeader className="p-6 border-b border-border">
          <SheetTitle className="text-left font-bold text-xl uppercase tracking-wider">Tài Khoản</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 border-b border-border">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">{user.email?.charAt(0).toUpperCase()}</div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold truncate">{user.email}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Thành viên OHOUSE</p>
                </div>
              </div>
            ) : (
              <Button className="w-full btn-hero h-11" onClick={() => { onOpenAuth(); onOpenChange(false); }}><User className="w-4 h-4 mr-2" /> Đăng Nhập / Đăng Ký</Button>
            )}
          </div>

          <nav className="p-4">
            <div className="space-y-1">
              {accountMenuItems.map((item) => (
                <Link key={item.name} to={item.href} onClick={() => onOpenChange(false)} className="flex items-center gap-4 py-3.5 px-3 rounded-xl hover:bg-secondary group transition-all">
                  <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors"><item.icon className="w-4.5 h-4.5" /></div>
                  <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">{item.name}</span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-30 group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </nav>
        </div>

        {user && (
          <div className="p-4 border-t border-border mt-auto">
            <Button variant="ghost" onClick={handleLogout} className="w-full text-destructive hover:bg-destructive/10 justify-start"><LogOut className="w-4 h-4 mr-3" /> Đăng xuất tài khoản</Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}