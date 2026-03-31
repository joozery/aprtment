import { motion } from 'framer-motion';
import {
    TrendingUp,
    Download,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    Wallet,
    Users,
    Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import { useApp } from '@/context/AppContext';

const expenseBreakdown = [
    { name: 'ค่าน้ำ-ไฟ', value: 35000, color: '#4f46e5' },
    { name: 'เงินเดือน', value: 45000, color: '#f59e0b' },
    { name: 'ซ่อมแซม', value: 15000, color: '#ec4899' },
    { name: 'ภาษี/อื่นๆ', value: 10000, color: '#10b981' },
];

export default function Reports() {
    const { tenants, billing, incomeHistory } = useApp();

    // Mock data processing
    const chartData = incomeHistory.map(h => ({
        ...h,
        month: h.name,
        income: h.income,
        expense: Math.floor(h.income * 0.45), // Mock expense at 45%
        profit: Math.floor(h.income * 0.55),
    }));

    const currentIncome = billing
        .filter(b => b.status === 'ชำระแล้ว')
        .reduce((acc, curr) => acc + curr.total, 0);

    const totalPossibleRooms = 50;
    const occupancyRate = (tenants.length / totalPossibleRooms * 100).toFixed(1);

    // Mock calculations for display
    const lastMonthIncome = currentIncome * 0.9; // Mock
    const incomeGrowth = ((currentIncome - lastMonthIncome) / lastMonthIncome * 100).toFixed(1);

    const currentExpense = Math.floor(currentIncome * 0.4);
    const profit = currentIncome - currentExpense;

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">รายงานสรุปผลประกอบการ</h2>
                    <p className="text-slate-500 mt-1 font-medium text-sm">ภาพรวมข้อมูลทางการเงินและสถิติหอพัก ประจำเดือนมิถุนายน 2567</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="h-9 px-4 rounded-xl border-slate-200 bg-white font-semibold text-slate-600 hover:bg-slate-50 text-sm">
                        <Calendar size={14} className="mr-2" />
                        เลือกเดือน
                    </Button>
                    <Button className="h-9 px-4 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 shadow-lg shadow-slate-200 text-sm">
                        <Download size={14} className="mr-2" />
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* KPI Stats Row - Clean & Professional */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-xl">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-slate-500">รายรับรวม</p>
                                <h3 className="text-xl font-bold text-slate-800 mt-1">฿{currentIncome.toLocaleString()}</h3>
                            </div>
                            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                                <DollarSign size={16} />
                            </div>
                        </div>
                        <div className="mt-2 flex items-center text-xs">
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                                <TrendingUp size={12} /> +{incomeGrowth}%
                            </span>
                            <span className="text-slate-400 ml-2">จากเดือนที่แล้ว</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-xl">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-slate-500">รายจ่ายรวม</p>
                                <h3 className="text-xl font-bold text-slate-800 mt-1">฿{currentExpense.toLocaleString()}</h3>
                            </div>
                            <div className="p-1.5 bg-rose-50 rounded-lg text-rose-600">
                                <Wallet size={16} />
                            </div>
                        </div>
                        <div className="mt-2 flex items-center text-xs">
                            <span className="text-rose-500 font-bold flex items-center gap-1">
                                <ArrowUpRight size={12} /> +5.2%
                            </span>
                            <span className="text-slate-400 ml-2">จากเดือนที่แล้ว</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-xl">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-slate-500">กำไรสุทธิ</p>
                                <h3 className="text-xl font-bold text-slate-800 mt-1">฿{profit.toLocaleString()}</h3>
                            </div>
                            <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                                <Activity size={16} />
                            </div>
                        </div>
                        <div className="mt-2 flex items-center text-xs">
                            <span className="text-indigo-600 font-bold flex items-center gap-1">
                                <TrendingUp size={12} /> +8.4%
                            </span>
                            <span className="text-slate-400 ml-2">กำไรเติบโตต่อเนื่อง</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-xl">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-slate-500">อัตราการเข้าพัก</p>
                                <h3 className="text-xl font-bold text-slate-800 mt-1">{occupancyRate}%</h3>
                            </div>
                            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                                <Users size={16} />
                            </div>
                        </div>
                        <div className="mt-2 flex items-center text-xs">
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${occupancyRate}%` }}></div>
                            </div>
                            <span className="ml-2 font-bold text-slate-600 whitespace-nowrap">{tenants.length}/{totalPossibleRooms}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Trend Chart */}
                <Card className="lg:col-span-2 border-none shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-800">แนวโน้มรายรับ - รายจ่าย</CardTitle>
                            <CardDescription className="text-slate-500">เปรียบเทียบยอดรายรับและรายจ่ายย้อนหลัง 6 เดือน</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant="outline" className="font-normal rounded-lg bg-slate-50 border-slate-100">6 เดือน</Badge>
                            <Badge variant="outline" className="font-normal rounded-lg border-transparent text-slate-400 hover:bg-slate-50 cursor-pointer">ปีนี้</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="px-2 pb-6">
                        <div className="h-[350px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        tickFormatter={(v) => `${v / 1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        iconType="circle"
                                    />
                                    <Area type="monotone" dataKey="income" name="รายรับ" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                                    <Area type="monotone" dataKey="expense" name="รายจ่าย" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Expense Breakdown */}
                <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base font-bold text-slate-800">สัดส่วนค่าใช้จ่าย</CardTitle>
                        <CardDescription className="text-xs">วิเคราะห์โครงสร้างต้นทุนเดือนล่าสุด</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <PieChart>
                                    <Pie
                                        data={expenseBreakdown}
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                        startAngle={90}
                                        endAngle={-270}
                                    >
                                        {expenseBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 space-y-2">
                            {expenseBreakdown.map((item) => (
                                <div key={item.name} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-slate-600 font-medium">{item.name}</span>
                                    </div>
                                    <span className="font-bold text-slate-700">฿{item.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Financial Activity Table (New Addition for 'Fresh' look) */}
            <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base font-bold text-slate-800">ธุรกรรมล่าสุด</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50/50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-4 py-3 first:pl-6">รายการ</th>
                                    <th className="px-4 py-3">หมวดหมู่</th>
                                    <th className="px-4 py-3">วันที่</th>
                                    <th className="px-4 py-3">สถานะ</th>
                                    <th className="px-4 py-3 text-right last:pr-6">จำนวนเงิน</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {[
                                    { desc: 'รับชำระค่าเช่า ห้อง 101', cat: 'Income', date: '06 มิ.ย. 67', status: 'Success', amount: 4500 },
                                    { desc: 'รับชำระค่าเช่า ห้อง 204', cat: 'Income', date: '06 มิ.ย. 67', status: 'Success', amount: 4800 },
                                    { desc: 'จ่ายค่าซ่อมบำรุงปั๊มน้ำ', cat: 'Expense', date: '05 มิ.ย. 67', status: 'Pending', amount: -2500 },
                                    { desc: 'รับชำระค่าเช่า ห้อง 305', cat: 'Income', date: '05 มิ.ย. 67', status: 'Success', amount: 5000 },
                                    { desc: 'จ่ายค่าบริการอินเทอร์เน็ต', cat: 'Expense', date: '04 มิ.ย. 67', status: 'Success', amount: -1200 },
                                ].map((item, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-700 first:pl-6">{item.desc}</td>
                                        <td className="px-4 py-3 text-slate-500">{item.cat}</td>
                                        <td className="px-4 py-3 text-slate-500">{item.date}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant="outline" className={`border-none text-[10px] px-2 py-0.5 ${item.status === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                {item.status}
                                            </Badge>
                                        </td>
                                        <td className={`px-4 py-3 text-right font-bold last:pr-6 ${item.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
