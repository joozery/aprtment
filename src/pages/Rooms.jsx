import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    Users,
    DoorOpen,
    Search,
    Filter,
    Grid3x3,
    List,
    CheckCircle2,
    XCircle,
    Plus,
    Eye,
    Building2,
    Layers,
    MoreHorizontal,
    LayoutGrid,
    BedDouble,
    Bath,
    Maximize
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function Rooms() {
    const { tenants, getAllRooms, getRoomsByBuilding, buildings } = useApp();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedBuilding, setSelectedBuilding] = useState('all');

    // Get rooms based on selection
    const allRoomsRaw = selectedBuilding === 'all'
        ? getAllRooms()
        : getRoomsByBuilding(parseInt(selectedBuilding));

    // Enrich room data
    const allRooms = allRoomsRaw.map(r => ({
        ...r,
        status: r.isOccupied ? 'occupied' : 'vacant',
        type: 'Standard',
        size: '24',
        features: ['แอร์', 'เครื่องทำน้ำอุ่น', 'เฟอร์นิเจอร์']
    }));

    // Filter logic
    const filteredRooms = allRooms.filter(room => {
        const matchesSearch = room.number.includes(searchQuery) ||
            (room.tenant && room.tenant.name.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesFilter = filterStatus === 'all' || room.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    // Stats
    const totalRooms = allRooms.length;
    const vacantCount = allRooms.filter(r => r.status === 'vacant').length;
    const occupiedCount = allRooms.filter(r => r.status === 'occupied').length;
    const occupancyRate = totalRooms > 0 ? ((occupiedCount / totalRooms) * 100).toFixed(0) : 0;

    // Group by floor for grid view
    const roomsByFloor = filteredRooms.reduce((acc, room) => {
        const floor = room.floor;
        if (!acc[floor]) acc[floor] = [];
        acc[floor].push(room);
        return acc;
    }, {});

    return (
        <div className="space-y-8 pb-10 min-h-screen bg-[#F8FAFC]/50">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-800">จัดการห้องพัก</h2>
                    <p className="text-slate-500 mt-1 font-medium flex items-center gap-2">
                        <Building2 size={16} className="text-indigo-500" />
                        ภาพรวมสถานะห้องพักและผังอาคาร
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="h-10 px-5 rounded-xl border-slate-200 bg-white font-bold text-slate-600 hover:bg-slate-50 shadow-sm">
                        <Layers size={16} className="mr-2 text-slate-400" />
                        จัดการโซน/ตึก
                    </Button>
                    <Button className="h-10 px-6 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] transition-all">
                        <Plus size={18} className="mr-2" />
                        เพิ่มห้องพัก
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-none shadow-sm rounded-2xl bg-white relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Home size={80} />
                    </div>
                    <CardContent className="p-5">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ห้องทั้งหมด</p>
                        <h3 className="text-3xl font-bold text-slate-800">{totalRooms} <span className="text-sm font-medium text-slate-400">ห้อง</span></h3>
                        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 w-fit px-2 py-1 rounded-lg">
                            <Building2 size={12} /> {buildings.length} อาคาร
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-2xl bg-white relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <DoorOpen size={80} className="text-emerald-500" />
                    </div>
                    <CardContent className="p-5">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ห้องว่าง</p>
                        <h3 className="text-3xl font-bold text-emerald-600">{vacantCount} <span className="text-sm font-medium text-emerald-600/60">ห้อง</span></h3>
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-lg">
                            พร้อมเข้าอยู่
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-2xl bg-white relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Users size={80} className="text-blue-500" />
                    </div>
                    <CardContent className="p-5">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ไม่ว่าง / มีผู้เช่า</p>
                        <h3 className="text-3xl font-bold text-blue-600">{occupiedCount} <span className="text-sm font-medium text-blue-600/60">ห้อง</span></h3>
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-lg">
                            สัญญาปกติ
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-2xl bg-indigo-600 text-white relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <CheckCircle2 size={80} className="text-white" />
                    </div>
                    <CardContent className="p-5">
                        <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1">อัตราการเข้าพัก</p>
                        <h3 className="text-3xl font-bold">{occupancyRate}%</h3>
                        <div className="mt-4 w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-white h-full rounded-full" style={{ width: `${occupancyRate}%` }}></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Controls */}
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                    <div className="relative flex-1 sm:w-72 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <Input
                            placeholder="ค้นหาเลขห้อง, ชื่อผู้เช่า..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-11 bg-slate-50 border-none rounded-xl font-medium focus-visible:ring-2 focus-visible:ring-indigo-100 transition-all"
                        />
                    </div>

                    <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                        <SelectTrigger className="w-full sm:w-[180px] h-11 bg-slate-50 border-none rounded-xl font-bold text-slate-600">
                            <div className="flex items-center gap-2">
                                <Building2 size={16} className="text-slate-400" />
                                <SelectValue placeholder="เลือกตึก" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">ทุกตึก</SelectItem>
                            {buildings.map(b => (
                                <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
                    <div className="flex p-1 bg-slate-100 rounded-xl mr-2">
                        {['all', 'vacant', 'occupied'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterStatus === status
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {status === 'all' ? 'ทั้งหมด' : status === 'vacant' ? 'ว่าง' : 'มีคนอยู่'}
                            </button>
                        ))}
                    </div>

                    <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

                    <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewMode('grid')}
                            className={`h-9 w-9 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
                        >
                            <LayoutGrid size={18} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewMode('list')}
                            className={`h-9 w-9 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
                        >
                            <List size={18} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {viewMode === 'grid' ? (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {Object.keys(roomsByFloor).sort((a, b) => b - a).map((floor) => (
                            <div key={floor} className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-px flex-1 bg-slate-200"></div>
                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                                        ชั้น {floor}
                                    </span>
                                    <div className="h-px flex-1 bg-slate-200"></div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                    {roomsByFloor[floor].map((room, idx) => (
                                        <motion.div
                                            key={room.number}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <Card className={`group border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer h-full relative ${room.status === 'vacant'
                                                ? 'bg-white hover:ring-2 hover:ring-emerald-400/50'
                                                : 'bg-white hover:ring-2 hover:ring-indigo-400/50'
                                                }`}>
                                                {/* Status Indicator Stripe */}
                                                <div className={`absolute top-0 left-0 w-1.5 h-full ${room.status === 'vacant' ? 'bg-emerald-400' : 'bg-indigo-500'
                                                    }`} />

                                                <div className="p-5 pl-7">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="text-2xl font-bold text-slate-800 tracking-tight">{room.number}</h4>
                                                                <Badge variant="secondary" className="font-medium text-[10px] bg-slate-100 text-slate-500 border-none">
                                                                    {room.type}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex gap-3 text-xs text-slate-400 mt-2 font-medium">
                                                                <span className="flex items-center gap-1"><Maximize size={12} /> {room.size} ตร.ม.</span>
                                                                <span className="flex items-center gap-1"><BedDouble size={12} /> 1</span>
                                                                <span className="flex items-center gap-1"><Bath size={12} /> 1</span>
                                                            </div>
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 -mr-2">
                                                                    <MoreHorizontal size={18} className="text-slate-400" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-slate-100">
                                                                <DropdownMenuLabel>ตั่วเลือก</DropdownMenuLabel>
                                                                <DropdownMenuItem className="cursor-pointer">
                                                                    <Eye size={14} className="mr-2" /> ดูรายละเอียด
                                                                </DropdownMenuItem>
                                                                {room.status === 'vacant' && (
                                                                    <DropdownMenuItem className="cursor-pointer text-indigo-600 focus:text-indigo-700" onClick={() => navigate('/tenants')}>
                                                                        <Plus size={14} className="mr-2" /> เพิ่มผู้เช่าใหม่
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>

                                                    <div className="mt-4 pt-4 border-t border-slate-50 space-y-3">
                                                        {room.tenant ? (
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-indigo-50 border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold text-indigo-600">
                                                                    {room.tenant.avatar}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-xs text-slate-400 font-bold uppercase">ผู้เช่าปัจจุบัน</p>
                                                                    <p className="text-sm font-bold text-slate-700 truncate">{room.tenant.name}</p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 py-1">
                                                                <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none px-3 py-1 text-xs font-bold">
                                                                    <DoorOpen size={14} className="mr-1.5" /> ว่าง - พร้อมเช่า
                                                                </Badge>
                                                            </div>
                                                        )}

                                                        <div className="flex justify-between items-end">
                                                            <div>
                                                                <p className="text-[10px] uppercase font-bold text-slate-400">ค่าเช่าเริ่มต้น</p>
                                                                <p className={`text-lg font-bold ${room.status === 'vacant' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                                                    ฿{room.rent.toLocaleString()} <span className="text-xs font-medium text-slate-400">/ด</span>
                                                                </p>
                                                            </div>
                                                            {room.status === 'vacant' && (
                                                                <Button size="sm" className="h-8 rounded-lg bg-slate-900 border-slate-900 shadow-none hover:bg-slate-800 text-xs font-bold" onClick={() => navigate('/tenants')}>
                                                                    เข้าพัก
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                            <CardContent className="p-0">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">ห้อง</th>
                                            <th className="px-6 py-4">ชั้น</th>
                                            <th className="px-6 py-4">ประเภท/ขนาด</th>
                                            <th className="px-6 py-4">สถานะ</th>
                                            <th className="px-6 py-4">ผู้เช่า</th>
                                            <th className="px-6 py-4 text-right">ค่าเช่า</th>
                                            <th className="px-6 py-4 text-center">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredRooms.map((room) => (
                                            <tr key={room.number} className="hover:bg-slate-50/60 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-slate-800 text-base">{room.number}</span>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-500">
                                                    ชั้น {room.floor}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-700">{room.type}</span>
                                                        <span className="text-xs text-slate-400">{room.size} ตร.ม.</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {room.status === 'vacant' ? (
                                                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold">ว่าง</Badge>
                                                    ) : (
                                                        <Badge className="bg-indigo-50 text-indigo-600 border-none font-bold">มีผู้เช่า</Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {room.tenant ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-white shadow-sm">
                                                                {room.tenant.avatar}
                                                            </div>
                                                            <span className="font-bold text-slate-700 text-sm">{room.tenant.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs italic">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-bold text-slate-900">฿{room.rent.toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm">
                                                        <MoreHorizontal size={16} className="text-slate-400 group-hover:text-indigo-500" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {filteredRooms.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Search size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">ไม่พบห้องที่ค้นหา</h3>
                    <p className="text-slate-500">ลองเปลี่ยนคำค้นหา หรือตัวกรองสถานะใหม่</p>
                    <Button
                        variant="link"
                        onClick={() => { setSearchQuery(''); setFilterStatus('all'); }}
                        className="mt-2 text-indigo-600 font-bold"
                    >
                        ล้างตัวกรองทั้งหมด
                    </Button>
                </div>
            )}
        </div>
    );
}
