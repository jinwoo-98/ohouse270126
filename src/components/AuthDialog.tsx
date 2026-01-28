import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

  // Lấy origin hiện tại để redirect chính xác (ví dụ: localhost:8080 hoặc domain của bạn)
  const redirectUrl = window.location.origin;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-6 md:p-8 z-[110] overflow-y-auto max-h-[90vh]">
        <DialogHeader className="text-center mb-4">
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
                },
                radii: {
                  borderRadiusButton: '0.75rem',
                  inputBorderRadius: '0.75rem',
                },
              },
            },
          }}
          providers={['google', 'facebook']}
          redirectTo={redirectUrl}
          onlyThirdPartyProviders={false}
          view="sign_in"
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Mật khẩu',
                button_label: 'Đăng Nhập',
                social_provider_text: 'Tiếp tục với {{provider}}',
              },
            },
          }}
        />

        <div className="mt-6 pt-4 border-t">
          <Alert className="bg-primary/5 border-primary/20">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-[10px] text-muted-foreground leading-relaxed">
              <strong>Lưu ý:</strong> Để Google/Facebook hoạt động, bạn cần cấu hình Client ID trong 
              <a 
                href="https://supabase.com/dashboard/project/kyfzqgyazmjtnxjdvetr/auth/providers" 
                target="_blank" 
                rel="noreferrer"
                className="text-primary underline ml-1"
              >
                Supabase Dashboard
              </a>.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}