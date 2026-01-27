import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function AccountPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to the profile dashboard
  useEffect(() => {
    if (user) {
      // Since we don't have a full dashboard yet, redirect to home or a placeholder
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

  // If not loading and not logged in, show a prompt to use the dialog
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-12 md:py-16">
        <div className="container-luxury">
          <div className="max-w-md mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-lg shadow-medium p-8"
            >
              <User className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h1 className="text-2xl font-bold mb-2">Đăng Nhập Tài Khoản</h1>
              <p className="text-muted-foreground mb-6">
                Vui lòng sử dụng biểu tượng người dùng trên thanh điều hướng để đăng nhập hoặc đăng ký.
              </p>
              <Button asChild>
                <Link to="/">Quay lại trang chủ</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}