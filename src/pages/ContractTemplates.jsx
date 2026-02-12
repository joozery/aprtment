import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Trash2, Save, ArrowLeft, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContractTemplates() {
    const { contractConfig, setContractConfig } = useApp();
    const navigate = useNavigate();

    // Local state for editing
    const [config, setConfig] = useState(contractConfig);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (contractConfig) {
            setConfig(contractConfig);
        }
    }, [contractConfig]);

    const handleSave = () => {
        setContractConfig(config);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const addTerm = () => {
        setConfig(prev => ({
            ...prev,
            terms: [...prev.terms, '']
        }));
    };

    const updateTerm = (index, value) => {
        const newTerms = [...config.terms];
        newTerms[index] = value;
        setConfig(prev => ({ ...prev, terms: newTerms }));
    };

    const removeTerm = (index) => {
        const newTerms = config.terms.filter((_, i) => i !== index);
        setConfig(prev => ({ ...prev, terms: newTerms }));
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="rounded-xl h-9 w-9 p-0" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} className="text-slate-600" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800">จัดการเทมเพลตสัญญา</h2>
                        <p className="text-slate-500 mt-1 font-medium text-sm">แก้ไขรายละเอียดและเงื่อนไขสัญญาเช่ามาตรฐาน</p>
                    </div>
                </div>
                <Button
                    onClick={handleSave}
                    className={`h-9 px-6 rounded-xl font-bold premium-shadow transition-all ${isSaved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary hover:bg-primary/90'} text-white shadow-xl shadow-indigo-100 text-sm`}
                >
                    <Save size={16} className="mr-2" />
                    {isSaved ? 'บันทึกเรียบร้อย' : 'บันทึกการแก้ไข'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Form */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none premium-shadow bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-50 pb-3">
                            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <FileCheck size={18} className="text-indigo-500" /> ข้อมูลทั่วไป
                            </CardTitle>
                            <CardDescription className="text-xs">หัวข้อสัญญาและข้อมูลผู้ให้เช่า</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="space-y-1.5">
                                <Label className="font-bold text-slate-700 text-sm">หัวข้อสัญญา</Label>
                                <Input
                                    value={config.title}
                                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                                    className="h-10 rounded-lg bg-slate-50 border-none font-medium text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="font-bold text-slate-700 text-sm">ชื่อผู้ให้เช่า (ในสัญญา)</Label>
                                <Input
                                    value={config.lessorName}
                                    onChange={(e) => setConfig({ ...config, lessorName: e.target.value })}
                                    className="h-10 rounded-lg bg-slate-50 border-none font-medium text-sm"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none premium-shadow bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-50 pb-3 flex flex-row justify-between items-center">
                            <div>
                                <CardTitle className="text-lg font-bold text-slate-800">เงื่อนไขและข้อตกลง</CardTitle>
                                <CardDescription className="text-xs">รายการกฎระเบียบที่ระบุในสัญญา</CardDescription>
                            </div>
                            <Button size="sm" onClick={addTerm} variant="outline" className="rounded-lg border-dashed border-2 font-bold text-slate-600 h-8 text-xs">
                                <Plus size={14} className="mr-1" /> เพิ่มข้อ
                            </Button>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            {config.terms.map((term, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-2"
                                >
                                    <div className="h-10 w-10 flex-shrink-0 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-500 text-sm">
                                        {index + 1}
                                    </div>
                                    <Input
                                        value={term}
                                        onChange={(e) => updateTerm(index, e.target.value)}
                                        className="h-10 rounded-lg bg-slate-50 border-none font-medium flex-1 text-sm"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg"
                                        onClick={() => removeTerm(index)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </motion.div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Live Preview (Simulated) */}
                <div className="lg:col-span-1">
                    <div className="sticky top-10">
                        <Label className="text-slate-500 font-bold mb-4 block">ตัวอย่างการแสดงผล</Label>
                        <div className="bg-white p-6 shadow-xl rounded-sm border border-slate-200 min-h-[400px] text-[10px] text-slate-600 font-mono leading-relaxed relative">
                            {/* Paper Hole Punch Effect (Visual only) */}
                            <div className="absolute top-1/2 -left-2 w-4 h-4 rounded-full bg-slate-100 shadow-inner translate-y-[-100px]"></div>
                            <div className="absolute top-1/2 -left-2 w-4 h-4 rounded-full bg-slate-100 shadow-inner"></div>
                            <div className="absolute top-1/2 -left-2 w-4 h-4 rounded-full bg-slate-100 shadow-inner translate-y-[100px]"></div>

                            <div className="text-center font-bold text-sm mb-4 border-b pb-2 text-slate-900">{config.title}</div>
                            <p className="mb-2">สัญญาฉบับนี้ทำขึ้นระหว่าง <span className="font-bold">{config.lessorName}</span> (ผู้ให้เช่า)...</p>

                            <div className="mb-2 font-bold mt-4">เงื่อนไขการเช่า:</div>
                            <ul className="list-decimal pl-4 space-y-1 mb-4">
                                {config.terms.map((term, i) => (
                                    <li key={i}>{term || <span className="text-slate-300 italic">ว่าง...</span>}</li>
                                ))}
                            </ul>

                            <div className="mt-8 pt-4 border-t border-dashed border-slate-300">
                                <div className="flex justify-between">
                                    <div className="text-center w-20">
                                        <div className="h-4 border-b border-slate-300 mb-1"></div>
                                        (ผู้ให้เช่า)
                                    </div>
                                    <div className="text-center w-20">
                                        <div className="h-4 border-b border-slate-300 mb-1"></div>
                                        (ผู้เช่า)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
