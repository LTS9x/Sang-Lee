import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  LayoutDashboard,
  Users,
  Briefcase,
  Settings,
  Scale,
  LogOut,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  CheckSquare,
  Search,
  Filter,
  UserPlus,
  Edit3,
  Trash2,
  Lock,
  Eye,
  Building,
  RotateCcw,
  Sparkles,
  Download,
  DollarSign,
  Calendar,
  Layers,
  ChevronRight,
  Award,
  BookOpen,
} from 'lucide-react';
import {
  LegalCase,
  Client,
  DocumentItem,
  TaskItem,
  StaffMember,
  SystemSettings,
  AuditLogItem,
  PermissionKey,
} from '../types';
import { DashboardView } from './DashboardView';
import { StaffView } from './StaffView';
import { SettingsView } from './SettingsView';

interface AdminPortalViewProps {
  currentUser: StaffMember;
  staff: StaffMember[];
  cases: LegalCase[];
  clients: Client[];
  documents: DocumentItem[];
  tasks: TaskItem[];
  systemSettings: SystemSettings;
  auditLogs: AuditLogItem[];
  onSwitchToOperationsApp: () => void;
  onPreviewStaffView: (staffMember: StaffMember) => void;
  onUpdateCase: (updatedCase: LegalCase) => void;
  onDeleteCase: (caseId: string) => void;
  onDeleteClient: (clientId: string) => void;
  onDeleteDocument: (docId: string) => void;
  onSaveStaff: (staffMember: StaffMember) => void;
  onUpdateSettings: (newSettings: SystemSettings) => void;
  onResetData: () => void;
  onSelectCase: (caseItem: LegalCase) => void;
  onOpenCreateCase: () => void;
  onOpenUpload: (caseId?: string) => void;
  onLogout: () => void;
}

type AdminPortalTab = 'overview' | 'assignments' | 'staff_rbac' | 'master_records' | 'system_settings';

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  currentUser,
  staff,
  cases,
  clients,
  documents,
  tasks,
  systemSettings,
  auditLogs,
  onSwitchToOperationsApp,
  onPreviewStaffView,
  onUpdateCase,
  onDeleteCase,
  onDeleteClient,
  onDeleteDocument,
  onSaveStaff,
  onUpdateSettings,
  onResetData,
  onSelectCase,
  onOpenCreateCase,
  onOpenUpload,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<AdminPortalTab>('overview');
  const [caseSearch, setCaseSearch] = useState('');
  const [caseCategoryFilter, setCaseCategoryFilter] = useState<string>('all');
  const [selectedStaffForAssignment, setSelectedStaffForAssignment] = useState<string>('all');
  const [editingAssignmentCaseId, setEditingAssignmentCaseId] = useState<string | null>(null);

  // Assignment edit temp state
  const [tempLeadLawyer, setTempLeadLawyer] = useState<string>('');
  const [tempAssistants, setTempAssistants] = useState<string[]>([]);

  // Statistics
  const totalRevenue = cases.reduce((acc, c) => {
    if (c.billing?.totalFee) {
      const num = parseInt(c.billing.totalFee.replace(/\D/g, ''), 10) || 0;
      return acc + num;
    }
    return acc;
  }, 0);

  const collectedRevenue = cases.reduce((acc, c) => {
    if (c.billing?.paidAmount) {
      const num = parseInt(c.billing.paidAmount.replace(/\D/g, ''), 10) || 0;
      return acc + num;
    }
    return acc;
  }, 0);

  const activeCasesCount = cases.filter((c) => c.status !== 'Đã hoàn thành').length;
  const urgentCasesCount = cases.filter((c) => c.status === 'Khẩn' || c.priority === 'Khẩn').length;

  // Filtered cases for Case Assignment Hub
  const filteredCasesForAssignment = cases.filter((c) => {
    const matchQuery =
      c.title.toLowerCase().includes(caseSearch.toLowerCase()) ||
      c.id.toLowerCase().includes(caseSearch.toLowerCase()) ||
      c.clientName.toLowerCase().includes(caseSearch.toLowerCase()) ||
      c.leadLawyer.toLowerCase().includes(caseSearch.toLowerCase());

    const matchCategory = caseCategoryFilter === 'all' || c.category === caseCategoryFilter;

    const matchStaff =
      selectedStaffForAssignment === 'all' ||
      c.leadLawyer.toLowerCase().includes(selectedStaffForAssignment.toLowerCase()) ||
      c.assistants?.some((a) => a.toLowerCase().includes(selectedStaffForAssignment.toLowerCase()));

    return matchQuery && matchCategory && matchStaff;
  });

  const handleStartEditAssignment = (c: LegalCase) => {
    setEditingAssignmentCaseId(c.id);
    setTempLeadLawyer(c.leadLawyer);
    setTempAssistants(c.assistants || []);
  };

  const handleSaveAssignment = (originalCase: LegalCase) => {
    const updated: LegalCase = {
      ...originalCase,
      leadLawyer: tempLeadLawyer || originalCase.leadLawyer,
      assistants: tempAssistants,
    };
    onUpdateCase(updated);
    setEditingAssignmentCaseId(null);
  };

  const toggleAssistant = (staffName: string) => {
    setTempAssistants((prev) => {
      if (prev.includes(staffName)) {
        return prev.filter((a) => a !== staffName);
      } else {
        return [...prev, staffName];
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-slate-100 flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      {/* Top Luxury Admin Header */}
      <header className="bg-[#14161b] border-b border-amber-600/30 sticky top-0 z-30 shadow-xl">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Portal Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-700 via-red-800 to-amber-900 flex items-center justify-center text-amber-300 shadow-lg shadow-red-950/50 border border-amber-500/40 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-white">
                  BIGBOSS <span className="text-red-500">LAW</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider">
                  ADMIN PORTAL
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Trang Quản Trị Hệ Thống & Tổng Điều Hành Hãng Luật (Tách biệt với App tác nghiệp)
              </p>
            </div>
          </div>

          {/* Quick Actions & Navigation to Common Operations App */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* Quick Preview Staff View Dropdown */}
            <div className="hidden md:flex items-center space-x-1.5 bg-[#1b1e24] px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300">
              <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-slate-400">Xem thử góc nhìn:</span>
              <select
                onChange={(e) => {
                  const target = staff.find((s) => s.id === e.target.value);
                  if (target) {
                    onPreviewStaffView(target);
                  }
                }}
                defaultValue=""
                className="bg-transparent text-amber-300 font-semibold focus:outline-none cursor-pointer max-w-[150px] truncate"
              >
                <option value="" disabled className="bg-slate-900 text-slate-400">
                  Chọn nhân sự...
                </option>
                {staff
                  .filter((s) => s.roleId !== 'admin')
                  .map((s) => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                      {s.name} ({s.role})
                    </option>
                  ))}
              </select>
            </div>

            {/* Switch to Operations App Button */}
            <button
              onClick={onSwitchToOperationsApp}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-950/60 border border-red-600/40 flex items-center space-x-2 transition-all cursor-pointer group"
              title="Chuyển sang Ứng dụng tác nghiệp chung để quản lý vụ việc, tài liệu và nhiệm vụ chi tiết"
            >
              <Briefcase className="w-4 h-4 text-amber-400 group-hover:rotate-6 transition-transform" />
              <span className="hidden sm:inline">Vào App Tác Nghiệp Chung</span>
              <span className="sm:hidden">App Nghiệp vụ</span>
              <ArrowRight className="w-3.5 h-3.5 text-white/70 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Admin User Info */}
            <div className="hidden lg:flex items-center space-x-2 pl-2 border-l border-slate-700">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center">
                AD
              </div>
              <div className="text-left text-xs leading-tight">
                <div className="font-bold text-slate-200 truncate max-w-[120px]">{currentUser.name}</div>
                <div className="text-[10px] text-amber-400 font-mono">ADMINISTRATOR</div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 flex overflow-x-auto no-scrollbar border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 sm:px-5 py-3 text-xs font-bold border-b-2 flex items-center space-x-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>1. Tổng quan & KPI Hãng luật</span>
          </button>

          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 sm:px-5 py-3 text-xs font-bold border-b-2 flex items-center space-x-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'assignments'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>2. Bảng Phân công & Điều phối Vụ việc</span>
            <span className="px-1.5 py-0.2 rounded-full bg-red-900/80 text-amber-300 text-[10px] font-mono">
              {cases.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('staff_rbac')}
            className={`px-4 sm:px-5 py-3 text-xs font-bold border-b-2 flex items-center space-x-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'staff_rbac'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>3. Quản trị Nhân sự & Phân quyền RBAC</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
              {staff.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('master_records')}
            className={`px-4 sm:px-5 py-3 text-xs font-bold border-b-2 flex items-center space-x-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'master_records'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>4. Quản lý Dữ liệu Gốc (Hồ sơ & Khách hàng)</span>
          </button>

          <button
            onClick={() => setActiveTab('system_settings')}
            className={`px-4 sm:px-5 py-3 text-xs font-bold border-b-2 flex items-center space-x-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'system_settings'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>5. Cấu hình Hệ thống & Audit Log</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#14161b] p-5 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-amber-500" />
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Tổng Vụ việc Toàn Hãng</span>
                  <Scale className="w-4 h-4 text-red-500" />
                </div>
                <div className="mt-3 flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-white">{cases.length}</span>
                  <span className="text-xs text-amber-400 font-semibold">
                    ({activeCasesCount} đang giải quyết)
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Vụ việc khẩn cấp:</span>
                  <span className="font-bold text-red-400 font-mono">{urgentCasesCount} hồ sơ</span>
                </div>
              </div>

              <div className="bg-[#14161b] p-5 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 to-teal-500" />
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Tổng Doanh Thu Ước Tính</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-3 flex items-baseline space-x-2">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                    {(totalRevenue / 1000000).toLocaleString('vi-VN')} Tr
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Đã thu hồi:</span>
                  <span className="font-bold text-emerald-300 font-mono">
                    {(collectedRevenue / 1000000).toLocaleString('vi-VN')} Tr VNĐ
                  </span>
                </div>
              </div>

              <div className="bg-[#14161b] p-5 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-500" />
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Đội Ngũ Nhân Sự Pháp Lý</span>
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div className="mt-3 flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-white">{staff.length}</span>
                  <span className="text-xs text-blue-400 font-semibold">nhân sự hoạt động</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Số thân chủ thụ lý:</span>
                  <span className="font-bold text-slate-200 font-mono">{clients.length} khách</span>
                </div>
              </div>

              <div className="bg-[#14161b] p-5 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 to-yellow-500" />
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Nhiệm Vụ & Deadline</span>
                  <CheckSquare className="w-4 h-4 text-amber-400" />
                </div>
                <div className="mt-3 flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-white">
                    {tasks.filter((t) => !t.completed).length}
                  </span>
                  <span className="text-xs text-amber-400 font-semibold">chưa hoàn thành</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Kho tài liệu chứng cứ:</span>
                  <span className="font-bold text-slate-200 font-mono">{documents.length} tệp</span>
                </div>
              </div>
            </div>

            {/* Quick Banner: Notice regarding Staff vs Admin Isolation */}
            <div className="bg-gradient-to-r from-red-950/60 via-[#1b1e24] to-amber-950/40 p-4 rounded-2xl border border-amber-600/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Cơ chế Phân quyền & Cô lập Giao diện Nghiêm ngặt (Strict RBAC Isolation)
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Nhân sự khi đăng nhập chỉ thấy bàn làm việc và các hồ sơ được Admin phân công. Họ hoàn toàn không nhìn thấy Trang Quản trị này, doanh thu toàn công ty hay tính năng cấu hình.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('assignments')}
                className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0"
              >
                <span>Phân công hồ sơ ngay</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Embedded Full Dashboard Component for In-Depth Analytics */}
            <div className="bg-[#14161b] rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl">
              <div className="text-sm font-bold text-slate-200 mb-4 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Báo Cáo Tiến Độ & Các Vụ Việc Cần Chú Ý (Executive Matrix)</span>
              </div>
              <DashboardView
                cases={cases}
                clients={clients}
                documents={documents}
                tasks={tasks}
                staff={staff}
                currentUser={currentUser}
                onSelectCase={onSelectCase}
                onOpenUpload={onOpenUpload}
                onOpenCreateCase={onOpenCreateCase}
                onNavigateTab={(tab) => {
                  if (tab === 'cases') setActiveTab('assignments');
                  else if (tab === 'clients' || tab === 'documents') setActiveTab('master_records');
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 2: CASE ASSIGNMENT & ALLOCATION HUB (Điều phối phân công công việc) */}
        {activeTab === 'assignments' && (
          <div className="space-y-5">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#14161b] p-5 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Scale className="w-5 h-5 text-amber-400" />
                  <span>Trung Tâm Phân Công Vụ Việc & Điều Phối Nhân Sự</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Chỉ định Luật sư Chủ trì (Lead Lawyer) và Trợ lý pháp lý (Assistants). Nhân sự chỉ được xem các vụ việc mà bạn phân công tại đây.
                </p>
              </div>

              <button
                onClick={onOpenCreateCase}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-md"
              >
                <Scale className="w-4 h-4" />
                <span>+ Khởi tạo Vụ việc Mới</span>
              </button>
            </div>

            {/* Staff Caseload Quota Overview Cards */}
            <div className="bg-[#14161b] p-4 rounded-2xl border border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Khối lượng phụ trách của từng nhân sự (Caseload Quota)</span>
                <span className="text-[11px] text-amber-400 lowercase">Click vào nhân sự để lọc danh sách</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                <button
                  onClick={() => setSelectedStaffForAssignment('all')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedStaffForAssignment === 'all'
                      ? 'bg-amber-500/10 border-amber-500/60 text-amber-300'
                      : 'bg-[#181a20] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">Tất cả nhân sự</div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">{cases.length} vụ việc</div>
                </button>

                {staff.map((s) => {
                  const isOverQuota = s.maxCaseloadQuota && s.activeCases >= s.maxCaseloadQuota;
                  const isSelected = selectedStaffForAssignment === s.name;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStaffForAssignment(isSelected ? 'all' : s.name)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/60 text-amber-300'
                          : 'bg-[#181a20] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate mr-1">{s.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                          {s.initials}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{s.role}</div>
                      <div className="mt-2 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Đang nhận:</span>
                        <span className={`font-bold ${isOverQuota ? 'text-red-400' : 'text-emerald-400'}`}>
                          {s.activeCases} {s.maxCaseloadQuota ? `/ ${s.maxCaseloadQuota}` : ''} hồ sơ
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#14161b] p-3 rounded-xl border border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm mã vụ việc, tiêu đề, thân chủ, luật sư..."
                  value={caseSearch}
                  onChange={(e) => setCaseSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#181a20] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-xs text-slate-400 whitespace-nowrap">Lĩnh vực:</span>
                <select
                  value={caseCategoryFilter}
                  onChange={(e) => setCaseCategoryFilter(e.target.value)}
                  className="bg-[#181a20] border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500"
                >
                  <option value="all">Tất cả lĩnh vực</option>
                  <option value="Dân sự">Dân sự</option>
                  <option value="Hình sự">Hình sự</option>
                  <option value="Hôn nhân gia đình">Hôn nhân gia đình</option>
                  <option value="Đất đai">Đất đai</option>
                  <option value="Doanh nghiệp">Doanh nghiệp</option>
                  <option value="Hành chính">Hành chính</option>
                </select>
              </div>
            </div>

            {/* Cases Allocation Table */}
            <div className="bg-[#14161b] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#181a20] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Mã & Tiêu Đề Vụ Việc</th>
                      <th className="py-3 px-4">Thân Chủ</th>
                      <th className="py-3 px-4">Lĩnh Vực</th>
                      <th className="py-3 px-4 text-amber-400">Luật Sư Chủ Trì (Lead)</th>
                      <th className="py-3 px-4 text-slate-300">Trợ Lý Hỗ Trợ (Assistants)</th>
                      <th className="py-3 px-4">Trạng Thái</th>
                      <th className="py-3 px-4 text-right">Thao Tác Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredCasesForAssignment.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500">
                          Không tìm thấy vụ việc nào phù hợp với bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      filteredCasesForAssignment.map((c) => {
                        const isEditing = editingAssignmentCaseId === c.id;

                        return (
                          <tr
                            key={c.id}
                            className={`hover:bg-[#181a20]/70 transition-colors ${
                              isEditing ? 'bg-amber-950/20' : ''
                            }`}
                          >
                            {/* Case Code & Title */}
                            <td className="py-3 px-4">
                              <div className="font-mono text-[11px] font-bold text-amber-400">{c.id}</div>
                              <div className="font-semibold text-slate-200 mt-0.5 line-clamp-1 max-w-[240px]">
                                {c.title}
                              </div>
                            </td>

                            {/* Client */}
                            <td className="py-3 px-4 text-slate-300 font-medium">
                              {c.clientName}
                            </td>

                            {/* Category */}
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                                {c.category}
                              </span>
                            </td>

                            {/* Lead Lawyer Column */}
                            <td className="py-3 px-4">
                              {isEditing ? (
                                <select
                                  value={tempLeadLawyer}
                                  onChange={(e) => setTempLeadLawyer(e.target.value)}
                                  className="bg-slate-900 border border-amber-500/60 text-amber-300 font-bold px-2 py-1.5 rounded-lg text-xs focus:outline-none"
                                >
                                  {staff.map((s) => (
                                    <option key={s.id} value={s.name} className="bg-slate-900 text-white">
                                      {s.name} ({s.role})
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <div className="flex items-center space-x-1.5">
                                  <div className="w-5 h-5 rounded-full bg-red-900/60 text-amber-300 font-bold text-[10px] flex items-center justify-center border border-amber-500/30">
                                    ★
                                  </div>
                                  <span className="font-bold text-amber-300">{c.leadLawyer}</span>
                                </div>
                              )}
                            </td>

                            {/* Assistants Column */}
                            <td className="py-3 px-4">
                              {isEditing ? (
                                <div className="space-y-1 max-h-32 overflow-y-auto p-1 bg-slate-900 rounded-lg border border-slate-700">
                                  {staff
                                    .filter((s) => s.name !== tempLeadLawyer)
                                    .map((s) => (
                                      <label
                                        key={s.id}
                                        className="flex items-center space-x-1.5 text-[11px] text-slate-300 hover:text-white cursor-pointer"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={tempAssistants.includes(s.name)}
                                          onChange={() => toggleAssistant(s.name)}
                                          className="rounded text-red-600 focus:ring-0"
                                        />
                                        <span>{s.name}</span>
                                      </label>
                                    ))}
                                </div>
                              ) : (
                                <div className="flex flex-wrap gap-1">
                                  {c.assistants && c.assistants.length > 0 ? (
                                    c.assistants.map((ast, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]"
                                      >
                                        {ast}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-slate-500 italic text-[11px]">Chưa gán trợ lý</span>
                                  )}
                                </div>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  c.status === 'Khẩn'
                                    ? 'bg-red-900/60 text-red-300 border border-red-700'
                                    : c.status === 'Đang xử lý'
                                    ? 'bg-blue-900/60 text-blue-300 border border-blue-700'
                                    : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                                }`}
                              >
                                {c.status}
                              </span>
                            </td>

                            {/* Action Buttons */}
                            <td className="py-3 px-4 text-right">
                              {isEditing ? (
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => handleSaveAssignment(c)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                                  >
                                    Lưu
                                  </button>
                                  <button
                                    onClick={() => setEditingAssignmentCaseId(null)}
                                    className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs cursor-pointer"
                                  >
                                    Hủy
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => handleStartEditAssignment(c)}
                                    className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                                    title="Thay đổi luật sư chủ trì hoặc bổ sung trợ lý"
                                  >
                                    Phân công lại
                                  </button>
                                  <button
                                    onClick={() => onSelectCase(c)}
                                    className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                                    title="Xem chi tiết hồ sơ"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STAFF & RBAC GOVERNANCE */}
        {activeTab === 'staff_rbac' && (
          <div className="space-y-4">
            <div className="bg-[#14161b] p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span>Quản Trị Tài Khoản Nhân Sự & Phân Quyền RBAC</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Cài đặt tài khoản, chức vụ, email Google Workspace đăng nhập 1-chạm và 9 nhóm quyền nghiệp vụ chi tiết.
                </p>
              </div>

              {/* Impersonation quick preview tip */}
              <div className="px-3.5 py-2 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center space-x-2">
                <Eye className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Bạn có thể bấm &quot;Đăng nhập thử&quot; ở bất kỳ nhân sự nào để kiểm tra góc nhìn của họ!</span>
              </div>
            </div>

            {/* Embedded StaffView component */}
            <div className="bg-[#14161b] rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl text-slate-900">
              <StaffView
                staff={staff}
                cases={cases}
                currentUser={currentUser}
                onSelectCase={onSelectCase}
                onSaveStaff={onSaveStaff}
                onSwitchUser={(targetStaff) => {
                  onPreviewStaffView(targetStaff);
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 4: MASTER RECORDS (Hồ sơ gốc & Khách hàng của Hãng Luật) */}
        {activeTab === 'master_records' && (
          <div className="space-y-6">
            <div className="bg-[#14161b] p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <FolderOpen className="w-5 h-5 text-amber-400" />
                  <span>Quản Lý Toàn Bộ Dữ Liệu Gốc Hãng Luật (Master Records)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Đặc quyền Admin: Xem 100% hồ sơ, thân chủ, tài liệu mật và thực hiện xóa dữ liệu khi có yêu cầu hợp lệ.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenCreateCase}
                  className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  + Tạo Hồ sơ Mới
                </button>
                <button
                  onClick={() => onOpenUpload()}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  + Tải Tài liệu
                </button>
              </div>
            </div>

            {/* Sub-tabs / Sections: All Cases Table & All Clients Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Master Cases */}
              <div className="lg:col-span-2 bg-[#14161b] p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Scale className="w-4 h-4 text-red-500" />
                    <span>Toàn bộ Hồ sơ Vụ việc ({cases.length})</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Dữ liệu gốc bảo mật</span>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {cases.map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 bg-[#181a20] rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-amber-400">{c.id}</span>
                          <span className="px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                            {c.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {c.status}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-white truncate mt-1">{c.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                          Thân chủ: <strong className="text-slate-300">{c.clientName}</strong> • Luật sư: <strong className="text-amber-300">{c.leadLawyer}</strong>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => onSelectCase(c)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Mở hồ sơ
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ ${c.id} - ${c.title}? Hành động này chỉ Admin mới được thực hiện.`)) {
                              onDeleteCase(c.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg cursor-pointer transition-colors"
                          title="Xóa hồ sơ (Đặc quyền Admin)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right 1 Col: Master Clients */}
              <div className="bg-[#14161b] p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>Danh bạ Thân chủ ({clients.length})</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Toàn công ty</span>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {clients.map((cl) => (
                    <div
                      key={cl.id}
                      className="p-3 bg-[#181a20] rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold text-white truncate">{cl.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {cl.type} • {cl.phone}
                        </div>
                        <div className="text-[10px] text-amber-400/80 font-mono mt-0.5">
                          {cl.casesCount} vụ việc phụ trách
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (window.confirm(`Xác nhận xóa thân chủ ${cl.name}?`)) {
                            onDeleteClient(cl.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg cursor-pointer transition-colors shrink-0"
                        title="Xóa thân chủ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SYSTEM SETTINGS & AUDIT LOG */}
        {activeTab === 'system_settings' && (
          <div className="space-y-4">
            <div className="bg-[#14161b] p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-amber-400" />
                  <span>Cấu Hình Hệ Thống Văn Phòng & Nhật Ký Kiểm Toán (Audit Trail)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Thông tin pháp lý công ty luật, thiết lập module bảo mật, IP cho phép và truy xuất nhật ký thao tác.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={onResetData}
                  className="px-3.5 py-2 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/60 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Đặt lại Dữ liệu Mẫu</span>
                </button>
              </div>
            </div>

            {/* Embedded SettingsView */}
            <div className="bg-[#14161b] rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl text-slate-900">
              <SettingsView
                settings={systemSettings}
                onUpdateSettings={onUpdateSettings}
                auditLogs={auditLogs}
                onResetData={onResetData}
                casesCount={cases.length}
                clientsCount={clients.length}
                docsCount={documents.length}
                staffCount={staff.length}
              />
            </div>
          </div>
        )}
      </main>

      {/* Admin Portal Bottom Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#14161b] py-3 px-6 text-center text-xs text-slate-500">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>BigBoss Law Firm CRM • Khu Vực Quản Trị Hệ Thống Tối Cao (Admin Governance Center)</span>
          <span className="font-mono text-amber-400/80 text-[11px]">
            Phiên bản Quản Trị 2026.10 • Quyền hạn: MASTER_ADMIN
          </span>
        </div>
      </footer>
    </div>
  );
};
