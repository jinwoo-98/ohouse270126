import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useEffect } from 'react';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const { isLoading, user } = useAuth();

  // Đóng dialog khi người dùng đã đăng nhập thành công
  useEffect(() => {
    if (user && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Lấy URL chính xác của môi trường hiện tại
  const getRedirectUrl = () => {
    let url = window.location.origin;
    url = url.endsWith('/') ? url.slice(0, -1) : url;
    return url;
  };

  const redirectUrl = getRedirectUrl();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-6 md:p-10 z-[110] overflow-y-auto max-h-[95vh] rounded-3xl border-none shadow-elevated">
        <DialogHeader className="text-center mb-6">
          <div className="flex flex-col items-center mb-2">
            <span className="text-3xl font-bold tracking-tight text-charcoal">OHOUSE</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold mt-1">Nội Thất Cao Cấp</span>
          </div>
          <p className="text-muted-foreground text-sm mt-4">
            Đăng nhập để nhận ưu đãi thành viên và bảo mật đơn hàng của bạn.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary-foreground))',
                    inputBackground: 'transparent',
                  },
                  radii: {
                    borderRadiusButton: '12px',
                    inputBorderRadius: '12px',
                  },
                },
              },
              className: {
                button: 'font-bold uppercase tracking-wider text-xs h-12 transition-all hover:scale-[1.02]',
                input: 'h-12 border-border/60 focus:border-primary rounded-xl',
                label: 'text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1',
                anchor: 'text-xs font-bold text-primary hover:underline',
                message: 'text-xs text-destructive mt-1',
              }
            }}
            providers={['google']}
            redirectTo={redirectUrl}
            onlyThirdPartyProviders={false}
            view="sign_in"
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Địa chỉ Email',
                  password_label: 'Mật khẩu',
                  button_label: 'Đăng Nhập',
                  social_provider_text: 'Tiếp tục với {{provider}}',
                  link_text: 'Đã có tài khoản? Đăng nhập ngay',
                },
                sign_up: {
                  email_label: 'Địa chỉ Email',
                  password_label: 'Mật khẩu',
                  button_label: 'Đăng Ký Thành Viên',
                  social_provider_text: 'Đăng ký bằng {{provider}}',
                  link_text: 'Chưa có tài khoản? Đăng ký tại đây',
                },
                forgotten_password: {
                  email_label: 'Địa chỉ Email',
                  button_label: 'Gửi link đặt lại mật khẩu',
                  link_text: 'Quên mật khẩu?',
                }
              }
            }}
          />
        </div>

        <div className="mt-6 pt-6 border-t border-border/40 text-center">
          <p className="text-[10px] text-muted-foreground italic">
            Bằng việc đăng nhập, bạn đồng ý với Điều khoản và Chính sách bảo mật của OHOUSE.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}