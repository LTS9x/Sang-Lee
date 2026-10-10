import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Plus,
  ShieldCheck,
  Bell,
  ChevronDown,
  Check,
  User,
  Globe,
  Settings,
  AlertTriangle,
  Clock,
  Calendar,
  FileText,
  Menu,
} from 'lucide-react';
import { StaffMember } from '../types';

interface NavbarProps {
  title: string;
  subtitle?: string;
  currentUser: StaffMember;
  staff: StaffMember[];
  onOpenUpload: () => void;
  onOpenCreateCase: () => void;
  onSwitchUser: (member: StaffMember) => void;
  onOpenClientPortal: () => void;
  onOpenProfile: () => void;
  onToggleMobileMenu?: () => void;
  onOpenAdminPortal?: () => void;
}

interface LegalNotification {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'urgent' | 'hearing' | 'document' | 'assignment';
  read: boolean;
}

const SAMPLE_NOTIFICATIONS: LegalNotification[] = [
  {
    id: 'notif-1',
    title: 'Phiên Tòa xét xử sơ thẩm sắp diễn ra',
    desc: 'Hồ sơ HS-202610-0001 (Tranh chấp đặt cọc) mở phiên xét xử lúc 09:00 ngày 08/10 tại TAND TP.HCM.',
    time: '30 phút trước',
    type: 'hearing',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Hạn chót bổ sung bản Luận cứ bảo vệ',
    desc: 'Vụ việc Đất đai HS-202610-0003 cần nộp văn bản bảo vệ quyền lợi trước 17:00 ngày 15/10.',
    time: '2 giờ trước',
    type: 'urgent',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'Khách hàng tiếp nhận tài liệu mới',
    desc: 'Công ty Bất động sản Hoàng Gia vừa gửi tệp [Giấy chứng nhận QSDĐ.pdf].',
    time: 'Hôm qua',
    type: 'document',
    read: true,
  },
  {
    id: 'notif-4',
    title: 'Phân công nhân sự thụ lý vụ việc',
    desc: 'Bạn được chỉ định phụ trách hồ sơ Tư vấn sáp nhập doanh nghiệp HS-202610-0002.',
    time: '2 ngày trước',
    type: 'assignment',
    read: true,
  },
];

export const Navbar: React.FC<NavbarProps> = ({
  title,
  subtitle,
  currentUser,
  staff,
  onOpenUpload,
  onOpenCreateCase,
  onSwitchUser,
  onOpenClientPortal,
  onOpenProfile,
  onToggleMobileMenu,
  onOpenAdminPortal,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<LegalNotification[]>(SAMPLE_NOTIFICATIONS);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const canCreateCase = currentUser.permissions.includes('create_edit_cases');
  const canUploadDoc = currentUser.permissions.includes('upload_documents');

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Title & Mobile Toggle */}
      <div className="flex items-center min-w-0 mr-2">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 -ml-1 mr-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Mở thanh điều hướng"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight truncate max-w-[200px] sm:max-w-md lg:max-w-xl">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-slate-500 truncate hidden sm:block max-w-[240px] sm:max-w-md lg:max-w-xl">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
        {/* Dedicated Admin Portal Switcher (Strictly for Admin) */}
        {currentUser.roleId === 'admin' && onOpenAdminPortal && (
          <button
            onClick={onOpenAdminPortal}
            className="px-2.5 sm:px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 hover:from-red-900 hover:to-amber-900 text-amber-300 border border-amber-500/60 rounded-lg flex items-center space-x-1.5 transition-all shadow-md cursor-pointer animate-pulse"
            title="Mở Trang Quản Trị Hệ Thống riêng biệt dành cho Admin"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Trang Quản Trị Admin</span>
            <span className="sm:hidden font-mono">ADMIN</span>
          </button>
        )}

        {/* Client Portal Shortcut */}
        <button
          onClick={onOpenClientPortal}
          className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 rounded-lg flex items-center space-x-1.5 transition-colors shadow-2xs cursor-pointer"
          title="Mở Cổng tra cứu tiến độ hồ sơ cho Khách hàng"
        >
          <Globe className="w-3.5 h-3.5 text-red-800" />
          <span className="hidden sm:inline">Cổng Thân chủ</span>
        </button>

        {/* Quick upload button */}
        {canUploadDoc && (
          <button
            onClick={onOpenUpload}
            className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center space-x-1.5 transition-colors border border-slate-200 shadow-2xs cursor-pointer"
            title="Tải tài liệu của khách hàng lên hệ thống"
          >
            <Upload className="w-3.5 h-3.5 text-red-800" />
            <span className="hidden md:inline">Tải tài liệu</span>
          </button>
        )}

        {/* Quick create case */}
        {canCreateCase && (
          <button
            onClick={onOpenCreateCase}
            className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold bg-[#8b1d24] hover:bg-[#73161c] text-white rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
            title="Khởi tạo hồ sơ vụ việc mới"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tạo hồ sơ</span>
          </button>
        )}

        <div className="w-px h-5 bg-slate-200 mx-0.5 sm:mx-1 hidden sm:block" />

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg relative transition-colors cursor-pointer"
            title="Thông báo lịch Tòa & Nhiệm vụ"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-600 absolute top-1.5 right-1.5 ring-2 ring-white" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900">Thông báo Pháp lý</div>
                  <div className="text-[10px] text-slate-400">
                    {unreadCount > 0 ? `${unreadCount} thông báo chưa xem` : 'Đã đọc toàn bộ'}
                  </div>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-red-800 hover:underline font-semibold"
                  >
                    Đọc tất cả
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 text-xs transition-colors hover:bg-slate-50 ${
                      !n.read ? 'bg-red-50/40' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="font-bold text-slate-900 leading-tight">{n.title}</div>
                      <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug mt-1">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 transition-colors shadow-2xs"
          >
            <div
              className={`w-6 h-6 rounded-lg ${
                currentUser.avatarColor || 'bg-slate-900'
              } text-white text-[10px] font-bold flex items-center justify-center`}
            >
              {currentUser.initials}
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-bold text-slate-900 leading-tight truncate max-w-[130px]">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                {currentUser.role}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Account / Role Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
              {currentUser.roleId === 'admin' ? (
                <>
                  <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-red-800 flex items-center space-x-1">
                        <span>👑 Chế độ Quản trị (Admin)</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        Xem trước giao diện từng nhân sự được phân công:
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenProfile();
                      }}
                      className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800"
                      title="Cài đặt tài khoản & Đổi mật khẩu"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto py-1">
                    {staff.map((member) => {
                      const isCurrent = currentUser.id === member.id;
                      return (
                        <button
                          key={member.id}
                          onClick={() => {
                            onSwitchUser(member);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs hover:bg-slate-50 transition-colors ${
                            isCurrent ? 'bg-red-50/70 font-semibold' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 truncate">
                            <div
                              className={`w-6 h-6 rounded-lg ${
                                member.avatarColor || 'bg-slate-800'
                              } text-white text-[10px] font-bold flex items-center justify-center shrink-0`}
                            >
                              {member.initials}
                            </div>
                            <div className="truncate">
                              <div className="font-bold text-slate-900 truncate">{member.name}</div>
                              <div className="text-[10px] text-slate-500 truncate">{member.role}</div>
                            </div>
                          </div>
                          {isCurrent && <Check className="w-4 h-4 text-red-800 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* Regular Staff View: strictly their own profile, no switcher to other accounts */
                <div className="px-4 py-3 space-y-3">
                  <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                    <div
                      className={`w-10 h-10 rounded-xl ${
                        currentUser.avatarColor || 'bg-slate-800'
                      } text-white font-bold text-sm flex items-center justify-center shadow-inner shrink-0`}
                    >
                      {currentUser.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-sm truncate">{currentUser.name}</div>
                      <div className="text-xs text-slate-500 truncate">{currentUser.role}</div>
                      <span className="inline-block text-[10px] font-semibold text-slate-400">
                        {currentUser.department}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center justify-between">
                      <span>Phạm vi phân công công việc</span>
                      <span className="text-emerald-700 font-semibold">{currentUser.permissions.length}/10 quyền</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Hạn mức thụ lý:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {currentUser.activeCases} / {currentUser.maxCaseloadQuota || 15} hồ sơ
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Email Google Auth:</span>
                      <span className="font-mono text-slate-700 truncate max-w-[150px]">
                        {currentUser.googleEmail || currentUser.email}
                      </span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-200/60">
                      <div className="text-[10px] text-slate-500 mb-1 font-semibold">Quyền hạn Admin đã cấp:</div>
                      <div className="flex flex-wrap gap-1">
                        {currentUser.permissions.map((p) => {
                          const labels: Record<string, string> = {
                            view_all_cases: 'Xem hồ sơ',
                            create_edit_cases: 'Soạn/Sửa hồ sơ',
                            delete_cases: 'Xóa hồ sơ',
                            upload_documents: 'Tải tài liệu',
                            delete_documents: 'Xóa tài liệu',
                            view_confidential_notes: 'Ghi chú mật',
                            assign_lawyers: 'Phân công LS',
                            manage_billing: 'Thù lao',
                            manage_users_roles: 'Quản trị nhân sự',
                            system_settings: 'Cài đặt hệ thống',
                          };
                          return (
                            <span
                              key={p}
                              className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[9px] font-semibold text-slate-700"
                            >
                              ✓ {labels[p] || p}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 italic pt-1">
                      🔒 Tài khoản & quyền hạn do Admin thiết lập theo phân công.
                    </div>
                  </div>
                </div>
              )}

              <div className="px-3.5 py-2 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 rounded-b-2xl flex items-center justify-between">
                <span>{currentUser.roleId === 'admin' ? 'Toàn quyền Admin' : 'Không gian làm việc nhân sự'}</span>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onOpenProfile();
                  }}
                  className="text-red-800 hover:underline font-bold"
                >
                  Hồ sơ cá nhân & Đổi MK →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
