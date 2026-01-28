import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  Package,
  ArrowUpRight,
  Clock,
  ArrowDownRight,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { vi } from "date-fns/locale";

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch overall stats
      const { data: orders } = await supabase.from('orders').select('total_amount, created_at');
      const totalRev = orders?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;
      const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

      // 2. Fetch recent orders
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

      // 3. Process Chart Data (Last 7 days)
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(new Date(), 6 - i);
        return {
          date: d,
          name: format(d, 'dd/MM', { locale: vi }),
          fullDate: format(d, 'yyyy-MM-dd'),
          revenue: 0,
          orders: 0
        };
      });

      if (orders) {
        orders.forEach(order => {
          const orderDate = format(new Date(order.created_at), 'yyyy-MM-dd');
          const dayStat = days.find(d => d.fullDate === orderDate);
          if (dayStat) {
            dayStat.revenue += Number(order.total_amount);
            dayStat.orders += 1;
          }
        });
      }

      setChartData(days);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  function formatPrice(price: number) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  }

  const statCards = [
    { title: "Doanh thu", value: formatPrice(stats.totalRevenue), icon: DollarSign, color: "bg-emerald-500", trend: "+12.5%", isPositive: true },
    { title: "Đơn hàng", value: stats.totalOrders, icon: Package, color: "bg-blue-500", trend: "+5.2%", isPositive: true },
    { title: "Sản phẩm", value: stats.totalProducts, icon: ShoppingBag, color: "bg-amber-500", trend: "Ổn định", isPositive: true },
    { title: "Khách hàng", value: stats.totalUsers, icon: Users, color: "bg-purple-500", trend: "-2.1%", isPositive: false },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng Quan Kinh Doanh</h1>
          <p className="text-muted-foreground text-sm">Chào mừng bạn trở lại, đây là những gì đang diễn ra với OHOUSE.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground bg-white px-4 py-2 rounded-xl shadow-sm border">
          <Clock className="w-4 h-4" />
          Cập nhật: {new Date().toLocaleTimeString('vi-VN')}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-border hover:border-primary/40 transition-all group">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${stat.color} text-white shadow-lg`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <Badge variant="outline" className={`text-[10px] font-bold ${stat.isPositive ? 'border-emerald-100 text-emerald-600 bg-emerald-50' : 'border-rose-100 text-rose-600 bg-rose-50'}`}>
                {stat.trend} {stat.isPositive ? <ArrowUpRight className="w-3 h-3 ml-1" /> : <ArrowDownRight className="w-3 h-3 ml-1" />}
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.title}</p>
              <p className="text-2xl font-bold text-charcoal mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-border">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Doanh thu 7 ngày qua
            </h2>
            <select className="text-xs font-bold uppercase tracking-widest bg-secondary/50 border-none rounded-lg px-3 py-2 outline-none">
              <option>7 ngày qua</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [formatPrice(value), 'Doanh thu']}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border flex flex-col">
          <h2 className="font-bold text-lg mb-6">Đơn hàng mới nhất</h2>
          <div className="flex-1 space-y-4">
            {recentOrders.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground italic text-sm">
                Chưa có đơn hàng nào.
              </div>
            ) : recentOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/30 transition-colors border border-transparent hover:border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold truncate">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{order.contact_email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{formatPrice(order.total_amount)}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/5 rounded-xl transition-colors border border-dashed border-primary/20">
            Xem tất cả đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
}