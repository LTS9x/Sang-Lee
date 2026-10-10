import React from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FolderOpen,
  CheckSquare,
  UserCheck,
  Settings,
  LogOut,
  Scale,
  X,
  Shield,
} from 'lucide-react';
import { StaffMember } from '../types';

export type TabType = 
  | 'my-workspace'
  | 'dashboard'
  | 'cases'
  | 'tasks'
  | 'documents'
  | 'clients'
  | 'staff'
  | 'settings';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currentUser: StaffMember;
  onLogout: () => void;
  onOpenProfile: () => void;
  casesCount: number;
  docsCount: number;
  tasksCount: number;
  clientsCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenAdminPortal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onOpenProfile,
  casesCount,
  docsCount,
  tasksCount,
  clientsCount,
  isMobileOpen = false,
  onCloseMobile,
  onOpenAdminPortal,
}) => {
  const isAdmin = currentUser.roleId === 'admin';

  // Strict role-based navigation:
  // Admin sees full law firm governance, dashboard, settings, and staff RBAC.
  // Staff ONLY sees their assigned workspace and relevant job-related interfaces.
  const navItems = [
    {
      id: 'my-workspace' as TabType,
      label: isAdmin ? 'Bàn làm việc Admin' : 'Bàn làm việc của tôi',
      icon: Briefcase,
      badge: tasksCount > 0 ? `${tasksCount}` : null,
      highlight: true,
      description: isAdmin ? 'Công việc cá nhân quản trị' : 'Không gian làm việc & hồ sơ được giao',
    },
    // Dashboard: STRICTLY for Admin only (Firm-wide revenue, stats & KPIs)
    ...(isAdmin ? [{
      id: 'dashboard' as TabType,
      label: 'Tổng quan hãng luật',
      icon: LayoutDashboard,
      badge: null,
      description: 'Chỉ số & KPI toàn công ty',
    }] : []),
    {
      id: 'cases' as TabType,
      label: isAdmin ? 'Hồ sơ / Vụ việc (Tất cả)' : 'Hồ sơ được phân công',
      icon: Scale,
      badge: casesCount > 0 ? casesCount : null,
      description: isAdmin ? 'Tất cả hồ sơ toàn công ty' : 'Vụ việc do Admin phân công',
    },
    {
      id: 'tasks' as TabType,
      label: isAdmin ? 'Quản lý Công việc' : 'Công việc của tôi',
      icon: CheckSquare,
      badge: tasksCount > 0 ? tasksCount : null,
      description: isAdmin ? 'Nhiệm vụ toàn công ty' : 'Nhiệm vụ được phân công',
    },
    {
      id: 'documents' as TabType,
      label: isAdmin ? 'Kho tài liệu chung' : 'Tài liệu hồ sơ',
      icon: FolderOpen,
      badge: docsCount > 0 ? docsCount : null,
      description: isAdmin ? 'Kho lưu trữ toàn hãng luật' : 'Tài liệu vụ việc phụ trách',
    },
    {
      id: 'clients' as TabType,
      label: isAdmin ? 'Danh bạ Khách hàng' : 'Thân chủ liên quan',
      icon: Users,
      badge: clientsCount > 0 ? clientsCount : null,
      description: isAdmin ? 'Toàn bộ thân chủ công ty' : 'Khách hàng vụ việc phụ trách',
    },
    // Staff: STRICTLY for Admin only (Personnel accounts, Google Auth setup, RBAC)
    ...(isAdmin ? [{
      id: 'staff' as TabType,
      label: 'Nhân sự & Phân quyền',
      icon: UserCheck,
      badge: null,
      description: 'Quản trị tài khoản & Cài đặt Email Google',
    }] : []),
    // Settings: STRICTLY for Admin only (Security, System Audit Logs, Office Config)
    ...(isAdmin ? [{
      id: 'settings' as TabType,
      label: 'Quản trị hệ thống',
      icon: Settings,
      badge: null,
      adminOnly: true,
      description: 'Cấu hình bảo mật & Audit log',
    }] : []),
  ];

  const handleSelectTab = (id: TabType) => {
    setActiveTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const renderSidebarContent = (isMobileView = false) => (
    <div className="flex flex-col h-full justify-between">
      {/* Brand Header */}
      <div>
        <div className="p-5 sm:p-6 border-b border-[#23252a] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-800 flex items-center justify-center text-white shadow-md shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight leading-none text-white">
                BIGBOSS <span className="text-[#c52227]">LAW</span>
              </div>
              <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-1 tracking-wide">
                {isAdmin ? '👑 Ban Quản trị Tối cao' : '⚖️ Không gian Nhân sự'}
              </div>
            </div>
          </div>

          {isMobileView && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Đóng menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scope Banner: Admin vs Assigned Staff */}
        {!isAdmin ? (
          <div className="mx-3 mt-3 p-2.5 rounded-xl bg-[#1b1c21] border border-amber-900/40 text-[11px] space-y-1">
            <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center justify-between">
              <span>Phân công từ Admin</span>
              <span className="font-mono text-slate-400">{currentUser.initials}</span>
            </div>
            <div className="text-slate-200 font-semibold truncate">{currentUser.role}</div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span>Vụ việc phụ trách:</span>
              <span className="font-bold text-amber-300 font-mono">{casesCount} hồ sơ</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Nhiệm vụ cần làm:</span>
              <span className="font-bold text-slate-200 font-mono">{tasksCount} việc</span>
            </div>
          </div>
        ) : (
          <div className="mx-3 mt-3 p-3 rounded-xl bg-gradient-to-br from-red-950/70 via-[#191b22] to-amber-950/40 border border-amber-600/40 text-[11px] space-y-2">
            <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center justify-between">
              <span>👑 Chế độ Quản trị</span>
              <span className="font-mono text-amber-300">ADMIN</span>
            </div>
            <div className="text-slate-200 font-semibold truncate">Toàn quyền Hãng Luật</div>
            {onOpenAdminPortal && (
              <button
                onClick={() => {
                  onOpenAdminPortal();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full py-2 px-2.5 bg-gradient-to-r from-red-800 to-amber-700 hover:from-red-700 hover:to-amber-600 text-white font-bold rounded-lg shadow-md flex items-center justify-center space-x-1.5 transition-all cursor-pointer text-xs border border-amber-500/40 group"
              >
                <Shield className="w-3.5 h-3.5 text-amber-300 group-hover:scale-110 transition-transform" />
                <span>Trang Quản Trị Admin</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.adminOnly && !isAdmin) {
            return null;
          }

          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#25272c] text-white shadow-inner font-bold border-l-2 border-red-600'
                  : item.highlight
                  ? 'text-slate-200 hover:text-white bg-[#1a1c22] hover:bg-[#20222a]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1c1d22]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 transition-colors shrink-0 ${
                    isActive
                      ? 'text-red-500'
                      : item.highlight
                      ? 'text-amber-400'
                      : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== null && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                    isActive
                      ? 'bg-red-800 text-white'
                      : item.highlight
                      ? 'bg-red-950 text-red-300 border border-red-900/60'
                      : 'bg-[#222428] text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / User Profile Card & Logout */}
      <div className="p-3 border-t border-[#23252a] space-y-2">
        <div
          onClick={() => {
            onOpenProfile();
            if (onCloseMobile) onCloseMobile();
          }}
          className="bg-[#1b1c21] hover:bg-[#23252c] p-2.5 rounded-xl border border-[#272930] flex items-center space-x-2.5 cursor-pointer transition-colors group"
          title="Nhấn để mở Cài đặt tài khoản & Đổi mật khẩu"
        >
          <div
            className={`w-8 h-8 rounded-lg ${
              currentUser.avatarColor || 'bg-slate-800'
            } text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-inner`}
          >
            {currentUser.initials}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-xs font-bold text-white truncate group-hover:text-red-400 transition-colors">
              {currentUser.name}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {currentUser.role}
            </div>
            <div className="mt-0.5">
              <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded ${
                isAdmin
                  ? 'bg-red-900/80 text-red-200 border border-red-800'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                {isAdmin ? 'Toàn quyền Admin' : `Phân công: ${casesCount} hồ sơ`}
              </span>
            </div>
          </div>
          <Settings className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
        </div>

        <button
          onClick={() => {
            onLogout();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border border-[#30333b] hover:border-red-900 bg-transparent hover:bg-red-950/30 text-slate-400 hover:text-red-300 text-xs font-medium transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (>= lg: 1024px) */}
      <aside className="hidden lg:flex w-64 bg-[#141518] text-slate-300 flex-col shrink-0 min-h-screen border-r border-[#26282e] select-none">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile & Tablet Drawer (< lg: 1024px) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Overlay */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Off-canvas Drawer */}
          <aside className="relative w-72 max-w-[85vw] bg-[#141518] text-slate-300 flex flex-col h-full border-r border-[#26282e] shadow-2xl z-10 animate-in slide-in-from-left duration-250 select-none">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
