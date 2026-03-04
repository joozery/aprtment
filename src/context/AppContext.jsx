import React, { createContext, useContext, useState, useEffect } from 'react';

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
        waterRate: 20,      // บาท/หน่วย
        electricRate: 7,    // บาท/หน่วย
        defaultRent: 4500,  // บาทต่อเดือน
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
    const [buildings, setBuildings] = useState(() => {
        const saved = localStorage.getItem('smart_buildings');
        return saved ? JSON.parse(saved) : initialBuildings;
    });

    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('smart_settings');
        return saved ? JSON.parse(saved) : initialSettings;
    });

    const [tenants, setTenants] = useState(() => {
        const saved = localStorage.getItem('smart_tenants');
        return saved ? JSON.parse(saved) : initialTenants;
    });

    const [maintenance, setMaintenance] = useState(() => {
        const saved = localStorage.getItem('smart_maintenance');
        return saved ? JSON.parse(saved) : initialMaintenance;
    });

    const [billing, setBilling] = useState(() => {
        const saved = localStorage.getItem('smart_billing');
        return saved ? JSON.parse(saved) : [
            { room: '1101', buildingId: 1, name: 'สุรศักดิ์ ใจกล้า', water: 15, electric: 120, total: 5210, status: 'รอการชำระ', lastPay: '-' },
            { room: '1102', buildingId: 1, name: 'กานดา รักงาน', water: 12, electric: 145, total: 5320, status: 'ชำระแล้ว', lastPay: '25 มิ.ย. 67' },
        ];
    });

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

    useEffect(() => {
        localStorage.setItem('smart_buildings', JSON.stringify(buildings));
    }, [buildings]);

    useEffect(() => {
        localStorage.setItem('smart_settings', JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        localStorage.setItem('smart_tenants', JSON.stringify(tenants));
    }, [tenants]);

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
    const addTenant = (tenant) => {
        setTenants(prev => [...prev, { ...tenant, id: Date.now(), avatar: tenant.name.substring(0, 2).toUpperCase() }]);
    };

    const removeTenant = (id) => {
        setTenants(prev => prev.filter(t => t.id !== id));
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

    const calculateBill = (room, waterMeter, electricMeter) => {
        const tenant = tenants.find(t => t.room === room);
        if (!tenant) return;

        // Use rates from settings
        const waterUnit = settings.waterRate || 20;
        const electricUnit = settings.electricRate || 7;
        const waterPrice = waterMeter * waterUnit;
        const electricPrice = electricMeter * electricUnit;
        const total = (tenant.rent || 4500) + waterPrice + electricPrice;

        // Mock Dates: 25th last month to 25th this month
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 25);
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 25);
        const dateOptions = { day: 'numeric', month: 'short', year: '2-digit' };

        const newBill = {
            room,
            name: tenant.name,
            water: waterMeter,
            electric: electricMeter,
            total,
            total,
            status: 'รอการชำระ',
            lastPay: '-',
            dateStart: lastMonth.toLocaleDateString('th-TH', dateOptions),
            dateEnd: thisMonth.toLocaleDateString('th-TH', dateOptions)
        };

        setBilling(prev => {
            const filtered = prev.filter(b => b.room !== room);
            return [newBill, ...filtered];
        });
    };

    const payBill = (room) => {
        setBilling(prev => prev.map(b => b.room === room ? { ...b, status: 'ชำระแล้ว', lastPay: new Date().toLocaleDateString('th-TH') } : b));
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
            // we assume first digit is building id
            const bId = parseInt(roomNum.substring(0, 1));
            buildingContext = buildings.find(b => b.id === bId);
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
        const rooms = [];
        buildings.forEach((building) => {
            const buildingPrefix = building.id.toString();
            for (let f = 1; f <= building.floors; f++) {
                for (let r = 1; r <= building.roomsPerFloor; r++) {
                    const roomNum = `${buildingPrefix}${f}${r.toString().padStart(2, '0')}`;
                    rooms.push(getRoomInfo(roomNum, building));
                }
            }
        });
        return rooms;
    };

    // Building Management Functions
    const addBuilding = (building) => {
        setBuildings(prev => [...prev, { ...building, id: Date.now() }]);
    };

    const updateBuilding = (id, updates) => {
        setBuildings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    const deleteBuilding = (id) => {
        setBuildings(prev => prev.filter(b => b.id !== id));
    };

    // Settings Management
    const updateSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    // Get rooms by building
    const getRoomsByBuilding = (buildingId) => {
        const building = buildings.find(b => b.id === buildingId);
        if (!building) return [];

        const rooms = [];
        const buildingPrefix = building.id.toString();

        for (let f = 1; f <= building.floors; f++) {
            for (let r = 1; r <= building.roomsPerFloor; r++) {
                const roomNum = `${buildingPrefix}${f}${r.toString().padStart(2, '0')}`;
                const tenant = tenants.find(t => t.room === roomNum && t.buildingId === buildingId);
                rooms.push({
                    number: roomNum,
                    buildingId,
                    isOccupied: !!tenant,
                    tenant: tenant || null,
                    floor: f,
                    rent: building.defaultRent // use building specific rent
                });
            }
        }
        return rooms;
    };

    return (
        <AppContext.Provider value={{
            // Buildings & Settings
            buildings, addBuilding, updateBuilding, deleteBuilding,
            settings, updateSettings,
            getRoomsByBuilding,

            // Tenants
            tenants, addTenant, removeTenant,

            // Maintenance
            maintenance, updateMaintenanceStatus, addMaintenance, deleteMaintenance,

            // Billing
            billing, calculateBill, payBill,
            meters, setMeters,

            // Reports
            incomeHistory,

            // Legacy (for backward compatibility)
            roomConfig,
            getRoomInfo,
            getAllRooms,
            contractConfig, setContractConfig
        }}>
            {children}
        </AppContext.Provider>
    );
};

