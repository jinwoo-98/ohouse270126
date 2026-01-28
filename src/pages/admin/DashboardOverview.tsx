import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Loader2,
  Calendar as CalendarIcon,
  User,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  format, 
  subDays, 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  startOfMonth, 
  startOfYear,
  eachDayOfInterval,
  eachMonthOfInterval,
  isSameDay,
  isSameMonth
} from "date-fns";
import { vi } from "date-fns/locale";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type TimeRange = 'today' | 'week' | 'month' | 'year' | 'custom';

export default function DashboardOverview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [customDates, setCustomDates] = useState({ start: "", end: "" });
  
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange, customDates]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      let startDate: Date;
      let endDate = endOfDay(new Date());

      switch (timeRange) {
        case 'today': startDate = startOfDay(new Date()); break;
        case 'week': startDate = startOfWeek(new Date(), { weekStartsOn: 1 }); break;
        case 'month': startDate = startOfMonth(new Date()); break;
        case 'year': startDate = startOfYear(new Date()); break;
        case 'custom': 
          startDate = customDates.start ? new Date(customDates.start) : subDays(new Date(), 30);
          endDate = customDates.end ? endOfDay(new Date(customDates.end)) : endOfDay(new Date());
          break;
        default: startDate = subDays(new Date(), 7);
      }

      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

      const { data: recent } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      const periodRevenue = orders?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;

      setStats({
        totalOrders: orders?.length || 0,
        totalRevenue: periodRevenue,
        totalProducts: prodCount || 0,
        totalUsers: userCount || 0
      });
      setRecentOrders(recent || []);

      let processedChartData: any[] = [];
      if (timeRange === 'year') {
        const months = eachMonthOfInterval({ start: startDate, end: endDate });
        processedChartData = months.map(month => {
          const monthOrders = orders?.filter(o => isSameMonth(new Date(o.created_at), month)) || [];
          return {
            name: format(month, 'MMM', { locale: vi }),
            revenue: monthOrders.reduce((sum, o) => sum + Number(o.total_amount), 0)
          };
        });
      } else {
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        processedChartData = days.map(day => {
          const dayOrders = orders?.filter(o => isSameDay(new Date(o.created_at), day)) || [];
          return {
            name: format(day, 'dd/MM', { locale: vi }),
            revenue: dayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0)
          };
        });
      }
      setChartData(processedChartData);

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  function formatPrice(price: number) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  }

  const statCards = [
    { title: "Doanh thu kỳ này", value: formatPrice(stats.totalRevenue), icon: DollarSign, color: "bg-emerald-500", trend: "+12%", isPositive: true },
    { title: "Đơn hàng mới", value: stats.totalOrders, icon: Package, color: "bg-blue-500", trend: "+5%", isPositive: true },
    { title: "Tổng sản phẩm", value: stats.totalProducts, icon: ShoppingBag, color: "bg-amber-500", trend: "Ổn định", isPositive: true },
    { title: "Tổng khách hàng", value: stats.totalUsers, icon: Users, color: "bg-purple-500", trend: "+3%", isPositive: true },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500';
      case 'processing': return 'bg-blue-500';
      case 'shipped': return 'bg-indigo-500';
      case 'delivered': return 'bg-emerald-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tổng Quan Kinh Doanh</h1>
          <p className="text-muted-foreground text-sm">Phân tích hiệu quả kinh doanh của hệ thống OHOUSE.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {timeRange === 'custom' && (
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border shadow-sm">
              <Input type="date" className="h-8 border-none text-[10px] w-32" value={customDates.start} onChange={(e) => setCustomDates({...customDates, start: e.target.value})} />
              <span className="text-muted-foreground">-</span>
              <Input type="date" className="h-8 border-none text-[10px] w-32" value={customDates.end} onChange={(e) => setCustomDates({...customDates, end: e.target.value})} />
            </div>
          )}
          <Select value={timeRange} onValueChange={(val: TimeRange) => setTimeRange(val)}>
            <SelectTrigger className="w-44 h-11 bg-white rounded-xl shadow-sm border-border font-bold text-xs uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="today">Hôm nay</SelectItem>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="year">Năm nay</SelectItem>
              <SelectItem value="custom">Tùy chỉnh...</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-border hover:border-primary/40 transition-all">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${stat.color} text-white shadow-lg`}><stat.icon className="w-6 h-6" /></div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-border">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Biểu đồ doanh thu
            </h2>
          </div>
          <div className="h-[380px] w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#888'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#888'}} tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => [formatPrice(value), 'Doanh thu']} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg">Đơn hàng mới nhất</h2>
            <Badge variant="secondary" className="bg-primary/5 text-primary font-bold text-[10px] uppercase">TOP 6</Badge>
          </div>
          
          <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
            {loading ? (
               <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : recentOrders.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground italic text-sm">Chưa có đơn hàng nào.</div>
            ) : recentOrders.map((order) => {
              const customerName = order.contact_email?.split('@')[0] || "Khách vãng lai";
              return (
                <div 
                  key={order.id} 
                  className="group flex flex-col p-4 rounded-xl hover:bg-secondary/30 transition-all border border-transparent hover:border-border/50 cursor-pointer bg-secondary/10"
                  onClick={() => navigate('/admin/orders')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`} />
                      <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">#{order.id.slice(0, 8)}</span>
                    </div>
                    <span className="text-[10px] font-bold text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Xử lý ngay <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-charcoal truncate mb-0.5">{customerName}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{format(new Date(order.created_at), 'HH:mm')}</span>
                        <span className="text-border">|</span>
                        <span>{format(new Date(order.created_at), 'dd/MM/yyyy')}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-charcoal">{formatPrice(order.total_amount)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <button 
            onClick={() => navigate('/admin/orders')} 
            className="w-full mt-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-primary hover:bg-primary hover:text-white rounded-xl transition-all border border-primary/20 bg-primary/5 shadow-sm"
          >
            Quản lý tất cả đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
}