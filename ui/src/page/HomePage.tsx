import React from "react";
import {
  Search,
  Bell,
  Thermometer,
  Droplets,
  Zap,
  Armchair,
  Bed,
  ChefHat,
  Lightbulb,
  Bluetooth,
  Tv,
  Wifi,
  Refrigerator,
  Snowflake,
  Home,
  Square,
  Settings,
  Plus,
} from "lucide-react";

interface DeviceCardProps {
  icon: React.ReactNode;
  connectionIcon: React.ReactNode;
  title: string;
  subtitle: string;
  deviceCount?: string;
  isOn?: boolean;
  showToggle?: boolean;
}

const DeviceCard: React.FC<DeviceCardProps> = ({
  icon,
  connectionIcon,
  title,
  subtitle,
  deviceCount,
  isOn = false,
  showToggle = true,
}) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <div className="flex justify-between items-start mb-3">
      <div className="text-blue-500">{icon}</div>
      <div className="text-gray-400">{connectionIcon}</div>
    </div>
    <h3 className="font-semibold text-gray-800 text-sm mb-1">{title}</h3>
    <p className="text-gray-500 text-xs mb-3">{subtitle}</p>
    <div className="flex justify-between items-center">
      {deviceCount && (
        <span className="text-gray-600 text-xs">{deviceCount}</span>
      )}
      {showToggle && (
        <div
          className={`w-10 h-6 rounded-full transition-colors ${
            isOn ? "bg-blue-500" : "bg-gray-300"
          }`}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full transition-transform ${
              isOn ? "translate-x-5" : "translate-x-1"
            } mt-1`}
          />
        </div>
      )}
    </div>
  </div>
);

interface RoomTabProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const RoomTab: React.FC<RoomTabProps> = ({
  icon,
  label,
  isActive,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
      isActive
        ? "bg-blue-500 text-white"
        : "bg-white text-gray-600 hover:bg-gray-50"
    }`}
  >
    <div className="text-lg">{icon}</div>
    <span className="text-xs font-medium">{label}</span>
  </button>
);

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  isActive,
  onClick,
}) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1">
    <div className={`text-lg ${isActive ? "text-blue-500" : "text-gray-400"}`}>
      {icon}
    </div>
    <span
      className={`text-xs font-medium ${
        isActive ? "text-blue-500" : "text-gray-400"
      }`}
    >
      {label}
    </span>
    {isActive && <div className="w-1 h-1 bg-blue-500 rounded-full mt-1" />}
  </button>
);

const HomePage: React.FC<DeviceCardProps> = ({
  icon,
  connectionIcon,
  title,
  subtitle,
  deviceCount,
  isOn = false,
  showToggle = true,
}) => {
  const [activeRoom, setActiveRoom] = React.useState("living-room");
  const [activeTab, setActiveTab] = React.useState("home");

  return (
    <div className="w-[375px] h-[667px] bg-gray-50 mx-auto relative overflow-hidden">
      {/* Top Status Bar */}
      <div className="flex justify-between items-center px-6 py-2 bg-white">
        <span className="text-sm font-medium text-gray-800">9:41</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2 bg-gray-800 rounded-sm" />
          <div className="w-3 h-2 bg-gray-800 rounded-sm" />
          <div className="w-2 h-2 bg-gray-800 rounded-sm" />
        </div>
      </div>

      {/* Header Section */}
      <div className="px-6 py-4 bg-white">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">H</span>
            </div>
            <span className="text-gray-800 font-medium">Hi Henry</span>
          </div>
          <div className="flex gap-3">
            <Search className="w-5 h-5 text-gray-600" />
            <Bell className="w-5 h-5 text-gray-600" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-gray-800">
          Control your home Smartly
        </h1>
      </div>

      {/* Environmental Data Card */}
      <div className="px-6 py-4">
        <div className="bg-blue-500 rounded-xl p-4 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5" />
              <div>
                <p className="text-xs opacity-90">Temp</p>
                <p className="font-semibold">26°C</p>
              </div>
            </div>
            <div className="w-px h-8 bg-white opacity-30" />
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5" />
              <div>
                <p className="text-xs opacity-90">Humidity</p>
                <p className="font-semibold">60%</p>
              </div>
            </div>
            <div className="w-px h-8 bg-white opacity-30" />
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <div>
                <p className="text-xs opacity-90">Energy</p>
                <p className="font-semibold">20 Kwh</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Room Selection */}
      <div className="px-6 py-4">
        <div className="flex gap-3 overflow-x-auto">
          <RoomTab
            icon={<Armchair className="w-5 h-5" />}
            label="Living room"
            isActive={activeRoom === "living-room"}
            onClick={() => setActiveRoom("living-room")}
          />
          <RoomTab
            icon={<Bed className="w-5 h-5" />}
            label="Bedroom"
            isActive={activeRoom === "bedroom"}
            onClick={() => setActiveRoom("bedroom")}
          />
          <RoomTab
            icon={<ChefHat className="w-5 h-5" />}
            label="Kitchen"
            isActive={activeRoom === "kitchen"}
            onClick={() => setActiveRoom("kitchen")}
          />
        </div>
      </div>

      {/* Connected Devices Header */}
      <div className="px-6 py-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-gray-800 font-semibold">
              Connected devices
            </span>
            <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              6
            </div>
          </div>
          <button className="flex items-center gap-1 text-blue-500 text-sm font-medium">
            <Plus className="w-4 h-4" />
            Add device
          </button>
        </div>
      </div>

      {/* Device Grid */}
      <div className="px-6 py-2 flex-1">
        <div className="grid grid-cols-2 gap-3">
          <DeviceCard
            icon={<Lightbulb className="w-6 h-6" />}
            connectionIcon={<Bluetooth className="w-4 h-4" />}
            title="Smart Lighting"
            subtitle="100% led light"
            deviceCount="10 Devices"
            isOn={true}
            showToggle={true}
          />
          <DeviceCard
            icon={<Tv className="w-6 h-6" />}
            connectionIcon={<Wifi className="w-4 h-4" />}
            title="Smart TV"
            subtitle="Used 8 Kwh"
            deviceCount="2 Devices"
            isOn={false}
            showToggle={true}
          />
          <DeviceCard
            icon={<Refrigerator className="w-6 h-6" />}
            connectionIcon={<Bluetooth className="w-4 h-4" />}
            title="Refrigerator"
            subtitle="Used 5.2 Kwh"
            showToggle={false}
          />
          <DeviceCard
            icon={<Snowflake className="w-6 h-6" />}
            connectionIcon={<Bluetooth className="w-4 h-4" />}
            title="Air Conditioner"
            subtitle="Used 9 Kwh"
            showToggle={false}
          />
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex justify-between items-center">
          <NavItem
            icon={<Home className="w-5 h-5" />}
            label="Home"
            isActive={activeTab === "home"}
            onClick={() => setActiveTab("home")}
          />
          <NavItem
            icon={<Square className="w-5 h-5" />}
            label="Devices"
            isActive={activeTab === "devices"}
            onClick={() => setActiveTab("devices")}
          />
          <NavItem
            icon={<Lightbulb className="w-5 h-5" />}
            label="Energy"
            isActive={activeTab === "energy"}
            onClick={() => setActiveTab("energy")}
          />
          <NavItem
            icon={<Settings className="w-5 h-5" />}
            label="Settings"
            isActive={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
