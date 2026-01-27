import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Loader2 } from "lucide-react";

export default function AccountPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to the home page
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-12 md:py-16">
        <div className="container-luxury">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-lg shadow-medium p-6 md:p-8"
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">Chào Mừng Đến OHOUSE</h1>
                <p className="text-muted-foreground text-sm">
                  Đăng nhập để trải nghiệm mua sắm tốt hơn
                </p>
              </div>

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
                providers={[]}
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
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}