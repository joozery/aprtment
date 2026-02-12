import { motion } from 'framer-motion';
import {
    Wrench,
    MessageSquare,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Image as ImageIcon,
    ChevronRight,
    Filter,
    ArrowUpRight,
    MoreVertical,
    Plus,
    X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
import { useState } from 'react';

import { useApp } from '@/context/AppContext';

const StatusBadge = ({ status }) => {
    const configs = {
        'Pending': { icon: Clock, class: 'bg-amber-50 text-amber-600 border-amber-100' },
        'In Progress': { icon: Wrench, class: 'bg-blue-50 text-blue-600 border-blue-100' },
        'Done': { icon: CheckCircle2, class: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    };
    const config = configs[status] || configs['Pending'];
    const Icon = config.icon;

    return (
        <Badge variant="outline" className={`${config.class} gap-1.5 py-1.5 px-3 font-bold rounded-lg border-2 shadow-sm text-xs`}>
            <Icon size={14} />
            {status}
        </Badge>
    );
};

export default function Maintenance() {
    const { maintenance, updateMaintenanceStatus, addMaintenance, deleteMaintenance, getRoomInfo } = useApp();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newReq, setNewReq] = useState({ room: '', issue: '', category: 'ประปา', priority: 'Medium' });

    const handleAdd = () => {
        if (!newReq.room || !newReq.issue) return;

        const roomInfo = getRoomInfo(newReq.room);
        if (!roomInfo) {
            alert('หมายเลขห้องไม่ถูกต้อง (กรุณาตรวจสอบชั้น 1-4, ห้อง 01-08)');
            return;
        }

        addMaintenance({
            ...newReq,
            status: 'Pending',
            images: 0
        });
        setIsAddOpen(false);
        setNewReq({ room: '', issue: '', category: 'ประปา', priority: 'Medium' });
    };

    const stats = [
        { label: 'รอดำเนินการ', value: maintenance.filter(m => m.status === 'Pending').length.toString(), color: 'indigo', icon: Clock },
        { label: 'กำลังซ่อม', value: maintenance.filter(m => m.status === 'In Progress').length.toString(), color: 'blue', icon: Wrench },
        { label: 'เสร็จสิ้นเดือนนี้', value: maintenance.filter(m => m.status === 'Done').length.toString(), color: 'emerald', icon: CheckCircle2 },
        { label: 'งานด่วนพิเศษ', value: maintenance.filter(m => m.priority === 'High' && m.status !== 'Done').length.toString(), color: 'rose', icon: AlertTriangle }
    ];

    const nextStatus = (current) => {
        if (current === 'Pending') return 'In Progress';
        if (current === 'In Progress') return 'Done';
        return 'Pending';
    };

    return (
        <div className="space-y-10 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">แจ้งซ่อมและบริการ</h2>
                    <p className="text-slate-500 mt-1 text-sm font-medium flex items-center gap-2">
                        ติดตามรายการแจ้งปัญหาจากผู้เช่า <Badge className="bg-amber-500 text-white border-none font-bold px-3">{maintenance.filter(m => m.status !== 'Done').length} รายการ</Badge>
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-9 px-4 rounded-xl border-slate-200 bg-white font-bold text-slate-600 premium-shadow text-sm">
                        <Filter size={14} className="mr-2 opacity-50" />
                        ตัวกรองขั้นสูง
                    </Button>

                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-9 px-6 rounded-xl bg-slate-900 text-white font-bold premium-shadow hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-200 text-sm">
                                <Plus size={16} className="mr-2" />
                                เพิ่มรายการแจ้งซ่อม
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-white rounded-2xl p-8 border-none premium-shadow">
                            <DialogHeader>
                                <DialogTitle className="text-3xl font-bold text-slate-800">แจ้งซ่อมใหม่</DialogTitle>
                                <DialogDescription className="text-slate-400 font-medium">ระบุรายละเอียดอาการเสียและห้องที่ต้องการบริการ</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-700">เลขห้อง</Label>
                                    <input
                                        value={newReq.room}
                                        onChange={(e) => setNewReq({ ...newReq, room: e.target.value })}
                                        className="w-full h-11 rounded-lg bg-slate-50 border-none px-4 font-bold"
                                        placeholder="เช่น 101"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-700">อาการเบื้องต้น</Label>
                                    <input
                                        value={newReq.issue}
                                        onChange={(e) => setNewReq({ ...newReq, issue: e.target.value })}
                                        className="w-full h-11 rounded-lg bg-slate-50 border-none px-4 font-bold"
                                        placeholder="เช่น ท่อน้ำรั่ว"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-bold text-slate-700">หมวดหมู่</Label>
                                        <select
                                            value={newReq.category}
                                            onChange={(e) => setNewReq({ ...newReq, category: e.target.value })}
                                            className="w-full h-11 rounded-lg bg-slate-50 border-none px-4 font-bold appearance-none"
                                        >
                                            <option>ประปา</option>
                                            <option>ไฟฟ้า</option>
                                            <option>เครื่องปรับอากาศ</option>
                                            <option>ทั่วไป</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold text-slate-700">ความสำคัญ</Label>
                                        <select
                                            value={newReq.priority}
                                            onChange={(e) => setNewReq({ ...newReq, priority: e.target.value })}
                                            className="w-full h-11 rounded-lg bg-slate-50 border-none px-4 font-bold appearance-none"
                                        >
                                            <option value="Low">ปกติ</option>
                                            <option value="Medium">เร่งด่วน</option>
                                            <option value="High">ด่วนมาก</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAdd} className="w-full h-11 bg-slate-900 text-white font-bold text-lg rounded-xl">
                                    บันทึกรายการ
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="border-none premium-shadow bg-white rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer group">
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 group-hover:bg-${stat.color}-600 group-hover:text-white transition-colors duration-500 shadow-inner`}>
                                    <stat.icon size={20} strokeWidth={2.5} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                                    <h4 className="text-2xl font-bold text-slate-800 tracking-tighter italic">{stat.value}</h4>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Maintenance List */}
            <div className="space-y-6">
                {maintenance.map((req, idx) => (
                    <motion.div
                        key={req.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="border-none premium-shadow bg-white rounded-2xl overflow-hidden group hover:scale-[1.01] transition-all duration-300">
                            <CardContent className="p-0 flex flex-col md:flex-row items-stretch divide-y md:divide-y-0 md:divide-x divide-slate-50">
                                {/* Room Identifier */}
                                <div className="p-6 w-full md:w-32 flex flex-col items-center justify-center bg-slate-50/50 group-hover:bg-slate-100/50 transition-colors">
                                    <div className="h-14 w-14 rounded-xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center justify-center transform group-hover:rotate-6 transition-transform">
                                        <span className="text-xl font-bold text-slate-800 tracking-tighter leading-none">{req.room}</span>
                                        <span className="text-[8px] font-bold text-slate-300 tracking-[0.2em] mt-1">UNIT</span>
                                    </div>
                                </div>

                                {/* Issue Details */}
                                <div className="p-6 flex-1 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-2">
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md text-[10px] border border-slate-200">#{req.id}</Badge>
                                            <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-md text-[10px] border border-indigo-100 uppercase tracking-wider">{req.category}</Badge>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 italic">ส่งเมื่อ {req.date}</span>
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-bold text-slate-800 tracking-tight mb-2">{req.issue}</h4>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                                                <ImageIcon size={12} className="text-indigo-400" /> {req.images} รูปภาพประกอบ
                                            </div>
                                            <div className={`flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest ${req.priority === 'High' ? 'text-rose-500' : req.priority === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                                                }`}>
                                                <AlertTriangle size={12} /> {req.priority} Priority
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Column */}
                                <div className="p-6 w-full md:w-48 flex flex-col items-center justify-center gap-2">
                                    <div className="scale-90 origin-center"><StatusBadge status={req.status} /></div>
                                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest italic">Last updated: Just now</p>
                                </div>

                                {/* Actions Column */}
                                <div className="p-4 w-full md:w-40 flex flex-row md:flex-col gap-2 items-center justify-center bg-slate-50/20">
                                    <Button
                                        onClick={() => updateMaintenanceStatus(req.id, nextStatus(req.status))}
                                        className="w-full h-9 bg-white border border-slate-100 shadow-md text-slate-800 font-bold rounded-xl hover:bg-slate-900 hover:text-white hover:shadow-xl transition-all group/btn text-xs"
                                    >
                                        {req.status === 'Done' ? 'รีเซ็ตสถานะ' : 'ขั้นตอนถัดไป'} <ChevronRight size={14} className="ml-1 opacity-50 group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
                                    <Button
                                        onClick={() => deleteMaintenance(req.id)}
                                        variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:bg-white hover:text-rose-600 hover:shadow-lg transition-all"
                                    >
                                        <X size={18} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
