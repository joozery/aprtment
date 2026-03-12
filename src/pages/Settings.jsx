import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, Zap, Home, Save, CheckCircle2, QrCode, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings() {
    const { settings, updateSettings } = useApp();
    const [formData, setFormData] = useState(settings);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Sync form data when settings are fetched from server
    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const success = await updateSettings(formData);
        setIsSaving(false);
        
        if (success) {
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } else {
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
        }
    };

    const handleChange = (field, value) => {
        const stringFields = ['promptpayPhone'];
        setFormData(prev => ({ ...prev, [field]: stringFields.includes(field) ? value : (parseFloat(value) || 0) }));
        setIsSaved(false);
    };

    return (
        <div className="p-6 space-y-6 max-w-4xl">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800">ตั้งค่าระบบ</h2>
                <p className="text-slate-500 mt-1">กำหนดอัตราค่าน้ำ ค่าไฟ และค่าเช่าเริ่มต้น</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Water Rate */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <Droplets className="text-blue-600" size={24} />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">อัตราค่าน้ำประปา</CardTitle>
                                    <CardDescription>กำหนดราคาต่อหน่วยการใช้น้ำ</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-end gap-4">
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="waterRate">ราคาต่อหน่วย (บาท)</Label>
                                        <Input
                                            id="waterRate"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.waterRate}
                                            onChange={(e) => handleChange('waterRate', e.target.value)}
                                            className="font-semibold"
                                        />
                                    </div>
                                    <div className="text-slate-500 pb-2 text-sm">
                                        บาท/หน่วย
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="waterMin">ขั้นต่ำ (บาท)</Label>
                                        <Input
                                            id="waterMin"
                                            type="number"
                                            min="0"
                                            value={formData.waterMin ?? 200}
                                            onChange={(e) => handleChange('waterMin', e.target.value)}
                                            className="font-semibold text-rose-600"
                                        />
                                    </div>
                                    <div className="text-slate-500 pb-2 text-sm">
                                        บาท
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500">
                                    ตัวอย่าง: ใช้น้ำ 2 หน่วย × {formData.waterRate} บาท = {2 * formData.waterRate} บาท (จะถูกปัดเป็นขั้นต่ำ <b>{(formData.waterMin ?? 200).toLocaleString()} บาท</b>)
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Electric Rate */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                    <Zap className="text-amber-600" size={24} />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">อัตราค่าไฟฟ้า</CardTitle>
                                    <CardDescription>กำหนดราคาต่อหน่วยการใช้ไฟฟ้า</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-end gap-4">
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="electricRate">ราคาต่อหน่วย (บาท)</Label>
                                        <Input
                                            id="electricRate"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.electricRate}
                                            onChange={(e) => handleChange('electricRate', e.target.value)}
                                            className="font-semibold"
                                        />
                                    </div>
                                    <div className="text-slate-500 pb-2 text-sm">
                                        บาท/หน่วย
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="electricMin">ขั้นต่ำ (บาท)</Label>
                                        <Input
                                            id="electricMin"
                                            type="number"
                                            min="0"
                                            value={formData.electricMin ?? 200}
                                            onChange={(e) => handleChange('electricMin', e.target.value)}
                                            className="font-semibold text-rose-600"
                                        />
                                    </div>
                                    <div className="text-slate-500 pb-2 text-sm">
                                        บาท
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500">
                                    ตัวอย่าง: ใช้ไฟ 10 หน่วย × {formData.electricRate} บาท = {10 * formData.electricRate} บาท (จะถูกปัดเป็นขั้นต่ำ <b>{(formData.electricMin ?? 200).toLocaleString()} บาท</b>)
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Default Rent */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                                    <Home className="text-indigo-600" size={24} />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">ค่าเช่าและบริการ</CardTitle>
                                    <CardDescription>กำหนดค่าเช่ามาตรฐานและค่าบริการอื่นๆ</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-end gap-4">
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="defaultRent">ค่าเช่าต่อเดือน (บาท)</Label>
                                        <Input
                                            id="defaultRent"
                                            type="number"
                                            min="0"
                                            step="100"
                                            value={formData.defaultRent}
                                            onChange={(e) => handleChange('defaultRent', e.target.value)}
                                            className="font-semibold"
                                        />
                                    </div>
                                    <div className="text-slate-500 pb-2 text-sm whitespace-nowrap">
                                        บาท/เดือน
                                    </div>
                                </div>
                                <div className="flex items-end gap-4">
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="serviceFee">ค่าบริการ/ค่าส่วนกลาง (บาท)</Label>
                                        <Input
                                            id="serviceFee"
                                            type="number"
                                            min="0"
                                            step="10"
                                            value={formData.serviceFee ?? 200}
                                            onChange={(e) => handleChange('serviceFee', e.target.value)}
                                            className="font-semibold"
                                        />
                                    </div>
                                    <div className="text-slate-500 pb-2 text-sm whitespace-nowrap">
                                        บาท/เดือน
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500">
                                    ค่านี้จะถูกเพิ่มเข้าไปตอนออกบิลให้ลูกบ้านทุกครั้งอัตโนมัติ
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* PromptPay */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                                    <QrCode className="text-indigo-600" size={24} />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">ตั้งค่า PromptPay</CardTitle>
                                    <CardDescription>เบอร์เงินหรือเลขบัตรประชาชน สำหรับสร้าง QR Codeชำระเงิน</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-end gap-4">
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="promptpayPhone">เบอร์โทรศัพท์หรือเลขบัตรประชาชน (13 หลัก)</Label>
                                        <Input
                                            id="promptpayPhone"
                                            value={formData.promptpayPhone || ''}
                                            onChange={(e) => handleChange('promptpayPhone', e.target.value)}
                                            placeholder="0xx-xxx-xxxx"
                                            className="font-semibold"
                                            maxLength={13}
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500">
                                    ระบุเบอร์โทรที่ผูก PromptPay หรือบัตรประชาชน QR Code จะสร้างจากข้อมูลนี้โดยอัตโนมัติในหน้าชำระเงิน
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <div className="flex justify-end pt-4">
                    <Button
                        type="submit"
                        className={`transition-all ${isSaved
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                        disabled={isSaving || isSaved}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={16} className="mr-2 animate-spin" />
                                กำลังบันทึก...
                            </>
                        ) : isSaved ? (
                            <>
                                <CheckCircle2 size={16} className="mr-2" />
                                บันทึกเรียบร้อย
                            </>
                        ) : (
                            <>
                                <Save size={16} className="mr-2" />
                                บันทึกการตั้งค่า
                            </>
                        )}
                    </Button>
                </div>
            </form>

            {/* Summary Card */}
            <Card className="bg-slate-50 border-slate-200">
                <CardHeader>
                    <CardTitle className="text-base">สรุปการคำนวณ (ตัวอย่าง)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-600">ค่าเช่า (ปรับตามจริงแต่ละห้อง)</span>
                        <span className="font-semibold">฿{formData.defaultRent?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600">ค่าบริการรายเดือน</span>
                        <span className="font-semibold">฿{(formData.serviceFee ?? 200).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-blue-600 bg-blue-50/50 p-2 -mx-2 rounded">
                        <span className="text-blue-700">ค่าน้ำ (ตัวอย่างใช้ 2 หน่วย) - ปัดเข้าขั้นต่ำ</span>
                        <span className="font-bold">฿{Math.max((2 * formData.waterRate), (formData.waterMin ?? 200)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-amber-600 bg-amber-50/50 p-2 -mx-2 rounded">
                        <span className="text-amber-700">ค่าไฟ (ตัวอย่างใช้ 50 หน่วย)</span>
                        <span className="font-bold">฿{Math.max((50 * formData.electricRate), (formData.electricMin ?? 200)).toLocaleString()}</span>
                    </div>
                    <div className="border-t border-slate-300 pt-3 mt-2 flex justify-between">
                        <span className="font-bold text-slate-800">รวมทั้งสิ้น</span>
                        <span className="font-bold text-indigo-600 text-lg">
                            ฿{(
                                formData.defaultRent +
                                (formData.serviceFee ?? 200) +
                                Math.max((2 * formData.waterRate), (formData.waterMin ?? 200)) +
                                Math.max((50 * formData.electricRate), (formData.electricMin ?? 200))
                            ).toLocaleString()}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
