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
    const { billing, tenants, calculateBill, payBill, meters, setMeters, buildings, settings, updateTenant, deleteBill, updateBillStatus } = useApp();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('invoice');
    const [search, setSearch] = useState('');
    const [selectedBuilding, setSelectedBuilding] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Dynamic Billing Logic
    const waterUnit = settings?.waterRate || 35;
    const electricUnit = settings?.electricRate || 11;
    const waterMin = settings?.waterMin ?? 200;
    const electricMin = settings?.electricMin ?? 200;
    const serviceFee = settings?.serviceFee ?? 200;

    const getMonthLabel = (isoDate) => {
        if (!isoDate) return '-';
        return new Date(isoDate).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
    };
    const uniqueMonths = [...new Set(billing.map(b => getMonthLabel(b.createdAt)))].filter(s => s !== '-').sort().reverse();
    const [monthFilter, setMonthFilter] = useState('current');

    const baseBilling = monthFilter === 'current' ? tenants.map(t => {
        // Find existing unpaid invoice for this room, or the latest paid if you prefer. 
        // For simplicity, find any invoice for this room. If none or all are paid, we can generate a draft
        const existingInvoice = billing.find(b => b.room === t.room && b.status !== 'ชำระแล้ว');
        if (existingInvoice) return existingInvoice;

        const prevElec = t.lastElectricMeter || 0;
        const currElec = meters.electric[t.room] !== undefined && meters.electric[t.room] !== ''
            ? parseFloat(meters.electric[t.room])
            : prevElec;
        const elecUnits = Math.max(0, currElec - prevElec);
        const elecCost = Math.max(elecUnits * electricUnit, electricMin);

        const prevWater = t.lastWaterMeter || 0;
        const currWater = meters.water[t.room] !== undefined && meters.water[t.room] !== ''
            ? parseFloat(meters.water[t.room])
            : prevWater;
        const waterUnits = Math.max(0, currWater - prevWater);
        const waterCost = Math.max(waterUnits * waterUnit, waterMin);

        return {
            isDraft: true,
            room: t.room,
            name: t.name,
            buildingId: t.buildingId,
            water: waterUnits,
            electric: elecUnits,
            total: (t.rent || 4500) + waterCost + elecCost + serviceFee,
            status: 'ยังไม่ออกบิล',
            lastPay: '-',
            currentWater: currWater,
            currentElectric: currElec
        };
    }) : (() => {
        const monthBills = billing.filter(b => getMonthLabel(b.createdAt) === monthFilter);
        // Deduplicate: keep only the latest bill per room
        const latestByRoom = {};
        monthBills.forEach(b => {
            if (!latestByRoom[b.room] || new Date(b.createdAt) > new Date(latestByRoom[b.room].createdAt)) {
                latestByRoom[b.room] = b;
            }
        });
        return Object.values(latestByRoom);
    })();

    const filteredBilling = baseBilling.filter(b => {
        const matchesSearch = b.room.includes(search) || b.name.includes(search);

        // Fallback to tenant's buildingId if the invoice is old and missing it
        const billBuildingId = b.buildingId || tenants.find(t => t.room === b.room)?.buildingId;
        const matchesBuilding = selectedBuilding === 'all' || String(billBuildingId) === selectedBuilding;
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'paid' && b.status === 'ชำระแล้ว') ||
            (statusFilter === 'pending' && (b.status === 'รอการชำระ' || b.status === 'รอชำระ')) ||
            (statusFilter === 'overdue' && b.status === 'เกินกำหนด') ||
            (statusFilter === 'draft' && b.status === 'ยังไม่ออกบิล');
        return matchesSearch && matchesBuilding && matchesStatus;
    }).sort((a, b) => String(a.room).localeCompare(String(b.room), undefined, { numeric: true }));

    // Filter Logic for Meters (Tenants)
    const filteredTenants = tenants.filter(t => {
        const matchesSearch = t.room.includes(search) || t.name.toLowerCase().includes(search.toLowerCase());
        const matchesBuilding = selectedBuilding === 'all' || String(t.buildingId) === selectedBuilding;
        return matchesSearch && matchesBuilding;
    }).sort((a, b) => String(a.room).localeCompare(String(b.room), undefined, { numeric: true }));

    // Metrics Calculation uses baseBilling now to reflect full pipeline
    const totalPending = baseBilling.reduce((acc, curr) => acc + (curr.status !== 'ชำระแล้ว' && curr.status !== 'ยังไม่ออกบิล' ? curr.total : 0), 0);
    const totalPaid = baseBilling.reduce((acc, curr) => acc + (curr.status === 'ชำระแล้ว' ? curr.total : 0), 0);
    const paidCount = baseBilling.filter(b => b.status === 'ชำระแล้ว').length;
    const totalCount = baseBilling.filter(b => b.status !== 'ยังไม่ออกบิล').length || 1;

    const handleCalculateAll = () => {
        tenants.forEach(t => {
            const currentWater = parseFloat(meters.water[t.room] || 0);
            const currentElectric = parseFloat(meters.electric[t.room] || 0);

            const lastWater = t.lastWaterMeter || 0;
            const lastElectric = t.lastElectricMeter || 0;

            const waterUsage = Math.max(0, currentWater - lastWater);
            const electricUsage = Math.max(0, currentElectric - lastElectric);

            if (currentWater > 0 || currentElectric > 0) {
                calculateBill(t.room, waterUsage, electricUsage, currentWater, currentElectric);
            }
        });
        setActiveTab('invoice');
    };

    return (
        <div className="space-y-8 pb-10 min-h-screen bg-slate-50/50 p-6 md:p-10 print:p-0 print:bg-white">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 no-print">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">การเงินและค่าที่พัก</h2>
                    <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
                        จัดการบิลรายเดือน และบันทึกมิเตอร์น้ำไฟ
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => {
                            const params = monthFilter !== 'current' ? `?all=true&month=${encodeURIComponent(monthFilter)}` : '?all=true';
                            navigate(`/receipts/all${params}`);
                        }}
                        className="h-10 px-4 rounded-xl border-slate-200 bg-white font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                        <Printer size={16} className="mr-2 text-slate-400" />
                        พิมพ์บิลทั้งหมด
                    </Button>
                </div>

            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
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
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 no-print">
                    <TabsList className="bg-white p-1 h-12 rounded-xl border border-slate-200/60 shadow-sm w-full sm:w-auto">
                        <TabsTrigger value="invoice" className="px-6 h-10 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 font-semibold text-slate-500">
                            รายการใบแจ้งหนี้
                        </TabsTrigger>
                        <TabsTrigger value="meter" className="px-6 h-10 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 font-semibold text-slate-500">
                            บันทึกมิเตอร์
                        </TabsTrigger>
                        <TabsTrigger value="summary" className="px-6 h-10 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 font-semibold text-slate-500">
                            สรุปค่าน้ำ-ไฟ
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
                                    <SelectItem value="pending">รอการชำระ</SelectItem>
                                    <SelectItem value="overdue">เกินกำหนด</SelectItem>
                                    <SelectItem value="draft">ยังไม่ออกบิล</SelectItem>
                                </SelectContent>
                            </Select>
                        )}

                        {/* Month filter - visible on all tabs */}
                        <Select value={monthFilter} onValueChange={setMonthFilter}>
                            <SelectTrigger className="w-[180px] h-10 bg-white border-slate-200 rounded-xl font-medium">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Calendar size={16} />
                                    <SelectValue placeholder="รอบบิล" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="current">รอบปัจจุบัน (บันทึกใหม่)</SelectItem>
                                {uniqueMonths.map(m => (
                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                                                            row.status === 'ยังไม่ออกบิล' ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200' :
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

                                                                {row.status === 'ยังไม่ออกบิล' && (
                                                                    <DropdownMenuItem onClick={() => calculateBill(row.room, row.water, row.electric, row.currentWater, row.currentElectric)} className="rounded-lg text-sm font-medium text-indigo-600 focus:bg-indigo-50 cursor-pointer">
                                                                        <Plus size={14} className="mr-2" /> บันทึกออกบิล
                                                                    </DropdownMenuItem>
                                                                )}

                                                                {(row.status !== 'ยังไม่ออกบิล') && (
                                                                    <>
                                                                        {row.status !== 'ชำระแล้ว' && (
                                                                            <DropdownMenuItem onClick={() => payBill(row.room)} className="rounded-lg text-sm font-medium text-emerald-600 focus:bg-emerald-50 cursor-pointer">
                                                                                <CheckCircle2 size={14} className="mr-2" /> ยืนยันการชำระเงิน
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                        {row.status !== 'รอการชำระ' && (
                                                                            <DropdownMenuItem onClick={() => updateBillStatus(row.id || row._id, 'รอการชำระ')} className="rounded-lg text-sm font-medium text-amber-600 focus:bg-amber-50 cursor-pointer">
                                                                                <Wallet size={14} className="mr-2" /> เปลี่ยนเป็นรอการชำระ
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                        {row.status !== 'เกินกำหนด' && (
                                                                            <DropdownMenuItem onClick={() => updateBillStatus(row.id || row._id, 'เกินกำหนด')} className="rounded-lg text-sm font-medium text-rose-600 focus:bg-rose-50 cursor-pointer">
                                                                                <Calendar size={14} className="mr-2" /> เปลี่ยนเป็นเกินกำหนด
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                    </>
                                                                )}

                                                                <DropdownMenuItem onClick={() => navigate(`/receipt/${row.room}`)} className="rounded-lg text-sm font-medium text-slate-700 focus:bg-slate-50 cursor-pointer">
                                                                    <Printer size={14} className="mr-2 text-slate-400" /> พิมพ์ใบเสร็จ
                                                                </DropdownMenuItem>

                                                                <DropdownMenuItem className="rounded-lg text-sm font-medium text-slate-700 focus:bg-slate-50 cursor-pointer">
                                                                    <FileDown size={14} className="mr-2 text-slate-400" /> ส่งทางอีเมล
                                                                </DropdownMenuItem>

                                                                {row.status !== 'ยังไม่ออกบิล' && (
                                                                    <>
                                                                        <DropdownMenuSeparator className="bg-slate-100 m-1" />
                                                                        <DropdownMenuItem onClick={() => deleteBill(row.id || row._id)} className="rounded-lg text-sm font-medium text-rose-600 focus:bg-rose-50 cursor-pointer">
                                                                            ลบบิลนี้
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
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
                                                {(monthFilter === 'current' ? filteredTenants : filteredBilling).length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="h-24 text-center text-slate-400">
                                                            ไม่พบข้อมูลตามที่ค้นหาในรอบบิลนี้
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (monthFilter === 'current' ? filteredTenants : filteredBilling).map((item) => {
                                                    const isCurrent = monthFilter === 'current';
                                                    let prevVal = 0, currVal = '', usageVal = '-';

                                                    if (isCurrent) {
                                                        prevVal = type === 'water' ? (item.lastWaterMeter || 0) : (item.lastElectricMeter || 0);
                                                        currVal = meters[type][item.room] || '';
                                                        if (currVal) {
                                                            let u = parseFloat(currVal) - parseFloat(prevVal);
                                                            usageVal = Math.max(0, u);
                                                        }
                                                    } else {
                                                        const billUsage = type === 'water' ? (item.water || 0) : (item.electric || 0);
                                                        const billCurr = type === 'water' ? item.currentWater : item.currentElectric;
                                                        if (billCurr !== undefined) {
                                                            currVal = billCurr;
                                                            prevVal = parseFloat(billCurr) - billUsage;
                                                        } else {
                                                            currVal = '-';
                                                            prevVal = '-';
                                                        }
                                                        usageVal = billUsage;
                                                    }

                                                    return (
                                                        <TableRow key={item.room} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                            <TableCell className="pl-6 font-bold text-slate-700">
                                                                <div>{item.room}</div>
                                                                <div className="text-xs text-slate-400 font-medium">{item.name}</div>
                                                            </TableCell>
                                                            <TableCell className="font-medium text-slate-500">
                                                                {isCurrent ? (
                                                                    <Input
                                                                        type="number"
                                                                        min="0"
                                                                        step="any"
                                                                        defaultValue={prevVal}
                                                                        onBlur={(e) => {
                                                                            const val = parseFloat(e.target.value);
                                                                            if (!isNaN(val) && val !== prevVal) {
                                                                                updateTenant(item.id, {
                                                                                    [type === 'water' ? 'lastWaterMeter' : 'lastElectricMeter']: val
                                                                                });
                                                                            }
                                                                        }}
                                                                        className="h-9 w-28 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-medium"
                                                                        placeholder="เลขครั้งก่อน"
                                                                    />
                                                                ) : (
                                                                    <div className="h-9 w-28 flex items-center px-3 bg-slate-50 rounded-md border border-slate-200 opacity-70">
                                                                        {prevVal}
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {isCurrent ? (
                                                                    <Input
                                                                        type="number"
                                                                        min="0"
                                                                        step="any"
                                                                        value={currVal}
                                                                        onChange={(e) => setMeters(prev => ({ ...prev, [type]: { ...prev[type], [item.room]: e.target.value } }))}
                                                                        className="h-9 w-32 bg-white border-slate-200 focus-visible:ring-indigo-500 font-medium"
                                                                        placeholder="ระบุเลขมิเตอร์"
                                                                    />
                                                                ) : (
                                                                    <div className="h-9 w-32 flex items-center px-3 bg-white rounded-md border border-slate-200 opacity-70">
                                                                        {currVal}
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right pr-6 font-medium text-slate-900">
                                                                {usageVal}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="summary">
                        <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden p-8 print:p-0 print:shadow-none printable-area">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-2">สรุปค่าน้ำ,ค่าไฟ</h2>
                                    <p className="text-sm font-medium text-slate-600">วันเวลาที่พิมพ์ : {new Date().toLocaleString('th-TH')}</p>
                                    <p className="text-sm font-medium text-slate-600">ข้อมูลรอบบิลปัจจุบัน</p>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">ตวงเงิน แมนชั่น</h2>
                            </div>

                            <div className="overflow-x-auto">
                                <Table className="w-full text-sm">
                                    <TableHeader>
                                        <TableRow className="border-b-2 border-slate-200 hover:bg-transparent">
                                            <TableHead className="font-bold text-slate-800 py-3">หมายเลข</TableHead>
                                            <TableHead className="font-bold text-slate-800 py-3 min-w-[200px]">ชื่อ-สกุล</TableHead>
                                            <TableHead className="font-bold text-slate-800 text-center py-3">มิเตอร์ไฟ</TableHead>
                                            <TableHead className="font-bold text-slate-800 text-right py-3">จำนวนไฟ</TableHead>
                                            <TableHead className="font-bold text-slate-800 text-right py-3">ค่าไฟ</TableHead>
                                            <TableHead className="font-bold text-slate-800 text-center py-3">มิเตอร์น้ำ</TableHead>
                                            <TableHead className="font-bold text-slate-800 text-right py-3">จำนวนน้ำ</TableHead>
                                            <TableHead className="font-bold text-slate-800 text-right py-3">ค่าน้ำ</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(monthFilter === 'current' ? filteredTenants : filteredBilling).length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="h-40 text-center text-slate-400">
                                                    ไม่พบข้อมูลการค้นหา
                                                </TableCell>
                                            </TableRow>
                                        ) : (monthFilter === 'current' ? filteredTenants : filteredBilling).map((item) => {
                                            const isCurrent = monthFilter === 'current';

                                            let prevElec, currElec, elecUnits, elecCost;
                                            let prevWater, currWater, waterUnits, waterCost;

                                            if (isCurrent) {
                                                prevElec = item.lastElectricMeter || 0;
                                                currElec = meters.electric[item.room] !== undefined && meters.electric[item.room] !== ''
                                                    ? parseFloat(meters.electric[item.room])
                                                    : prevElec;
                                                elecUnits = Math.max(0, currElec - prevElec);
                                                elecCost = Math.max(elecUnits * (settings?.electricRate || 11), settings?.electricMin ?? 200);

                                                prevWater = item.lastWaterMeter || 0;
                                                currWater = meters.water[item.room] !== undefined && meters.water[item.room] !== ''
                                                    ? parseFloat(meters.water[item.room])
                                                    : prevWater;
                                                waterUnits = Math.max(0, currWater - prevWater);
                                                waterCost = Math.max(waterUnits * (settings?.waterRate || 35), settings?.waterMin ?? 200);
                                            } else {
                                                elecUnits = item.electric || 0;
                                                elecCost = Math.max(elecUnits * (settings?.electricRate || 11), settings?.electricMin ?? 200);
                                                if (item.currentElectric !== undefined) {
                                                    currElec = item.currentElectric;
                                                    prevElec = currElec - elecUnits;
                                                } else {
                                                    currElec = '-';
                                                    prevElec = '-';
                                                }

                                                waterUnits = item.water || 0;
                                                waterCost = Math.max(waterUnits * (settings?.waterRate || 35), settings?.waterMin ?? 200);
                                                if (item.currentWater !== undefined) {
                                                    currWater = item.currentWater;
                                                    prevWater = currWater - waterUnits;
                                                } else {
                                                    currWater = '-';
                                                    prevWater = '-';
                                                }
                                            }

                                            return (
                                                <TableRow key={item.room} className="border-b border-slate-100 hover:bg-slate-50/50">
                                                    <TableCell className="font-bold text-slate-700">{item.room}</TableCell>
                                                    <TableCell className="font-medium text-slate-600">{item.name}</TableCell>

                                                    <TableCell className="text-center font-medium text-slate-500 whitespace-nowrap">
                                                        {prevElec === '-' ? '-' : String(prevElec).padStart(4, '0')} - {currElec === '-' ? '-' : String(currElec).padStart(4, '0')}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium text-slate-700">
                                                        {elecUnits}
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-slate-800">
                                                        {elecCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </TableCell>

                                                    <TableCell className="text-center font-medium text-slate-500 whitespace-nowrap">
                                                        {prevWater === '-' ? '-' : String(prevWater).padStart(4, '0')} - {currWater === '-' ? '-' : String(currWater).padStart(4, '0')}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium text-slate-700">
                                                        {waterUnits}
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-slate-800">
                                                        {waterCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="mt-8 flex justify-end print:hidden">
                                <Button
                                    onClick={() => navigate(`/reports/meter-summary?month=${encodeURIComponent(monthFilter)}&building=${selectedBuilding}`)}
                                    className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-6 h-10 shadow-lg shadow-slate-200"
                                >
                                    <Printer size={18} className="mr-2" />
                                    พิมพ์เอกสารนี้
                                </Button>
                            </div>
                        </Card>
                    </TabsContent>
                </AnimatePresence>
            </Tabs>
        </div>
    );
}
