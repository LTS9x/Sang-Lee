import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Building,
  RefreshCw,
  Database,
  CheckCircle2,
  Download,
  ToggleLeft,
  ToggleRight,
  Lock,
  Clock,
  History,
  FileText,
  AlertTriangle,
  Search,
  Key,
  Globe,
  Mail,
  Phone,
  CreditCard,
  Sliders,
  Check,
} from 'lucide-react';
import { SystemSettings, AuditLogItem } from '../types';

interface SettingsViewProps {
  settings: SystemSettings;
  onUpdateSettings: (newSettings: SystemSettings) => void;
  auditLogs: AuditLogItem[];
  onResetData: () => void;
  casesCount: number;
  clientsCount: number;
  docsCount: number;
  staffCount: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  auditLogs,
  onResetData,
  casesCount,
  clientsCount,
  docsCount,
  staffCount,
}) => {
  const [activeTab, setActiveTab] = useState<
    'profile' | 'modules' | 'security' | 'audit' | 'backup'
  >('profile');

  // Form state for profile
  const [formSettings, setFormSettings] = useState<SystemSettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('all');

  const handleToggleModule = (key: keyof SystemSettings['modules']) => {
    const updated: SystemSettings = {
      ...formSettings,
      modules: {
        ...formSettings.modules,
        [key]: !formSettings.modules[key],
      },
    };
    setFormSettings(updated);
    onUpdateSettings(updated);
    triggerSaveToast();
  };

  const handleToggleSecurity = (key: keyof SystemSettings['security']) => {
    if (typeof formSettings.security[key] === 'boolean') {
      const updated: SystemSettings = {
        ...formSettings,
        security: {
          ...formSettings.security,
          [key]: !formSettings.security[key],
        },
      };
      setFormSettings(updated);
      onUpdateSettings(updated);
      triggerSaveToast();
    }
  };

  const triggerSaveToast = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formSettings);
    triggerSaveToast();
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Bạn có chắc muốn khôi phục dữ liệu mẫu ban đầu của hệ thống? Toàn bộ thay đổi thử nghiệm sẽ được làm mới.'
      )
    ) {
      onResetData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            settings: formSettings,
            statistics: {
              casesCount,
              clientsCount,
              docsCount,
              staffCount,
            },
            auditLogs,
          },
          null,
          2
        )
      );
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `BigBossLaw_SystemBackup_${Date.now()}.json`);
    dlAnchorElem.click();
  };

  // Filter audit logs
  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.actorName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
      (log.target && log.target.toLowerCase().includes(auditSearch.toLowerCase())) ||
      (log.ipAddress && log.ipAddress.includes(auditSearch));
    const matchesAction =
      auditActionFilter === 'all' ? true : log.action === auditActionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="p-3.5 sm:p-5 md:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-[#2c0d12] text-white p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-900/60 border border-red-700/60 text-red-200">
              TRUNG TÂM QUẢN TRỊ HỆ THỐNG (SYSTEM ADMIN)
            </span>
            <span className="text-xs text-slate-400">• Cấu hình toàn diện hãng luật</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold mt-1">Cấu hình Văn phòng, Tính năng & Bảo mật</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Quản trị viên có toàn quyền bật/tắt các module tính năng, thiết lập chính sách an ninh, kiểm tra nhật ký kiểm toán và xuất bản sao lưu.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={handleExportJson}
            className="w-full sm:w-auto px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all flex items-center justify-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Xuất bản sao lưu (.JSON)</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-2xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-lg font-bold transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'profile'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>1. Hồ sơ Văn phòng Luật</span>
        </button>

        <button
          onClick={() => setActiveTab('modules')}
          className={`px-4 py-2.5 rounded-lg font-bold transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'modules'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>2. Quản lý Tính năng & Module</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 rounded-lg font-bold transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'security'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>3. An ninh & Bảo mật</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-lg font-bold transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'audit'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>4. Nhật ký Kiểm toán ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2.5 rounded-lg font-bold transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'backup'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>5. Sao lưu & Khôi phục</span>
        </button>
      </div>

      {/* Save Toast */}
      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Cấu hình hệ thống đã được lưu và cập nhật thành công!</span>
        </div>
      )}

      {/* Tab 1: Law Firm Identity */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
              <Building className="w-4 h-4 text-red-800" />
              <span>Pháp nhân & Thông tin Hành nghề Luật sư</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Tên tổ chức hành nghề (tiếng Việt) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formSettings.firmName}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, firmName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Tên giao dịch quốc tế (tiếng Anh)
                </label>
                <input
                  type="text"
                  value={formSettings.firmEnglishName}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, firmEnglishName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Giấy phép hoạt động (Sở Tư pháp cấp)
                </label>
                <input
                  type="text"
                  value={formSettings.licenseNumber}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, licenseNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Đoàn Luật sư chủ quản
                </label>
                <input
                  type="text"
                  value={formSettings.barAssociation}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, barAssociation: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Mã số thuế doanh nghiệp
                </label>
                <input
                  type="text"
                  value={formSettings.taxId}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, taxId: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Người đại diện theo pháp luật / Giám đốc
                </label>
                <input
                  type="text"
                  value={formSettings.representative}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, representative: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Trụ sở chính văn phòng
                </label>
                <input
                  type="text"
                  value={formSettings.address}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, address: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Chi nhánh / Văn phòng đại diện (nếu có)
                </label>
                <input
                  type="text"
                  value={formSettings.branchAddress || ''}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, branchAddress: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Billing & Contact */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              <span>Tài khoản Thu Thù lao Pháp lý & Kênh Liên lạc</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Số tài khoản ngân hàng xuất hóa đơn
                </label>
                <input
                  type="text"
                  value={formSettings.bankAccount}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, bankAccount: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Tên ngân hàng & Chi nhánh
                </label>
                <input
                  type="text"
                  value={formSettings.bankName}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, bankName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Hotline tư vấn pháp luật
                </label>
                <input
                  type="text"
                  value={formSettings.hotline}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, hotline: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Email tiếp nhận hồ sơ
                </label>
                <input
                  type="email"
                  value={formSettings.email}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, email: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-red-850 hover:bg-red-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Lưu thông tin văn phòng</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Feature Flags & Modular Governance */}
      {activeTab === 'modules' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Quản lý Bật/Tắt Phân hệ Tính năng (Modular Feature Flags)
                </h3>
                <p className="text-xs text-slate-500">
                  Tùy biến các module phù hợp với quy mô và mô hình hoạt động của công ty luật
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {[
                {
                  key: 'enableBilling' as const,
                  title: 'Phân hệ Thù lao & Quản lý Biểu phí (Billing Module)',
                  desc: 'Cho phép theo dõi phí dịch vụ hợp đồng, tạm ứng đợt 1, đợt 2 và công nợ thân chủ trong từng hồ sơ.',
                  tag: 'Tài chính',
                },
                {
                  key: 'enableConfidentialNotes' as const,
                  title: 'Ghi chú Chiến lược Tố tụng Mật (Confidential Defense Strategy)',
                  desc: 'Kích hoạt tab ghi chú nội bộ bảo mật, chỉ phân quyền riêng cho Luật sư phụ trách đọc và biên soạn.',
                  tag: 'Bảo mật',
                },
                {
                  key: 'enableClientPortal' as const,
                  title: 'Cổng Tra cứu Tiến độ Thân chủ (Client Portal)',
                  desc: 'Cho phép thân chủ tra cứu trạng thái và tiến độ xử lý hồ sơ vụ việc qua mã tra cứu độc lập.',
                  tag: 'Khách hàng',
                },
                {
                  key: 'enableConflictCheck' as const,
                  title: 'Kiểm tra Xung đột Lợi ích Tự động (Conflict of Interest Check)',
                  desc: 'Cảnh báo ngay khi thân chủ mới hoặc đối thủ tranh chấp trùng tên với các vụ việc đang thụ lý tại hãng luật.',
                  tag: 'Tuân thủ',
                },
                {
                  key: 'enableWatermark' as const,
                  title: 'Đóng dấu Watermark Bản quyền lên Tài liệu Tải xuống',
                  desc: 'Tự động chèn dòng chữ chìm [BIGBOSS LAW FIRM - BẢO MẬT] vào toàn bộ tài liệu và chứng cứ xuất ra.',
                  tag: 'Tài liệu',
                },
                {
                  key: 'enableDeadlineReminder' as const,
                  title: 'Tự động Cảnh báo Lịch tòa & Thời hiệu Khởi kiện',
                  desc: 'Thông báo nổi bật trước 3 ngày làm việc đối với các lịch làm việc Viện kiểm sát và phiên tòa xét xử.',
                  tag: 'Tố tụng',
                },
                {
                  key: 'enableActivityAudit' as const,
                  title: 'Bắt buộc Ghi nhật ký Thao tác (Activity Audit Trail)',
                  desc: 'Ghi lại mọi hoạt động xem chứng cứ, tải file và thay đổi phân quyền để phòng chống rò rỉ dữ liệu.',
                  tag: 'Kiểm toán',
                },
              ].map((item) => {
                const isEnabled = formSettings.modules[item.key];
                return (
                  <div
                    key={item.key}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900">{item.title}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                        {item.desc}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleModule(item.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 ${
                        isEnabled
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {isEnabled ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Đang BẬT</span>
                        </>
                      ) : (
                        <span>Đã TẮT</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Security & Access Policy */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-5">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
              <Shield className="w-4 h-4 text-red-800" />
              <span>Chính sách An ninh & Kiểm soát Phiên làm việc</span>
            </div>

            <div className="space-y-4 text-xs">
              {/* 2FA Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="font-bold text-slate-900 text-xs">
                    Bắt buộc Xác thực 2 bước (2FA / Two-Factor Authentication)
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Yêu cầu mã xác thực OTP qua ứng dụng Google Authenticator đối với tất cả Luật sư và Quản trị viên
                  </p>
                </div>
                <button
                  onClick={() => handleToggleSecurity('require2FA')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    formSettings.security.require2FA
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {formSettings.security.require2FA ? 'Đã kích hoạt' : 'Chưa bật'}
                </button>
              </div>

              {/* Auto logout */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Thời gian tự động đăng xuất phiên làm việc (Session Timeout)</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Tự động khóa màn hình nếu không có thao tác chuột hoặc bàn phím để bảo vệ tài liệu thân chủ
                </p>
                <div className="flex space-x-2 pt-1">
                  {[15, 30, 60, 120].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => {
                        const updated: SystemSettings = {
                          ...formSettings,
                          security: { ...formSettings.security, autoLogoutMinutes: mins },
                        };
                        setFormSettings(updated);
                        onUpdateSettings(updated);
                        triggerSaveToast();
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                        formSettings.security.autoLogoutMinutes === mins
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {mins} phút
                    </button>
                  ))}
                </div>
              </div>

              {/* IP restriction */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-xs">
                      Giới hạn IP mạng nội bộ (Office Network Restriction)
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Chỉ cho phép tải xuống các tài liệu mật khi nhân sự kết nối mạng WiFi/VPN văn phòng
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleSecurity('restrictOfficeIp')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      formSettings.security.restrictOfficeIp
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {formSettings.security.restrictOfficeIp ? 'Đang kích hoạt' : 'Không giới hạn'}
                  </button>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Dải địa chỉ IP văn phòng cho phép (CIDR)
                  </label>
                  <input
                    type="text"
                    value={formSettings.security.allowedIpRange}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        security: {
                          ...formSettings.security,
                          allowedIpRange: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-4">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                <History className="w-4 h-4 text-red-800" />
                <span>Nhật ký Hoạt động & Kiểm toán An ninh (Audit Trail)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Ghi nhận lịch sử đăng nhập, tải tài liệu, phân quyền và xuất dữ liệu
              </p>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm hành vi, nhân sự, IP..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg w-full focus:outline-hidden focus:ring-1 focus:ring-red-800"
                />
              </div>

              <select
                value={auditActionFilter}
                onChange={(e) => setAuditActionFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-700"
              >
                <option value="all">Tất cả thao tác</option>
                <option value="LOGIN">Đăng nhập</option>
                <option value="UPLOAD_DOC">Tải tài liệu</option>
                <option value="CHANGE_PERMISSION">Đổi phân quyền</option>
                <option value="TOGGLE_ACCOUNT">Khóa/Mở tài khoản</option>
                <option value="UPDATE_SETTINGS">Cập nhật hệ thống</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto px-4 pb-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">Thời gian</th>
                  <th className="py-2.5 px-3">Nhân sự thực hiện</th>
                  <th className="py-2.5 px-3">Loại hành vi</th>
                  <th className="py-2.5 px-3">Nội dung chi tiết</th>
                  <th className="py-2.5 px-3 font-mono">Địa chỉ IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-slate-500 font-mono whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{log.actorName}</div>
                      <div className="text-[10px] text-slate-500">{log.actorRole}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-semibold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 max-w-md leading-relaxed">
                      {log.details}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {log.ipAddress || '14.161.22.88'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Backup & Disaster Recovery */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
              <Database className="w-4 h-4 text-red-800" />
              <span>Sao lưu dữ liệu & Khôi phục mặc định</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dữ liệu của phần mềm bao gồm <strong>{casesCount} vụ việc</strong>,{' '}
              <strong>{clientsCount} khách hàng</strong>,{' '}
              <strong>{docsCount} tài liệu lưu trữ</strong> và{' '}
              <strong>{staffCount} nhân sự</strong>. Bạn có thể tải toàn bộ tệp sao lưu chuẩn JSON về máy tính cá nhân để lưu trữ ngoại tuyến.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleExportJson}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Xuất bản sao lưu dữ liệu toàn diện (.JSON)</span>
              </button>

              <button
                onClick={handleReset}
                className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 transition-colors border border-red-200"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Khôi phục dữ liệu mẫu Demo ban đầu</span>
              </button>
            </div>

            {resetSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Đã khôi phục dữ liệu mẫu ban đầu thành công!</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
