import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

  // Lấy URL chính xác của môi trường hiện tại (Local hoặc Preview)
  const getRedirectUrl = () => {
    let url = window.location.origin;
    // Đảm bảo không có dấu gạch chéo ở cuối để tránh lỗi whitelist của Supabase
    url = url.endsWith('/') ? url.slice(0, -1) : url;
    return url;
  };

  const redirectUrl = getRedirectUrl();

  // In ra console để người dùng copy vào Supabase Dashboard nếu cần
  console.log("[AuthDialog] Redirect URL hiện tại:", redirectUrl);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-6 md:p-10 z-[110] overflow-y-auto max-h-[95vh] rounded-3xl">
        <DialogHeader className="text-center mb-6">
          <DialogTitle className="text-3xl font-bold tracking-tight text-charcoal">OHOUSE</DialogTitle>
          <p className="text-muted-foreground text-sm mt-2">
            Đăng nhập để nhận ưu đãi thành viên và bảo mật đơn hàng
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
                button: 'font-bold uppercase tracking-wider text-xs h-12',
                input: 'h-12 border-border/60 focus:border-primary',
                label: 'text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1',
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
                }
              }
            }}
          />
        </div>

        <Alert className="mt-8 bg-amber-50 border-amber-200 text-amber-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-xs font-bold uppercase mb-1">Kiểm tra cấu hình!</AlertTitle>
          <AlertDescription className="text-[10px] leading-relaxed">
            Nếu nút Google quay về trang lỗi, hãy chắc chắn bạn đã thêm URL <strong>{redirectUrl}</strong> vào mục 
            <a 
              href="https://supabase.com/dashboard/project/kyfzqgyazmjtnxjdvetr/auth/url-configuration" 
              target="_blank" 
              className="font-bold underline ml-1"
            >
              Redirect URLs
            </a> trong Supabase Dashboard.
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
}