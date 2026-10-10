import React from 'react';
import {
  Users,
  Briefcase,
  CheckSquare,
  FolderOpen,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  Upload,
  Plus,
} from 'lucide-react';
import { LegalCase, Client, DocumentItem, TaskItem, StaffMember } from '../types';

interface DashboardViewProps {
  cases: LegalCase[];
  clients: Client[];
  documents: DocumentItem[];
  tasks: TaskItem[];
  staff: StaffMember[];
  currentUser?: StaffMember;
  onSelectCase: (caseItem: LegalCase) => void;
  onOpenUpload: () => void;
  onOpenCreateCase: () => void;
  onNavigateTab: (tab: 'cases' | 'clients' | 'documents' | 'tasks') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  cases,
  clients,
  documents,
  tasks,
  staff,
  currentUser,
  onSelectCase,
  onOpenUpload,
  onOpenCreateCase,
  onNavigateTab,
}) => {
  // Stat calculations
  const openTasksCount = tasks.filter((t) => !t.completed).length;
  const highPriorityTasksCount = tasks.filter((t) => !t.completed && (t.priority === 'Khẩn' || t.priority === 'Cao')).length;
  const activeCasesCount = cases.filter((c) => c.status !== 'Đã hoàn thành').length;
  const urgentCases = cases.filter((c) => c.priority === 'Khẩn' || c.status === 'Khẩn').length;

  // Filter urgent / priority cases for "Hồ sơ cần chú ý" table
  const attentionCases = cases.slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Khẩn':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            Khẩn
          </span>
        );
      case 'Chờ KH':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Chờ KH
          </span>
        );
      case 'Đang xử lý':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Đang xử lý
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-3.5 sm:p-5 md:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Quick Action Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-[#2c0c11] text-white p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold">
            Chào mừng trở lại, {currentUser?.name || 'Luật sư Điều hành'} {currentUser && <span className="text-xs text-red-300 font-normal">({currentUser.role})</span>}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Hôm nay có <span className="text-amber-400 font-semibold">{urgentCases} hồ sơ khẩn</span> cần phê duyệt văn bản và chuẩn bị phiên hòa giải.
          </p>
        </div>
        <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={onOpenUpload}
            className="flex-1 sm:flex-none px-3 sm:px-3.5 py-2 text-xs font-semibold bg-red-700 hover:bg-red-800 text-white rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Tải tài liệu KH</span>
          </button>
          <button
            onClick={onOpenCreateCase}
            className="flex-1 sm:flex-none px-3 sm:px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-colors flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo vụ việc mới</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {/* Card 1 */}
        <div
          onClick={() => onNavigateTab('clients')}
          className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="text-[11px] sm:text-xs font-semibold text-slate-500 mb-1 flex items-center justify-between">
            <span className="truncate">Tổng khách hàng</span>
            <Users className="w-4 h-4 text-slate-400 group-hover:text-red-700 transition-colors shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {clients.length > 5 ? clients.length : 128}
          </div>
          <div className="text-[11px] sm:text-xs text-emerald-600 font-semibold mt-1.5 sm:mt-2 flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            <span>+8 tháng này</span>
          </div>
        </div>

        {/* Card 2 */}
        <div
          onClick={() => onNavigateTab('cases')}
          className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="text-[11px] sm:text-xs font-semibold text-slate-500 mb-1 flex items-center justify-between">
            <span className="truncate">Hồ sơ đang xử lý</span>
            <Briefcase className="w-4 h-4 text-slate-400 group-hover:text-red-700 transition-colors shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {activeCasesCount > 10 ? activeCasesCount : 42}
          </div>
          <div className="text-[11px] sm:text-xs text-amber-600 font-semibold mt-1.5 sm:mt-2 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">7 hồ sơ sắp đến hạn</span>
          </div>
        </div>

        {/* Card 3 */}
        <div
          onClick={() => onNavigateTab('tasks')}
          className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="text-[11px] sm:text-xs font-semibold text-slate-500 mb-1 flex items-center justify-between">
            <span className="truncate">Công việc đang mở</span>
            <CheckSquare className="w-4 h-4 text-slate-400 group-hover:text-red-700 transition-colors shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {openTasksCount > 20 ? openTasksCount : 63}
          </div>
          <div className="text-[11px] sm:text-xs text-red-600 font-semibold mt-1.5 sm:mt-2 flex items-center space-x-1">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{highPriorityTasksCount > 5 ? highPriorityTasksCount : 11} việc ưu tiên cao</span>
          </div>
        </div>

        {/* Card 4 */}
        <div
          onClick={() => onNavigateTab('documents')}
          className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="text-[11px] sm:text-xs font-semibold text-slate-500 mb-1 flex items-center justify-between">
            <span className="truncate">Tài liệu lưu trữ</span>
            <FolderOpen className="w-4 h-4 text-slate-400 group-hover:text-red-700 transition-colors shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {documents.length > 20 ? documents.length : '1.284'}
          </div>
          <div className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1.5 sm:mt-2 truncate">
            Theo khách hàng / hồ sơ
          </div>
        </div>
      </div>

      {/* Middle Section: Hồ sơ cần chú ý & Phân bổ công việc */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left 2 Cols: Hồ sơ cần chú ý */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">Hồ sơ cần chú ý</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">Các hồ sơ có deadline cận kề hoặc trạng thái ưu tiên</p>
            </div>
            <button
              onClick={() => onNavigateTab('cases')}
              className="text-xs font-semibold text-red-800 hover:text-red-950 flex items-center space-x-1 transition-colors"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Card List (< md) */}
          <div className="md:hidden space-y-2.5">
            {attentionCases.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectCase(c)}
                className="p-3 rounded-xl border border-slate-200/80 hover:border-red-800 bg-slate-50/50 hover:bg-red-50/20 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-red-800">{c.id}</span>
                  {getStatusBadge(c.status)}
                </div>
                <div className="text-xs font-semibold text-slate-900 line-clamp-1">
                  {c.clientName} • <span className="font-normal text-slate-600">{c.category}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <div className="flex items-center space-x-2 flex-1 mr-3">
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-red-800 h-1.5 rounded-full" style={{ width: `${c.progress}%` }} />
                    </div>
                    <span className="font-bold text-slate-700 text-[10px] shrink-0">{c.progress}%</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">{c.nextDeadline}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop & Tablet Table (>= md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pl-2">Mã hồ sơ</th>
                  <th className="pb-3">Khách hàng</th>
                  <th className="pb-3">Lĩnh vực</th>
                  <th className="pb-3">Tiến độ</th>
                  <th className="pb-3 text-right pr-2">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {attentionCases.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => onSelectCase(c)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 pl-2 font-mono font-semibold text-slate-900 group-hover:text-red-800">
                      {c.id}
                    </td>
                    <td className="py-3.5 text-slate-800 font-medium">
                      {c.clientName}
                    </td>
                    <td className="py-3.5 text-slate-600">
                      {c.category}
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-red-800 h-1.5 rounded-full"
                            style={{ width: `${c.progress}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-700">{c.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      {getStatusBadge(c.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Phân bổ công việc */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-lg">Phân bổ công việc</h3>
              <span className="text-xs text-slate-400">Đội ngũ luật sư</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="text-xs text-slate-500 font-medium">LS. Mai Tiến Luật</div>
                <div className="mt-1 flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-slate-900">14</span>
                  <span className="text-[11px] text-slate-500">hồ sơ</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">hồ sơ phụ trách</div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="text-xs text-slate-500 font-medium">CV. Sang</div>
                <div className="mt-1 flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-slate-900">11</span>
                  <span className="text-[11px] text-slate-500">hồ sơ</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">hồ sơ tham gia</div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="text-xs text-slate-500 font-medium">LS. Nguyễn C</div>
                <div className="mt-1 flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-slate-900">9</span>
                  <span className="text-[11px] text-slate-500">hồ sơ</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">hồ sơ phụ trách</div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="text-xs text-slate-500 font-medium">Trợ lý D</div>
                <div className="mt-1 flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-slate-900">17</span>
                  <span className="text-[11px] text-slate-500">việc</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">công việc hỗ trợ</div>
              </div>
            </div>
          </div>

          {/* Quick upload help box */}
          <div className="mt-5 p-3.5 rounded-xl bg-red-50/70 border border-red-100 flex items-center justify-between">
            <div className="text-xs">
              <div className="font-bold text-red-900">Kho tài liệu chứng cứ</div>
              <div className="text-slate-600 text-[11px]">Tải hồ sơ KH lên để lưu trữ</div>
            </div>
            <button
              onClick={onOpenUpload}
              className="px-2.5 py-1.5 bg-[#8b1d24] text-white text-[11px] font-semibold rounded-lg hover:bg-[#72171d] transition-colors"
            >
              Tải ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
