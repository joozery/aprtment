import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';
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
                if (pos === 0 && digit === 1 && len > 1) bahtText += 'เอ็ด';
                else if (pos === 1 && digit === 2) bahtText += 'ยี่';
                else if (pos === 1 && digit === 1) { }
                else bahtText += textNum[digit];
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
                if (pos === 0 && digit === 1 && len > 1) bahtText += 'เอ็ด';
                else if (pos === 1 && digit === 2) bahtText += 'ยี่';
                else if (pos === 1 && digit === 1) { }
                else bahtText += textNum[digit];
                if (i === 0) bahtText += 'สิบ';
            }
        }
        bahtText += 'สตางค์';
    }
    return bahtText;
};

// Single Receipt Component - matches ReceiptView format exactly
const SingleReceipt = ({ bill, tenant, settings, building, isLast }) => {
    const rent = tenant?.rent || settings.defaultRent;
    const waterTotal = bill.water * settings.waterRate;
    const elecTotal = bill.electric * settings.electricRate;
    const commonFee = settings?.serviceFee ?? 150;
    const netTotal = rent + waterTotal + elecTotal + commonFee;

    const today = new Date();
    const printDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${(today.getFullYear() + 543).toString().slice(-2)} ${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`;
    const serviceStart = `01/${(today.getMonth()).toString().padStart(2, '0')}/${(today.getFullYear() + 543).toString().slice(-2)} 00:00`;
    const serviceEnd = `30/${(today.getMonth()).toString().padStart(2, '0')}/${(today.getFullYear() + 543).toString().slice(-2)} 23:59`;

    return (
        <div className={`receipt-page bg-white p-10 ${!isLast ? 'page-break' : ''}`} style={{ fontFamily: "'Sarabun', sans-serif" }}>
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-lg font-bold mb-1">{building?.name || 'ตวงเงินแมนชั่น'}</h1>
                    <p className="text-xs mb-0.5 max-w-[300px] leading-tight text-slate-700">
                        {building?.address || '23/43 ม.9 ต.คลองหนึ่ง อ.คลองหลวง จ.ปทุมธานี 12120'}
                    </p>
                    <p className="text-xs text-slate-700">โทร. {building?.phone || '099-013-6999'}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-base font-bold mb-0.5">ใบเสร็จรับเงิน/ใบแจ้งหนี้</h2>
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
                <div className="w-1/2 flex justify-end">
                    <div className="text-sm space-y-1 w-fit">
                        <div className="grid grid-cols-[60px_120px] items-center">
                            <span className="font-semibold text-left">เลขที่</span>
                            <span className="text-right font-medium">0000{bill.room}10</span>
                        </div>
                        <div className="grid grid-cols-[60px_120px] items-center">
                            <span className="font-semibold text-left">วันที่</span>
                            <span className="text-right font-medium">{printDate}</span>
                        </div>
                        <div className="grid grid-cols-[60px_120px] items-center">
                            <span className="font-semibold text-left">ห้อง</span>
                            <span className="text-right font-medium">{bill.room}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Period */}
            <div className="mb-4 text-sm">
                <span className="font-semibold mr-2">วันที่เริ่มคิดค่าบริการ</span>
                <span>{serviceStart} - {serviceEnd}</span>
            </div>

            {/* Table - no tax column */}
            <table className="w-full border-collapse text-sm mb-0 shadow-none border-none" style={{ border: '1px solid black' }}>
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
                    <tr className="border-b-0">
                        <td className="border-r border-black py-2 px-3 text-center align-top">1</td>
                        <td className="border-r border-black py-2 px-3 align-top">
                            <div className="flex items-baseline gap-2">
                                <span className="whitespace-nowrap">ค่าห้อง</span>
                                <span className="text-sm text-black whitespace-nowrap">{serviceStart} - {serviceEnd}</span>
                            </div>
                        </td>
                        <td className="border-r border-black py-2 px-3 text-right align-top">1</td>
                        <td className="border-r border-black py-2 px-3 text-right align-top">{(rent || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="border-r border-black py-2 px-3 text-right align-top">{(rent || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-2 px-3 text-right align-top">{(rent || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                    {/* Electric */}
                    <tr className="border-b-0">
                        <td className="border-r border-black py-2 px-3 text-center align-top">2</td>
                        <td className="border-r border-black py-2 px-3 align-top">
                            <div className="flex items-baseline gap-2">
                                <span className="whitespace-nowrap">ค่าไฟ</span>
                                <span className="text-sm text-black whitespace-nowrap">{(bill.currentElectric !== undefined && bill.electric) ? `${(parseFloat(bill.currentElectric) - bill.electric)} - ${bill.currentElectric}` : ''} &nbsp; {serviceStart} - {serviceEnd}</span>
                            </div>
                        </td>
                        <td className="border-r border-black py-2 px-3 text-right align-top">{bill.electric}</td>
                        <td className="border-r border-black py-2 px-3 text-right align-top">{(settings?.electricRate || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="border-r border-black py-2 px-3 text-right align-top">{(elecTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-2 px-3 text-right align-top">{(elecTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                    {/* Water */}
                    <tr className="border-b-0">
                        <td className="border-r border-black py-2 px-3 text-center align-top">3</td>
                        <td className="border-r border-black py-2 px-3 align-top">
                            <div className="flex items-baseline gap-2">
                                <span className="whitespace-nowrap">ค่าน้ำ</span>
                                <span className="text-sm text-black whitespace-nowrap">{(bill.currentWater !== undefined && bill.water) ? `${(parseFloat(bill.currentWater) - bill.water)} - ${bill.currentWater}` : ''} &nbsp; {serviceStart} - {serviceEnd}</span>
                            </div>
                        </td>
                        <td className="border-r border-black py-2 px-3 text-right align-top">{bill.water}</td>
                        <td className="border-r border-black py-2 px-3 text-right align-top">{(settings?.waterRate || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="border-r border-black py-2 px-3 text-right align-top">{(waterTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-2 px-3 text-right align-top">{(waterTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                    {/* Common Fee */}
                    <tr className="border-b-0 h-[100px]">
                        <td className="border-r border-black py-2 px-3 text-center align-top">4</td>
                        <td className="border-r border-black py-2 px-3 align-top">
                            <div className="font-normal">ค่าส่วนกลาง</div>
                        </td>
                        <td className="border-r border-black py-2 px-3 text-right align-top">1</td>
                        <td className="border-r border-black py-2 px-3 text-right align-top">{(commonFee || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="border-r border-black py-2 px-3 text-right align-top">{(commonFee || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-2 px-3 text-right align-top">{(commonFee || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                    {/* Total */}
                    <tr className="total-row border-t border-black">
                        <td colSpan="4" className="border-r border-black py-2 px-3 font-semibold">
                            <div className="flex items-center">
                                <span className="whitespace-nowrap">ยอดเงินสุทธิ</span>
                                <span className="flex-1 text-center text-sm text-black">( * {thaiBahtText(netTotal)} * )</span>
                            </div>
                        </td>
                        <td className="border-r border-black py-2 px-3 text-right font-semibold">{(netTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-2 px-3 text-right font-semibold">{(netTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
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
    );
};

export default function BulkReceipts() {
    const { buildingId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { billing, tenants, buildings, settings } = useApp();

    // Support all-bills mode via query param ?all=true
    const isAll = new URLSearchParams(location.search).get('all') === 'true';
    const monthParam = new URLSearchParams(location.search).get('month');

    // Filter bills by building OR all buildings
    let buildingBills;
    let building = null;

    if (isAll) {
        // All bills — optionally filter by month label
        buildingBills = billing.filter(b => b.status !== 'ยังไม่ออกบิล');
        if (monthParam) {
            const getMonthLabel = (d) => d ? new Date(d).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' }) : '';
            buildingBills = buildingBills.filter(b => getMonthLabel(b.createdAt) === monthParam);
        }
        // Deduplicate by room — latest only
        const latestByRoom = {};
        buildingBills.forEach(b => {
            if (!latestByRoom[b.room] || new Date(b.createdAt) > new Date(latestByRoom[b.room].createdAt)) {
                latestByRoom[b.room] = b;
            }
        });
        buildingBills = Object.values(latestByRoom).sort((a, b) =>
            String(a.room).localeCompare(String(b.room), undefined, { numeric: true })
        );
    } else {
        // Per-building filter — fix ObjectId string comparison
        const buildingIdStr = String(buildingId);
        buildingBills = billing.filter(b =>
            String(b.buildingId) === buildingIdStr && b.status !== 'ยังไม่ออกบิล'
        );
        // Deduplicate
        const latestByRoom = {};
        buildingBills.forEach(b => {
            if (!latestByRoom[b.room] || new Date(b.createdAt) > new Date(latestByRoom[b.room].createdAt)) {
                latestByRoom[b.room] = b;
            }
        });
        buildingBills = Object.values(latestByRoom).sort((a, b) =>
            String(a.room).localeCompare(String(b.room), undefined, { numeric: true })
        );
        building = buildings.find(b =>
            String(b.id) === buildingIdStr ||
            String(b._id) === buildingIdStr
        ) || null;
    }

    if (buildingBills.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
                <h2 className="text-2xl font-bold text-slate-800">ไม่พบข้อมูลใบเสร็จ</h2>
                <p className="text-slate-500 mt-2">ยังไม่มีรายการบิลที่ออกแล้ว</p>
                <Button onClick={() => navigate(-1)} className="mt-4">ย้อนกลับ</Button>
            </div>
        );
    }

    const title = isAll ? `ใบเสร็จทั้งหมด${monthParam ? ` — ${monthParam}` : ''}` : (building?.name || 'พิมพ์ใบเสร็จ');

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4 font-sans">
            {/* Toolbar */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-[240mm] mx-auto mb-6 flex justify-between items-center print:hidden"
            >
                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
                        <ArrowLeft size={16} /> ย้อนกลับ
                    </Button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800">{title}</h1>
                        <p className="text-xs text-slate-500">{buildingBills.length} ใบเสร็จ</p>
                    </div>
                </div>
                <Button onClick={() => window.print()} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Printer size={16} /> พิมพ์ทั้งหมด ({buildingBills.length} ใบ)
                </Button>
            </motion.div>

            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
                    @media print {
                        @page { 
                            size: auto !important; 
                            margin: 10mm !important; 
                        }
                        table, th, td, tr {
                            color: black !important;
                        }
                        table {
                            border: 1px solid black !important;
                            border-collapse: collapse !important;
                        }
                        thead tr, thead th {
                            border-bottom: 1px solid black !important;
                        }
                        th, td {
                            border-right: 1px solid black !important;
                        }
                        tbody tr, tbody td {
                            border-bottom: none !important;
                        }
                        .total-row, .total-row td {
                            border-top: 1px solid black !important;
                        }
                        th:last-child, td:last-child {
                            border-right: none !important;
                        }
                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            font-family: 'Sarabun', sans-serif !important;
                        }
                        body { 
                            background: white !important; 
                            margin: 0 !important; 
                            padding: 0 !important; 
                        }
                        .receipt-page {
                            background: white !important;
                            padding: 10mm !important;
                        }
                        .page-break { 
                            page-break-after: always; 
                        }
                        .no-print, button, nav, aside { display: none !important; }
                    }
                    @media screen {
                        .receipt-page {
                            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
                        }
                    }
                `}
            </style>

            {/* All Receipts */}
            <div className="space-y-6 print:space-y-0 max-w-[240mm] mx-auto">
                {buildingBills.map((bill, index) => {
                    const billBuildingIdStr = String(bill.buildingId);
                    const billBuilding = building || buildings.find(b =>
                        String(b.id) === billBuildingIdStr || String(b._id) === billBuildingIdStr
                    ) || buildings[0];
                    const tenant = tenants.find(t => t.room === bill.room);
                    return (
                        <SingleReceipt
                            key={`${bill.room}-${bill._id || index}`}
                            bill={bill}
                            tenant={tenant}
                            settings={settings}
                            building={billBuilding}
                            isLast={index === buildingBills.length - 1}
                        />
                    );
                })}
            </div>
        </div>
    );
}
