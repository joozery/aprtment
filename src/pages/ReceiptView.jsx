import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft, Send } from 'lucide-react';
import { motion } from 'framer-motion';

// Helper for Thai Baht Text
const thaiBahtText = (amount) => {
    if (!amount) return 'ศูนย์บาทถ้วน';
    const textNum = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
    const textDigit = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

    let bahtText = '';
    const parts = String(parseFloat(amount).toFixed(2)).split('.');
    let intNum = parts[0];
    let decNum = parts[1];

    if (parseInt(intNum) === 0) {
        bahtText = 'ศูนย์บาท';
    } else {
        const len = intNum.length;
        for (let i = 0; i < len; i++) {
            const digit = parseInt(intNum.charAt(i));
            const pos = len - i - 1;
            if (digit !== 0) {
                if (pos === 0 && digit === 1 && len > 1) {
                    bahtText += 'เอ็ด';
                } else if (pos === 1 && digit === 2) {
                    bahtText += 'ยี่';
                } else if (pos === 1 && digit === 1) {
                    // Do nothing
                } else {
                    bahtText += textNum[digit];
                }
                bahtText += textDigit[pos];
            }
        }
        bahtText += 'บาท';
    }

    if (parseInt(decNum) === 0) {
        bahtText += 'ถ้วน';
    } else {
        const len = decNum.length;
        for (let i = 0; i < len; i++) {
            const digit = parseInt(decNum.charAt(i));
            const pos = len - i - 1;
            if (digit !== 0) {
                if (pos === 0 && digit === 1 && len > 1) {
                    bahtText += 'เอ็ด';
                } else if (pos === 1 && digit === 2) {
                    bahtText += 'ยี่';
                } else if (pos === 1 && digit === 1) {
                    // Do nothing
                } else {
                    bahtText += textNum[digit];
                }
                if (i === 0) bahtText += 'สิบ';
            }
        }
        bahtText += 'สตางค์';
    }
    return bahtText;
};

export default function ReceiptView() {
    const { room } = useParams();
    const navigate = useNavigate();
    const { billing, tenants, settings, buildings } = useApp();

    const bill = billing.find(b => b.room === room);
    const tenant = tenants.find(t => t.room === room);

    if (!bill) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h2 className="text-2xl font-bold text-slate-800">ไม่พบข้อมูลบิล</h2>
                <p className="text-slate-500 mt-2">ห้อง {room} ยังไม่มีรายการบิล</p>
                <Button onClick={() => navigate(-1)} className="mt-4">ย้อนกลับ</Button>
            </div>
        );
    }

    const billBuildingId = bill.buildingId || tenant?.buildingId;
    // Normalize both sides to plain string before compare (handles ObjectId objects)
    const billBuildingIdStr = billBuildingId ? String(billBuildingId) : '';
    const targetBuilding = buildings.find(b =>
        billBuildingIdStr && (
            String(b.id) === billBuildingIdStr ||
            String(b._id) === billBuildingIdStr ||
            (b._id && b._id.toString && b._id.toString() === billBuildingIdStr)
        )
    ) || buildings[0] || {};

    const rent = tenant?.rent || settings.defaultRent;
    const waterTotal = bill.water * settings.waterRate;
    const elecTotal = bill.electric * settings.electricRate;
    const commonFee = 150;
    const netTotal = rent + waterTotal + elecTotal + commonFee;

    const today = new Date();
    const printDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${(today.getFullYear() + 543).toString().slice(-2)} ${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`;
    const serviceStart = `01/${(today.getMonth()).toString().padStart(2, '0')}/${(today.getFullYear() + 543).toString().slice(-2)} 00:00`;
    const serviceEnd = `30/${(today.getMonth()).toString().padStart(2, '0')}/${(today.getFullYear() + 543).toString().slice(-2)} 23:59`;

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 font-sans">
            {/* Toolbar */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden"
            >
                <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
                    <ArrowLeft size={16} /> ย้อนกลับ
                </Button>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => window.print()} className="gap-2">
                        <Printer size={16} /> พิมพ์
                    </Button>
                    <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Send size={16} /> ส่งเมล
                    </Button>
                </div>
            </motion.div>

            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
                    @media print {
                        @page { 
                            size: portrait; 
                            margin: 10mm;
                        }
                        body { 
                            background: white !important; 
                            margin: 0; 
                            padding: 0; 
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        .printable-area { 
                            width: 100% !important; 
                            max-width: none !important; 
                            margin: 0 !important; 
                            padding: 10mm !important;
                            background: white !important;
                            box-shadow: none !important;
                            border: none !important;
                            display: block !important;
                            visibility: visible !important;
                        }
                        .no-print, button, nav, aside { display: none !important; }
                    }
                    @media screen {
                        .printable-area {
                            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                        }
                    }
                `}
            </style>

            <div className="printable-area max-w-[210mm] mx-auto bg-white p-12 relative" style={{ fontFamily: "'Sarabun', sans-serif" }}>
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-lg font-bold mb-1">{targetBuilding.name || 'ตวงเงินแมนชั่น'}</h1>
                        <p className="text-xs mb-0.5">{targetBuilding.address || '23/43 ม.9 ต.คลองหนึ่ง อ.คลองหลวง จ.ปทุมธานี 12120'}</p>
                        <p className="text-xs">โทร. {targetBuilding.phone || '099-013-6999'}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-base font-bold mb-0.5">ใบแจ้งหนี้/ใบเสร็จรับเงิน</h2>
                        <p className="text-xs">หน้าที่ 1/1</p>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="flex justify-between items-start mb-4">
                    <div className="w-1/2">
                        <div className="text-sm space-y-1">
                            <div className="flex gap-4">
                                <span className="font-semibold">ชื่อ</span>
                                <span>{tenant?.name || bill.name}</span>
                            </div>
                            <div className="flex gap-4">
                                <span className="font-semibold">ที่อยู่</span>
                                <span>-</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-1/2">
                        <div className="text-sm space-y-1 text-right">
                            <div className="flex justify-end gap-8">
                                <span className="font-semibold">เลขที่</span>
                                <span>0000{room}10</span>
                            </div>
                            <div className="flex justify-end gap-8">
                                <span className="font-semibold">วันที่</span>
                                <span>{printDate}</span>
                            </div>
                            <div className="flex justify-end gap-8">
                                <span className="font-semibold">ห้อง</span>
                                <span>{room}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Service Period */}
                <div className="mb-4 text-sm">
                    <span className="font-semibold mr-2">วันที่เริ่มคิดค่าบริการ</span>
                    <span>{serviceStart} - {serviceEnd}</span>
                </div>

                {/* Table */}
                <table className="w-full border-collapse border border-black text-sm mb-0">
                    <thead>
                        <tr className="border-b border-black">
                            <th className="border-r border-black py-2 px-3 text-center font-semibold">ลำดับ</th>
                            <th className="border-r border-black py-2 px-3 text-left font-semibold">รายการ</th>
                            <th className="border-r border-black py-2 px-3 text-right font-semibold">จำนวน</th>
                            <th className="border-r border-black py-2 px-3 text-right font-semibold">ราคา</th>
                            <th className="border-r border-black py-2 px-3 text-right font-semibold">จำนวนเงิน</th>
                            <th className="py-2 px-3 text-right font-semibold">รวมเงิน</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Room Rent */}
                        <tr>
                            <td className="border-r border-black py-2 px-3 text-center align-top">1</td>
                            <td className="border-r border-black py-2 px-3 align-top">
                                <div className="flex items-baseline gap-2">
                                    <span className="whitespace-nowrap">ค่าห้อง</span>
                                    <span className="text-[10px] text-gray-500 whitespace-nowrap">{serviceStart} - {serviceEnd}</span>
                                </div>
                            </td>
                            <td className="border-r border-black py-2 px-3 text-right align-top">1</td>
                            <td className="border-r border-black py-2 px-3 text-right align-top">{rent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="border-r border-black py-2 px-3 text-right align-top">{rent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="py-2 px-3 text-right align-top">{rent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                        {/* Electric */}
                        <tr>
                            <td className="border-r border-black py-2 px-3 text-center align-top">2</td>
                            <td className="border-r border-black py-2 px-3 align-top">
                                <div className="flex items-baseline gap-2">
                                    <span className="whitespace-nowrap">ค่าไฟ</span>
                                    <span className="text-[10px] text-gray-500 whitespace-nowrap">{(bill.currentElectric !== undefined && bill.electric) ? `${(parseFloat(bill.currentElectric) - bill.electric)} - ${bill.currentElectric}` : ''} &nbsp; {serviceStart} - {serviceEnd}</span>
                                </div>
                            </td>
                            <td className="border-r border-black py-2 px-3 text-right align-top">{bill.electric}</td>
                            <td className="border-r border-black py-2 px-3 text-right align-top">{settings.electricRate.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="border-r border-black py-2 px-3 text-right align-top">{elecTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="py-2 px-3 text-right align-top">{elecTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                        {/* Water */}
                        <tr>
                            <td className="border-r border-black py-2 px-3 text-center align-top">3</td>
                            <td className="border-r border-black py-2 px-3 align-top">
                                <div className="flex items-baseline gap-2">
                                    <span className="whitespace-nowrap">ค่าน้ำ</span>
                                    <span className="text-[10px] text-gray-500 whitespace-nowrap">{(bill.currentWater !== undefined && bill.water) ? `${(parseFloat(bill.currentWater) - bill.water)} - ${bill.currentWater}` : ''} &nbsp; {serviceStart} - {serviceEnd}</span>
                                </div>
                            </td>
                            <td className="border-r border-black py-2 px-3 text-right align-top">{bill.water}</td>
                            <td className="border-r border-black py-2 px-3 text-right align-top">{settings.waterRate.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="border-r border-black py-2 px-3 text-right align-top">{waterTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="py-2 px-3 text-right align-top">{waterTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                        {/* Common Fee */}
                        <tr className="border-b border-black">
                            <td className="border-r border-black py-2 px-3 text-center align-top">4</td>
                            <td className="border-r border-black py-2 px-3 align-top">
                                <div className="font-normal">ค่าส่วนกลาง</div>
                            </td>
                            <td className="border-r border-black py-2 px-3 text-right align-top">1</td>
                            <td className="border-r border-black py-2 px-3 text-right align-top">{commonFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="border-r border-black py-2 px-3 text-right align-top">{commonFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="py-2 px-3 text-right align-top">{commonFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                        {/* Total */}
                        <tr>
                            <td colSpan="4" className="border-r border-black py-2 px-3 font-semibold">
                                <div className="flex items-center justify-between">
                                    <span>ยอดเงินสุทธิ</span>
                                    <span className="text-xs italic text-gray-600 mx-4">* {thaiBahtText(netTotal)} *</span>
                                </div>
                            </td>
                            <td className="border-r border-black py-2 px-3 text-right font-semibold">{netTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="py-2 px-3 text-right font-semibold">{netTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Signatures */}
                <div className="grid grid-cols-3 gap-16 mt-16 text-sm">
                    <div className="text-center">
                        <div className="border-b border-black w-full mx-auto mb-2"></div>
                        <p className="font-semibold">ผู้จัดทำ</p>
                    </div>
                    <div className="text-center">
                        <div className="border-b border-black w-full mx-auto mb-2"></div>
                        <p className="font-semibold">ผู้อนุมัติ</p>
                    </div>
                    <div className="text-center">
                        <div className="border-b border-black w-full mx-auto mb-2"></div>
                        <p className="font-semibold">ผู้รับเงิน</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
