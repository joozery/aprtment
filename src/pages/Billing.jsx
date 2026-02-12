import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Droplets,
    Zap,
    Receipt,
    QrCode,
    FileDown,
    Search,
    CheckCircle2,
    Share2,
    Printer,
    Building2,
    MoreHorizontal,
    Filter,
    Calendar,
    Wallet
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useApp } from '@/context/AppContext';

export default function Billing() {
    const { billing, tenants, calculateBill, payBill, meters, setMeters, buildings } = useApp();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('invoice');
    const [search, setSearch] = useState('');
    const [selectedBuilding, setSelectedBuilding] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Filter Logic for Billing
    const filteredBilling = billing.filter(b => {
        const matchesSearch = b.room.includes(search) || b.name.includes(search);
        const matchesBuilding = selectedBuilding === 'all' || b.buildingId === parseInt(selectedBuilding);
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'paid' && b.status === 'ชำระแล้ว') ||
            (statusFilter === 'pending' && b.status === 'รอชำระ') ||
            (statusFilter === 'overdue' && b.status === 'เกินกำหนด');
        return matchesSearch && matchesBuilding && matchesStatus;
    });

    // Filter Logic for Meters (Tenants)
    const filteredTenants = tenants.filter(t => {
        const matchesSearch = t.room.includes(search) || t.name.toLowerCase().includes(search.toLowerCase());
        const matchesBuilding = selectedBuilding === 'all' || t.buildingId === parseInt(selectedBuilding);
        return matchesSearch && matchesBuilding;
    });

    // Metrics Calculation
    const totalPending = billing.reduce((acc, curr) => acc + (curr.status !== 'ชำระแล้ว' ? curr.total : 0), 0);
    const totalPaid = billing.reduce((acc, curr) => acc + (curr.status === 'ชำระแล้ว' ? curr.total : 0), 0);
    const paidCount = billing.filter(b => b.status === 'ชำระแล้ว').length;
    const totalCount = billing.length;

    const handleCalculateAll = () => {
        tenants.forEach(t => {
            const currentWater = parseFloat(meters.water[t.room] || 0);
            const currentElectric = parseFloat(meters.electric[t.room] || 0);

            const lastWater = t.lastWaterMeter || 0;
            const lastElectric = t.lastElectricMeter || 0;

            const waterUsage = Math.max(0, currentWater - lastWater);
            const electricUsage = Math.max(0, currentElectric - lastElectric);

            if (currentWater > 0 || currentElectric > 0) {
                calculateBill(t.room, waterUsage, electricUsage);
            }
        });
        setActiveTab('invoice');
    };

    return (
        <div className="space-y-8 pb-10 min-h-screen bg-slate-50/50 p-6 md:p-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">การเงินและค่าที่พัก</h2>
                    <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
                        จัดการบิลรายเดือน และบันทึกมิเตอร์น้ำไฟ
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200 bg-white font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
                        <FileDown size={16} className="mr-2 text-slate-400" />
                        Export Excel
                    </Button>
                    <Button className="h-10 px-6 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] transition-all">
                        <Plus size={18} className="mr-2" />
                        สร้างบิลรอบใหม่
                    </Button>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm rounded-2xl bg-white relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Wallet size={100} />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="font-semibold text-slate-500">ยอดค้างชำระทั้งหมด</CardDescription>
                        <CardTitle className="text-3xl font-bold text-slate-900 flex items-baseline gap-2">
                            ฿{totalPending.toLocaleString()}
                            <span className="text-sm font-medium text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">Pending</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(totalPending / (totalPending + totalPaid)) * 100}%` }}></div>
                            </div>
                            <span>{((totalPending / (totalPending + totalPaid || 1)) * 100).toFixed(0)}%</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-2xl bg-white relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <CheckCircle2 size={100} />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="font-semibold text-slate-500">ยอดที่ชำระแล้ว</CardDescription>
                        <CardTitle className="text-3xl font-bold text-slate-900 flex items-baseline gap-2">
                            ฿{totalPaid.toLocaleString()}
                            <span className="text-sm font-medium text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">Paid</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                            <span className="text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 size={14} /> {paidCount} บิล
                            </span>
                            <span>จากทั้งหมด {totalCount} บิล</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-2xl bg-indigo-600 text-white relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform text-white">
                        <Calendar size={100} />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="font-semibold text-indigo-100">รอบบิลปัจจุบัน</CardDescription>
                        <CardTitle className="text-3xl font-bold flex items-baseline gap-2">
                            มิถุนายน 2567
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 text-white border-none font-semibold backdrop-blur-sm" onClick={handleCalculateAll}>
                            คำนวณและออกบิลอัตโนมัติ
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <TabsList className="bg-white p-1 h-12 rounded-xl border border-slate-200/60 shadow-sm w-full sm:w-auto">
                        <TabsTrigger value="invoice" className="px-6 h-10 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 font-semibold text-slate-500">
                            รายการใบแจ้งหนี้
                        </TabsTrigger>
                        <TabsTrigger value="meter" className="px-6 h-10 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 font-semibold text-slate-500">
                            บันทึกมิเตอร์
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                            <SelectTrigger className="w-[160px] h-10 bg-white border-slate-200 rounded-xl font-medium">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Building2 size={16} />
                                    <SelectValue placeholder="เลือกตึก" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทั้งหมด</SelectItem>
                                {buildings.map(b => (
                                    <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {activeTab === 'invoice' && (
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[140px] h-10 bg-white border-slate-200 rounded-xl font-medium">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Filter size={16} />
                                        <SelectValue placeholder="สถานะ" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">ทุกสถานะ</SelectItem>
                                    <SelectItem value="paid">ชำระแล้ว</SelectItem>
                                    <SelectItem value="pending">รอชำระ</SelectItem>
                                    <SelectItem value="overdue">เกินกำหนด</SelectItem>
                                </SelectContent>
                            </Select>
                        )}

                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="ค้นหาห้อง / ชื่อผู้เช่า..."
                                className="pl-10 h-10 bg-white border-slate-200 rounded-xl font-medium focus-visible:ring-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <TabsContent value="invoice" className="space-y-6">
                        {/* Batch Actions */}
                        {selectedBuilding !== 'all' && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100"
                            >
                                <div className="flex items-center gap-3 text-indigo-900 font-medium">
                                    <Building2 size={20} className="text-indigo-600" />
                                    <span>
                                        กำลังจัดการ: <span className="font-bold">{buildings.find(b => b.id.toString() === selectedBuilding)?.name}</span> ({filteredBilling.length} รายการ)
                                    </span>
                                </div>
                                <Button
                                    onClick={() => navigate(`/receipts/building/${selectedBuilding}`)}
                                    className="bg-white text-indigo-600 hover:bg-indigo-100 border border-indigo-200 shadow-sm font-semibold h-9"
                                >
                                    <Printer size={16} className="mr-2" /> พิมพ์บิลทั้งตึก
                                </Button>
                            </motion.div>
                        )}

                        <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow className="border-slate-100 hover:bg-transparent">
                                            <TableHead className="font-semibold text-slate-500 pl-6 h-12">ห้องพัก</TableHead>
                                            <TableHead className="font-semibold text-slate-500 h-12">ผู้เช่า</TableHead>
                                            <TableHead className="text-right font-semibold text-slate-500 h-12">ยอดรวม</TableHead>
                                            <TableHead className="text-center font-semibold text-slate-500 h-12">มิเตอร์น้ำ/ไฟ</TableHead>
                                            <TableHead className="text-center font-semibold text-slate-500 h-12">สถานะ</TableHead>
                                            <TableHead className="text-right font-semibold text-slate-500 pr-6 h-12">จัดการ</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredBilling.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-40 text-center text-slate-400">
                                                    ไม่พบรายการบิลที่ค้นหา
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredBilling.map((row) => (
                                            <TableRow key={row.room} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                                                <TableCell className="pl-6 font-bold text-slate-700">{row.room}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-slate-900">{row.name}</span>
                                                        <span className="text-xs text-slate-400">อัปเดต: {row.lastPay}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="font-bold text-slate-900">฿{row.total.toLocaleString()}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-medium">
                                                            <Droplets size={10} className="mr-1" /> {row.water}
                                                        </Badge>
                                                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-100 font-medium">
                                                            <Zap size={10} className="mr-1" /> {row.electric}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge className={`font-semibold capitalize shadow-none border px-2.5 py-0.5 rounded-full ${row.status === 'ชำระแล้ว' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' :
                                                        row.status === 'เกินกำหนด' ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100' :
                                                            'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'
                                                        }`}>
                                                        {row.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <div className="flex justify-end gap-2">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                                                    <MoreHorizontal size={16} />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-slate-100 p-1">
                                                                <DropdownMenuLabel className="text-xs text-slate-400 px-2 py-1.5 uppercase tracking-wider font-semibold">ตัวเลือก</DropdownMenuLabel>

                                                                {row.status !== 'ชำระแล้ว' && (
                                                                    <DropdownMenuItem onClick={() => payBill(row.room)} className="rounded-lg text-sm font-medium text-emerald-600 focus:bg-emerald-50 cursor-pointer">
                                                                        <CheckCircle2 size={14} className="mr-2" /> ยืนยันการชำระเงิน
                                                                    </DropdownMenuItem>
                                                                )}

                                                                <DropdownMenuItem onClick={() => navigate(`/receipt/${row.room}`)} className="rounded-lg text-sm font-medium text-slate-700 focus:bg-slate-50 cursor-pointer">
                                                                    <Printer size={14} className="mr-2 text-slate-400" /> พิมพ์ใบเสร็จ
                                                                </DropdownMenuItem>

                                                                <DropdownMenuItem className="rounded-lg text-sm font-medium text-slate-700 focus:bg-slate-50 cursor-pointer">
                                                                    <FileDown size={14} className="mr-2 text-slate-400" /> ส่งทางอีเมล
                                                                </DropdownMenuItem>

                                                                <DropdownMenuSeparator className="bg-slate-100 m-1" />

                                                                <DropdownMenuItem className="rounded-lg text-sm font-medium text-rose-600 focus:bg-rose-50 cursor-pointer">
                                                                    ยกเลิกบิล
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="meter">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {['water', 'electric'].map((type) => (
                                <Card key={type} className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                                    <CardHeader className={`px-6 py-4 border-b ${type === 'water' ? 'bg-blue-50/50 border-blue-100/50' : 'bg-amber-50/50 border-amber-100/50'} flex flex-row items-center justify-between`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-sm ${type === 'water' ? 'bg-blue-500 text-white shadow-blue-200' : 'bg-amber-500 text-white shadow-amber-200'}`}>
                                                {type === 'water' ? <Droplets size={20} /> : <Zap size={20} />}
                                            </div>
                                            <div>
                                                <CardTitle className={`text-lg font-bold ${type === 'water' ? 'text-blue-950' : 'text-amber-950'}`}>
                                                    {type === 'water' ? 'บันทึกมิเตอร์น้ำ' : 'บันทึกมิเตอร์ไฟ'}
                                                </CardTitle>
                                                <CardDescription className="text-xs font-medium opacity-80">ประจำเดือน มิถุนายน</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <div className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-slate-100 hover:bg-transparent bg-slate-50/30">
                                                    <TableHead className="w-24 pl-6 font-semibold text-slate-500">ห้อง</TableHead>
                                                    <TableHead className="font-semibold text-slate-500">เลขครั้งก่อน</TableHead>
                                                    <TableHead className="font-semibold text-slate-500">เลขครั้งนี้</TableHead>
                                                    <TableHead className="text-right pr-6 font-semibold text-slate-500">หน่วยที่ใช้</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredTenants.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="h-24 text-center text-slate-400">
                                                            ไม่พบห้องที่ค้นหา
                                                        </TableCell>
                                                    </TableRow>
                                                ) : filteredTenants.map((t) => (
                                                    <TableRow key={t.room} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                        <TableCell className="pl-6 font-bold text-slate-700">
                                                            <div>{t.room}</div>
                                                            <div className="text-xs text-slate-400 font-medium">{t.name}</div>
                                                        </TableCell>
                                                        <TableCell className="font-medium text-slate-500">
                                                            {type === 'water' ? (t.lastWaterMeter || 0) : (t.lastElectricMeter || 0)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="any"
                                                                value={meters[type][t.room] || ''}
                                                                onChange={(e) => setMeters(prev => ({ ...prev, [type]: { ...prev[type], [t.room]: e.target.value } }))}
                                                                className="h-9 w-32 bg-white border-slate-200 focus-visible:ring-indigo-500 font-medium"
                                                                placeholder="ระบุเลขมิเตอร์"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right pr-6 font-medium text-slate-900">
                                                            {meters[type][t.room] ?
                                                                Math.max(0, (meters[type][t.room] - (type === 'water' ? (t.lastWaterMeter || 0) : (t.lastElectricMeter || 0))))
                                                                : '-'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </AnimatePresence>
            </Tabs>
        </div>
    );
}
