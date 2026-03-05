import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    ReceiptText,
    BarChart3,
    Bell,
    Search,
    LogOut,
    Building2,
    Menu,
    ChevronRight,
    Settings,
    Home,
    CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const SidebarItem = ({ icon: Icon, label, path, active }) => (
    <Link to={path}>
        <motion.div
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 group ${active
                ? 'active-nav-bg text-white shadow-lg shadow-primary/20'
                : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
        >
            <div className="flex items-center gap-3">
                <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                <span className={`font-medium text-[13px] ${active ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>
                    {label}
                </span>
            </div>
            {active && (
                <motion.div
                    layoutId="sidebar-active-indicator"
                    className="w-1.5 h-1.5 bg-white rounded-full"
                />
            )}
        </motion.div>
    </Link>
);

export default function DashboardLayout() {
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const { user, logout } = useAuth();

    const menuItems = [
        { icon: LayoutDashboard, label: 'แดชบอร์ด', path: '/dashboard' },
        { icon: Building2, label: 'จัดการตึก', path: '/buildings' },
        { icon: Home, label: 'จัดการห้องพัก', path: '/rooms' },
        { icon: Users, label: 'ผู้เช่าและสัญญา', path: '/tenants' },
        { icon: ReceiptText, label: 'การเงินและค่าที่พัก', path: '/billing' },
        { icon: CreditCard, label: 'ชำระเงิน', path: '/payment' },
        { icon: BarChart3, label: 'รายงาน', path: '/reports' },
    ];

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans">
            {/* Premium Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 240 : 0, opacity: isSidebarOpen ? 1 : 0 }}
                className="bg-white border-r border-slate-100 flex flex-col relative overflow-hidden shrink-0"
            >
                <div className="p-6 pb-6 flex items-center gap-3">
                    <div className="bg-primary p-2 rounded-xl shadow-indigo-100 shadow-xl">
                        <Building2 className="text-white" size={20} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold tracking-tight text-slate-800 leading-none">ตวงเงินแมนชั่น</h1>
                        <span className="text-[9px] uppercase tracking-[0.2em] font-medium text-slate-400 mt-1">Management Pro</span>
                    </div>
                </div>

                <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                    <p className="px-3 text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-2">เมนูหลัก</p>
                    {menuItems.map((item) => (
                        <SidebarItem
                            key={item.path}
                            {...item}
                            active={location.pathname === item.path}
                        />
                    ))}

                    <div className="mt-6 pt-6 border-t border-slate-50">
                        <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">อื่นๆ</p>
                        <SidebarItem icon={Settings} label="ตั้งค่าระบบ" path="/settings" active={location.pathname === '/settings'} />
                    </div>
                </nav>

                <div className="p-4 mt-auto">
                    <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3 border border-slate-100">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                            {(user?.displayName || user?.username || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{user?.displayName || user?.username || 'Admin'}</p>
                            <p className="text-[10px] text-slate-400 font-medium capitalize">{user?.role || 'admin'}</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={logout}
                            className="text-slate-400 hover:text-destructive hover:bg-rose-50 rounded-lg h-8 w-8"
                            title="ออกจากระบบ"
                        >
                            <LogOut size={16} />
                        </Button>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Modern Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 shrink-0 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                            className="text-slate-400 hover:bg-slate-100 rounded-xl w-9 h-9"
                        >
                            <Menu size={18} />
                        </Button>

                        <div className="relative group hidden md:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                            <Input
                                placeholder="ค้นหาด่วน..."
                                className="w-80 pl-11 h-9 bg-slate-50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-primary/10 transition-all font-medium text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex gap-2 p-1 bg-slate-100/50 rounded-xl">
                            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg bg-white shadow-sm border border-slate-100 text-slate-600 hover:text-primary transition-all">
                                <Bell size={18} />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-slate-500 hover:text-primary transition-all">
                                <Settings size={18} />
                            </Button>
                        </div>

                        <Avatar className="h-9 w-9 border-2 border-white shadow-md cursor-pointer hover:scale-105 transition-all">
                            <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100" />
                            <AvatarFallback>AD</AvatarFallback>
                        </Avatar>
                    </div>
                </header>

                {/* Dynamic Content */}
                <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
                    <div className="p-6 max-w-[1600px] mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 10, scale: 0.995 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.005 }}
                                transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
}
