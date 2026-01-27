import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-6 md:p-8">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">Chào Mừng Đến OHOUSE</DialogTitle>
          <p className="text-muted-foreground text-sm">
            Đăng nhập để trải nghiệm mua sắm tốt hơn
          </p>
        </DialogHeader>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary-foreground))',
                  defaultButtonBackground: 'hsl(var(--secondary))',
                  defaultButtonBackgroundHover: 'hsl(var(--secondary-foreground))',
                  defaultButtonBorder: 'hsl(var(--border))',
                  inputBackground: 'hsl(var(--background))',
                  inputBorder: 'hsl(var(--border))',
                  inputBorderHover: 'hsl(var(--primary))',
                  inputBorderFocus: 'hsl(var(--primary))',
                  inputText: 'hsl(var(--foreground))',
                },
                radii: {
                  borderRadiusButton: '0.5rem',
                  inputBorderRadius: '0.5rem',
                },
              },
            },
          }}
          providers={['google', 'facebook']} // Added Google and Facebook
          view="sign_in"
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Mật khẩu',
                button_label: 'Đăng Nhập',
                social_provider_text: 'Hoặc tiếp tục với',
                link_text: 'Đã có tài khoản? Đăng nhập',
                forgotten_password: 'Quên mật khẩu?',
              },
              sign_up: {
                email_label: 'Email',
                password_label: 'Mật khẩu',
                button_label: 'Đăng Ký Ngay',
                social_provider_text: 'Hoặc tiếp tục với',
                link_text: 'Chưa có tài khoản? Đăng ký',
              },
              forgotten_password: {
                link_text: 'Quên mật khẩu?',
                button_label: 'Gửi hướng dẫn khôi phục',
                email_label: 'Email',
                loading_button_label: 'Đang gửi...',
                confirmation_text: 'Vui lòng kiểm tra email để khôi phục mật khẩu.',
              },
              update_password: {
                password_label: 'Mật khẩu mới',
                button_label: 'Cập nhật mật khẩu',
              },
            },
          }}
        />
      </DialogContent>
    </Dialog>
  );
}