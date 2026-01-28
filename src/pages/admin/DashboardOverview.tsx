import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  Package,
  ArrowUpRight,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Get Orders & Revenue
      const { data: orders } = await supabase.from('orders').select('total_amount');
      const totalRev = orders?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;
      
      // Get Products count
      const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
      
      // Get Profiles count
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

      // Get Recent Orders
      const { data: recent } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalOrders: orders?.length || 0,
        totalRevenue: totalRev,
        totalProducts: prodCount || 0,
        totalUsers: userCount || 0
      });
      setRecentOrders(recent || []);
    } finally {
      setLoading(false);
    }
  };

  function formatPrice(price: number) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  }

  const statCards = [
    { title: "Doanh thu", value: formatPrice(stats.totalRevenue), icon: DollarSign, color: "bg-emerald-500", trend: "+12%" },
    { title: "Đơn hàng", value: stats.totalOrders, icon: Package, color: "bg-blue-500", trend: "+5%" },
    { title: "Sản phẩm", value: stats.totalProducts, icon: ShoppingBag, color: "bg-amber-500", trend: "Ổn định" },
    { title: "Khách hàng", value: stats.totalUsers, icon: Users, color: "bg-purple-500", trend: "+8%" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chào mừng trở lại!</h1>
          <p className="text-muted-foreground text-sm">Dưới đây là tóm tắt hoạt động kinh doanh của OHOUSE hôm nay.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground bg-white px-4 py-2 rounded-xl shadow-sm border">
          <Clock className="w-4 h-4" />
          Cập nhật lúc: {new Date().toLocaleTimeString('vi-VN')}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-border group hover:border-primary/50 transition-all">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${stat.color} text-white shadow-lg`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="text-[10px] font-bold border-emerald-100 text-emerald-600 bg-emerald-50">
                {stat.trend} <ArrowUpRight className="w-3 h-3 ml-1" />
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.title}</p>
              <p className="text-2xl font-bold text-charcoal mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-lg">Đơn hàng gần đây</h2>
          <button className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">Xem tất cả</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase tracking-widest font-bold text-muted-foreground border-b">
                <th className="px-6 py-4">Mã đơn</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Tổng tiền</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-muted-foreground italic">Chưa có dữ liệu đơn hàng.</td></tr>
              ) : recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-primary">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4 text-sm font-medium">{order.contact_email}</td>
                  <td className="px-6 py-4 text-sm font-bold text-charcoal">{formatPrice(order.total_amount)}</td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="secondary" className="capitalize text-[10px]">{order.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}