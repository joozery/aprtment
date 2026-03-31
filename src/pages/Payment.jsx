import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
    CreditCard, CheckCircle2, Calendar, Building2, Search,
    QrCode, Wallet, AlertCircle, X, Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

// PromptPay QR payload generator — Thai EMV QR standard (correct)
function generatePromptPayPayload(phoneOrId, amount) {
    const clean = (phoneOrId || '').replace(/\D/g, '');
    if (!clean) return '';

    let tag, id;
    if (clean.length === 10) {
        // Mobile phone: 0812345678 → 0066812345678
        tag = '01';
        id = '0066' + clean.substring(1);
    } else if (clean.length === 13) {
        // National ID / juristic ID
        tag = '02';
        id = clean;
    } else {
        return '';
    }

    const encode = (tag, value) => tag + String(value.length).padStart(2, '0') + value;

    const guid = 'A000000677010111';
    const merchantAccInfo = encode('00', guid) + encode(tag, id);
    // Tag 29 = PromptPay merchant account info
    const tag29 = encode('29', merchantAccInfo);

    let payload = [
        encode('00', '01'),          // Payload Format Indicator
        encode('01', '12'),          // Point of Initiation Method: 12 = dynamic
        tag29,
        encode('53', '764'),         // Currency: THB
    ];

    if (amount && amount > 0) {
        payload.push(encode('54', amount.toFixed(2)));
    }

    payload.push(encode('58', 'TH'));  // Country Code
    payload.push('6304');              // CRC placeholder (no value yet)

    const str = payload.join('');

    // CRC16-CCITT (XModem variant)
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
        }
    }

    return str + crc.toString(16).toUpperCase().padStart(4, '0');
}


export default function PaymentPage() {
    const { billing, tenants, buildings, settings, payBill } = useApp();
    const [search, setSearch] = useState('');
    const [selectedBuilding, setSelectedBuilding] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [payingBill, setPayingBill] = useState(null);
    const [confirmed, setConfirmed] = useState(null);

    const PROMPTPAY_NUMBER = settings?.promptpayPhone || '0990136999';

    const getMonthLabel = (isoDate) => {
        if (!isoDate) return '-';
        return new Date(isoDate).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
    };
    const uniqueMonths = [...new Set(billing.map(b => getMonthLabel(b.createdAt)))].filter(s => s !== '-').sort().reverse();

    // Only show unpaid bills
    const pendingBills = useMemo(() => {
        let bills = billing.filter(b => b.status !== 'ชำระแล้ว' && b.status !== 'ยังไม่ออกบิล');

        if (selectedBuilding !== 'all') {
            bills = bills.filter(b => String(b.buildingId) === selectedBuilding);
        }
        if (selectedMonth !== 'all') {
            bills = bills.filter(b => getMonthLabel(b.createdAt) === selectedMonth);
        }
        if (search.trim()) {
            const s = search.toLowerCase();
            bills = bills.filter(b => b.room.includes(s) || b.name.toLowerCase().includes(s));
        }

        // Dedup: latest per room
        const latestByRoom = {};
        bills.forEach(b => {
            if (!latestByRoom[b.room] || new Date(b.createdAt) > new Date(latestByRoom[b.room].createdAt)) {
                latestByRoom[b.room] = b;
            }
        });
        return Object.values(latestByRoom).sort((a, b) =>
            String(a.room).localeCompare(String(b.room), undefined, { numeric: true })
        );
    }, [billing, selectedBuilding, selectedMonth, search]);

    const handleConfirmPayment = async (bill) => {
        await payBill(bill.room);
        setConfirmed(bill.room);
        setTimeout(() => {
            setPayingBill(null);
            setConfirmed(null);
        }, 1800);
    };

    const tenant = payingBill ? tenants.find(t => t.room === payingBill.room) : null;
    const rent = tenant?.rent || settings.defaultRent;
    const total = payingBill?.total ?? 0;
    const qrPayload = payingBill ? generatePromptPayPayload(PROMPTPAY_NUMBER, total) : '';

    return (
        <div className="space-y-8 pb-10 min-h-screen bg-slate-50/50 p-6 md:p-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">ชำระเงิน</h2>
                    <p className="text-slate-500 mt-1 font-medium">รับชำระค่าเช่าผ่าน PromptPay QR Code</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 font-semibold text-sm">
                    <Wallet size={16} />
                    รอชำระทั้งหมด: {pendingBills.length} ห้อง
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                    <SelectTrigger className="w-[160px] h-10 bg-white border-slate-200 rounded-xl font-medium">
                        <div className="flex items-center gap-2 text-slate-600">
                            <Building2 size={16} />
                            <SelectValue placeholder="เลือกตึก" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">ทุกตึก</SelectItem>
                        {buildings.map(b => (
                            <SelectItem key={b.id} value={String(b.id || b._id)}>{b.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[180px] h-10 bg-white border-slate-200 rounded-xl font-medium">
                        <div className="flex items-center gap-2 text-slate-600">
                            <Calendar size={16} />
                            <SelectValue placeholder="เดือน" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">ทุกเดือน</SelectItem>
                        {uniqueMonths.map(m => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="ค้นหาห้อง / ชื่อผู้เช่า..."
                        className="pl-10 h-10 bg-white border-slate-200 rounded-xl font-medium"
                    />
                </div>
            </div>

            {/* Bill Grid */}
            {pendingBills.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                    <CheckCircle2 size={56} className="text-emerald-300 mb-4" />
                    <p className="text-lg font-semibold text-slate-600">ไม่มีรายการค้างชำระ</p>
                    <p className="text-sm mt-1">ทุกห้องชำระเงินครบแล้ว 🎉</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {pendingBills.map(bill => (
                        <motion.div
                            key={bill.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -4, shadow: 'lg' }}
                            className="cursor-pointer"
                            onClick={() => setPayingBill(bill)}
                        >
                            <Card className="border-none shadow-sm hover:shadow-xl transition-all rounded-2xl overflow-hidden bg-white group">
                                <div className={`h-1.5 w-full ${bill.status === 'เกินกำหนด' ? 'bg-rose-500' : 'bg-amber-400'}`} />
                                <CardContent className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-xl text-sm">
                                            ห้อง {bill.room}
                                        </div>
                                        <Badge className={`text-xs border ${bill.status === 'เกินกำหนด' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                            {bill.status === 'เกินกำหนด' ? <AlertCircle size={10} className="mr-1" /> : null}
                                            {bill.status}
                                        </Badge>
                                    </div>
                                    <p className="font-semibold text-slate-800 truncate">{bill.name}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{getMonthLabel(bill.createdAt)}</p>
                                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                                        <span className="text-2xl font-bold text-slate-900">฿{(bill.total || 0).toLocaleString()}</span>
                                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-1.5 text-xs">
                                            <QrCode size={13} /> จ่ายเลย
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Payment Modal */}
            <AnimatePresence>
                {payingBill && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={e => { if (e.target === e.currentTarget) setPayingBill(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.92, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white relative">
                                <button
                                    onClick={() => setPayingBill(null)}
                                    className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-xl p-1.5 transition-all"
                                >
                                    <X size={16} />
                                </button>
                                <p className="text-indigo-100 text-sm font-medium mb-1">ชำระค่าเช่าห้อง {payingBill.room}</p>
                                <h3 className="text-2xl font-bold">{payingBill.name}</h3>
                                <p className="text-indigo-200 text-sm mt-1">{getMonthLabel(payingBill.createdAt)}</p>
                            </div>

                            <div className="p-6">
                                {confirmed === payingBill.room ? (
                                    /* Confirmed animation */
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="flex flex-col items-center justify-center py-8"
                                    >
                                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                                            <Check size={40} className="text-emerald-600" />
                                        </div>
                                        <p className="text-xl font-bold text-slate-800">ชำระเงินสำเร็จ!</p>
                                        <p className="text-slate-400 text-sm mt-1">บันทึกการชำระแล้ว</p>
                                    </motion.div>
                                ) : (
                                    <>
                                        {/* Amount Summary */}
                                        <div className="bg-slate-50 rounded-2xl p-4 mb-5 space-y-2 text-sm">
                                            <div className="flex justify-between text-slate-600">
                                                <span>ค่าห้อง</span>
                                                <span>฿{(rent || 0).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-slate-600">
                                                <span>ค่าน้ำ ({payingBill.water} หน่วย)</span>
                                                <span>฿{( (payingBill?.water || 0) * (settings?.waterRate || 0) ).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-slate-600">
                                                <span>ค่าไฟ ({payingBill.electric} หน่วย)</span>
                                                <span>฿{( (payingBill?.electric || 0) * (settings?.electricRate || 0) ).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-slate-600">
                                                <span>ค่าส่วนกลาง</span>
                                                <span>฿{(settings?.serviceFee ?? 200).toLocaleString()}</span>
                                            </div>
                                            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-base">
                                                <span>ยอดรวม</span>
                                                <span className="text-indigo-600">฿{(payingBill?.total || 0).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {/* QR Code */}
                                        <div className="flex flex-col items-center mb-5">
                                            <p className="text-xs text-slate-500 mb-3 font-medium">สแกนจ่าย PromptPay</p>
                                            <div className="p-3 bg-white border-2 border-indigo-100 rounded-2xl shadow-sm">
                                                <QRCodeSVG
                                                    value={qrPayload}
                                                    size={180}
                                                    level="M"
                                                    includeMargin={false}
                                                />
                                            </div>
                                            <p className="text-xs text-slate-400 mt-2">พร้อมเพย์ {PROMPTPAY_NUMBER}</p>
                                        </div>

                                        {/* Confirm Button */}
                                        <Button
                                            onClick={() => handleConfirmPayment(payingBill)}
                                            className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-100 gap-2"
                                        >
                                            <CheckCircle2 size={20} />
                                            ยืนยันการชำระเงิน
                                        </Button>
                                        <p className="text-center text-xs text-slate-400 mt-3">กดยืนยันเมื่อรับเงินที่เคาน์เตอร์เรียบร้อยแล้ว</p>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
