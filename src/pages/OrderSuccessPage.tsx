import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Package, ShoppingBag, ArrowRight, Home } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("id");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 md:py-24">
        <div className="container-luxury max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-2xl shadow-elevated p-8 md:p-12 border border-primary/10"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Đặt Hàng Thành Công!</h1>
            <p className="text-muted-foreground mb-8 text-lg">
              Cảm ơn bạn đã tin tưởng lựa chọn OHOUSE. Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến bạn.
            </p>
            
            {orderId && (
              <div className="bg-secondary/50 rounded-lg p-4 mb-8 inline-block px-8">
                <span className="text-sm text-muted-foreground block mb-1">Mã đơn hàng của bạn:</span>
                <span className="text-xl font-mono font-bold text-primary">#{orderId.slice(0, 8).toUpperCase()}</span>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <Button asChild variant="outline" size="lg" className="h-14">
                <Link to="/tai-khoan/don-hang">
                  <Package className="w-5 h-5 mr-2" />
                  Quản lý đơn hàng
                </Link>
              </Button>
              <Button asChild size="lg" className="btn-hero h-14">
                <Link to="/">
                  <Home className="w-5 h-5 mr-2" />
                  Về trang chủ
                </Link>
              </Button>
            </div>

            <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-primary" />
                <span>Kiểm tra email xác nhận</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-primary" />
                <span>Giao hàng từ 3-5 ngày</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}