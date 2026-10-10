import React, { useState } from 'react';
import {
  UserCheck,
  Phone,
  Mail,
  Shield,
  ShieldCheck,
  UserPlus,
  Edit3,
  Check,
  X,
  ExternalLink,
  Users,
  Briefcase,
  Key,
  Lock,
  Unlock,
  Award,
  BarChart2,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
} from 'lucide-react';
import { StaffMember, LegalCase, PermissionKey, UserRole } from '../types';
import { StaffRoleModal } from './Modals/StaffRoleModal';

interface StaffViewProps {
  staff: StaffMember[];
  cases: LegalCase[];
  currentUser: StaffMember;
  onSelectCase: (caseItem: LegalCase) => void;
  onSaveStaff: (staffMember: StaffMember) => void;
  onSwitchUser: (staffMember: StaffMember) => void;
}

const PERMISSION_COLUMNS: { key: PermissionKey; label: string }[] = [
  { key: 'view_all_cases', label: 'Xem tất cả hồ sơ' },
  { key: 'create_edit_cases', label: 'Tạo & Sửa hồ sơ' },
  { key: 'upload_documents', label: 'Tải tài liệu KH' },
  { key: 'delete_documents', label: 'Xóa tài liệu' },
  { key: 'view_confidential_notes', label: 'Ghi chú mật' },
  { key: 'assign_lawyers', label: 'Phân công LS' },
  { key: 'manage_billing', label: 'Quản lý Thù lao' },
  { key: 'manage_users_roles', label: 'Phân quyền QTV' },
  { key: 'system_settings', label: 'Cài đặt hệ thống' },
];

export const StaffView: React.FC<StaffViewProps> = ({
  staff,
  cases,
  currentUser,
  onSelectCase,
  onSaveStaff,
  onSwitchUser,
}) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'matrix'>('directory');
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const isAdmin = currentUser.roleId === 'admin';

  const handleOpenCreate = () => {
    if (!isAdmin) {
      alert('Chỉ Luật sư Điều hành (Admin) mới có thẩm quyền tạo tài khoản nhân sự mới! Người dùng không được phép tự tạo tài khoản.');
      return;
    }
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: StaffMember) => {
    if (!isAdmin) {
      alert('Chỉ Luật sư Điều hành (Admin) mới có thẩm quyền thay đổi vai trò và phân quyền nhân sự! Người dùng không được phép tự nâng quyền.');
      return;
    }
    setEditingStaff(member);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (member: StaffMember) => {
    if (!isAdmin) {
      alert('Chỉ Luật sư Điều hành (Admin) mới có thẩm quyền khóa hoặc kích hoạt tài khoản nhân sự!');
      return;
    }
    if (member.id === currentUser.id) {
      alert('Không thể tự khóa tài khoản quản trị viên đang đăng nhập!');
      return;
    }
    const nextStatus = member.status === 'active' ? 'suspended' : 'active';
    const updated: StaffMember = { ...member, status: nextStatus };
    onSaveStaff(updated);
    showToast(
      nextStatus === 'suspended'
        ? `Đã tạm khóa tài khoản của ${member.name}. Quyền truy cập hồ sơ bị đình chỉ.`
        : `Đã mở khóa và kích hoạt lại tài khoản cho ${member.name}.`
    );
  };

  const handleResetPassword = (member: StaffMember) => {
    if (!isAdmin) {
      alert('Chỉ Luật sư Điều hành (Admin) mới có thẩm quyền đặt lại mật khẩu nhân sự!');
      return;
    }
    const tempPass = `BB@${Math.floor(100000 + Math.random() * 900000)}`;
    showToast(
      `Đã đặt lại mật khẩu cho ${member.name}. Mật khẩu tạm thời: [ ${tempPass} ] đã gửi tới email ${member.email}`
    );
  };

  const getRoleBadge = (roleId: UserRole) => {
    switch (roleId) {
      case 'admin':
        return 'bg-red-900 text-white border-red-800';
      case 'partner_lawyer':
        return 'bg-slate-900 text-white border-slate-800';
      case 'associate_lawyer':
        return 'bg-red-50 text-red-900 border-red-200';
      case 'paralegal':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'accountant':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Departments list for filter
  const departments = Array.from(new Set(staff.map((s) => s.department)));

  // Filtered staff
  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.lawyerCardNumber &&
        member.lawyerCardNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      statusFilter === 'all' ? true : member.status === statusFilter;
    const matchesDept =
      departmentFilter === 'all' ? true : member.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  // KPI Metrics
  const activeStaffCount = staff.filter((s) => s.status === 'active').length;
  const certifiedLawyersCount = staff.filter((s) => !!s.lawyerCardNumber).length;
  const avgQuota = Math.round(
    staff.reduce((acc, s) => acc + (s.maxCaseloadQuota || 15), 0) / staff.length
  );
  const avgKpi = Math.round(
    staff.reduce((acc, s) => acc + (s.kpiSuccessRate || 92), 0) / staff.length
  );

  return (
    <div className="p-3.5 sm:p-5 md:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-3 sm:right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner with Active User info and Role Switcher */}
      <div className="bg-gradient-to-r from-slate-900 to-[#2c0d12] text-white p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-900/60 border border-red-700/60 text-red-200">
              QUẢN TRỊ NHÂN SỰ & PHÂN QUYỀN (ADMIN GOVERNANCE)
            </span>
            <span className="text-xs text-slate-400">• Tiêu chuẩn bảo mật văn phòng luật sư</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold mt-1">Quản lý Tài khoản Nhân sự & Phân quyền Truy cập</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Tài khoản hiện tại: <strong className="text-white font-bold">{currentUser.name}</strong> ({currentUser.role}). 
            {isAdmin 
              ? ' Bạn có toàn quyền quản trị, cấp tài khoản, thiết lập ma trận phân quyền và khóa tài khoản nhân sự.' 
              : ' Chế độ xem dành cho nhân viên (Chỉ đọc). Chỉ Admin có thẩm quyền phân quyền và quản trị nhân sự.'}
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={handleOpenCreate}
            className={`w-full sm:w-auto px-4 py-2.5 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 ${
              isAdmin 
                ? 'bg-red-700 hover:bg-red-800' 
                : 'bg-slate-700/80 hover:bg-slate-700 text-slate-300 cursor-not-allowed opacity-80'
            }`}
            title={isAdmin ? 'Tạo tài khoản nhân sự mới' : 'Chỉ Admin mới có quyền tạo tài khoản mới'}
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Tạo tài khoản mới</span>
          </button>
        </div>
      </div>

      {/* Admin Stat Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
            <Users className="w-3.5 h-3.5 text-red-800" />
            <span>Tổng nhân sự</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {staff.length}{' '}
            <span className="text-xs font-semibold text-emerald-600 font-normal">
              ({activeStaffCount} hoạt động)
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
            <Award className="w-3.5 h-3.5 text-amber-700" />
            <span>Luật sư có Thẻ CCHN</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {certifiedLawyersCount}{' '}
            <span className="text-xs font-semibold text-slate-500 font-normal">
              / {staff.length} nhân sự
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
            <Briefcase className="w-3.5 h-3.5 text-blue-700" />
            <span>Hạn mức thụ lý TB</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {avgQuota}{' '}
            <span className="text-xs font-semibold text-slate-500 font-normal">
              hồ sơ / nhân sự
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Hiệu suất đúng hạn KPI</span>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {avgKpi}%{' '}
            <span className="text-xs font-semibold text-slate-500 font-normal">
              đạt chỉ tiêu
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Selector & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex space-x-1 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-2xs">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'directory'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Danh sách nhân sự & Quản trị tài khoản ({filteredStaff.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'matrix'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
            <span>Ma trận phân quyền (RBAC Matrix)</span>
          </button>
        </div>

        {activeTab === 'directory' && (
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tên, email, số thẻ luật sư..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-800 w-52"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-700"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="suspended">Tạm khóa</option>
            </select>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-700 max-w-[150px] truncate"
            >
              <option value="all">Tất cả phòng ban</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Directory Tab View */}
      {activeTab === 'directory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStaff.map((member) => {
            const isCurrentUser = currentUser.id === member.id;
            const quota = member.maxCaseloadQuota || 15;
            const loadPercent = Math.min(100, Math.round((member.activeCases / quota) * 100));

            return (
              <div
                key={member.id}
                className={`bg-white rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between overflow-hidden ${
                  isCurrentUser
                    ? 'border-red-800/80 ring-2 ring-red-800/20 shadow-xs'
                    : member.status === 'suspended'
                    ? 'border-slate-300 bg-slate-50/60 opacity-80'
                    : 'border-slate-200 shadow-2xs'
                }`}
              >
                <div className="p-5 space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 rounded-2xl ${
                          member.avatarColor || 'bg-slate-800'
                        } text-white font-black text-sm flex items-center justify-center shadow-inner shrink-0`}
                      >
                        {member.initials}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h3 className="font-bold text-slate-900 text-sm">{member.name}</h3>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.5 rounded-md bg-red-100 text-red-900 text-[10px] font-bold">
                              Bạn
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{member.role}</p>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {member.department}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadge(
                        member.roleId
                      )}`}
                    >
                      {member.roleId.toUpperCase()}
                    </span>
                  </div>

                  {/* Legal Certificate & Quota Information */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center space-x-1">
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        <span>Thẻ Luật sư:</span>
                      </span>
                      <span className="font-mono font-semibold text-slate-800">
                        {member.lawyerCardNumber || 'Chưa cập nhật'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-500">Tải công việc:</span>
                        <span className="font-semibold text-slate-700">
                          {member.activeCases} / {quota} hồ sơ ({loadPercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${
                            loadPercent > 85
                              ? 'bg-red-700'
                              : loadPercent > 60
                              ? 'bg-amber-600'
                              : 'bg-emerald-600'
                          }`}
                          style={{ width: `${loadPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500">KPI đúng hạn:</span>
                      <span className="font-bold text-emerald-700">
                        {member.kpiSuccessRate || 95}%
                      </span>
                    </div>
                  </div>

                  {/* Specializations Tags */}
                  {member.specializations && member.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {member.specializations.slice(0, 3).map((spec) => (
                        <span
                          key={spec}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Contact Info & Admin Google Auth Setup */}
                  <div className="space-y-1.5 text-xs text-slate-600 pt-1.5 border-t border-slate-100">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{member.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 min-w-0">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-medium text-slate-800">{member.email}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">(Công việc)</span>
                    </div>
                    {/* Google Auth Indicator */}
                    <div className="p-2 rounded-lg bg-red-50/60 border border-red-200/70 flex items-center justify-between gap-1 text-[11px]">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span className="font-mono text-red-950 truncate font-semibold">
                          {member.googleEmail || member.email}
                        </span>
                      </div>
                      <span className="text-[9px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded shrink-0">
                        Admin cấp
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls for Admin */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1">
                    {/* Toggle Status */}
                    <button
                      onClick={() => handleToggleStatus(member)}
                      className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                        member.status === 'active'
                          ? 'border-slate-200 text-slate-600 hover:text-red-700 hover:bg-red-50'
                          : 'border-red-200 bg-red-100 text-red-800 hover:bg-emerald-100 hover:text-emerald-800'
                      }`}
                      title={
                        member.status === 'active'
                          ? 'Tạm khóa tài khoản'
                          : 'Mở khóa tài khoản'
                      }
                    >
                      {member.status === 'active' ? (
                        <Lock className="w-3.5 h-3.5" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Reset Password */}
                    <button
                      onClick={() => handleResetPassword(member)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
                      title="Đặt lại mật khẩu tạm thời"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit & Permissions */}
                    <button
                      onClick={() => handleOpenEdit(member)}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors flex items-center space-x-1 ${
                        isAdmin
                          ? 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
                          : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                      title={isAdmin ? 'Chỉnh sửa tài khoản & phân quyền' : 'Chỉ Admin mới có quyền phân quyền'}
                    >
                      <Edit3 className={`w-3 h-3 ${isAdmin ? 'text-red-800' : 'text-slate-400'}`} />
                      <span>Phân quyền</span>
                    </button>
                  </div>

                  {/* Switch User Simulation */}
                  <button
                    onClick={() => onSwitchUser(member)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                      isCurrentUser
                        ? 'bg-emerald-700 text-white cursor-default'
                        : 'bg-slate-900 hover:bg-red-800 text-white'
                    }`}
                  >
                    <Key className="w-3 h-3" />
                    <span>{isCurrentUser ? 'Đang kích hoạt' : 'Đăng nhập'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RBAC Matrix Tab View */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Ma trận kiểm soát truy cập theo vai trò (Role-Based Access Control)
              </h3>
              <p className="text-xs text-slate-500">
                Hiển thị trực quan 10 quyền hạn pháp lý được áp dụng cho từng nhân sự
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="py-3 px-4 font-bold min-w-[200px]">Nhân sự / Vai trò</th>
                  {PERMISSION_COLUMNS.map((col) => (
                    <th key={col.key} className="py-3 px-2 font-semibold text-center whitespace-nowrap">
                      {col.label}
                    </th>
                  ))}
                  <th className="py-3 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staff.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg ${
                            member.avatarColor || 'bg-slate-800'
                          } text-white font-bold text-[10px] flex items-center justify-center shrink-0`}
                        >
                          {member.initials}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{member.name}</div>
                          <div className="text-[10px] text-slate-500">{member.role}</div>
                        </div>
                      </div>
                    </td>

                    {PERMISSION_COLUMNS.map((col) => {
                      const hasPerm = member.permissions.includes(col.key);
                      return (
                        <td key={col.key} className="py-3 px-2 text-center">
                          {hasPerm ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-800">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-300">
                              <X className="w-3 h-3" />
                            </span>
                          )}
                        </td>
                      );
                    })}

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleOpenEdit(member)}
                        className="text-red-800 hover:text-red-950 font-bold hover:underline"
                      >
                        Sửa quyền
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Staff Role Modal */}
      <StaffRoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        staffMember={editingStaff}
        currentUser={currentUser}
        onSave={onSaveStaff}
      />
    </div>
  );
};
