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
    Settings,
    Edit3,
    Zap,
    Droplets
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useApp } from '@/context/AppContext';
import { useState, useEffect } from 'react';
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

export default function Tenants() {
    const { tenants, addTenant, removeTenant, updateTenant, getRoomInfo, buildings, getRoomsByBuilding } = useApp();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterBuilding, setFilterBuilding] = useState('all');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [newTenant, setNewTenant] = useState({ room: '', name: '', rent: 4500, status: 'ปกติ' });
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isManualRoom, setIsManualRoom] = useState(false);

    // New state for selecting building when adding tenant
    const [filterBuildingId, setFilterBuildingId] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        if (!filterBuildingId && buildings.length > 0) {
            setFilterBuildingId(buildings[0].id.toString());
        }
    }, [buildings, filterBuildingId]);

    const availableRooms = filterBuildingId
        ? getRoomsByBuilding(filterBuildingId).filter(r => !r.isOccupied)
        : [];

    const handleSave = async () => {
        if (!newTenant.room || !newTenant.name) return;

        if (isEditMode) {
            const res = await updateTenant(newTenant.id, newTenant);
            if (res && res.success) {
                setIsAddOpen(false);
                setNewTenant({ room: '', name: '', rent: 4500, status: 'ปกติ' });
            } else {
                alert(res?.error || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้เช่า');
            }
            return;
        }

        const roomInfo = getRoomInfo(newTenant.room);
        
        // 1. Check if this room is already taken by an existing tenant (Double protection)
        const existingTenant = tenants.find(t => String(t.room) === String(newTenant.room));
        if (existingTenant) {
            alert(`ไม่สามารถใช้เลขห้องนี้ได้ เนื่องจากมีผู้เช่าอยู่แล้ว: ${existingTenant.name}`);
            return;
        }

        // 2. If room exists in room database, check its occupied status
        if (roomInfo && roomInfo.isOccupied) {
            alert(`ห้อง ${newTenant.room} มีสถานะไม่ว่างในระบบห้องพัก`);
            return;
        }

        // 3. Only block if NOT manual mode and room isn't found at all
        if (!isManualRoom && !roomInfo) {
            alert('หมายเลขห้องไม่ถูกต้อง หรือไม่มีในระบบ');
            return;
        }

        const res = await addTenant({
            ...newTenant,
            buildingId: filterBuildingId,
            date: new Date().toLocaleDateString('th-TH'),
            expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('th-TH')
        });

        if (res && res.success) {
            setIsAddOpen(false);
            setNewTenant({ room: '', name: '', rent: 4500, status: 'ปกติ' });
            setIsManualRoom(false); // Reset to default mode
        } else {
            alert(res?.error || 'เกิดข้อผิดพลาดในการลงทะเบียนผู้เช่า');
        }
    };

    const filteredTenants = tenants.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.room.includes(search);
        const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
        const matchesBuilding = filterBuilding === 'all' || String(t.buildingId) === String(filterBuilding);
        return matchesSearch && matchesStatus && matchesBuilding;
    }).sort((a, b) => {
        const bA = buildings.find(bu => String(bu.id || bu._id) === String(a.buildingId))?.name || '';
        const bB = buildings.find(bu => String(bu.id || bu._id) === String(b.buildingId))?.name || '';
        if (bA !== bB) return bA.localeCompare(bB);
        return parseInt(a.room) - parseInt(b.room);
    });

    const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTenants = filteredTenants.slice(startIndex, startIndex + itemsPerPage);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, filterBuilding, search]);

    const exportToCSV = () => {
        const headers = ['ตึก', 'เลขห้อง', 'ชื่อ', 'เบอร์โทร', 'ค่าเช่า', 'สถานะ', 'วันที่เริ่มสัญญา', 'วันหมดสัญญา', 'มิเตอร์ไฟล่าสุด', 'มิเตอร์น้ำล่าสุด'];
        const csvRows = [];
        // Add BOM for UTF-8 compatibility
        csvRows.push('\uFEFF' + headers.join(','));

        filteredTenants.forEach(t => {
            const buildingName = buildings.find(bu => String(bu.id || bu._id) === String(t.buildingId))?.name || '-';
            const row = [
                `"${buildingName}"`,
                `"${t.room}"`,
                `"${t.name}"`,
                `"${t.phone || '-'}"`,
                t.rent,
                `"${t.status}"`,
                `"${t.date}"`,
                `"${t.expiry}"`,
                t.lastElectricMeter || 0,
                t.lastWaterMeter || 0
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `รายชื่อผู้เช่า_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
                    <Button onClick={exportToCSV} variant="outline" className="h-9 px-4 rounded-xl border-slate-200 bg-white font-bold text-slate-600 premium-shadow group text-sm">
                        <Download size={14} className="mr-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                        ส่งออกรายชื่อ
                    </Button>

                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button
                                onClick={() => { setIsEditMode(false); setNewTenant({ room: '', name: '', rent: 4500, status: 'ปกติ' }); }}
                                className="h-9 px-6 rounded-xl bg-primary text-white font-bold premium-shadow hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-100 text-sm"
                            >
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
                                {!isEditMode && (
                                    <div className="space-y-2">
                                        <Label className="font-bold text-slate-700">เลือกตึก (เพื่อดูห้องว่าง)</Label>
                                        <Select
                                            value={filterBuildingId}
                                            onValueChange={(val) => {
                                                setFilterBuildingId(val);
                                                setNewTenant({ ...newTenant, room: '' });
                                            }}
                                        >
                                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none">
                                                <SelectValue placeholder="เลือกตึก" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-none shadow-lg">
                                                {buildings.map(b => (
                                                    <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="font-bold text-slate-700">เลขห้อง</Label>
                                        {!isEditMode && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => {
                                                    setIsManualRoom(!isManualRoom);
                                                    setNewTenant({ ...newTenant, room: '' });
                                                }}
                                                className="h-7 text-[10px] font-bold text-primary hover:bg-indigo-50"
                                            >
                                                {isManualRoom ? 'เลือกจากห้องว่าง' : 'กรอกเลขห้องเอง'}
                                            </Button>
                                        )}
                                    </div>
                                    {isEditMode ? (
                                        <Input
                                            value={newTenant.room}
                                            disabled
                                            className="h-12 rounded-xl bg-slate-50 border-none disabled:opacity-50"
                                        />
                                    ) : isManualRoom ? (
                                        <Input
                                            value={newTenant.room}
                                            onChange={(e) => setNewTenant({ ...newTenant, room: e.target.value })}
                                            placeholder="ระบุเลขห้อง (เช่น 101)"
                                            className="h-12 rounded-xl bg-slate-50 border-none"
                                        />
                                    ) : (
                                        <Select
                                            value={newTenant.room}
                                            onValueChange={(val) => {
                                                const roomInfo = getRoomInfo(val);
                                                setNewTenant({
                                                    ...newTenant,
                                                    room: val,
                                                    rent: roomInfo ? roomInfo.rent : 4500
                                                });
                                            }}
                                        >
                                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none">
                                                <SelectValue placeholder="เลือกห้องว่าง" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-none shadow-lg max-h-60">
                                                {availableRooms.length > 0 ? (
                                                    availableRooms.map(r => (
                                                        <SelectItem key={r.number} value={r.number.toString()}>
                                                            {r.number} (ชั้น {r.floor}) - ฿{r.rent?.toLocaleString() || '4,500'}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <div className="py-4 text-center text-sm font-medium text-slate-400">
                                                        ไม่มีห้องว่างในตึกนี้
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
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
                                <Button onClick={handleSave} className="w-full h-14 bg-primary text-white font-bold text-lg rounded-2xl shadow-xl shadow-indigo-100">
                                    {isEditMode ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูลผู้เช่า'}
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
                        <CardDescription className="font-medium text-slate-400 text-xs">เรียงตามตึกและหมายเลขห้อง</CardDescription>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={14} />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="ค้นหาชื่อ, เลขห้อง..."
                                className="pl-9 h-9 bg-white border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/10 transition-all font-medium text-slate-700 text-sm"
                            />
                        </div>

                        {/* Building Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-9 px-4 rounded-xl border-slate-200 bg-white text-slate-600 font-bold group text-sm">
                                    <Filter size={14} className="mr-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                                    ตึก: {filterBuilding === 'all' ? 'ทั้งหมด' : buildings.find(b => String(b.id) === String(filterBuilding))?.name}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-slate-100">
                                <DropdownMenuItem onClick={() => setFilterBuilding('all')} className="font-medium cursor-pointer text-slate-800">
                                    ทุกตึก
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {buildings.map(b => (
                                    <DropdownMenuItem key={b.id} onClick={() => setFilterBuilding(b.id)} className="font-medium cursor-pointer text-slate-800">
                                        {b.name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Status Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-9 px-4 rounded-xl border-slate-200 bg-white text-slate-600 font-bold group text-sm">
                                    <Filter size={14} className="mr-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                                    สถานะ: {filterStatus === 'all' ? 'ทั้งหมด' : filterStatus}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-slate-100">
                                <DropdownMenuItem onClick={() => setFilterStatus('all')} className="font-medium cursor-pointer">
                                    สถานะทั้งหมด
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setFilterStatus('ปกติ')} className="text-emerald-600 font-medium cursor-pointer">
                                    ปกติ
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterStatus('ค้างชำระ')} className="text-rose-600 font-medium cursor-pointer">
                                    ค้างชำระ
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterStatus('ใกล้หมดสัญญา')} className="text-amber-600 font-medium cursor-pointer">
                                    ใกล้หมดสัญญา
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                                    <TableHead className="font-bold text-slate-800 uppercase tracking-widest text-[10px] py-4"><Zap size={10} className="inline mr-1 opacity-30" /> มิเตอร์ไฟ/น้ำ</TableHead>
                                    <TableHead className="font-bold text-slate-800 uppercase tracking-widest text-[10px] py-4"><Calendar size={10} className="inline mr-1 opacity-30" /> ระยะสัญญา</TableHead>
                                    <TableHead className="font-bold text-slate-800 uppercase tracking-widest text-[10px] py-4 text-right">ค่าเช่าสุทธิ</TableHead>
                                    <TableHead className="w-[80px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedTenants.map((tenant, idx) => (
                                    <motion.tr
                                        key={tenant.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group hover:bg-slate-50/50 transition-all duration-300 border-slate-50 h-16"
                                    >
                                        <TableCell className="px-6">
                                            <div className="flex items-center gap-2">
                                                <div className="h-10 w-12 rounded-lg bg-white border border-slate-100 flex flex-col items-center justify-center shadow-sm group-hover:shadow-md group-hover:border-primary/20 transition-all">
                                                    <span className="text-xs font-bold text-slate-800 leading-none">{tenant.room}</span>
                                                    <span className="text-[8px] text-slate-400 mt-1 font-bold">
                                                        {buildings.find(bu => String(bu.id || bu._id) === String(tenant.buildingId))?.name || '-'}
                                                    </span>
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
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[9px] h-5 bg-amber-50 text-amber-700 border-amber-100 font-bold px-1.5">
                                                        <Zap size={8} className="mr-1" /> {tenant.lastElectricMeter?.toLocaleString() || 0}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-[9px] h-5 bg-blue-50 text-blue-700 border-blue-100 font-bold px-1.5">
                                                        <Droplets size={8} className="mr-1" /> {tenant.lastWaterMeter?.toLocaleString() || 0}
                                                    </Badge>
                                                </div>
                                            </div>
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
                                                        <span className="font-bold text-slate-700">ดูรายละเอียดผู้เช่า</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => { setSelectedTenant(tenant); setIsHistoryOpen(true); }}
                                                        className="gap-3 py-3 px-4 rounded-xl cursor-pointer hover:bg-slate-50"
                                                    >
                                                        <div className="bg-emerald-50 p-2 rounded-lg text-emerald-500"><History size={16} /></div>
                                                        <span className="font-bold text-slate-700">ประวัติการชำระเงิน</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setNewTenant({ ...tenant });
                                                            setIsEditMode(true);
                                                            setIsAddOpen(true);
                                                        }}
                                                        className="gap-3 py-3 px-4 rounded-xl cursor-pointer hover:bg-slate-50"
                                                    >
                                                        <div className="bg-amber-50 p-2 rounded-lg text-amber-500"><Edit3 size={16} /></div>
                                                        <span className="font-bold text-slate-700">แก้ไขข้อมูลผู้เช่า</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="my-2 bg-slate-50" />
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            if (window.confirm('ยืนยันการยกเลิกสัญญา?')) {
                                                                removeTenant(tenant.id);
                                                            }
                                                        }}
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

                    <div className="p-8 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center bg-slate-50/30 gap-4">
                        <p className="text-sm font-bold text-slate-400">
                            แสดง {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredTenants.length)} จาก {filteredTenants.length} รายชื่อ
                        </p>

                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="rounded-xl font-bold h-10 px-4 disabled:opacity-30 hover:bg-white"
                            >
                                ก่อนหน้า
                            </Button>

                            {totalPages > 0 && Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                // Simple page window
                                let pageNum = i + 1;
                                if (totalPages > 5) {
                                    if (currentPage > 3) pageNum = currentPage - 2 + i;
                                    if (pageNum > totalPages - 4) pageNum = totalPages - 4 + i;
                                }
                                if (pageNum > totalPages) return null;

                                return (
                                    <Button
                                        key={pageNum}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`rounded-xl font-bold h-10 px-4 transition-all ${currentPage === pageNum
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary'
                                                : 'bg-white shadow-sm border border-slate-100 hover:bg-slate-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="rounded-xl font-bold h-10 px-4 disabled:opacity-30 hover:bg-white"
                            >
                                ถัดไป
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
