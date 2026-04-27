import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';

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

// Single Receipt Component (Original Simple UI)
const SingleReceipt = ({ bill, tenant, settings, building, format }) => {
    const isFull = format === 'full';
    const isCompact = format === 'compact';
    const rent = tenant?.rent || settings.defaultRent;
    const waterTotal = bill.water * settings.waterRate;
    const elecTotal = bill.electric * settings.electricRate;
    const commonFee = settings?.serviceFee ?? 150;
    const netTotal = rent + waterTotal + elecTotal + commonFee;

    const today = new Date();
    const printDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${(today.getFullYear() + 543).toString().slice(-2)} ${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`;
    
    // Rent Period (Next Month)
    const serviceStart = bill.dateStart || `01/${(today.getMonth() + 2).toString().padStart(2, '0')}/${(today.getFullYear() + 543).toString().slice(-2)} 00:00`;
    const serviceEnd = bill.dateEnd || `${new Date(today.getFullYear(), today.getMonth() + 2, 0).getDate()}/${(today.getMonth() + 2).toString().padStart(2, '0')}/${(today.getFullYear() + 543).toString().slice(-2)} 23:59`;

    // Utility Period (Current Month)
    const utilityPeriodStart = bill.meterPeriodStart || `01/${(today.getMonth() + 1).toString().padStart(2, '0')}/${(today.getFullYear() + 543).toString().slice(-2)} 00:00`;
    const utilityPeriodEnd = bill.meterPeriodEnd || `${new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${(today.getFullYear() + 543).toString().slice(-2)} 23:59`;

    return (
        <div className="receipt-page bg-white" style={{ fontFamily: "'Sarabun', sans-serif" }}>
            {/* Header */}
            <div className={`flex justify-between items-start ${isFull ? 'mb-12' : isCompact ? 'mb-3' : 'mb-8'}`}>
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
            <div className={`flex justify-between items-start ${isCompact ? 'mb-2' : 'mb-4'}`}>
                <div className="w-1/2">
                    <div className={`${isCompact ? 'text-xs' : 'text-sm'} space-y-1`}>
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
                    <div className={`${isCompact ? 'text-xs' : 'text-sm'} space-y-0.5 w-fit`}>
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
                            <span className="text-right font-medium font-bold text-lg">{bill.room}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Period */}
            <div className={`${isCompact ? 'mb-1 text-[11px]' : 'mb-4 text-sm'}`}>
                <span className="font-semibold mr-2">วันที่เริ่มคิดค่าบริการ</span>
                <span>{utilityPeriodStart} - {utilityPeriodEnd}</span>
            </div>

            {/* Table */}
            <table className={`w-full border-collapse border border-black ${isCompact ? 'text-[11px]' : 'text-sm'} mb-0`}>
                <thead>
                    <tr className="border-b border-black">
                        <th className={`border-r border-black ${isCompact ? 'py-1 px-2' : 'py-2 px-3'} text-center font-semibold`}>ลำดับ</th>
                        <th className={`border-r border-black ${isCompact ? 'py-1 px-2' : 'py-2 px-3'} text-left font-semibold`}>รายการ</th>
                        <th className={`border-r border-black ${isCompact ? 'py-1 px-2' : 'py-2 px-3'} text-right font-semibold`}>จำนวน</th>
                        <th className={`border-r border-black ${isCompact ? 'py-1 px-2' : 'py-2 px-3'} text-right font-semibold`}>ราคา</th>
                        <th className={`border-r border-black ${isCompact ? 'py-1 px-2' : 'py-2 px-3'} text-right font-semibold`}>จำนวนเงิน</th>
                        <th className={`${isCompact ? 'py-1 px-2' : 'py-2 px-3'} text-right font-semibold`}>รวมเงิน</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Room Rent */}
                    <tr className="border-b border-black">
                        <td className={`border-r border-black ${isCompact ? 'py-1 px-2' : 'py-2 px-3'} text-center align-top`}>1</td>
                        <td className={`border-r border-black ${isCompact ? 'py-1 px-2' : 'py-2 px-3'} align-top`}>
                            <div className="flex items-baseline gap-2">
                                <span className="whitespace-nowrap font-bold">ค่าห้อง</span>
                                <span className={`${isCompact ? 'text-[10px]' : 'text-sm'} text-black whitespace-nowrap`}>{serviceStart} - {serviceEnd}</span>
                            </div>
                        </td>
                        <td className={`border-r border-black ${isCompact ? 'py-1 px-2' : 'py-2 px-3'} text-right align-top`}>1</td>
                        <td className={`border-r border-black ${isCompact ? 'py-1 px-2' : 'py-2 px-3'} text-right align-top`}>{(rent || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className={`border-r border-black ${isCompact ? 'py-1 px-2' : 'py-2 px-3'} text-right align-top`}>{(rent || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className={`${isCompact ? 'py-1 px-2' : 'py-2 px-3'} text-right align-top`}>{(rent || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                    {/* Electric */}
                    <tr className="border-b border-black">
                        <td className={`border-r border-black ${isCompact ? 'py-1 px-2' : 'py-2 px-3'} text-center align-top`}>2</td>
                        <td className={`border-r border-black ${isCompact ? 'py-1 px-2' : 'py-2 px-3'} align-top`}>
                            <div className="flex items-baseline gap-2">
                                <span className="whitespace-nowrap font-bold">ค่าไฟ</span>
                                <span className={`${isCompact ? 'text-[10px]' : 'text-sm'} text-black whitespace-nowrap`}>{(bill.currentElectric !== undefined && bill.electric) ? `${(parseFloat(bill.currentElectric) - bill.electric).toLocaleString()} - ${parseFloat(bill.currentElectric).toLocaleString()}` : ''} &nbsp; {utilityPeriodStart} - {utilityPeriodEnd}</span>
                            </div>
                        </td>
                        <td className={`border-r border-black ${isCompact ? 'py-1 px-2' : 'py-2 px-3'} text-right align-top`}>{bill.electric}</td>
                        <td className={`border-r border-black ${isCompact ? 'py-1 px-2' : 'py-2 px-3'} text-right align-top`}>{(settings?.electricRate || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className={`border-r border-black ${isCompact ? 'py-1 px-2' : 'py-2 px-3'} text-right align-top`}>{(elecTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className={`${isCompact ? 'py-1 px-2' : 'py-2 px-3'} text-right align-top`}>{(elecTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                    {/* Water */}
                    <tr className="border-b border-black">
                        <td className={`border-r border-black ${isCompact ? 'py-1 px-2' : 'py-2 px-3'} text-center align-top`}>3</td>
                        <td className={`border-r border-black ${isCompact ? 'py-1 px-2' : 'py-2 px-3'} align-top`}>
                            <div className="flex items-baseline gap-2">
                                <span className="whitespace-nowrap font-bold">ค่าน้ำ</span>
                                <span className={`${isCompact ? 'text-[10px]' : 'text-sm'} text-black whitespace-nowrap`}>{(bill.currentWater !== undefined && bill.water) ? `${(parseFloat(bill.currentWater) - bill.water).toLocaleString()} - ${parseFloat(bill.currentWater).toLocaleString()}` : ''} &nbsp; {utilityPeriodStart} - {utilityPeriodEnd}</span>
                            </div>
                        </td>
                        <td className={`border-r border-black ${isCompact ? 'py-1 px-2' : 'py-2 px-3'} text-right align-top`}>{bill.water}</td>
                        <td className={`border-r border-black ${isCompact ? 'py-1 px-2' : 'py-2 px-3'} text-right align-top`}>{(settings?.waterRate || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className={`border-r border-black ${isCompact ? 'py-1 px-2' : 'py-2 px-3'} text-right align-top`}>{(waterTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className={`${isCompact ? 'py-1 px-2' : 'py-2 px-3'} text-right align-top`}>{(waterTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                    {/* Common Fee */}
                    <tr className="border-b border-black h-auto">
                        <td className={`border-r border-black ${isCompact ? 'py-1 px-2' : 'py-2 px-3'} text-center align-top`}>4</td>
                        <td className={`border-r border-black ${isCompact ? 'py-1 px-2' : 'py-2 px-3'} align-top`}>
                            <div className="font-bold">ค่าส่วนกลาง</div>
                        </td>
                        <td className={`border-r border-black ${isCompact ? 'py-1 px-2' : 'py-2 px-3'} text-right align-top`}>1</td>
                        <td className={`border-r border-black ${isCompact ? 'py-1 px-2' : 'py-2 px-3'} text-right align-top`}>{(commonFee || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className={`border-r border-black ${isCompact ? 'py-1 px-2' : 'py-2 px-3'} text-right align-top`}>{(commonFee || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className={`${isCompact ? 'py-1 px-2' : 'py-2 px-3'} text-right align-top`}>{(commonFee || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                    {/* Total */}
                    <tr className="total-row">
                        <td colSpan="4" className="border-r border-black py-2 px-3 font-semibold">
                            <div className="flex items-center justify-between">
                                <span className="whitespace-nowrap">ยอดเงินสุทธิ</span>
                                <span className={`${isCompact ? 'text-[10px]' : 'text-sm'} text-black text-center font-bold`}>( * {thaiBahtText(netTotal)} * )</span>
                            </div>
                        </td>
                        <td className="border-r border-black py-2 px-3 text-right font-bold" colSpan="2">
                            {netTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Signatures */}
            <div className={`grid grid-cols-3 ${isCompact ? 'gap-4 mt-4 text-sm' : 'gap-16 mt-6 text-sm'}`}>
                <div className="text-center">
                    <div className="border-b border-black w-full mx-auto mb-1 mt-6"></div>
                    <p className="font-semibold">ผู้จัดทำ</p>
                </div>
                <div className="text-center">
                    <div className="border-b border-black w-full mx-auto mb-1 mt-6"></div>
                    <p className="font-semibold">ผู้อนุมัติ</p>
                </div>
                <div className="text-center">
                    <div className="border-b border-black w-full mx-auto mb-1 mt-6"></div>
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
    const [printFormat, setPrintFormat] = useState('half'); // 'full', 'half', or 'compact'

    const isAll = new URLSearchParams(location.search).get('all') === 'true';
    const monthParam = new URLSearchParams(location.search).get('month');
    const idsParam = new URLSearchParams(location.search).get('ids');

    let buildingBills;
    let building = null;

    if (idsParam) {
        const selectedIds = idsParam.split(',');
        buildingBills = billing.filter(b => 
            selectedIds.includes(String(b._id)) || selectedIds.includes(String(b.id))
        );
    } else if (isAll) {
        buildingBills = billing.filter(b => b.status !== 'ยังไม่ออกบิล');
        if (monthParam) {
            const getMonthLabel = (d) => d ? new Date(d).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' }) : '';
            buildingBills = buildingBills.filter(b => getMonthLabel(b.createdAt) === monthParam);
        }
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
        const buildingIdStr = String(buildingId);
        buildingBills = billing.filter(b =>
            String(b.buildingId) === buildingIdStr && b.status !== 'ยังไม่ออกบิล'
        );
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
                <Button onClick={() => navigate(-1)} className="mt-4">ย้อนกลับ</Button>
            </div>
        );
    }

    const title = isAll ? `ใบเสร็จทั้งหมด${monthParam ? ` — ${monthParam}` : ''}` : (building?.name || 'พิมพ์ใบเสร็จ');

    return (
        <div className="min-h-screen bg-gray-200 py-6 px-4 font-sans print:p-0 print:bg-white">
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
                    
                    @media print {
                        @page { 
                            size: A4;
                            margin: 0 !important;
                        }
                        
                        /* Aggressive override for global index.css rules */
                        body, html, #root, #root > div, main, main > div, .min-h-screen, 
                        .printable-area, .printable-area *, .receipt-page, .receipt-page * {
                            visibility: visible !important;
                            opacity: 1 !important;
                        }

                        /* Force block display ONLY for main layout containers, but NOT for table elements */
                        html, body, #root, #root > div, main, main > div, .min-h-screen, .printable-area, .a4-page-preview {
                            display: block !important;
                            background: white !important;
                        }

                        /* Reset all parent containers */
                        html, body, #root, #root > div, main, main > div, .min-h-screen {
                            margin: 0 !important;
                            padding: 0 !important;
                            height: auto !important;
                            min-height: 0 !important;
                            overflow: visible !important;
                        }

                        .a4-page-preview {
                            visibility: visible !important;
                            display: block !important;
                            width: 210mm !important;
                            height: 296mm !important; /* Lock height and slightly reduce */
                            margin: 0 !important;
                            padding: 0 !important;
                            box-shadow: none !important;
                            border: none !important;
                            page-break-after: always !important;
                            break-after: page !important;
                            position: relative !important;
                            background: white !important;
                            overflow: hidden !important; /* CRITICAL: Prevent sub-pixel overflow to next page */
                        }

                        /* Don't break after the very last page */
                        .printable-area > .a4-page-preview:last-child {
                            page-break-after: avoid !important;
                            break-after: auto !important;
                        }

                        .receipt-page {
                            visibility: visible !important;
                            display: block !important;
                            background: white !important;
                            overflow: hidden !important;
                            page-break-after: avoid !important; /* Prevent individual receipts from breaking */
                            break-after: avoid !important;
                        }

                        .print\\:hidden, .no-print, button, nav, aside, header, footer, .toolbar-container { 
                            display: none !important;
                            visibility: hidden !important;
                        }

                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                    }

                    @media screen {
                        .receipt-page {
                            margin-bottom: 0;
                            border: none;
                        }
                        .receipt-separator { 
                            display: block !important; 
                            border-top: 1px dashed #bbb !important;
                        }
                        .a4-page-preview {
                            background: white;
                            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                            margin: 0 auto 40px auto;
                            width: 210mm;
                            min-height: 297mm;
                            position: relative;
                        }
                    }

                    .receipt-page {
                        background: white;
                        display: block;
                        width: 210mm;
                        margin: 0;
                        padding: ${printFormat === 'full' ? '12mm 20mm 20mm' : printFormat === 'compact' ? '5mm 8mm 8mm' : '8mm 15mm 15mm'};
                        height: ${printFormat === 'half' ? '147.5mm' : printFormat === 'compact' ? '98mm' : '296mm'};
                        min-height: ${printFormat === 'half' ? '147.5mm' : printFormat === 'compact' ? '98mm' : '296mm'};
                        position: relative;
                        box-sizing: border-box;
                    }

                    .receipt-separator {
                        width: 100%;
                        height: 0;
                        margin: 0;
                        display: ${printFormat !== 'full' ? 'block' : 'none'};
                    }
                `}
            </style>

            {/* Toolbar */}
            <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden toolbar-container">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
                        <ArrowLeft size={16} /> ย้อนกลับ
                    </Button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800">{title}</h1>
                        <p className="text-xs text-slate-500">
                            {buildingBills.length} ใบเสร็จ (
                            {printFormat === 'half' ? 'พิมพ์ 2 ใบต่อหน้า' : 
                             printFormat === 'compact' ? 'พิมพ์ 3 ใบต่อหน้า' : 
                             'พิมพ์ 1 ใบต่อหน้า A4'}
                            )
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="bg-white border rounded-xl p-1 flex gap-1 shadow-sm">
                        <Button 
                            variant={printFormat === 'compact' ? 'secondary' : 'ghost'} 
                            size="sm" 
                            onClick={() => setPrintFormat('compact')}
                            className="text-xs h-8 rounded-lg"
                        >
                            3 ใบ/หน้า
                        </Button>
                        <Button 
                            variant={printFormat === 'half' ? 'secondary' : 'ghost'} 
                            size="sm" 
                            onClick={() => setPrintFormat('half')}
                            className="text-xs h-8 rounded-lg"
                        >
                            2 ใบ/หน้า
                        </Button>
                        <Button 
                            variant={printFormat === 'full' ? 'secondary' : 'ghost'} 
                            size="sm" 
                            onClick={() => setPrintFormat('full')}
                            className="text-xs h-8 rounded-lg"
                        >
                            1 ใบ/หน้า
                        </Button>
                    </div>
                    <Button onClick={() => window.print()} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Printer size={16} /> พิมพ์ทั้งหมด ({buildingBills.length} ใบ)
                    </Button>
                </div>
            </div>

            {/* Receipts Container - Wrapped in printable-area to fix index.css hiding */}
            <div className="max-w-fit mx-auto print:m-0 print:p-0 print:max-w-none printable-area">
                {(() => {
                    const itemsPerPage = printFormat === 'compact' ? 3 : (printFormat === 'half' ? 2 : 1);
                    const pages = [];
                    for (let i = 0; i < buildingBills.length; i += itemsPerPage) {
                        pages.push(buildingBills.slice(i, i + itemsPerPage));
                    }

                    return pages.map((pageBills, pageIndex) => (
                        <div key={`page-${pageIndex}`} className="a4-page-preview">
                            {pageBills.map((bill, index) => {
                                const billBuildingIdStr = String(bill.buildingId);
                                const billBuilding = building || buildings.find(b =>
                                    String(b.id) === billBuildingIdStr || String(b._id) === billBuildingIdStr
                                ) || buildings[0];
                                const tenant = tenants.find(t => t.room === bill.room);
                                const isLastInPage = index === pageBills.length - 1;

                                return (
                                    <div key={`${bill.room}-${bill._id || index}`}>
                                        <SingleReceipt
                                            bill={bill}
                                            tenant={tenant}
                                            settings={settings}
                                            building={billBuilding}
                                            format={printFormat}
                                        />
                                        {!isLastInPage && (
                                            <div className="receipt-separator" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ));
                })()}
            </div>
        </div>
    );
}
