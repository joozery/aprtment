import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, Zap, Home, Save, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings() {
    const { settings, updateSettings } = useApp();
    const [formData, setFormData] = useState(settings);
    const [isSaved, setIsSaved] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        updateSettings(formData);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
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
                                        className="text-lg font-semibold"
                                    />
                                </div>
                                <div className="text-slate-500 pb-2">
                                    บาท/หน่วย
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-3">
                                ตัวอย่าง: ใช้น้ำ 15 หน่วย × {formData.waterRate} บาท = <span className="font-bold text-blue-600">{(15 * formData.waterRate).toLocaleString()} บาท</span>
                            </p>
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
                                        className="text-lg font-semibold"
                                    />
                                </div>
                                <div className="text-slate-500 pb-2">
                                    บาท/หน่วย
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-3">
                                ตัวอย่าง: ใช้ไฟ 120 หน่วย × {formData.electricRate} บาท = <span className="font-bold text-amber-600">{(120 * formData.electricRate).toLocaleString()} บาท</span>
                            </p>
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
                                    <CardTitle className="text-lg">ค่าเช่าเริ่มต้น</CardTitle>
                                    <CardDescription>กำหนดค่าเช่าห้องพักมาตรฐาน</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
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
                                        className="text-lg font-semibold"
                                    />
                                </div>
                                <div className="text-slate-500 pb-2">
                                    บาท/เดือน
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-3">
                                ค่านี้จะถูกใช้เป็นค่าเริ่มต้นเมื่อเพิ่มผู้เช่าใหม่ (สามารถปรับแก้ได้ในภายหลัง)
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                    <Button
                        type="submit"
                        className={`transition-all ${isSaved
                                ? 'bg-emerald-600 hover:bg-emerald-700'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                        disabled={isSaved}
                    >
                        {isSaved ? (
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
                        <span className="text-slate-600">ค่าเช่า</span>
                        <span className="font-semibold">฿{formData.defaultRent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600">ค่าน้ำ (15 หน่วย)</span>
                        <span className="font-semibold">฿{(15 * formData.waterRate).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600">ค่าไฟ (120 หน่วย)</span>
                        <span className="font-semibold">฿{(120 * formData.electricRate).toLocaleString()}</span>
                    </div>
                    <div className="border-t border-slate-300 pt-2 mt-2 flex justify-between">
                        <span className="font-bold text-slate-800">รวมทั้งสิ้น</span>
                        <span className="font-bold text-indigo-600 text-lg">
                            ฿{(formData.defaultRent + (15 * formData.waterRate) + (120 * formData.electricRate)).toLocaleString()}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
