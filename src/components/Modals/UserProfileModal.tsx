import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Key,
  Bell,
  FileCheck,
  ShieldCheck,
  Check,
  AlertCircle,
  Phone,
  Mail,
  Award,
  Building,
  Lock,
  Download,
} from 'lucide-react';
import { StaffMember } from '../../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: StaffMember;
  onUpdateProfile: (updatedUser: StaffMember) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'password' | 'notifications' | 'signature'>('info');

  // Info form
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [lawyerCardNumber, setLawyerCardNumber] = useState(currentUser.lawyerCardNumber || '');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Notification settings
  const [notifyNewCase, setNotifyNewCase] = useState(true);
  const [notifyHearing, setNotifyHearing] = useState(true);
  const [notifyTaskDue, setNotifyTaskDue] = useState(true);
  const [notifyWeeklyReport, setNotifyWeeklyReport] = useState(false);

  // Status message
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setPhone(currentUser.phone);
      setLawyerCardNumber(currentUser.lawyerCardNumber || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setPasswordSuccess(false);
      setSaveSuccess(false);
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StaffMember = {
      ...currentUser,
      name: name.trim(),
      phone: phone.trim(),
      lawyerCardNumber: lawyerCardNumber.trim() || undefined,
    };
    onUpdateProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Vui lòng nhập mật khẩu hiện tại');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có tối thiểu 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp với mật khẩu mới');
      return;
    }

    // Success
    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const handleExportPersonalReport = () => {
    const reportContent = `
=========================================
BÁO CÁO CÔNG TÁC PHÁP LÝ CÁ NHÂN
HÃNG LUẬT BIGBOSS LAW
=========================================
Họ và tên: ${currentUser.name}
Chức danh: ${currentUser.role}
Phòng ban: ${currentUser.department}
Số thẻ Luật sư: ${currentUser.lawyerCardNumber || 'Chưa đăng ký'}
Email nội bộ: ${currentUser.email}
Số điện thoại: ${currentUser.phone}
-----------------------------------------
CHỈ SỐ THỰC HIỆN CÔNG VIỆC:
- Số hồ sơ đang thụ lý: ${currentUser.activeCases} hồ sơ
- Hạn mức hồ sơ tối đa: ${currentUser.maxCaseloadQuota || 15} hồ sơ
- Hiệu suất KPI đúng hạn: ${currentUser.kpiSuccessRate || 95}%
- Lĩnh vực sở trường: ${currentUser.specializations?.join(', ') || 'Tố tụng pháp lý'}
- Quyền hạn hệ thống: ${currentUser.permissions.length} quyền RBAC
=========================================
Thời gian xuất: ${new Date().toLocaleString('vi-VN')}
    `.trim();

    const element = document.createElement('a');
    const file = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `BaoCao_CaNhan_${currentUser.initials}_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-xl ${
                currentUser.avatarColor || 'bg-red-850'
              } flex items-center justify-center text-white font-black text-sm shadow-inner`}
            >
              {currentUser.initials}
            </div>
            <div>
              <h3 className="font-bold text-base">Hồ sơ & Cài đặt Cá nhân</h3>
              <p className="text-xs text-slate-300">
                {currentUser.name} • {currentUser.role}
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

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'info'
                ? 'border-red-800 text-red-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Thông tin cá nhân</span>
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'password'
                ? 'border-red-800 text-red-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Đổi mật khẩu</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'notifications'
                ? 'border-red-800 text-red-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Thông báo công việc</span>
          </button>

          <button
            onClick={() => setActiveTab('signature')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'signature'
                ? 'border-red-800 text-red-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Chữ ký số & Ký nháy</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Đã lưu cập nhật thông tin cá nhân thành công!</span>
            </div>
          )}

          {/* Tab 1: Info */}
          {activeTab === 'info' && (
            <form onSubmit={handleSaveInfo} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Họ và tên</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Email tài khoản (Do Admin cấp)
                  </label>
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-medium cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Số điện thoại liên hệ
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Số thẻ Luật sư / Thẻ hành nghề
                  </label>
                  <input
                    type="text"
                    value={lawyerCardNumber}
                    onChange={(e) => setLawyerCardNumber(e.target.value)}
                    placeholder="VD: LS-0824/ĐLS-HCM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phòng ban</label>
                  <input
                    type="text"
                    value={currentUser.department}
                    disabled
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-medium cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Chức danh / Vai trò</label>
                  <input
                    type="text"
                    value={currentUser.role}
                    disabled
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Specializations badge view */}
              {currentUser.specializations && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Lĩnh vực sở trường đã được xác nhận:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {currentUser.specializations.map((spec) => (
                      <span
                        key={spec}
                        className="px-2.5 py-1 rounded-lg bg-red-50 text-red-900 border border-red-200 text-xs font-medium"
                      >
                        ✓ {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance Summary Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>Chỉ số công tác của bạn:</span>
                  <button
                    type="button"
                    onClick={handleExportPersonalReport}
                    className="text-red-800 hover:underline flex items-center space-x-1 font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Xuất báo cáo cá nhân (.TXT)</span>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400">Hồ sơ thụ lý</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">
                      {currentUser.activeCases} / {currentUser.maxCaseloadQuota || 15}
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400">Hiệu suất KPI</div>
                    <div className="font-bold text-emerald-700 text-sm mt-0.5">
                      {currentUser.kpiSuccessRate || 95}%
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400">Quyền hạn RBAC</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">
                      {currentUser.permissions.length} / 10 quyền
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-red-850 hover:bg-red-900 text-white font-bold rounded-xl transition-all shadow-2xs"
                >
                  Lưu thay đổi thông tin
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Change Password */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md mx-auto py-2">
              <div className="text-xs text-slate-600 mb-2">
                Nhân viên có thể chủ động đổi mật khẩu định kỳ để bảo đảm an toàn dữ liệu khách hàng.
              </div>

              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới của bạn.</span>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Mật khẩu hiện tại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Mật khẩu mới (Tối thiểu 6 ký tự) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Xác nhận lại mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-xs"
                >
                  Cập nhật mật khẩu mới
                </button>
              </div>
            </form>
          )}

          {/* Tab 3: Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-3 py-2">
              <div className="text-xs text-slate-600 mb-2">
                Tùy chỉnh thông báo cá nhân để không bao giờ bỏ lỡ kỳ hạn tố tụng hay lịch làm việc với cơ quan chức năng.
              </div>

              {[
                {
                  label: 'Thông báo khi được phân công thụ lý hồ sơ mới',
                  desc: 'Gửi chuông thông báo ngay khi Luật sư điều hành chỉ định bạn vào vụ việc.',
                  state: notifyNewCase,
                  setState: setNotifyNewCase,
                },
                {
                  label: 'Nhắc nhở Lịch Tòa án & Viện kiểm sát trước 3 ngày',
                  desc: 'Cảnh báo nổi bật trên thanh tiêu đề và gửi email tóm tắt trước phiên xử.',
                  state: notifyHearing,
                  setState: setNotifyHearing,
                },
                {
                  label: 'Nhắc nhở Nhiệm vụ / Deadline công việc trong 24 giờ',
                  desc: 'Thông báo khi có công việc soạn đơn hoặc thu thập tài liệu sắp đến hạn.',
                  state: notifyTaskDue,
                  setState: setNotifyTaskDue,
                },
                {
                  label: 'Nhận Báo cáo Tổng kết Hiệu suất Công việc hàng tuần',
                  desc: 'Gửi tóm tắt số hồ sơ đã giải quyết và các đầu việc tồn đọng vào sáng thứ Hai.',
                  state: notifyWeeklyReport,
                  setState: setNotifyWeeklyReport,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">{item.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => item.setState(!item.state)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors shrink-0 ${
                      item.state
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {item.state ? 'BẬT' : 'TẮT'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: Digital Signature */}
          {activeTab === 'signature' && (
            <div className="space-y-4 py-2">
              <div className="text-xs text-slate-600">
                Mẫu chữ ký số và chữ ký nháy sẽ được tự động đính kèm vào các văn bản pháp lý, đơn từ và biên bản bàn giao tài liệu xuất ra từ hệ thống.
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 space-y-3 text-center">
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Mẫu chữ ký điện tử tiêu chuẩn của bạn
                </div>
                <div className="font-serif italic text-2xl text-slate-800 font-bold tracking-wide">
                  {currentUser.name}
                </div>
                <div className="text-xs font-mono text-slate-600">
                  {currentUser.role} • {currentUser.lawyerCardNumber || 'Chứng thư số nội bộ: BB-CERT-2026'}
                </div>
                <div className="text-[11px] text-slate-400">
                  HÃNG LUẬT BIGBOSS LAW (BIGBOSS LAW FIRM) • ĐÃ XÁC THỰC DANH TÍNH
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-blue-700" />
                <span>
                  Chữ ký số nội bộ được mã hóa theo quy chuẩn bảo mật tài liệu pháp lý và nhật ký kiểm toán hệ thống.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
