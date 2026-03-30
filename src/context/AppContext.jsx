import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    // Initial Mock Data
    // Buildings Configuration
    const initialBuildings = [
        { id: 1, name: 'ตึก 1', floors: 4, roomsPerFloor: 8, defaultRent: 4500 },
        { id: 2, name: 'ตึก 2', floors: 3, roomsPerFloor: 10, defaultRent: 5000 },
    ];

    const initialSettings = {
        waterRate: 35,      // บาท/หน่วย
        electricRate: 11,   // บาท/หน่วย
        waterMin: 200,      // ขั้นต่ำ
        electricMin: 200,   // ขั้นต่ำ
        serviceFee: 200,    // ค่าบริการรายเดือน
        defaultRent: 4500,  // บาทต่อเดือน
        promptpayPhone: '', // เบอร์พร้อมเพย์
    };

    // Configuration (Legacy - will be replaced by buildings)
    const roomConfig = {
        totalFloors: 4,
        roomsPerFloor: 8,
    };

    const initialTenants = [
        { id: 1, room: '1101', buildingId: 1, name: 'สุรศักดิ์ ใจกล้า', status: 'ปกติ', date: '01 ม.ค. 2024', expiry: '01 ม.ค. 2025', rent: 4500, avatar: 'SJ', lastWaterMeter: 1250, lastElectricMeter: 4500 },
        { id: 2, room: '1102', buildingId: 1, name: 'กานดา รักงาน', status: 'ปกติ', date: '15 ก.พ. 2024', expiry: '15 ก.พ. 2025', rent: 4500, avatar: 'KR', lastWaterMeter: 1100, lastElectricMeter: 3200 },
        { id: 3, room: '1201', buildingId: 1, name: 'พรชัย ทองคำ', status: 'ค้างชำระ', date: '10 ธ.ค. 2023', expiry: '10 ธ.ค. 2024', rent: 5000, avatar: 'PT', lastWaterMeter: 1420, lastElectricMeter: 5100 },
    ];

    const initialMaintenance = [
        { id: 1, room: '1102', issue: 'ก๊อกน้ำรั่วในห้องน้ำ', category: 'ประปา', status: 'In Progress', date: '25 มิ.ย. 67', priority: 'High', images: 2 },
        { id: 2, room: '1405', issue: 'แอร์ไม่เย็น มีเสียงดัง', category: 'เครื่องใช้ไฟฟ้า', status: 'Pending', date: '26 มิ.ย. 67', priority: 'Medium', images: 3 },
    ];

    // State Management
    const [buildings, setBuildings] = useState([]);
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('smart_settings');
        return saved ? JSON.parse(saved) : initialSettings;
    });
    const [tenants, setTenants] = useState([]);
    const [maintenance, setMaintenance] = useState(() => {
        const saved = localStorage.getItem('smart_maintenance');
        return saved ? JSON.parse(saved) : initialMaintenance;
    });

    const [billing, setBilling] = useState([]);
    const [rooms, setRooms] = useState([]);

    const [incomeHistory, setIncomeHistory] = useState(() => {
        const saved = localStorage.getItem('smart_income_history');
        return saved ? JSON.parse(saved) : [
            { name: 'ม.ค.', income: 240000, expense: 80000 },
            { name: 'ก.พ.', income: 255000, expense: 85000 },
            { name: 'มี.ค.', income: 248000, expense: 78000 },
            { name: 'เม.ย.', income: 280000, expense: 92000 },
            { name: 'พ.ค.', income: 265000, expense: 88000 },
            { name: 'มิ.ย.', income: 290000, expense: 95000 },
        ];
    });

    const [meters, setMeters] = useState(() => {
        const saved = localStorage.getItem('smart_meters');
        return saved ? JSON.parse(saved) : { water: {}, electric: {} };
    });

    // Fetch Data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [buildingsRes, tenantsRes, billingRes, settingsRes, roomsRes] = await Promise.all([
                    axios.get(`${API_URL}/buildings`),
                    axios.get(`${API_URL}/tenants`),
                    axios.get(`${API_URL}/billing`),
                    axios.get(`${API_URL}/settings`),
                    axios.get(`${API_URL}/rooms`),
                ]);

                // MAP _id to id to keep frontend logic from breaking for now
                const formattedBuildings = (buildingsRes.data.data || []).map(b => ({ ...b, id: b._id }));
                const formattedTenants = (tenantsRes.data.data || []).map(t => ({ ...t, id: t._id }));
                const formattedBilling = (billingRes.data.data || []).map(b => ({ ...b, id: b._id }));
                const formattedRooms = (roomsRes.data.data || []).map(r => ({ ...r, id: r._id }));

                setBuildings(formattedBuildings);
                setTenants(formattedTenants);
                setBilling(formattedBilling);
                setRooms(formattedRooms);

                if (settingsRes.data.success) {
                    const s = settingsRes.data.data;
                    setSettings(prev => ({ ...prev, ...s }));
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        localStorage.setItem('smart_settings', JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        localStorage.setItem('smart_maintenance', JSON.stringify(maintenance));
    }, [maintenance]);

    useEffect(() => {
        localStorage.setItem('smart_billing', JSON.stringify(billing));
    }, [billing]);

    useEffect(() => {
        localStorage.setItem('smart_income_history', JSON.stringify(incomeHistory));
    }, [incomeHistory]);

    useEffect(() => {
        localStorage.setItem('smart_meters', JSON.stringify(meters));
    }, [meters]);

    // Actions
    const addTenant = async (tenant) => {
        try {
            const res = await axios.post(`${API_URL}/tenants`, tenant);
            if (res.data.success) {
                const newTenant = { ...res.data.data, id: res.data.data._id };
                setTenants(prev => [...prev, newTenant]);
                return { success: true };
            }
        } catch (err) {
            console.error(err);
            return { success: false, error: err.response?.data?.error || err.message };
        }
    };

    const removeTenant = async (id) => {
        try {
            await axios.delete(`${API_URL}/tenants/${id}`);
            setTenants(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const updateTenant = async (id, data) => {
        try {
            const res = await axios.put(`${API_URL}/tenants/${id}`, data);
            if (res.data.success) {
                setTenants(prev => prev.map(t => t.id === id ? { ...t, ...res.data.data } : t));
                return { success: true };
            }
        } catch (err) {
            console.error(err);
            return { success: false, error: err.response?.data?.error || err.message };
        }
    };

    const bulkImportTenants = async (buildingId, tenantsData) => {
        try {
            const res = await axios.post(`${API_URL}/tenants/bulk-import`, { buildingId, tenantsData });
            if (res.data.success) {
                // Refresh data
                const [tenantsRes, buildingsRes, roomsRes] = await Promise.all([
                    axios.get(`${API_URL}/tenants`),
                    axios.get(`${API_URL}/buildings`),
                    axios.get(`${API_URL}/rooms`)
                ]);
                setTenants((tenantsRes.data.data || []).map(t => ({ ...t, id: t._id })));
                setBuildings((buildingsRes.data.data || []).map(b => ({ ...b, id: b._id })));
                setRooms((roomsRes.data.data || []).map(r => ({ ...r, id: r._id })));
                return { success: true, data: res.data.data };
            }
        } catch (err) {
            console.error(err);
            return { success: false, error: err.response?.data?.error || err.message };
        }
    };

    const clearBuildingData = async (buildingId) => {
        try {
            await axios.delete(`${API_URL}/buildings/${buildingId}/clear-data`);
            // Refresh
            const [tenantsRes, roomsRes] = await Promise.all([
                axios.get(`${API_URL}/tenants`),
                axios.get(`${API_URL}/rooms`)
            ]);
            setTenants((tenantsRes.data.data || []).map(t => ({ ...t, id: t._id })));
            setRooms((roomsRes.data.data || []).map(r => ({ ...r, id: r._id })));
            return { success: true };
        } catch (err) {
            console.error(err);
            return { success: false, error: err.response?.data?.error || err.message };
        }
    };

    const updateMaintenanceStatus = (id, status) => {
        setMaintenance(prev => prev.map(item => item.id === id ? { ...item, status } : item));
    };

    const addMaintenance = (req) => {
        setMaintenance(prev => [{ ...req, id: Date.now(), date: new Date().toLocaleDateString('th-TH') }, ...prev]);
    };

    const deleteMaintenance = (id) => {
        setMaintenance(prev => prev.filter(m => m.id !== id));
    };

    const calculateBill = async (room, waterMeter, electricMeter, currentWater, currentElectric) => {
        const tenant = tenants.find(t => t.room === room);
        if (!tenant) return;

        // Use rates from settings
        const waterUnit = settings.waterRate || 35;
        const electricUnit = settings.electricRate || 11;
        const waterMin = settings.waterMin ?? 200;
        const electricMin = settings.electricMin ?? 200;
        const serviceFee = settings.serviceFee ?? 200;

        const waterPriceRaw = waterMeter * waterUnit;
        const electricPriceRaw = electricMeter * electricUnit;

        const waterPrice = Math.max(waterPriceRaw, waterMin);
        const electricPrice = Math.max(electricPriceRaw, electricMin);

        const total = (tenant.rent || 4500) + waterPrice + electricPrice + serviceFee;

        // Mock Dates: 25th last month to 25th this month
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 25);
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 25);
        const dateOptions = { day: 'numeric', month: 'short', year: '2-digit' };

        const newBillData = {
            room,
            water: waterMeter,
            electric: electricMeter,
            total,
            status: 'รอการชำระ',
            dateStart: lastMonth.toLocaleDateString('th-TH', dateOptions),
            dateEnd: thisMonth.toLocaleDateString('th-TH', dateOptions),
            currentWater,
            currentElectric
        };

        try {
            const res = await axios.post(`${API_URL}/billing`, newBillData);
            if (res.data.success) {
                setBilling(prev => {
                    const filtered = prev.filter(b => b.room !== room || b.status === 'ชำระแล้ว');
                    const newEntry = { ...res.data.data, id: res.data.data._id };
                    return [newEntry, ...filtered];
                });
                // Optimistically update tenant
                if (currentWater !== undefined || currentElectric !== undefined) {
                    setTenants(prev => prev.map(t => t.id === tenant.id ? {
                        ...t,
                        lastWaterMeter: currentWater !== undefined ? currentWater : t.lastWaterMeter,
                        lastElectricMeter: currentElectric !== undefined ? currentElectric : t.lastElectricMeter
                    } : t));
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const payBill = async (room) => {
        try {
            const lastPay = new Date().toLocaleDateString('th-TH');
            const res = await axios.put(`${API_URL}/billing/${room}/pay`, { lastPay });
            if (res.data.success) {
                setBilling(prev => prev.map(b => b.room === room && b.status !== 'ชำระแล้ว' ? { ...b, status: 'ชำระแล้ว', lastPay } : b));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const updateBillStatus = async (id, newStatus) => {
        try {
            const res = await axios.put(`${API_URL}/billing/${id}`, { status: newStatus });
            if (res.data.success) {
                setBilling(prev => prev.map(b => (b.id === id || b._id === id) ? { ...b, status: newStatus } : b));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteBill = async (id) => {
        try {
            const res = await axios.delete(`${API_URL}/billing/${id}`);
            if (res.data.success) {
                setBilling(prev => prev.filter(b => b.id !== id && b._id !== id));
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Helper Functions
    const [contractConfig, setContractConfig] = useState({
        title: 'สัญญาเช่าห้องพักอาศัย',
        lessorName: 'หอพักตวงเงินแมนชั่น',
        terms: [
            'ผู้เช่าต้องชำระค่าเช่าภายในวันที่ 5 ของทุกเดือน',
            'ห้ามเลี้ยงสัตว์ทุกชนิดภายในห้องพัก',
            'ห้ามส่งเสียงดังรบกวนผู้เช่าท่านอื่นหลังเวลา 22.00 น.',
            'หากผิดสัญญา ผู้ให้เช่ามีสิทธิ์บอกเลิกสัญญาได้ทันที'
        ]
    });

    const getRoomInfo = (roomNum, buildingContext = null) => {
        // Find building context if not provided
        if (!buildingContext) {
            // we assume first digit is building index offset (1-based)
            const bIndexStr = roomNum.substring(0, 1);
            const bIndex = parseInt(bIndexStr) - 1;
            buildingContext = buildings[bIndex];
            if (!buildingContext) buildingContext = buildings[0]; // fallback
        }

        // skip 0, 1 for floor. 4 digit means index 1 is floor.
        const floor = parseInt(roomNum.substring(1, 2));

        const tenant = tenants.find(t => t.room === roomNum.toString());
        return {
            number: roomNum,
            isOccupied: !!tenant,
            tenant: tenant || null,
            floor,
            buildingId: buildingContext.id,
            rent: buildingContext.defaultRent
        };
    };

    const getAllRooms = () => {
        const allSystemRooms = [];

        buildings.forEach((building, index) => {
            const buildingRooms = rooms.filter(r => r.buildingId === building.id);
            const actualPrefix = building.prefix || (index + 1).toString();

            if (buildingRooms.length > 0) {
                // If this building has rooms in DB, use them
                buildingRooms.forEach(r => {
                    allSystemRooms.push({
                        ...r,
                        isOccupied: tenants.some(t => t.room === r.number && t.buildingId === r.buildingId),
                        tenant: tenants.find(t => t.room === r.number && t.buildingId === r.buildingId) || null
                    });
                });
            } else {
                // Fallback: generate default rooms for this building
                for (let f = 1; f <= building.floors; f++) {
                    for (let r = 1; r <= building.roomsPerFloor; r++) {
                        const roomNum = `${actualPrefix}${f}${r.toString().padStart(2, '0')}`;
                        allSystemRooms.push(getRoomInfo(roomNum, building));
                    }
                }
            }
        });

        return allSystemRooms;
    };

    // Building Management Functions
    const addBuilding = async (building) => {
        try {
            const res = await axios.post(`${API_URL}/buildings`, building);
            if (res.data.success) {
                setBuildings(prev => [...prev, { ...res.data.data, id: res.data.data._id }]);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const updateBuilding = async (id, updates) => {
        try {
            const oldBuilding = buildings.find(b => b.id === id);
            const res = await axios.put(`${API_URL}/buildings/${id}`, updates);
            if (res.data.success) {
                setBuildings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
                
                // Always refetch to ensure the frontend syncs successfully with automatic fixes
                const [resRooms, resTenants, resBills] = await Promise.all([
                    axios.get(`${API_URL}/rooms`),
                    axios.get(`${API_URL}/tenants`),
                    axios.get(`${API_URL}/billing`)
                ]);
                setRooms((resRooms.data.data || []).map(r => ({ ...r, id: r._id })));
                setTenants((resTenants.data.data || []).map(t => ({ ...t, id: t._id })));
                setBilling((resBills.data.data || []).map(b => ({ ...b, id: b._id })));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const deleteBuilding = async (id) => {
        try {
            await axios.delete(`${API_URL}/buildings/${id}`);
            setBuildings(prev => prev.filter(b => b.id !== id));
        } catch (e) {
            console.error(e);
        }
    };

    // Settings Management
    const updateSettings = async (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
        try {
            // Sanitize data: remove DB-specific fields
            const { _id, key, __v, createdAt, updatedAt, ...cleanData } = newSettings;
            const res = await axios.put(`${API_URL}/settings`, cleanData);
            return res.data.success;
        } catch (err) {
            console.error('Error saving settings:', err);
            return false;
        }
    };

    // Get rooms by building
    const getRoomsByBuilding = (buildingId) => {
        const roomsList = getAllRooms();
        return roomsList.filter(r => String(r.buildingId) === String(buildingId));
    };

    return (
        <AppContext.Provider value={{
            // Buildings & Settings
            buildings, addBuilding, updateBuilding, deleteBuilding,
            settings, updateSettings,
            rooms, getRoomsByBuilding,
            getAllRooms,

            // Tenants
            tenants, addTenant, removeTenant, updateTenant, bulkImportTenants, clearBuildingData,

            // Maintenance
            maintenance, updateMaintenanceStatus, addMaintenance, deleteMaintenance,

            // Billing
            billing, calculateBill, payBill, updateBillStatus, deleteBill,
            meters, setMeters,

            // Reports
            incomeHistory,

            // Legacy (for backward compatibility)
            roomConfig,
            getRoomInfo,
            contractConfig, setContractConfig
        }}>
            {children}
        </AppContext.Provider>
    );
};

