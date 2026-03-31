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
    Wallet,
    Save
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
    const { billing, tenants, calculateBill, payBill, meters, setMeters, buildings, settings, updateTenant, deleteBill, updateBillStatus, fetchData } = useApp();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('invoice');
    const [search, setSearch] = useState('');
    const [selectedBuilding, setSelectedBuilding] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [importData, setImportData] = useState('');

    // Dynamic Billing Logic
    const waterRate = settings?.waterRate || 35;
    const electricRate = settings?.electricRate || 11;
    const waterMin = settings?.waterMin ?? 200;
    const electricMin = settings?.electricMin ?? 200;
    const serviceFee = settings?.serviceFee ?? 200;

    const getMonthLabel = (isoDate) => {
        if (!isoDate) return '-';
        return new Date(isoDate).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
    };
    const uniqueMonths = [...new Set(billing.map(b => getMonthLabel(b.createdAt)))].filter(s => s !== '-').sort().reverse();
    const [monthFilter, setMonthFilter] = useState('current');

    const baseBilling = monthFilter === 'current' ? (() => {
        const seenRooms = new Set();
        const deduplicatedTenants = tenants.filter(t => {
            if (seenRooms.has(t.room)) return false;
            seenRooms.add(t.room);
            return true;
        });

        return deduplicatedTenants.map(t => {
            const existingInvoice = billing.find(b => b.room === t.room && b.status !== 'ชำระแล้ว');
            if (existingInvoice) return existingInvoice;

            const prevElec = t.lastElectricMeter || 0;
            const currElec = meters.electric[t.room] !== undefined && meters.electric[t.room] !== ''
                ? parseFloat(meters.electric[t.room])
                : prevElec;
            const elecUnits = Math.max(0, currElec - prevElec);
            const elecCost = Math.max(elecUnits * electricRate, electricMin);

            const prevWater = t.lastWaterMeter || 0;
            const currWater = meters.water[t.room] !== undefined && meters.water[t.room] !== ''
                ? parseFloat(meters.water[t.room])
                : prevWater;
            const waterUnits = Math.max(0, currWater - prevWater);
            const waterCost = Math.max(waterUnits * waterRate, waterMin);

            return {
                isDraft: true,
                id: `draft-${t.room}`,
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
        });
    })() : (() => {
        const monthBills = billing.filter(b => getMonthLabel(b.createdAt) === monthFilter);
        const latestByRoom = {};
        monthBills.forEach(b => {
            if (!latestByRoom[b.room] || new Date(b.createdAt) > new Date(latestByRoom[b.room].createdAt)) {
                latestByRoom[b.room] = b;
            }
        });
        return Object.values(latestByRoom);
    })();

    const filteredBilling = baseBilling.filter(b => {
        const matchesSearch = b.room.includes(search) || b.name.toLowerCase().includes(search.toLowerCase());
        const billBuildingId = b.buildingId || tenants.find(t => t.room === b.room)?.buildingId;
        const matchesBuilding = selectedBuilding === 'all' || String(billBuildingId) === selectedBuilding;
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'paid' && b.status === 'ชำระแล้ว') ||
            (statusFilter === 'pending' && (b.status === 'รอการชำระ' || b.status === 'รอชำระ')) ||
            (statusFilter === 'overdue' && b.status === 'เกินกำหนด') ||
            (statusFilter === 'draft' && b.status === 'ยังไม่ออกบิล');
        return matchesSearch && matchesBuilding && matchesStatus;
    }).sort((a, b) => String(a.room).localeCompare(String(b.room), undefined, { numeric: true }));

    const filteredTenants = (() => {
        const seenRooms = new Set();
        return tenants.filter(t => {
            const matchesSearch = t.room.includes(search) || t.name.toLowerCase().includes(search.toLowerCase());
            const matchesBuilding = selectedBuilding === 'all' || String(t.buildingId) === selectedBuilding;
            if (matchesSearch && matchesBuilding) {
                if (seenRooms.has(t.room)) return false;
                seenRooms.add(t.room);
                return true;
            }
            return false;
        }).sort((a, b) => String(a.room).localeCompare(String(b.room), undefined, { numeric: true }));
    })();

    const totalPending = baseBilling.reduce((acc, curr) => acc + (curr.status !== 'ชำระแล้ว' && curr.status !== 'ยังไม่ออกบิล' ? curr.total : 0), 0);
    const totalPaid = baseBilling.reduce((acc, curr) => acc + (curr.status === 'ชำระแล้ว' ? curr.total : 0), 0);
    const paidCount = baseBilling.filter(b => b.status === 'ชำระแล้ว').length;
    const totalCount = baseBilling.filter(b => b.status !== 'ยังไม่ออกบิล').length || 1;

    const handleCalculateAll = async () => {
        const drafts = filteredBilling.filter(b => b.isDraft);
        if (drafts.length === 0) {
            alert('ไม่มีบิลค้างให้ออก หรือระบุเลขมิเตอร์ก่อน');
            return;
        }

        try {
            for (const item of drafts) {
                if (item.currentWater > 0 || item.currentElectric > 0) {
                    await calculateBill(item.room, undefined, undefined, item.currentWater, item.currentElectric);
                }
            }
            alert(`ออกบิลเรียบร้อย ${drafts.length} รายการ`);
            await fetchData();
            setActiveTab('invoice');
        } catch (error) {
            console.error(error);
            alert('เกิดข้อผิดพลาดในการออกบิลหมู่');
        }
    };

    const handleImportMeters = () => {
        if (!importData.trim()) return;
        const lines = importData.trim().split('\n');
        const newMeters = { water: { ...meters.water }, electric: { ...meters.electric } };
        let count = 0;
        lines.forEach(line => {
            const parts = line.split('\t');
            if (parts.length >= 2) {
                const room = parts[0].trim();
                const elec = parts[1].trim();
                const water = parts[2] ? parts[2].trim() : '';
                if (room) {
                    if (elec) newMeters.electric[room] = elec;
                    if (water) newMeters.water[room] = water;
                    count++;
                }
            }
        });
        setMeters(newMeters);
        setIsImportOpen(false);
        setImportData('');
        alert(`นำเข้าข้อมูลมิเตอร์เรียบร้อย ${count} ห้อง`);
    };

    const handleMeterChange = (type, room, value) => {
        setMeters(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [room]: value
            }
        }));
    };

    return (
        <div className="space-y-8 pb-10 min-h-screen bg-slate-50/50 p-6 md:p-10 print:p-0 print:bg-white">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
                <Card className="border-none shadow-sm rounded-2xl bg-white relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Wallet size={100} /></div>
                    <CardHeader className="pb-2">
                        <CardDescription className="font-semibold text-slate-500">ยอดค้างชำระทั้งหมด</CardDescription>
                        <CardTitle className="text-3xl font-bold text-slate-900 flex items-baseline gap-2">
                            ฿{(totalPending || 0).toLocaleString()}
                            <span className="text-sm font-medium text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">Pending</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(totalPending / (totalPending + totalPaid || 1)) * 100}%` }}></div>
                            </div>
                            <span>{((totalPending / (totalPending + totalPaid || 1)) * 100).toFixed(0)}%</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-2xl bg-white relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><CheckCircle2 size={100} /></div>
                    <CardHeader className="pb-2">
                        <CardDescription className="font-semibold text-slate-500">ยอดที่ชำระแล้ว</CardDescription>
                        <CardTitle className="text-3xl font-bold text-slate-900 flex items-baseline gap-2">
                            ฿{(totalPaid || 0).toLocaleString()}
                            <span className="text-sm font-medium text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">Paid</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                            <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={14} /> {paidCount} บิล</span>
                            <span>จากทั้งหมด {totalCount} บิล</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-2xl bg-indigo-600 text-white relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform text-white"><Calendar size={100} /></div>
                    <CardHeader className="pb-2">
                        <CardDescription className="font-semibold text-indigo-100">รอบบิลปัจจุบัน</CardDescription>
                        <CardTitle className="text-3xl font-bold flex items-baseline gap-2">
                            {(new Date()).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 text-white border-none font-semibold backdrop-blur-sm" onClick={handleCalculateAll}>
                            คำนวณและออกบิลอัตโนมัติ
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 no-print">
                    <TabsList className="bg-white p-1 h-12 rounded-xl border border-slate-200/60 shadow-sm w-full sm:w-auto">
                        <TabsTrigger value="invoice" className="px-6 h-10 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 font-semibold text-slate-500">รายการใบแจ้งหนี้</TabsTrigger>
                        <TabsTrigger value="meter" className="px-6 h-10 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 font-semibold text-slate-500">บันทึกมิเตอร์</TabsTrigger>
                        <TabsTrigger value="summary" className="px-6 h-10 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 font-semibold text-slate-500">สรุปค่าน้ำ-ไฟ</TabsTrigger>
                    </TabsList>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                            <SelectTrigger className="w-[140px] h-10 bg-white border-slate-200 rounded-xl font-medium">
                                <div className="flex items-center gap-2 text-slate-600"><Building2 size={16} /><SelectValue placeholder="เลือกตึก" /></div>
                            </SelectTrigger>
                            <SelectContent><SelectItem value="all">ทั้งหมด</SelectItem>{buildings.map(b => (<SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>))}</SelectContent>
                        </Select>

                        <Select value={monthFilter} onValueChange={setMonthFilter}>
                            <SelectTrigger className="w-[180px] h-10 bg-white border-slate-200 rounded-xl font-medium">
                                <div className="flex items-center gap-2 text-slate-600"><Calendar size={16} /><SelectValue placeholder="รอบบิล" /></div>
                            </SelectTrigger>
                            <SelectContent><SelectItem value="current">รอบปัจจุบัน (Draft)</SelectItem>{uniqueMonths.map(m => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent>
                        </Select>

                        <div className="relative flex-1 sm:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาห้อง..." className="pl-10 h-10 bg-white border-slate-200 rounded-xl font-medium" /></div>
                    </div>
                </div>

                <div className="space-y-6">
                    <AnimatePresence mode="wait">
                        {activeTab === 'invoice' && (
                            <TabsContent key="invoice-tab" value="invoice" forceMount>
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                                    {selectedBuilding !== 'all' && (
                                        <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100 mb-6">
                                            <div className="flex items-center gap-3 text-indigo-900 font-medium">
                                                <Building2 size={20} className="text-indigo-600" />
                                                <span>กำลังจัดการ: <span className="font-bold">{buildings.find(b => b.id.toString() === selectedBuilding)?.name}</span> ({filteredBilling.length} รายการ)</span>
                                            </div>
                                            <Button onClick={() => navigate(`/receipts/building/${selectedBuilding}`)} className="bg-white text-indigo-600 hover:bg-indigo-100 border border-indigo-200 shadow-sm font-semibold h-9"><Printer size={16} className="mr-2" /> พิมพ์บิลทั้งตึก</Button>
                                        </div>
                                    )}

                                    <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-slate-50/50">
                                                <TableRow className="border-slate-100">
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
                                                    <TableRow><TableCell colSpan={6} className="h-40 text-center text-slate-400">ไม่พบรายการบิลในรอบนี้</TableCell></TableRow>
                                                ) : filteredBilling.map((row, idx) => (
                                                    <TableRow key={row.id || `invoice-${row.room}-${idx}`} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                                                        <TableCell className="pl-6 font-bold text-slate-700">{row.room}</TableCell>
                                                        <TableCell><div className="flex flex-col"><span className="font-medium text-slate-900">{row.name}</span><span className="text-xs text-slate-400">อัปเดต: {row.lastPay}</span></div></TableCell>
                                                        <TableCell className="text-right"><span className="font-bold text-slate-900">฿{(row.total || 0).toLocaleString()}</span></TableCell>
                                                        <TableCell className="text-center"><div className="flex items-center justify-center gap-2"><Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-medium"><Droplets size={10} className="mr-1" /> {row.water}</Badge><Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-100 font-medium"><Zap size={10} className="mr-1" /> {row.electric}</Badge></div></TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge className={`font-semibold capitalize shadow-none border px-2.5 py-0.5 rounded-full ${row.status === 'ชำระแล้ว' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : row.status === 'ยังไม่ออกบิล' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{row.status}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right pr-6">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8"><MoreHorizontal size={16} /></Button></DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-lg border-slate-100">
                                                                    {row.status === 'ยังไม่ออกบิล' && (<DropdownMenuItem onClick={() => calculateBill(row.room, row.water, row.electric, row.currentWater, row.currentElectric)} className="rounded-lg text-indigo-600"><Plus size={14} className="mr-2" /> บันทึกออกบิล</DropdownMenuItem>)}
                                                                    {row.status !== 'ยังไม่ออกบิล' && row.status !== 'ชำระแล้ว' && (<DropdownMenuItem onClick={() => payBill(row.room)} className="rounded-lg text-emerald-600"><CheckCircle2 size={14} className="mr-2" /> ยืนยันการชำระเงิน</DropdownMenuItem>)}
                                                                    <DropdownMenuItem onClick={() => navigate(`/receipt/${row.room}`)} className="rounded-lg text-slate-700"><Printer size={14} className="mr-2 text-slate-400" /> พิมพ์ใบเสร็จ</DropdownMenuItem>
                                                                    {!row.isDraft && (<DropdownMenuItem onClick={() => deleteBill(row._id)} className="rounded-lg text-rose-600"><MoreHorizontal size={14} className="mr-2" /> ลบบิล</DropdownMenuItem>)}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Card>
                                </motion.div>
                            </TabsContent>
                        )}

                        {activeTab === 'meter' && (
                            <TabsContent key="meter-tab" value="meter" forceMount>
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                                        <div className="flex items-center gap-3"><Badge variant="outline" className="bg-white border-slate-200 text-slate-500 font-bold px-3 py-1.5 h-auto"><Zap size={14} className="mr-2 text-amber-500" /> จดมิเตอร์ประจำเดือน</Badge></div>
                                        <div className="flex gap-2">
                                            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                                                <DialogTrigger asChild><Button variant="outline" className="h-9 px-4 rounded-xl border-slate-200 bg-white font-bold text-slate-600 text-xs"><FileDown size={14} className="mr-2" /> นำเข้าข้อมูล</Button></DialogTrigger>
                                                <DialogContent className="bg-white rounded-3xl p-8 border-none shadow-xl">
                                                    <DialogHeader><DialogTitle className="text-2xl font-bold">นำเข้าด้วย Excel</DialogTitle></DialogHeader>
                                                    <div className="space-y-4 pt-4"><textarea className="w-full h-48 p-4 rounded-2xl bg-slate-50 border-none font-mono text-sm" placeholder="1101 [TAB] 4520 [TAB] 320" value={importData} onChange={(e) => setImportData(e.target.value)} /><Button onClick={handleImportMeters} className="w-full bg-slate-900 text-white font-bold h-11 rounded-xl">ยืนยันนำเข้า</Button></div>
                                                </DialogContent>
                                            </Dialog>
                                            <Button onClick={handleCalculateAll} className="h-9 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs"><Plus size={14} className="mr-2" /> ออกบิลทั้งตึก</Button>
                                        </div>
                                    </div>

                                     <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                                        <CardHeader className="px-6 py-4 border-b bg-slate-50/50">
                                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                                <Zap size={20} className="text-amber-500" /> จดมิเตอร์น้ำ-ไฟ แยกตามห้อง
                                            </CardTitle>
                                        </CardHeader>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader className="bg-slate-50/30">
                                                    <TableRow>
                                                        <TableHead className="w-32 pl-6">ห้องพัก</TableHead>
                                                        <TableHead className="text-center font-bold text-amber-600 bg-amber-50/20">ไฟ (ครั้งก่อน)</TableHead>
                                                        <TableHead className="text-center font-bold text-amber-600 bg-amber-50/30">ไฟ (ครั้งนี้)</TableHead>
                                                        <TableHead className="text-center font-bold text-blue-600 bg-blue-50/20">น้ำ (ครั้งก่อน)</TableHead>
                                                        <TableHead className="text-center font-bold text-blue-600 bg-blue-50/30">น้ำ (ครั้งนี้)</TableHead>
                                                        <TableHead className="text-right pr-6">หน่วยที่ใช้</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredTenants.map((item, idx) => {
                                                        const prevElec = (item.lastElectricMeter || 0);
                                                        const currElec = meters.electric[item.room] || '';
                                                        const elecUsage = currElec ? Math.max(0, parseFloat(currElec) - parseFloat(prevElec)) : 0;

                                                        const prevWater = (item.lastWaterMeter || 0);
                                                        const currWater = meters.water[item.room] || '';
                                                        const waterUsage = currWater ? Math.max(0, parseFloat(currWater) - parseFloat(prevWater)) : 0;

                                                        const handleKeyDown = (e, type, room, index) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                if (type === 'electric') {
                                                                    // Move to water of same room
                                                                    document.getElementById(`meter-water-${room}`)?.focus();
                                                                } else {
                                                                    // Move to next room's electric
                                                                    const nextRoom = filteredTenants[index + 1];
                                                                    if (nextRoom) {
                                                                        document.getElementById(`meter-electric-${nextRoom.room}`)?.focus();
                                                                    }
                                                                }
                                                            }
                                                        };

                                                        return (
                                                            <TableRow key={`meter-row-${item.room}-${idx}`} className="border-slate-50 hover:bg-slate-50/50">
                                                                <TableCell className="pl-6 py-4">
                                                                    <div className="font-bold text-slate-800">{item.room}</div>
                                                                    <div className="text-xs text-slate-400 font-medium truncate max-w-[120px]">{item.name}</div>
                                                                </TableCell>
                                                                
                                                                {/* Electric */}
                                                                <TableCell className="text-center bg-amber-50/5 text-slate-400">
                                                                    <div className="flex flex-col items-center gap-1">
                                                                        <span className="text-[10px] uppercase font-bold text-slate-300">ไฟเก่า</span>
                                                                        <Input 
                                                                            type="number"
                                                                            className="h-7 w-16 bg-transparent border-slate-200 text-center text-xs font-medium focus:bg-white"
                                                                            defaultValue={prevElec}
                                                                            onBlur={(e) => {
                                                                                const val = parseFloat(e.target.value);
                                                                                if (!isNaN(val) && val !== prevElec) {
                                                                                    updateTenant(item.id, { lastElectricMeter: val });
                                                                                }
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="bg-amber-50/20">
                                                                    <div className="flex flex-col items-center gap-1">
                                                                        <span className="text-[10px] uppercase font-bold text-amber-500">ไฟใหม่</span>
                                                                        <Input 
                                                                            id={`meter-electric-${item.room}`}
                                                                            type="number" 
                                                                            value={currElec} 
                                                                            onChange={(e) => handleMeterChange('electric', item.room, e.target.value)} 
                                                                            onKeyDown={(e) => handleKeyDown(e, 'electric', item.room, idx)}
                                                                            className="h-9 w-24 bg-white border-amber-200 rounded-lg text-center font-bold text-amber-700 focus:border-amber-500 focus:ring-amber-500 shadow-sm" 
                                                                            placeholder="0000" 
                                                                        />
                                                                    </div>
                                                                </TableCell>

                                                                {/* Water */}
                                                                <TableCell className="text-center bg-blue-50/5 text-slate-400">
                                                                    <div className="flex flex-col items-center gap-1">
                                                                        <span className="text-[10px] uppercase font-bold text-slate-300">น้ำเก่า</span>
                                                                        <Input 
                                                                            type="number"
                                                                            className="h-7 w-16 bg-transparent border-slate-200 text-center text-xs font-medium focus:bg-white"
                                                                            defaultValue={prevWater}
                                                                            onBlur={(e) => {
                                                                                const val = parseFloat(e.target.value);
                                                                                if (!isNaN(val) && val !== prevWater) {
                                                                                    updateTenant(item.id, { lastWaterMeter: val });
                                                                                }
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="bg-blue-50/20">
                                                                    <div className="flex flex-col items-center gap-1">
                                                                        <span className="text-[10px] uppercase font-bold text-blue-500">น้ำใหม่</span>
                                                                        <Input 
                                                                            id={`meter-water-${item.room}`}
                                                                            type="number" 
                                                                            value={currWater} 
                                                                            onChange={(e) => handleMeterChange('water', item.room, e.target.value)} 
                                                                            onKeyDown={(e) => handleKeyDown(e, 'water', item.room, idx)}
                                                                            className="h-9 w-24 bg-white border-blue-200 rounded-lg text-center font-bold text-blue-700 focus:border-blue-500 focus:ring-blue-500 shadow-sm" 
                                                                            placeholder="0000" 
                                                                        />
                                                                    </div>
                                                                </TableCell>

                                                                <TableCell className="text-right pr-6">
                                                                    <div className="flex flex-col items-end gap-1">
                                                                        <span className={`text-xs font-bold ${elecUsage > 0 ? 'text-amber-600' : 'text-slate-300'}`}>ไฟ: {elecUsage}</span>
                                                                        <span className={`text-xs font-bold ${waterUsage > 0 ? 'text-blue-600' : 'text-slate-300'}`}>น้ำ: {waterUsage}</span>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </Card>
                                </motion.div>
                            </TabsContent>
                        )}

                        {activeTab === 'summary' && (
                            <TabsContent key="summary-tab" value="summary" forceMount>
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                                    <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden p-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <div><h2 className="text-2xl font-bold text-slate-900 mb-2">สรุปค่าน้ำ-ไฟ</h2><p className="text-sm font-medium text-slate-500">ข้อมูลอัปเดต ณ {new Date().toLocaleString('th-TH')}</p></div>
                                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">ตวงเงิน แมนชั่น</h2>
                                        </div>
                                        <Table>
                                            <TableHeader><TableRow className="border-b-2 border-slate-200 hover:bg-transparent"><TableHead className="font-bold py-3">ห้องพัก</TableHead><TableHead className="font-bold py-3 text-center">มิเตอร์ไฟ (เดิม-ใหม่)</TableHead><TableHead className="font-bold py-3 text-right">ไฟ (หน่วย)</TableHead><TableHead className="font-bold py-3 text-center">มิเตอร์น้ำ (เดิม-ใหม่)</TableHead><TableHead className="font-bold py-3 text-right">น้ำ (หน่วย)</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {filteredTenants.map((item, idx) => {
                                                    const prevWater = item.lastWaterMeter || 0;
                                                    const currWater = meters.water[item.room] || prevWater;
                                                    const waterUse = Math.max(0, parseFloat(currWater) - parseFloat(prevWater));
                                                    const prevElec = item.lastElectricMeter || 0;
                                                    const currElec = meters.electric[item.room] || prevElec;
                                                    const elecUse = Math.max(0, parseFloat(currElec) - parseFloat(prevElec));
                                                    return (
                                                        <TableRow key={`summary-${item.room}-${idx}`} className="border-b border-slate-100 hover:bg-slate-50/50">
                                                            <TableCell className="font-bold text-slate-700">{item.room}</TableCell>
                                                            <TableCell className="text-center text-slate-500 text-xs font-medium">{prevElec} ➝ {currElec}</TableCell>
                                                            <TableCell className="text-right font-bold text-amber-600">{elecUse}</TableCell>
                                                            <TableCell className="text-center text-slate-500 text-xs font-medium">{prevWater} ➝ {currWater}</TableCell>
                                                            <TableCell className="text-right font-bold text-blue-600">{waterUse}</TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </Card>
                                </motion.div>
                            </TabsContent>
                        )}
                    </AnimatePresence>
                </div>
            </Tabs>
        </div>
    );
}
