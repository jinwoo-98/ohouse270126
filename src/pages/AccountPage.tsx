import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AuthDialog } from "@/components/AuthDialog";
import { useState } from "react";

export default function AccountPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(true);

  // Redirect authenticated users to the profile dashboard
  useEffect(() => {
    if (user) {
      navigate("/tai-khoan/thong-tin"); 
    }
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not logged in, show the login dialog and a fallback page content
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
                Vui lòng đăng nhập để truy cập trang quản lý tài khoản.
              </p>
              <Button onClick={() => setIsAuthDialogOpen(true)}>
                Mở cửa sổ đăng nhập
              </Button>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
      
      {/* Show Auth Dialog when accessing /tai-khoan directly */}
      <AuthDialog 
        isOpen={isAuthDialogOpen} 
        onClose={() => {
          setIsAuthDialogOpen(false);
          // If user closes the dialog without logging in, redirect them away from the login route
          if (!user) navigate("/"); 
        }} 
      />
    </div>
  );
}