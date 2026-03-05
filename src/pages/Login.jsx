import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Eye, EyeOff, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await login(username.trim(), password);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
            }
        } catch (err) {
            setError(err?.response?.data?.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-indigo-500/10"
                        style={{
                            width: `${200 + i * 80}px`,
                            height: `${200 + i * 80}px`,
                            left: `${10 + i * 15}%`,
                            top: `${5 + i * 10}%`,
                        }}
                        animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
                    />
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                className="relative w-full max-w-md"
            >
                {/* Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                    {/* Header */}
                    <div className="px-8 pt-10 pb-6 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/40 mb-5"
                        >
                            <Building2 size={32} className="text-white" />
                        </motion.div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">ตวงเงินแมนชั่น</h1>
                        <p className="text-indigo-200/80 text-sm mt-1.5 font-medium">ระบบจัดการหอพัก</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-5">
                        {/* Error */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2.5 bg-rose-500/20 border border-rose-400/30 text-rose-200 rounded-xl px-4 py-3 text-sm"
                            >
                                <AlertCircle size={16} className="shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        {/* Username */}
                        <div className="space-y-2">
                            <Label className="text-indigo-100 font-medium text-sm">ชื่อผู้ใช้</Label>
                            <Input
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="username"
                                autoComplete="username"
                                required
                                className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus-visible:ring-indigo-400 focus-visible:border-indigo-400"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label className="text-indigo-100 font-medium text-sm">รหัสผ่าน</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="รหัสผ่าน"
                                    autoComplete="current-password"
                                    required
                                    className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus-visible:ring-indigo-400 focus-visible:border-indigo-400 pr-11"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 gap-2 text-base mt-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? (
                                <><Loader2 size={18} className="animate-spin" /> กำลังเข้าสู่ระบบ...</>
                            ) : (
                                <><LogIn size={18} /> เข้าสู่ระบบ</>
                            )}
                        </Button>
                    </form>
                </div>

                <p className="text-center text-indigo-300/50 text-xs mt-6">
                    Management Pro © {new Date().getFullYear()}
                </p>
            </motion.div>
        </div>
    );
}
