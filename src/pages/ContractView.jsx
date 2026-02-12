import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, ArrowLeft, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContractView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { tenants, rooms, contractConfig } = useApp();

    // Find tenant by ID (simulated, in real app use ID)
    // For this mock, we search by room number if passed as ID, or tenant ID
    const tenant = tenants.find(t => t.room === id || t.id.toString() === id);

    if (!tenant) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
                <h2 className="text-2xl font-bold text-slate-800">ไม่พบข้อมูลสัญญา</h2>
                <Button onClick={() => navigate(-1)} className="mt-4">ย้อนกลับ</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 py-10 px-4 md:px-10 font-sans">
            {/* Toolbar */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4"
            >
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="rounded-xl h-10 w-10 p-0" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} className="text-slate-600" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            สัญญาเช่าห้องพัก
                            <Badge className="bg-slate-800 text-white border-none text-lg px-2 py-0.5 rounded-lg">{tenant.room}</Badge>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">เลขที่สัญญา: CTR-{tenant.room}-{new Date().getFullYear()}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="h-10 rounded-xl border-slate-200 bg-white font-bold text-slate-600 shadow-sm" onClick={() => window.print()}>
                        <Printer size={16} className="mr-2" /> พิมพ์
                    </Button>
                    <Button className="h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-100">
                        <Download size={16} className="mr-2" /> ดาวน์โหลด PDF
                    </Button>
                </div>
            </motion.div>

            {/* A4 Paper View */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="max-w-[210mm] mx-auto bg-white shadow-2xl rounded-none md:rounded-sm min-h-[297mm] p-[20mm] relative text-slate-800 leading-relaxed"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-4 text-emerald-600">
                        <FileCheck size={48} />
                    </div>
                    <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-4 inline-block px-10">{contractConfig?.title}</h2>
                    <p className="mt-4 font-semibold text-slate-500">ทำที่: หอพักตวงเงินแมนชั่น, ปทุมธานี</p>
                    <p className="font-semibold text-slate-500">วันที่: {tenant.date}</p>
                </div>

                {/* Content */}
                <div className="space-y-6 text-[15px] text-justify indent-8">
                    <p>
                        สัญญาฉบับนี้ทำขึ้นระหว่าง <strong>{contractConfig?.lessorName}</strong> ซึ่งต่อไปในสัญญานี้เรียกว่า "ผู้ให้เช่า" ฝ่ายหนึ่ง
                        กับ <strong>{tenant.name}</strong> ถือบัตรประชาชนเลขที่ (แสดงเฉพาะเจ้าหน้าที่) ซึ่งต่อไปในสัญญานี้เรียกว่า "ผู้เช่า" อีกฝ่ายหนึ่ง
                    </p>
                    <p>
                        คู่สัญญาทั้งสองฝ่ายตกลงทำสัญญากันโดยมีข้อความดังต่อไปนี้:
                    </p>

                    <ol className="list-decimal pl-12 space-y-4 marker:font-bold">
                        <li className="pl-2">
                            <strong>ทรัพย์สินที่เช่า:</strong> ผู้ให้เช่าตกลงให้เช่าและผู้เช่าตกลงเช่าห้องพักหมายเลข <strong>{tenant.room}</strong>
                            ชั้น {tenant.room.charAt(0)} อาคาร A รวมอุปกรณ์เฟอร์นิเจอร์ตามรายการแนบท้ายสัญญา
                        </li>
                        <li className="pl-2">
                            <strong>ระยะเวลาการเช่า:</strong> สัญญามีกำหนดระยะเวลา <strong>1 ปี</strong> เริ่มตั้งแต่วันที่ <strong>{tenant.date}</strong>
                            ถึงวันที่ <strong>{tenant.expiry}</strong>
                        </li>
                        <li className="pl-2">
                            <strong>ค่าเช่าและค่าใช้จ่าย:</strong> ผู้เช่าตกลงชำระค่าเช่าในอัตราเดือนละ <strong>{tenant.rent.toLocaleString()} บาท</strong>
                            (สี่พันห้าร้อยบาทถ้วน) โดยต้องชำระภายในวันที่ 5 ของทุกเดือน
                        </li>
                        <li className="pl-2">
                            <strong>เงินประกัน:</strong> ในวันทำสัญญานี้ ผู้เช่าได้วางเงินประกันความเสียหายจำนวน 2 เดือน ของค่าเช่า เป็นเงิน <strong>{(tenant.rent * 2).toLocaleString()} บาท</strong>
                            ซึ่งผู้ให้เช่าจะคืนให้เมื่อสัญญาเลิกกัน และไม่มีหนี้สินค้างชำระ
                        </li>
                        {contractConfig?.terms.map((term, index) => (
                            <li key={index} className="pl-2">{term}</li>
                        ))}
                    </ol>

                    <p className="mt-8 indent-0">
                        สัญญานี้ทำขึ้นเป็นสองฉบับมีข้อความถูกต้องตรงกัน คู่สัญญาได้อ่านและเข้าใจข้อความในสัญญานี้โดยตลอดแล้ว จึงลงลายมือชื่อไว้เป็นสำคัญต่อหน้าพยาน
                    </p>
                </div>

                {/* Signatures */}
                <div className="mt-20 flex justify-between px-10">
                    <div className="text-center w-64">
                        <div className="border-b border-slate-800 h-10 mb-2"></div>
                        <p className="font-bold">( {contractConfig?.lessorName} )</p>
                        <p className="text-sm text-slate-500">ผู้ให้เช่า</p>
                    </div>
                    <div className="text-center w-64">
                        <div className="border-b border-slate-800 h-10 mb-2 font-handwriting text-2xl text-blue-600 relative">
                            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 font-script italic">{tenant.name}</span>
                        </div>
                        <p className="font-bold">( {tenant.name} )</p>
                        <p className="text-sm text-slate-500">ผู้เช่า</p>
                    </div>
                </div>

                {/* Signatures Witness */}
                <div className="mt-16 flex justify-center px-10">
                    <div className="text-center w-64">
                        <div className="border-b border-slate-800 h-10 mb-2"></div>
                        <p className="font-bold">( เจ้าหน้าที่พยาน )</p>
                        <p className="text-sm text-slate-500">พยาน</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
