import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Check,
  Key,
  Lock,
  Award,
  BarChart2,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { StaffMember, UserRole, PermissionKey } from '../../types';

interface StaffRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffMember?: StaffMember | null;
  currentUser?: StaffMember;
  onSave: (staff: StaffMember) => void;
}

const ALL_PERMISSIONS: { key: PermissionKey; label: string; desc: string; category: string }[] = [
  {
    key: 'view_all_cases',
    label: 'Xem tất cả hồ sơ vụ việc',
    desc: 'Có quyền xem toàn bộ hồ sơ trong công ty (thay vì chỉ hồ sơ được phân công)',
    category: 'Quản lý Hồ sơ',
  },
  {
    key: 'create_edit_cases',
    label: 'Tạo & Chỉnh sửa hồ sơ vụ việc',
    desc: 'Khởi tạo hồ sơ mới, cập nhật tiến độ 4 giai đoạn, thông tin tóm tắt và mục tiêu',
    category: 'Quản lý Hồ sơ',
  },
  {
    key: 'delete_cases',
    label: 'Xóa hồ sơ vụ việc',
    desc: 'Xóa hồ sơ khỏi cơ sở dữ liệu của văn phòng luật (Yêu cầu quyền cấp cao)',
    category: 'Quản lý Hồ sơ',
  },
  {
    key: 'upload_documents',
    label: 'Tải lên tài liệu khách hàng',
    desc: 'Được phép upload hồ sơ, chứng cứ, hợp đồng và CCCD thân chủ vào hệ thống',
    category: 'Quản lý Tài liệu',
  },
  {
    key: 'delete_documents',
    label: 'Xóa tài liệu lưu trữ',
    desc: 'Quyền xóa các file chứng cứ, văn bản tố tụng đã tải lên',
    category: 'Quản lý Tài liệu',
  },
  {
    key: 'view_confidential_notes',
    label: 'Xem ghi chú & Chiến lược mật',
    desc: 'Xem và tạo các ghi chú nội bộ bảo mật của luật sư thụ lý án',
    category: 'Bảo mật & Chiến lược',
  },
  {
    key: 'assign_lawyers',
    label: 'Phân công nhân sự vụ việc',
    desc: 'Chỉ định hoặc thay đổi Luật sư chính, chuyên viên và trợ lý thụ lý hồ sơ',
    category: 'Nhân sự & Vụ việc',
  },
  {
    key: 'manage_billing',
    label: 'Quản lý thù lao & Hợp đồng phí',
    desc: 'Xem và cập nhật biểu phí, số tiền đã thu và công nợ thân chủ',
    category: 'Tài chính & Biểu phí',
  },
  {
    key: 'manage_users_roles',
    label: 'Quản trị tài khoản & Phân quyền',
    desc: 'Tạo tài khoản nhân viên mới và thiết lập ma trận phân quyền hệ thống',
    category: 'Quản trị hệ thống',
  },
  {
    key: 'system_settings',
    label: 'Cấu hình hệ thống văn phòng',
    desc: 'Thay đổi thông tin công ty luật, chi nhánh và xuất bản sao lưu dữ liệu',
    category: 'Quản trị hệ thống',
  },
];

const ROLE_PRESETS: Record<UserRole, { roleName: string; permissions: PermissionKey[] }> = {
  admin: {
    roleName: 'Luật sư Điều hành / Managing Partner',
    permissions: [
      'view_all_cases',
      'create_edit_cases',
      'delete_cases',
      'upload_documents',
      'delete_documents',
      'view_confidential_notes',
      'assign_lawyers',
      'manage_billing',
      'manage_users_roles',
      'system_settings',
    ],
  },
  partner_lawyer: {
    roleName: 'Luật sư Thành viên / Phụ trách tranh tụng',
    permissions: [
      'view_all_cases',
      'create_edit_cases',
      'upload_documents',
      'delete_documents',
      'view_confidential_notes',
      'assign_lawyers',
      'manage_billing',
    ],
  },
  associate_lawyer: {
    roleName: 'Chuyên viên Pháp lý / Luật sư cộng sự',
    permissions: [
      'create_edit_cases',
      'upload_documents',
      'view_confidential_notes',
    ],
  },
  paralegal: {
    roleName: 'Trợ lý pháp lý / Thư ký vụ việc',
    permissions: ['upload_documents'],
  },
  accountant: {
    roleName: 'Kế toán / Quản lý tài chính',
    permissions: ['view_all_cases', 'manage_billing'],
  },
};

const PRACTICE_AREAS = [
  'Tranh tụng Dân sự',
  'Hình sự & Tố tụng',
  'Đất đai & Bất động sản',
  'Hôn nhân Gia đình',
  'Hợp đồng & Doanh nghiệp',
  'Lao động & Việc làm',
  'Sở hữu Trí tuệ',
  'Tố tụng Trọng tài & M&A',
];

export const StaffRoleModal: React.FC<StaffRoleModalProps> = ({
  isOpen,
  onClose,
  staffMember,
  currentUser,
  onSave,
}) => {
  const isEditing = !!staffMember;
  const [activeTab, setActiveTab] = useState<'account' | 'permissions'>('account');

  // Basic Account Form
  const [name, setName] = useState('');
  const [roleId, setRoleId] = useState<UserRole>('associate_lawyer');
  const [roleTitle, setRoleTitle] = useState(ROLE_PRESETS.associate_lawyer.roleName);
  const [department, setDepartment] = useState('Ban Tố tụng & Tranh chấp');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [initialPassword, setInitialPassword] = useState('BigBossLaw@2026');
  const [mustChangePassword, setMustChangePassword] = useState(true);
  const [status, setStatus] = useState<'active' | 'suspended'>('active');
  const [lawyerCardNumber, setLawyerCardNumber] = useState('');
  const [maxCaseloadQuota, setMaxCaseloadQuota] = useState(15);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([
    'Tranh tụng Dân sự',
  ]);
  const [permissions, setPermissions] = useState<PermissionKey[]>(
    ROLE_PRESETS.associate_lawyer.permissions
  );
  const [error, setError] = useState('');

  useEffect(() => {
    if (staffMember) {
      setName(staffMember.name);
      setRoleId(staffMember.roleId);
      setRoleTitle(staffMember.role);
      setDepartment(staffMember.department);
      setPhone(staffMember.phone);
      setEmail(staffMember.email);
      setGoogleEmail(staffMember.googleEmail || staffMember.email || '');
      setStatus(staffMember.status);
      setLawyerCardNumber(staffMember.lawyerCardNumber || '');
      setMaxCaseloadQuota(staffMember.maxCaseloadQuota || 15);
      setSelectedSpecializations(
        staffMember.specializations || ['Tranh tụng Dân sự']
      );
      setPermissions(staffMember.permissions);
      setMustChangePassword(staffMember.mustChangePassword ?? false);
    } else {
      setName('');
      setRoleId('associate_lawyer');
      setRoleTitle(ROLE_PRESETS.associate_lawyer.roleName);
      setDepartment('Ban Tố tụng & Tranh chấp');
      setPhone('');
      setEmail('');
      setGoogleEmail('');
      setInitialPassword('BigBossLaw@2026');
      setMustChangePassword(true);
      setStatus('active');
      setLawyerCardNumber('');
      setMaxCaseloadQuota(15);
      setSelectedSpecializations(['Tranh tụng Dân sự']);
      setPermissions(ROLE_PRESETS.associate_lawyer.permissions);
    }
    setActiveTab('account');
    setError('');
  }, [staffMember, isOpen]);

  if (!isOpen) return null;

  const handleRolePresetChange = (newRole: UserRole) => {
    setRoleId(newRole);
    setRoleTitle(ROLE_PRESETS[newRole].roleName);
    setPermissions(ROLE_PRESETS[newRole].permissions);
  };

  const toggleSpecialization = (area: string) => {
    if (selectedSpecializations.includes(area)) {
      setSelectedSpecializations(selectedSpecializations.filter((a) => a !== area));
    } else {
      setSelectedSpecializations([...selectedSpecializations, area]);
    }
  };

  const togglePermission = (key: PermissionKey) => {
    if (permissions.includes(key)) {
      setPermissions(permissions.filter((p) => p !== key));
    } else {
      setPermissions([...permissions, key]);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let result = 'BB-';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setInitialPassword(result);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser && currentUser.roleId !== 'admin') {
      setError('Chỉ Luật sư Điều hành (Admin) có thẩm quyền phân quyền nhân sự! Không cho phép người dùng tự nâng quyền.');
      return;
    }
    if (!name.trim()) {
      setError('Vui lòng nhập họ tên nhân sự');
      setActiveTab('account');
      return;
    }
    if (!email.trim()) {
      setError('Vui lòng nhập email đăng nhập');
      setActiveTab('account');
      return;
    }

    const initials =
      name
        .split(' ')
        .filter(Boolean)
        .slice(-2)
        .map((part) => part[0])
        .join('')
        .toUpperCase() || 'NV';

    const resolvedGoogleEmail = (googleEmail.trim() || email.trim()).toLowerCase();

    const savedStaff: StaffMember = {
      id: staffMember?.id || `staff-${Date.now().toString().slice(-5)}`,
      name: name.trim(),
      role: roleTitle.trim(),
      roleId,
      department: department.trim(),
      activeCases: staffMember?.activeCases || 0,
      initials,
      phone: phone.trim() || 'Chưa cung cấp',
      email: email.trim().toLowerCase(),
      googleEmail: resolvedGoogleEmail,
      status,
      permissions,
      avatarColor: staffMember?.avatarColor || 'bg-slate-800',
      lawyerCardNumber: lawyerCardNumber.trim() || undefined,
      maxCaseloadQuota: Number(maxCaseloadQuota) || 15,
      specializations: selectedSpecializations,
      joinedDate: staffMember?.joinedDate || new Date().toLocaleDateString('vi-VN'),
      lastLogin: staffMember?.lastLogin || 'Chưa đăng nhập lần nào',
      kpiSuccessRate: staffMember?.kpiSuccessRate || 95,
      mustChangePassword,
    };

    onSave(savedStaff);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-800 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {isEditing ? 'Quản trị Tài khoản & Phân quyền Nhân sự' : 'Tạo Tài khoản Nhân sự Mới'}
              </h3>
              <p className="text-xs text-slate-300">
                Cấp tài khoản, chứng chỉ hành nghề, hạn mức hồ sơ và phân quyền RBAC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'account'
                ? 'border-red-800 text-red-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>1. Thông tin Tài khoản & Chuyên môn</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('permissions')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'permissions'
                ? 'border-red-800 text-red-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>2. Vai trò & Phân quyền ({permissions.length}/10 quyền)</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-4">
              {/* Basic Personal Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Họ và tên nhân sự <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: LS. Lê Văn Bình"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Email công việc / Liên hệ <span className="text-red-500">*</span></span>
                    <span className="text-[10px] text-slate-400">Hòm thư nội bộ</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (!googleEmail) setGoogleEmail(e.target.value);
                    }}
                    placeholder="VD: nhansu@bigbosslaw.com"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
                    required
                  />
                </div>

                {/* Admin Google Account Configuration Box */}
                <div className="sm:col-span-2 p-3.5 bg-gradient-to-r from-red-50/70 via-slate-50 to-white rounded-xl border border-red-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-red-950 flex items-center space-x-1.5">
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Email Google đăng nhập (Cài đặt bởi Admin) <span className="text-red-500">*</span></span>
                    </label>
                    <span className="text-[10px] font-bold text-red-800 bg-red-100/80 px-2 py-0.5 rounded-md">
                      Bảo mật 1-Chạm Google Auth
                    </span>
                  </div>

                  <input
                    type="email"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="VD: nhansu.lawyer@gmail.com hoặc email Google Workspace"
                    className="w-full px-3 py-2 text-xs bg-white border border-red-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 font-mono text-slate-900"
                    required
                  />

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    🔐 <strong>Quy định bảo mật Admin:</strong> Nhân sự chỉ có thể đăng nhập thành công khi tài khoản Google của họ có email trùng khớp với địa chỉ do Admin cài đặt ở đây. Khách hàng/người dùng tự do sẽ bị chặn truy cập.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số điện thoại liên hệ
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0918 333 444"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phòng ban / Nhóm chuyên trách
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="VD: Ban Tố tụng & Tranh chấp"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
                  />
                </div>
              </div>

              {/* Password & Security Credentials (Admin setup) */}
              {!isEditing && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5 text-red-800" />
                      <span>Mật khẩu khởi tạo ban đầu</span>
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-[11px] text-red-800 hover:underline font-semibold flex items-center space-x-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Tạo mật khẩu ngẫu nhiên an toàn</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={initialPassword}
                    onChange={(e) => setInitialPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800"
                  />
                  <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={mustChangePassword}
                      onChange={(e) => setMustChangePassword(e.target.checked)}
                      className="rounded border-slate-300 text-red-800 focus:ring-red-800"
                    />
                    <span>Bắt buộc nhân sự đổi mật khẩu ở lần đăng nhập đầu tiên</span>
                  </label>
                </div>
              )}

              {/* Legal Credentials & Workload Quota */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số thẻ Luật sư / Thẻ hành nghề (nếu có)
                  </label>
                  <input
                    type="text"
                    value={lawyerCardNumber}
                    onChange={(e) => setLawyerCardNumber(e.target.value)}
                    placeholder="VD: LS-0824/ĐLS-HCM"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Dùng để ký văn bản và xuất trình Tòa án</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hạn mức hồ sơ thụ lý tối đa (Caseload Quota)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={maxCaseloadQuota}
                      onChange={(e) => setMaxCaseloadQuota(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white font-mono"
                    />
                    <span className="text-xs text-slate-500 whitespace-nowrap">hồ sơ</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Cảnh báo khi nhân sự bị quá tải công việc</p>
                </div>
              </div>

              {/* Specialization Areas */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Lĩnh vực sở trường & Chuyên môn pháp lý:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRACTICE_AREAS.map((area) => {
                    const isSelected = selectedSpecializations.includes(area);
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => toggleSpecialization(area)}
                        className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition-all ${
                          isSelected
                            ? 'bg-red-850 text-white font-semibold shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Switcher */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-800">Trạng thái tài khoản</div>
                  <div className="text-[11px] text-slate-500">
                    Khóa tài khoản sẽ ngắt quyền truy cập hồ sơ khách hàng ngay lập tức
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setStatus('active')}
                    className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-colors ${
                      status === 'active'
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-white border text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Đang hoạt động
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('suspended')}
                    className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-colors ${
                      status === 'suspended'
                        ? 'bg-red-800 text-white shadow-2xs'
                        : 'bg-white border text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Tạm khóa
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-4">
              {/* Role Preset Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Gán vai trò mặc định (Chức danh RBAC) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {(
                    [
                      { id: 'admin', label: 'Quản trị viên / Managing Partner', icon: '👑' },
                      { id: 'partner_lawyer', label: 'Luật sư Thành viên', icon: '⚖️' },
                      { id: 'associate_lawyer', label: 'Chuyên viên / LS Cộng sự', icon: '📑' },
                      { id: 'paralegal', label: 'Trợ lý / Thư ký', icon: '📂' },
                      { id: 'accountant', label: 'Kế toán & Biểu phí', icon: '💰' },
                    ] as const
                  ).map((preset) => {
                    const isSelected = roleId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleRolePresetChange(preset.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-red-800 bg-red-50/80 text-red-950 font-bold ring-1 ring-red-800'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="text-sm mb-0.5">{preset.icon}</div>
                        <div className="font-semibold leading-snug">{preset.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Granular Permissions Checklist */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Chi tiết ma trận quyền hạn (Đã kích hoạt {permissions.length}/10 quyền)
                  </label>
                  <div className="space-x-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPermissions(ALL_PERMISSIONS.map((p) => p.key))}
                      className="text-red-800 hover:underline font-semibold"
                    >
                      Chọn tất cả
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setPermissions([])}
                      className="text-slate-500 hover:underline"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {ALL_PERMISSIONS.map((perm) => {
                    const isChecked = permissions.includes(perm.key);
                    return (
                      <div
                        key={perm.key}
                        onClick={() => togglePermission(perm.key)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-2.5 ${
                          isChecked
                            ? 'border-red-700/60 bg-red-50/40 text-slate-900'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md mt-0.5 shrink-0 flex items-center justify-center border ${
                            isChecked
                              ? 'bg-[#8b1d24] border-[#8b1d24] text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                            <span>{perm.label}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-normal">
                              {perm.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{perm.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              {activeTab === 'account' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('permissions')}
                  className="text-red-800 hover:underline font-bold"
                >
                  Tiếp theo: Thiết lập phân quyền →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab('account')}
                  className="text-slate-600 hover:underline"
                >
                  ← Quay lại thông tin tài khoản
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 font-medium rounded-lg hover:bg-slate-100 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs bg-[#8b1d24] hover:bg-[#72171d] text-white font-bold rounded-lg shadow-sm hover:shadow transition-all flex items-center space-x-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isEditing ? 'Lưu cập nhật nhân sự' : 'Tạo & Cấp quyền tài khoản'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
