import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function MeterSummaryReport() {
    const navigate = useNavigate();
    const location = useLocation();
    const { billing, tenants, settings, buildings, meters } = useApp();

    // Get filter from query params or state
    const queryParams = new URLSearchParams(location.search);
    const monthFilter = queryParams.get('month') || 'current';
    const buildingFilter = queryParams.get('building') || 'all';

    const baseData = monthFilter === 'current' ? tenants : billing;

    const filteredData = baseData.filter(item => {
        const matchesBuilding = buildingFilter === 'all' || String(item.buildingId) === buildingFilter;
        if (monthFilter !== 'current') {
            const getMonthLabel = (isoDate) => {
                if (!isoDate) return '-';
                return new Date(isoDate).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
            };
            return matchesBuilding && getMonthLabel(item.createdAt) === monthFilter;
        }
        return matchesBuilding;
    }).sort((a, b) => String(a.room).localeCompare(String(b.room), undefined, { numeric: true }));

    const today = new Date();
    const printDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${(today.getFullYear() + 543)} ${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}:${today.getSeconds().toString().padStart(2, '0')}`;

    return (
        <div className="min-h-screen bg-white py-8 px-4 font-sans printable-area">
            {/* Toolbar */}
            <div className="max-w-[1200px] mx-auto mb-8 flex justify-between items-center no-print">
                <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
                    <ArrowLeft size={16} /> กลับไปหน้าจัดเก็บเงิน
                </Button>
                <Button onClick={() => window.print()} className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
                    <Printer size={16} /> พิมพ์เอกสารนี้
                </Button>
            </div>

            {/* Document Content */}
            <div className="max-w-[1100px] mx-auto p-4 sm:p-8 border border-slate-100 rounded-xl shadow-sm print:border-none print:shadow-none bg-white">
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">สรุปค่าน้ำ,ค่าไฟ</h1>
                        <p className="text-sm font-medium text-slate-600">วันเวลาที่พิมพ์ : {printDate}</p>
                        <p className="text-sm font-medium text-slate-600">ข้อมูลรอบบิล: {monthFilter === 'current' ? 'ปัจจุบัน' : monthFilter}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold text-slate-900">ตวงเงิน แมนชั่น</h2>
                        <p className="text-sm text-slate-500 mt-1">สรุปข้อมูลมิเตอร์รายห้อง</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table className="w-full text-xs border-collapse border-2 border-black">
                        <TableHeader>
                            <TableRow className="border-b-2 border-black bg-slate-50/50">
                                <TableHead className="font-bold text-black border-r-2 border-black py-2 px-1 text-center">หมายเลข</TableHead>
                                <TableHead className="font-bold text-black border-r-2 border-black py-2 px-2 min-w-[150px]">ชื่อ-สกุล</TableHead>
                                <TableHead className="font-bold text-black border-r-2 border-black text-center py-2 px-1">มิเตอร์ไฟ</TableHead>
                                <TableHead className="font-bold text-black border-r-2 border-black text-right py-2 px-1">จำนวนไฟ</TableHead>
                                <TableHead className="font-bold text-black border-r-2 border-black text-right py-2 px-1">ค่าไฟ</TableHead>
                                <TableHead className="font-bold text-black border-r-2 border-black text-center py-2 px-1">มิเตอร์น้ำ</TableHead>
                                <TableHead className="font-bold text-black border-r-2 border-black text-right py-2 px-1">จำนวนน้ำ</TableHead>
                                <TableHead className="font-bold text-black text-right py-2 px-1">ค่าน้ำ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-60 text-center text-slate-400">
                                        ไม่พบข้อมูลในรอบนี้
                                    </TableCell>
                                </TableRow>
                            ) : filteredData.map((item) => {
                                const isCurrent = monthFilter === 'current';

                                let prevElec, currElec, elecUnits, elecCost;
                                let prevWater, currWater, waterUnits, waterCost;

                                if (isCurrent) {
                                    prevElec = item.lastElectricMeter || 0;
                                    currElec = (meters.electric && meters.electric[item.room] !== undefined && meters.electric[item.room] !== '')
                                        ? parseFloat(meters.electric[item.room])
                                        : prevElec;
                                    elecUnits = Math.max(0, currElec - prevElec);
                                    elecCost = Math.max(elecUnits * (settings?.electricRate || 11), settings?.electricMin ?? 200);

                                    prevWater = item.lastWaterMeter || 0;
                                    currWater = (meters.water && meters.water[item.room] !== undefined && meters.water[item.room] !== '')
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
                                    <TableRow key={item.room} className="border-b-2 border-black hover:bg-transparent">
                                        <TableCell className="font-bold text-black border-r-2 border-black py-2 px-1 text-center">{item.room}</TableCell>
                                        <TableCell className="font-medium text-black border-r-2 border-black py-2 px-2">{item.name}</TableCell>

                                        <TableCell className="text-center font-medium text-slate-600 border-r-2 border-black py-2 px-1 whitespace-nowrap">
                                            {prevElec === '-' ? '-' : String(prevElec).padStart(4, '0')} - {currElec === '-' ? '-' : String(currElec).padStart(4, '0')}
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-black border-r-2 border-black py-2 px-1">
                                            {elecUnits}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-black border-r-2 border-black py-2 px-1">
                                            {elecCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </TableCell>

                                        <TableCell className="text-center font-medium text-slate-600 border-r-2 border-black py-2 px-1 whitespace-nowrap">
                                            {prevWater === '-' ? '-' : String(prevWater).padStart(4, '0')} - {currWater === '-' ? '-' : String(currWater).padStart(4, '0')}
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-black border-r-2 border-black py-2 px-1">
                                            {waterUnits}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-black py-2 px-1">
                                            {waterCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
                
                <div className="mt-12 text-sm text-slate-400 no-print text-center italic">
                    * รูปแบบเอกสารนี้จัดทำขึ้นเพื่อแสดงตัวอย่างก่อนพิมพ์จริง *
                </div>
            </div>
        </div>
    );
}
