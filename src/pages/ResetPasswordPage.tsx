"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, KeyRound, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwords, setPasswords] = useState({
    password: "",
    confirm: "",
  });

  // Supabase sẽ tự động đăng nhập người dùng khi họ nhấn vào link reset mật khẩu
  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY") {
        console.log("Đang trong luồng khôi phục mật khẩu");
      }
    });
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.password !== passwords.confirm) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.password
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Mật khẩu của bạn đã được đặt lại thành công!");
      setTimeout(() => navigate("/"), 3000);
    } catch (error: any) {
      toast.error("Lỗi đặt lại mật khẩu: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-card rounded-3xl shadow-elevated p-8 md:p-10 border border-border/40"
        >
          {isSuccess ? (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-charcoal">Đặt lại thành công!</h1>
              <p className="text-muted-foreground">
                Mật khẩu mới đã được cập nhật. Bạn đang được chuyển hướng về trang chủ...
              </p>
              <Button asChild className="w-full btn-hero h-12">
                <a href="/">Về Trang Chủ</a>
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-charcoal">Đặt Lại Mật Khẩu</h1>
                <p className="text-muted-foreground text-sm mt-2">
                  Vui lòng nhập mật khẩu mới cho tài khoản của bạn
                </p>
              </div>

              <form onSubmit={handleReset} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="pass">Mật khẩu mới</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="pass"
                      type="password" 
                      placeholder="Ít nhất 6 ký tự"
                      className="pl-10 h-12 rounded-xl"
                      value={passwords.password}
                      onChange={(e) => setPasswords({...passwords, password: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm">Xác nhận mật khẩu</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="confirm"
                      type="password" 
                      placeholder="Nhập lại mật khẩu mới"
                      className="pl-10 h-12 rounded-xl"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full btn-hero h-12 text-sm font-bold shadow-gold" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Cập nhật mật khẩu ngay
                </Button>
              </form>
            </>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}