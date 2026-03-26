import { motion } from 'framer-motion';
import {
    Users,
    Home,
    Wallet,
    AlertCircle,
    TrendingUp,
    Zap,
    ChevronRight,
    ArrowUp,
    ArrowDown,
    Clock,
    Plus,
    FileText,
    Wrench,
    Package,
    MoreHorizontal,
    Droplets
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';

// Modern Stat Card Design
const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
    >
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full opacity-5 ${color} group-hover:scale-125 transition-transform duration-500`} />

            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-white`}>
                    <Icon size={22} className={`opacity-100 ${color.replace('bg-', 'text-')}`} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                        {trend === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                        {trendValue}
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">{value}</h3>
                <p className="text-sm font-medium text-slate-400">{title}</p>
            </div>
        </div>
    </motion.div>
);

// Quick Action Button
const QuickAction = ({ icon: Icon, label, onClick, color }) => (
    <Button
        variant="outline"
        className="h-auto py-4 flex flex-col gap-2 rounded-xl border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all bg-white"
        onClick={onClick}
    >
        <div className={`p-2 rounded-full ${color} bg-opacity-10`}>
            <Icon size={20} className={color.replace('bg-', 'text-')} />
        </div>
        <span className="text-xs font-bold text-slate-600">{label}</span>
    </Button>
);

export default function Dashboard() {
    const { tenants, billing, maintenance, incomeHistory, buildings, settings } = useApp();
    const navigate = useNavigate();

    // Calculations
    const totalRooms = buildings.reduce((acc, b) => acc + (b.floors * b.roomsPerFloor), 0) || 50; // Fallback to 50 if 0
    const occupancyRate = totalRooms > 0 ? Math.round((tenants.length / totalRooms) * 100) : 0;

    const paidIncome = billing
        .filter(b => b.status === "ชำระแล้ว")
        .reduce((sum, b) => sum + b.total, 0);

    const pendingIncome = billing
        .filter(b => b.status !== "ชำระแล้ว")
        .reduce((sum, b) => sum + b.total, 0);

    const pendingMaintenance = maintenance.filter(m => m.status !== "Completed").length;

    // Monthly Growth (Mock calculation)
    const currentMonthIncome = incomeHistory[incomeHistory.length - 1]?.income || 0;
    const lastMonthIncome = incomeHistory[incomeHistory.length - 2]?.income || 1;
    const growthRate = ((currentMonthIncome - lastMonthIncome) / lastMonthIncome * 100).toFixed(1);

    // Utility units calculation
    const totalElectricUnits = billing.reduce((acc, curr) => acc + (curr.electric || 0), 0);
    const totalWaterUnits = billing.reduce((acc, curr) => acc + (curr.water || 0), 0);
    const totalElectricCost = billing.reduce((acc, curr) => acc + ((curr.electric || 0) * (settings?.electricRate || 11)), 0);
    const totalWaterCost = billing.reduce((acc, curr) => acc + ((curr.water || 0) * (settings?.waterRate || 35)), 0);

    return (
        <div className="space-y-8 pb-10 font-sans min-h-screen bg-[#F8FAFC]/50">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">แดชบอร์ด</h1>
                    <p className="text-slate-500 mt-1 font-medium flex items-center gap-2">
                        ภาพรวมสถานะหอพักตวงเงินแมนชั่น ประจำวันนี้
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                    <Button variant="ghost" className="rounded-xl font-bold text-slate-600 h-10">
                        <Clock size={16} className="mr-2 text-slate-400" />
                        {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Button>
                    <div className="h-6 w-px bg-slate-200 mx-1"></div>
                    <Button onClick={() => navigate('/billing')} className="rounded-xl bg-slate-900 text-white font-bold h-10 shadow-lg shadow-slate-200 hover:bg-slate-800">
                        <Plus size={16} className="mr-2" /> สร้างบิลใหม่
                    </Button>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="รายรับเดือนนี้ (ชำระแล้ว)"
                    value={`฿${paidIncome.toLocaleString()}`}
                    icon={Wallet}
                    trend="up"
                    trendValue={`+${growthRate}%`}
                    color="bg-emerald-500"
                    delay={0.1}
                />
                <StatCard
                    title="ยอดรอชำระ/ค้างจ่าย"
                    value={`฿${pendingIncome.toLocaleString()}`}
                    icon={Clock}
                    trend="down"
                    trendValue={`${billing.filter(b => b.status !== "ชำระแล้ว").length} บิล`}
                    color="bg-amber-500"
                    delay={0.2}
                />
                <StatCard
                    title="ผู้เช่าปัจจุบัน"
                    value={`${tenants.length}/${totalRooms}`}
                    icon={Users}
                    trend="up"
                    trendValue={`${occupancyRate}% Rate`}
                    color="bg-blue-500"
                    delay={0.3}
                />
                <StatCard
                    title="รายการซ่อมบำรุง"
                    value={pendingMaintenance.toString()}
                    icon={Wrench}
                    trend={pendingMaintenance > 0 ? "down" : "up"}
                    trendValue={pendingMaintenance > 0 ? "รอดำเนินการ" : "เรียบร้อย"}
                    color="bg-rose-500"
                    delay={0.4}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Chart Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="xl:col-span-2 space-y-6"
                >
                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                            <div>
                                <CardTitle className="text-xl font-bold text-slate-800">สรุปรายรับ - รายจ่าย</CardTitle>
                                <CardDescription>สถิติย้อนหลัง 6 เดือนล่าสุด</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Badge variant="outline" className="rounded-lg px-3 py-1 bg-slate-50 text-slate-600 border-slate-200">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></div> รายรับ
                                </Badge>
                                <Badge variant="outline" className="rounded-lg px-3 py-1 bg-slate-50 text-slate-600 border-slate-200">
                                    <div className="w-2 h-2 rounded-full bg-slate-300 mr-2"></div> รายจ่าย
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={incomeHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                                        tickFormatter={(value) => `฿${value / 1000}k`}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                        cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="income"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorIncome)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="expense"
                                        stroke="#cbd5e1"
                                        strokeWidth={3}
                                        fill="none"
                                        strokeDasharray="5 5"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Pending Actions / Recent */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-none shadow-sm bg-white rounded-2xl">
                            <CardHeader className="p-6 pb-2">
                                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Zap size={18} className="text-amber-500 fill-amber-500" /> จดมิเตอร์ล่าสุด
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 pt-2">
                                <div className="space-y-4 mt-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">ความคืบหน้าเดือนนี้</span>
                                        <span className="text-slate-900 font-bold">{tenants.length > 0 ? Math.round((billing.length / tenants.length) * 100) : 0}%</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${tenants.length > 0 ? (billing.length / tenants.length) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        เหลืออีก {Math.max(0, tenants.length - billing.length)} ห้องที่ยังไม่ได้จดมิเตอร์หรือสร้างบิล
                                    </p>
                                    <Button onClick={() => navigate('/billing')} variant="outline" className="w-full rounded-xl font-bold text-slate-600">
                                        จัดการมิเตอร์
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-white rounded-2xl">
                            <CardHeader className="p-6 pb-2">
                                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Package size={18} className="text-indigo-500" /> พัสดุตกค้าง
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-50">
                                    {[
                                        { room: '102', from: 'Kerry Express', date: 'วันนี้' },
                                        { room: '305', from: 'Shopee', date: 'เมื่อวาน' },
                                    ].map((item, i) => (
                                        <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-indigo-50 rounded-lg flex flex-col items-center justify-center text-indigo-600 font-bold leading-none">
                                                    <span className="text-sm">{item.room}</span>
                                                    <span className="text-[8px] opacity-70 uppercase">ROOM</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{item.from}</p>
                                                    <p className="text-xs text-slate-400">{item.date}</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-slate-300" />
                                        </div>
                                    ))}
                                    <div className="p-3">
                                        <Button variant="ghost" className="w-full text-xs font-bold text-slate-500">ดูทั้งหมด</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>

                {/* Right Sidebar - Quick Menu & Status */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-6"
                >
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Zap size={18} className="text-amber-500" /> เมนูด่วน
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <QuickAction
                                icon={Users}
                                label="เพิ่มผู้เช่า"
                                onClick={() => navigate('/tenants')}
                                color="bg-indigo-500"
                            />
                            <QuickAction
                                icon={FileText}
                                label="ออกบิล"
                                onClick={() => navigate('/billing')}
                                color="bg-emerald-500"
                            />
                            <QuickAction
                                icon={Wrench}
                                label="แจ้งซ่อม"
                                onClick={() => navigate('/maintenance')}
                                color="bg-rose-500"
                            />
                            <QuickAction
                                icon={Home}
                                label="ผังห้องพัก"
                                onClick={() => navigate('/rooms')}
                                color="bg-blue-500"
                            />
                        </div>
                    </div>

                    <Card className="border-none shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10 scale-[2.5] pointer-events-none">
                            <TrendingUp size={80} fill="currentColor" />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-lg">สรุปยอดประจำเดือน</CardTitle>
                            <CardDescription className="text-slate-400">มิถุนายน 2567</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 relative z-10">
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm opacity-80">
                                    <span>รายรับจริง</span>
                                    <span>{paidIncome + pendingIncome > 0 ? Math.round((paidIncome / (paidIncome + pendingIncome)) * 100) : 0}%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_theme(colors.emerald.500)]"
                                        style={{ width: `${paidIncome + pendingIncome > 0 ? (paidIncome / (paidIncome + pendingIncome)) * 100 : 0}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between items-end mt-1">
                                    <span className="text-2xl font-bold">฿{paidIncome.toLocaleString()}</span>
                                    <span className="text-xs text-slate-400">ค้างชำระ: ฿{pendingIncome.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-300">ค่าสาธารณูปโภค</span>
                                    <span className="text-xs bg-white/10 px-2 py-1 rounded text-white">ยอดรวมยูนิต</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-400">ค่าไฟ ({totalElectricUnits.toLocaleString()} หน่วย)</p>
                                        <p className="font-bold text-lg">฿{totalElectricCost.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">ค่าน้ำ ({totalWaterUnits.toLocaleString()} หน่วย)</p>
                                        <p className="font-bold text-lg">฿{totalWaterCost.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl h-11">
                                ดูรายงานฉบับเต็ม
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
