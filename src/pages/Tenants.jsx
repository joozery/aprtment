import { motion } from 'framer-motion';
import {
    Plus,
    Search,
    MoreHorizontal,
    FileText,
    History,
    Phone,
    Mail,
    Filter,
    UserPlus,
    ArrowUpDown,
    Download,
    Calendar,
    ShieldCheck,
    Settings
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';

const StatusBadge = ({ status }) => {
    const configs = {
        'ปกติ': 'bg-emerald-50 text-emerald-600 border-emerald-100',
        'ใกล้หมดสัญญา': 'bg-amber-50 text-amber-600 border-amber-100',
        'ค้างชำระ': 'bg-rose-50 text-rose-600 border-rose-100',
    };

    return (
        <Badge variant="outline" className={`${configs[status] || ''} px-3 py-1 font-bold rounded-lg border shadow-sm`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${status === 'ปกติ' ? 'bg-emerald-500' : status === 'ใกล้หมดสัญญา' ? 'bg-amber-500' : 'bg-rose-500'
                }`}></span>
            {status}
        </Badge>
    );
};

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';

// ... StatusBadge component ...

export default function Tenants() {
    const { tenants, addTenant, removeTenant, getRoomInfo } = useApp();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newTenant, setNewTenant] = useState({ room: '', name: '', rent: 4500, status: 'ปกติ' });
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const handleAdd = () => {
        if (!newTenant.room || !newTenant.name) return;

        const roomInfo = getRoomInfo(newTenant.room);
        if (!roomInfo) {
            alert('หมายเลขห้องไม่ถูกต้อง (กรุณาตรวจสอบชั้น 1-4, ห้อง 01-08)');
            return;
        }
        if (roomInfo.isOccupied) {
            alert(`ห้อง ${newTenant.room} มีผู้เช่าอยู่แล้ว (${roomInfo.tenant.name})`);
            return;
        }

        addTenant({
            ...newTenant,
            date: new Date().toLocaleDateString('th-TH'),
            expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('th-TH')
        });
        setIsAddOpen(false);
        setNewTenant({ room: '', name: '', rent: 4500, status: 'ปกติ' });
    };

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.room.includes(search)
    );

    return (
        <div className="space-y-10 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">ผู้เช่าและสัญญา</h2>
                    <p className="text-slate-500 mt-1 text-sm font-medium flex items-center gap-2">
                        จัดการข้อมูลผู้เช่าทั้งหมด <Badge variant="outline" className="ml-2 bg-white border-slate-200 font-bold px-3">{tenants.length} คน</Badge>
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button onClick={() => navigate('/templates')} variant="outline" className="h-9 px-4 rounded-xl border-slate-200 bg-white font-bold text-slate-600 premium-shadow group text-sm">
                        <Settings size={14} className="mr-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                        จัดการเทมเพลต
                    </Button>
                    <Button variant="outline" className="h-9 px-4 rounded-xl border-slate-200 bg-white font-bold text-slate-600 premium-shadow group text-sm">
                        <Download size={14} className="mr-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                        ส่งออกรายชื่อ
                    </Button>

                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-9 px-6 rounded-xl bg-primary text-white font-bold premium-shadow hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-100 text-sm">
                                <UserPlus size={16} className="mr-2" />
                                ลงทะเบียนผู้เช่าใหม่
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-white rounded-3xl p-8 border-none premium-shadow">
                            <DialogHeader>
                                <DialogTitle className="text-3xl font-bold text-slate-800">ลงทะเบียนผู้เช่า</DialogTitle>
                                <DialogDescription className="text-slate-400 font-medium">กรอกข้อมูลเพื่อเปิดสัญญากับผู้เช่ารายใหม่</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-700">เลขห้อง</Label>
                                    <Input
                                        value={newTenant.room}
                                        onChange={(e) => setNewTenant({ ...newTenant, room: e.target.value })}
                                        placeholder="เช่น 101"
                                        className="h-12 rounded-xl bg-slate-50 border-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-700">ชื่อ-นามสกุล</Label>
                                    <Input
                                        value={newTenant.name}
                                        onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                                        placeholder="ชื่อจริง-นามสกุล"
                                        className="h-12 rounded-xl bg-slate-50 border-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-700">ค่าเช่าพื้นฐาน</Label>
                                    <Input
                                        type="number"
                                        value={newTenant.rent}
                                        onChange={(e) => setNewTenant({ ...newTenant, rent: parseInt(e.target.value) })}
                                        className="h-12 rounded-xl bg-slate-50 border-none"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAdd} className="w-full h-14 bg-primary text-white font-bold text-lg rounded-2xl shadow-xl shadow-indigo-100">
                                    บันทึกและส่งสัญญา
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Tenant Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="sm:max-w-[600px] bg-white rounded-3xl p-8 border-none premium-shadow">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-slate-800">รายละเอียดสัญญา</DialogTitle>
                        <DialogDescription className="text-slate-400 font-medium">ข้อมูลผู้เช่าและเอกสารสัญญาเช่า</DialogDescription>
                    </DialogHeader>
                    {selectedTenant && (
                        <div className="space-y-6 mt-4">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                                <div className="h-16 w-16 bg-white rounded-xl flex items-center justify-center shadow-sm text-xl font-bold text-slate-700">
                                    {selectedTenant.room}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-slate-800">{selectedTenant.name}</h4>
                                    <p className="text-slate-500 font-medium">ผู้เช่าหลัก • สัญญา {selectedTenant.date} - {selectedTenant.expiry}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 border border-slate-100 rounded-xl space-y-1">
                                    <Label className="text-xs text-slate-400">ค่าเช่ารายเดือน</Label>
                                    <p className="text-lg font-bold text-slate-700">฿{selectedTenant.rent.toLocaleString()}</p>
                                </div>
                                <div className="p-4 border border-slate-100 rounded-xl space-y-1">
                                    <Label className="text-xs text-slate-400">สถานะสัญญา</Label>
                                    <div className="flex"><StatusBadge status={selectedTenant.status} /></div>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <Label className="text-xs text-slate-400 font-bold uppercase tracking-widest px-2 mb-2 block">ตัวอย่างสัญญาเช่า</Label>
                                <div className="bg-white p-6 shadow-sm border border-slate-100 rounded-lg text-[10px] leading-relaxed text-slate-600 font-mono h-[250px] overflow-y-auto">
                                    <div className="text-center font-bold text-sm mb-4 border-b pb-2">สัญญาเช่าห้องพักหอพักตวงเงินแมนชั่น</div>
                                    <p className="mb-2">สัญญาฉบับนี้ทำขึ้นเมื่อวันที่ <span className="font-bold text-slate-800 underline">{selectedTenant.date}</span></p>
                                    <p className="mb-2">ระหว่าง <span className="font-bold">หอพักตวงเงินแมนชั่น</span> (ผู้ให้เช่า) และ <span className="font-bold text-slate-800 underline">{selectedTenant.name}</span> (ผู้เช่า)</p>
                                    <p className="mb-4">คู่สัญญาทั้งสองฝ่ายตกลงทำสัญญาเช่าห้องพักหมายเลข <span className="font-bold text-slate-800 underline">{selectedTenant.room}</span> อัตราค่าเช่าเดือนละ <span className="font-bold text-slate-800 underline">{selectedTenant.rent.toLocaleString()}</span> บาท โดยมีกำหนดระยะเวลาสัญญา <span className="font-bold text-slate-800 underline">12 เดือน</span> นับตั้งแต่วันที่ {selectedTenant.date} จนถึง {selectedTenant.expiry}</p>
                                    <div className="mb-2 font-bold">เงื่อนไขการเช่า:</div>
                                    <ul className="list-disc pl-4 space-y-1 mb-4">
                                        <li>ผู้เช่าต้องชำระค่าเช่าภายในวันที่ 5 ของทุกเดือน</li>
                                        <li>ห้ามเลี้ยงสัตว์ทุกชนิดภายในห้องพัก</li>
                                        <li>ห้ามส่งเสียงดังรบกวนผู้เช่าท่านอื่นหลังเวลา 22.00 น.</li>
                                        <li>หากผิดสัญญา ผู้ให้เช่ามีสิทธิ์บอกเลิกสัญญาได้ทันที</li>
                                    </ul>
                                    <div className="flex justify-between mt-8 pt-4 border-t border-dashed border-slate-300">
                                        <div className="text-center">
                                            <div className="h-8 border-b border-slate-300 w-24 mb-1"></div>
                                            (ผู้ให้เช่า)
                                        </div>
                                        <div className="text-center">
                                            <div className="h-8 border-b border-slate-300 w-24 mb-1"></div>
                                            (ผู้เช่า)
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-3">
                                    <Button
                                        onClick={() => navigate(`/contract/${selectedTenant.room}`)}
                                        size="sm"
                                        className="rounded-lg h-9 bg-slate-900 text-white font-bold shadow-md hover:bg-slate-800"
                                    >
                                        <FileText size={14} className="mr-2" /> เปิดดูสัญญาฉบับเต็ม
                                    </Button>
                                    <Button size="sm" variant="outline" className="rounded-lg h-9 bg-white border-slate-200 hover:bg-slate-50 text-slate-600">
                                        <Download size={14} className="mr-2" /> ดาวน์โหลด PDF
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Payment History Dialog */}
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogContent className="sm:max-w-[700px] bg-white rounded-3xl p-8 border-none premium-shadow">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-slate-800">ประวัติการชำระเงิน</DialogTitle>
                        <DialogDescription className="text-slate-400 font-medium">
                            ห้อง {selectedTenant?.room} - {selectedTenant?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="font-bold text-slate-700">รอบบิล</TableHead>
                                    <TableHead className="font-bold text-slate-700">วันที่ชำระ</TableHead>
                                    <TableHead className="font-bold text-slate-700 text-center">สถานะ</TableHead>
                                    <TableHead className="font-bold text-slate-700 text-right">ยอดรวม</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[
                                    { month: 'มิถุนายน 2567', date: '05 มิ.ย. 67', status: 'ชำระแล้ว', amount: selectedTenant?.rent + 750 },
                                    { month: 'พฤษภาคม 2567', date: '03 พ.ค. 67', status: 'ชำระแล้ว', amount: selectedTenant?.rent + 820 },
                                    { month: 'เมษายน 2567', date: '04 เม.ย. 67', status: 'ชำระแล้ว', amount: selectedTenant?.rent + 900 },
                                ].map((item, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-medium text-slate-700">{item.month}</TableCell>
                                        <TableCell className="text-slate-500">{item.date}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 font-bold border-none">
                                                {item.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-slate-800">
                                            ฿{item.amount?.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>


            {/* Main Content Card */}
            <Card className="border-none premium-shadow bg-white rounded-2xl overflow-hidden">
                <CardHeader className="p-6 pb-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-semibold text-slate-800 tracking-tight">รายชื่อผู้เช่าปัจจุบัน</CardTitle>
                        <CardDescription className="font-medium text-slate-400 text-xs">เรียงตามหมายเลขห้อง (101 - 508)</CardDescription>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={14} />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="ค้นหาชื่อ, เลขห้อง, เบอร์โทร..."
                                className="pl-9 h-9 bg-white border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/10 transition-all font-medium text-slate-700 text-sm"
                            />
                        </div>
                        <Button variant="outline" className="h-9 px-4 rounded-xl border-slate-200 bg-white text-slate-600 font-bold group text-sm">
                            <Filter size={14} className="mr-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                            กรอง
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/80">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="w-[100px] px-6 py-4 font-bold text-slate-800 uppercase tracking-widest text-[10px]">เลขห้อง <ArrowUpDown size={10} className="inline ml-1 opacity-30" /></TableHead>
                                    <TableHead className="font-bold text-slate-800 uppercase tracking-widest text-[10px] py-4">ผู้เช่า / รายละเอียด</TableHead>
                                    <TableHead className="font-bold text-slate-800 uppercase tracking-widest text-[10px] py-4 text-center">สถานะปัจจุบัน</TableHead>
                                    <TableHead className="font-bold text-slate-800 uppercase tracking-widest text-[10px] py-4"><Calendar size={10} className="inline mr-1 opacity-30" /> ระยะสัญญา</TableHead>
                                    <TableHead className="font-bold text-slate-800 uppercase tracking-widest text-[10px] py-4 text-right">ค่าเช่าสุทธิ</TableHead>
                                    <TableHead className="w-[80px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTenants.map((tenant, idx) => (
                                    <motion.tr
                                        key={tenant.room}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group hover:bg-slate-50/50 transition-all duration-300 border-slate-50 h-16"
                                    >
                                        <TableCell className="px-6">
                                            <div className="flex items-center gap-2">
                                                <div className="h-10 w-10 rounded-lg bg-white border border-slate-100 flex flex-col items-center justify-center shadow-sm group-hover:shadow-md group-hover:border-primary/20 transition-all">
                                                    <span className="text-sm font-bold text-slate-800 leading-none">{tenant.room}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 border-2 border-slate-100">
                                                    <AvatarFallback className="bg-slate-100 text-slate-500 font-bold text-[10px]">{tenant.avatar}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm text-slate-800 leading-tight">{tenant.name}</span>
                                                    <span className="text-[10px] font-medium text-slate-400 mt-0.5 flex items-center gap-1.5 underline decoration-slate-200 cursor-pointer hover:text-primary">
                                                        <Phone size={8} /> 08x-xxx-xxxx
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center py-4">
                                            <div className="scale-90"><StatusBadge status={tenant.status} /></div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700">
                                                    เริ่ม: <span className="font-medium text-slate-400">{tenant.date}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700">
                                                    หมด: <span className="font-medium text-slate-400">{tenant.expiry}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right py-4">
                                            <span className="font-bold text-sm text-slate-800">฿{tenant.rent.toLocaleString()}</span>
                                            <p className="text-[8px] uppercase font-bold text-slate-400 tracking-tighter">ต่อเดือน</p>
                                        </TableCell>
                                        <TableCell className="px-6">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-lg hover:bg-white hover:shadow-md border-transparent hover:border-slate-100 transition-all">
                                                        <MoreHorizontal size={20} className="text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-60 p-2 rounded-xl shadow-2xl border-slate-100">
                                                    <DropdownMenuLabel className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-400">จัดการข้อมูล</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        onClick={() => { setSelectedTenant(tenant); setIsDetailOpen(true); }}
                                                        className="gap-3 py-3 px-4 rounded-xl cursor-pointer hover:bg-slate-50"
                                                    >
                                                        <div className="bg-blue-50 p-2 rounded-lg text-blue-500"><FileText size={16} /></div>
                                                        <span className="font-bold text-slate-700">ดูรายละเอียด/สัญญา</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => { setSelectedTenant(tenant); setIsHistoryOpen(true); }}
                                                        className="gap-3 py-3 px-4 rounded-xl cursor-pointer hover:bg-slate-50"
                                                    >
                                                        <div className="bg-emerald-50 p-2 rounded-lg text-emerald-500"><History size={16} /></div>
                                                        <span className="font-bold text-slate-700">ประวัติการชำระเงิน</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="my-2 bg-slate-50" />
                                                    <DropdownMenuItem
                                                        onClick={() => removeTenant(tenant.id)}
                                                        className="text-rose-600 gap-3 py-3 px-4 rounded-lg cursor-pointer hover:bg-rose-50 border-none"
                                                    >
                                                        <div className="bg-rose-100 p-2 rounded-lg text-rose-500"><ShieldCheck size={16} /></div>
                                                        <span className="font-bold">ยกเลิกสัญญาถาวร</span>
                                                    </DropdownMenuItem>

                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="p-8 border-t border-slate-50 flex justify-between items-center bg-slate-50/30">
                        <p className="text-sm font-bold text-slate-400">แสดงผล {filteredTenants.length} จาก {tenants.length} รายชื่อ</p>

                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="rounded-xl font-bold h-10 px-4 disabled:opacity-30" disabled>ก่อนหน้า</Button>
                            <Button variant="ghost" size="sm" className="rounded-xl font-bold h-10 px-4 bg-white shadow-sm border border-slate-100">1</Button>
                            <Button variant="ghost" size="sm" className="rounded-xl font-bold h-10 px-4 hover:bg-white hover:shadow-sm">2</Button>
                            <Button variant="ghost" size="sm" className="rounded-xl font-bold h-10 px-4">ถัดไป</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div >
    );
}
