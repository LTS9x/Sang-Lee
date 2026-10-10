import React from 'react';
import {
  Briefcase,
  Scale,
  CheckSquare,
  Users,
  Menu,
} from 'lucide-react';
import { TabType } from './Sidebar';

interface MobileBottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenMobileMenu: () => void;
  casesCount: number;
  tasksCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileMenu,
  casesCount,
  tasksCount,
}) => {
  const items = [
    {
      id: 'my-workspace' as TabType,
      label: 'Bàn việc',
      icon: Briefcase,
      badge: null,
    },
    {
      id: 'cases' as TabType,
      label: 'Hồ sơ',
      icon: Scale,
      badge: casesCount > 0 ? casesCount : null,
    },
    {
      id: 'tasks' as TabType,
      label: 'Công việc',
      icon: CheckSquare,
      badge: tasksCount > 0 ? tasksCount : null,
    },
    {
      id: 'clients' as TabType,
      label: 'Thân chủ',
      icon: Users,
      badge: null,
    },
  ];

  return (
    <nav
      aria-label="Điều hướng nhanh thiết bị di động"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[46px] rounded-xl transition-all cursor-pointer relative ${
                isActive
                  ? 'text-red-800 font-bold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-red-800' : 'text-slate-500'
                  }`}
                />
                {item.badge !== null && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-red-700 text-white text-[9px] font-bold flex items-center justify-center shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 leading-tight tracking-tight">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-red-800 mt-0.5" />
              )}
            </button>
          );
        })}

        {/* More / Menu Drawer Trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[46px] rounded-xl text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
          title="Mở toàn bộ danh mục & cài đặt"
        >
          <Menu className="w-5 h-5 text-slate-600" />
          <span className="text-[10px] mt-0.5 font-medium leading-tight tracking-tight">
            Thêm
          </span>
        </button>
      </div>
    </nav>
  );
};
