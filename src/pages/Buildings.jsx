import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Plus, Pencil, Trash2, Home, FileUp, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Buildings() {
    const { buildings, addBuilding, updateBuilding, deleteBuilding, bulkImportTenants, clearBuildingData } = useApp();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [importData, setImportData] = useState('');
    const [selectedBuildingId, setSelectedBuildingId] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [editingBuilding, setEditingBuilding] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        prefix: '',
        floors: 4,
        roomsPerFloor: 8,
        defaultRent: 4500,
        address: '',
        taxId: ''
    });

    const handleImport = async () => {
        if (!selectedBuildingId || !importData) {
            alert('กรุณาเลือกตึกและระบุข้อมูลที่จะนำเข้า');
            return;
        }

        setIsImporting(true);
        try {
            const lines = importData.trim().split('\n');
            const tenantsData = lines.map((line, index) => {
                const cleanLine = line.trim();
                if (!cleanLine) return null;

                // 1. Try TAB split (Preserves names with single spaces)
                let cells = cleanLine.split('\t').map(c => c.trim()); // Do NOT filter empty strings here (prevents column shift)
                
                // 2. If TAB failed (only 1 or 2 parts), try flexible split from the RIGHT
                if (cells.length < 5) {
                    const parts = cleanLine.split(/\s+/).filter(p => p.trim());
                    if (parts.length >= 6) {
                        const room = parts[0];
                        // Extract numeric columns from RIGHT
                        const waterPrev = parts[parts.length - 2]; 
                        const elecPrev = parts[parts.length - 4];  
                        const rent = parts[parts.length - 5];
                        const nameAndNationality = parts.slice(1, parts.length - 5).join(' ');
                        
                        return {
                            room,
                            name: nameAndNationality,
                            rent: parseFloat(rent?.replace(/[^0-9.]/g, '')) || 0,
                            lastElectricMeter: parseFloat(elecPrev?.replace(/[^0-9.]/g, '')) || 0,
                            lastWaterMeter: parseFloat(waterPrev?.replace(/[^0-9.]/g, '')) || 0
                        };
                    }
                    return null;
                }

                // 3. Tab Case mapping (Exact 8 columns): 1101, Name, Nationality, Rent, ElecPrev, ElecCurr, WaterPrev, WaterCurr
                return {
                    room: cells[0],
                    name: cells[1],
                    nationality: cells[2] || '',
                    rent: parseFloat(cells[3]?.replace(/[^0-9.]/g, '')) || 0,
                    lastElectricMeter: parseFloat(cells[4]?.replace(/[^0-9.]/g, '')) || 0, // Using ElecPrev
                    lastWaterMeter: parseFloat(cells[6]?.replace(/[^0-9.]/g, '')) || 0  // Using WaterPrev
                };
            }).filter(item => item !== null && item.room);

            if (tenantsData.length === 0) {
                alert('ไม่พบข้อมูลที่จัดรูปแบบถูกต้อง (ตรวจสอบการวางข้อมูลให้นำหน้าด้วยเลขห้อง)');
                setIsImporting(false);
                return;
            }

            if (!window.confirm(`ระบบตรวจพบข้อมูลทั้งหมด ${tenantsData.length} รายการ\nคุณต้องการนำเข้าข้อมูลนี้ใช่หรือไม่?`)) {
                setIsImporting(false);
                return;
            }

            const result = await bulkImportTenants(selectedBuildingId, tenantsData);
            if (result.success) {
                alert(`นำเข้าสำเร็จทั้งหมด: ${result.data.success} รายการ`);
                setIsImportOpen(false);
                setImportData('');
            } else {
                alert('เกิดข้อผิดพลาด: ' + result.error);
            }
        } catch (err) {
            alert('ข้อผิดพลาด: ' + err.message);
        } finally {
            setIsImporting(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingBuilding) {
            updateBuilding(editingBuilding.id, formData);
        } else {
            addBuilding(formData);
        }
        resetForm();
    };

    const resetForm = () => {
        setFormData({ name: '', prefix: '', floors: 4, roomsPerFloor: 8, defaultRent: 4500, address: '', taxId: '' });
        setEditingBuilding(null);
        setIsDialogOpen(false);
    };

    const handleEdit = (building) => {
        setEditingBuilding(building);
        setFormData({
            name: building.name,
            prefix: building.prefix || '',
            floors: building.floors,
            roomsPerFloor: building.roomsPerFloor,
            defaultRent: building.defaultRent,
            address: building.address || '',
            taxId: building.taxId || ''
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (id) => {
        if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบตึกนี้? ข้อมูลห้องพักและผู้เช่าจะยังคงอยู่')) {
            deleteBuilding(id);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">จัดการตึก</h2>
                    <p className="text-slate-500 mt-1">เพิ่ม แก้ไข หรือลบตึกในระบบ</p>
                </div>
                    <div className="flex gap-2">
                        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                                    <FileUp size={16} className="mr-2" />
                                    นำเข้าข้อมูล
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>นำเข้าข้อมูลผู้เช่าและเริ่มสัญญา</DialogTitle>
                                    <DialogDescription>
                                        ก๊อปปี้ข้อมูลจาก Excel มาวางที่นี่ (เรียงคอลัมน์: ห้อง, ชื่อ, สัญชาติ, ค่าเช่า, ไฟเก่า, น้ำเก่า)
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label>เลือกตึกที่จะนำเข้า</Label>
                                        <select
                                            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                            value={selectedBuildingId}
                                            onChange={(e) => setSelectedBuildingId(e.target.value)}
                                        >
                                            <option value="">เลือกตึก...</option>
                                            {buildings.map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>วางข้อมูล (Excel/CSV)</Label>
                                        <textarea
                                            value={importData}
                                            onChange={(e) => setImportData(e.target.value)}
                                            placeholder="101	สุรศักดิ์ ใจกล้า	ไทย	4500	1250	4500"
                                            className="flex min-h-[300px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-mono placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsImportOpen(false)}>ยกเลิก</Button>
                                    <Button
                                        onClick={handleImport}
                                        disabled={isImporting}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        {isImporting ? 'กำลังนำเข้า...' : 'นำเข้าตอนนี้'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                    <Plus size={16} className="mr-2" />
                                    เพิ่มตึกใหม่
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <form onSubmit={handleSubmit}>
                                    <DialogHeader>
                                        <DialogTitle>{editingBuilding ? 'แก้ไขตึก' : 'เพิ่มตึกใหม่'}</DialogTitle>
                                        <DialogDescription>
                                            กรอกข้อมูลตึกที่ต้องการ{editingBuilding ? 'แก้ไข' : 'เพิ่ม'}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">ชื่อตึก</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="เช่น ตึก 1, อาคาร A"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="prefix">เลขนำหน้าห้อง (เช่น A, B หรือเลข 1)</Label>
                                            <Input
                                                id="prefix"
                                                value={formData.prefix}
                                                onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                                                placeholder="ถ้าว่างจะใช้ลำดับตึกเป็นหลัก"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="floors">จำนวนชั้น</Label>
                                                <Input
                                                    id="floors"
                                                    type="number"
                                                    min="1"
                                                    value={formData.floors}
                                                    onChange={(e) => setFormData({ ...formData, floors: parseInt(e.target.value) })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="roomsPerFloor">ห้องต่อชั้น</Label>
                                                <Input
                                                    id="roomsPerFloor"
                                                    type="number"
                                                    min="1"
                                                    value={formData.roomsPerFloor}
                                                    onChange={(e) => setFormData({ ...formData, roomsPerFloor: parseInt(e.target.value) })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="defaultRent">ค่าเช่เริ่มต้น (บาท/เดือน)</Label>
                                            <Input
                                                id="defaultRent"
                                                type="number"
                                                min="0"
                                                step="100"
                                                value={formData.defaultRent}
                                                onChange={(e) => setFormData({ ...formData, defaultRent: parseInt(e.target.value) })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="address">ที่อยู่ตึก (ใช้พิมพ์ในบิล)</Label>
                                            <textarea
                                                id="address"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                placeholder="เลขที่ หมู่ ซอย ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                                                className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="taxId">เลขประจำตัวผู้เสียภาษี</Label>
                                            <Input
                                                id="taxId"
                                                value={formData.taxId}
                                                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                                placeholder="เช่น 01055xxxxxxxx"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={resetForm}>
                                            ยกเลิก
                                        </Button>
                                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                                            {editingBuilding ? 'บันทึก' : 'เพิ่มตึก'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
            </div>

            {/* Buildings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {buildings.map((building, index) => (
                    <motion.div
                        key={building.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                                            <Building2 className="text-indigo-600" size={24} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{building.name}</CardTitle>
                                            <CardDescription className="text-xs mt-1 flex flex-col gap-1">
                                                <span>{building.floors * building.roomsPerFloor} ห้องทั้งหมด</span>
                                                <span className="text-indigo-600 font-bold bg-indigo-50 w-fit px-2 py-0.5 rounded">Prefix: {building.prefix || (index + 1)}</span>
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8"
                                            onClick={() => handleEdit(building)}
                                        >
                                            <Pencil size={14} className="text-slate-600" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8"
                                            title="รีเซ็ตข้อมูลตึก"
                                            onClick={() => {
                                                if (window.confirm(`คุณแน่ใจหรือไม่ที่จะล้างข้อมูลผู้เช่าและห้องพักทั้งหมดใน ${building.name}? ข้อมูลจะถูกลบและไม่สามารถกู้คืนได้`)) {
                                                    clearBuildingData(building.id).then(res => {
                                                        if (res.success) alert('ล้างข้อมูลสำเร็จ');
                                                        else alert('เกิดข้อผิดพลาด: ' + res.error);
                                                    });
                                                }
                                            }}
                                        >
                                            <RotateCcw size={14} className="text-amber-600" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8"
                                            onClick={() => handleDelete(building.id)}
                                        >
                                            <Trash2 size={14} className="text-rose-600" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <p className="text-slate-500 text-xs mb-1">จำนวนชั้น</p>
                                        <p className="font-bold text-slate-800">{building.floors} ชั้น</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <p className="text-slate-500 text-xs mb-1">ห้องต่อชั้น</p>
                                        <p className="font-bold text-slate-800">{building.roomsPerFloor} ห้อง</p>
                                    </div>
                                </div>
                                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-indigo-700 font-medium">ค่าเช่าเริ่มต้น</span>
                                        <span className="font-bold text-indigo-900">
                                            ฿{building.defaultRent.toLocaleString()}
                                        </span>
                                    </div>
                                    {(building.address || building.taxId) && (
                                        <div className="mt-3 pt-3 border-t border-indigo-100/50">
                                            {building.taxId && <p className="text-[10px] text-indigo-600 mb-1"><span className="font-bold">TAX ID:</span> {building.taxId}</p>}
                                            {building.address && <p className="text-[10px] text-indigo-700/70 truncate line-clamp-2 leading-tight" title={building.address}>{building.address}</p>}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {buildings.length === 0 && (
                <div className="text-center py-12">
                    <Home className="mx-auto text-slate-300" size={64} />
                    <h3 className="mt-4 text-lg font-semibold text-slate-800">ยังไม่มีตึกในระบบ</h3>
                    <p className="text-slate-500 mt-2">เริ่มต้นโดยการเพิ่มตึกแรกของคุณ</p>
                </div>
            )}
        </div>
    );
}
