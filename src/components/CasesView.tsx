import React, { useState } from 'react';
import { Search, Plus, Filter, Briefcase, ExternalLink, ArrowUpDown, Edit, Trash2, Shield, Calendar, Clock } from 'lucide-react';
import { LegalCase, CaseCategory, StaffMember } from '../types';

interface CasesViewProps {
  cases: LegalCase[];
  currentUser: StaffMember;
  onSelectCase: (caseItem: LegalCase) => void;
  onOpenCreateCase: () => void;
  onOpenEditCase: (caseItem: LegalCase) => void;
  onDeleteCase: (caseId: string) => void;
}

export const CasesView: React.FC<CasesViewProps> = ({
  cases,
  currentUser,
  onSelectCase,
  onOpenCreateCase,
  onOpenEditCase,
  onDeleteCase,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CaseCategory>('Tất cả hồ sơ');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [onlyMyCases, setOnlyMyCases] = useState<boolean>(() => {
    // If user does not have view_all_cases permission, default to true
    return !currentUser.permissions.includes('view_all_cases');
  });

  const categoryCards: { id: CaseCategory; label: string; countStr: string }[] = [
    { id: 'Tất cả hồ sơ', label: 'Tất cả hồ sơ', countStr: `${cases.length} hồ sơ đang xử lý` },
    { id: 'Dân sự', label: 'Dân sự', countStr: `${cases.filter((c) => c.category === 'Dân sự').length} hồ sơ` },
    { id: 'Hình sự', label: 'Hình sự', countStr: `${cases.filter((c) => c.category === 'Hình sự').length} hồ sơ` },
    { id: 'Hôn nhân gia đình', label: 'Hôn nhân gia đình', countStr: `${cases.filter((c) => c.category === 'Hôn nhân gia đình').length} hồ sơ` },
    { id: 'Đất đai', label: 'Đất đai', countStr: `${cases.filter((c) => c.category === 'Đất đai').length} hồ sơ` },
    { id: 'Hành chính', label: 'Hành chính', countStr: `${cases.filter((c) => c.category === 'Hành chính').length} hồ sơ` },
    { id: 'Doanh nghiệp', label: 'Doanh nghiệp', countStr: `${cases.filter((c) => c.category === 'Doanh nghiệp').length} hồ sơ` },
    { id: 'Soạn đơn', label: 'Soạn đơn', countStr: `${cases.filter((c) => c.category === 'Soạn đơn').length} hồ sơ` },
  ];

  const isAdmin = currentUser.roleId === 'admin';
  const canCreateCase = currentUser.permissions.includes('create_edit_cases');
  const canDeleteCase = currentUser.permissions.includes('delete_cases') && isAdmin;
  const hasViewAll = currentUser.permissions.includes('view_all_cases') || isAdmin;

  // Filter cases:
  // If user doesn't have view_all_cases permission, strictly force onlyMyCases
  const filteredCases = cases.filter((c) => {
    if (!hasViewAll) {
      const isAssignedToMe =
        c.leadLawyer.toLowerCase().includes(currentUser.name.toLowerCase()) ||
        currentUser.name.toLowerCase().includes(c.leadLawyer.toLowerCase()) ||
        c.assistants.some(
          (a) =>
            a.toLowerCase().includes(currentUser.name.toLowerCase()) ||
            currentUser.name.toLowerCase().includes(a.toLowerCase())
        );
      if (!isAssignedToMe) {
        return false;
      }
    } else if (onlyMyCases) {
      const isAssignedToMe =
        c.leadLawyer === currentUser.name || c.assistants.includes(currentUser.name);
      if (!isAssignedToMe) {
        return false;
      }
    }

    const matchesCategory =
      selectedCategory === 'Tất cả hồ sơ' || c.category === selectedCategory;
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.leadLawyer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.courtAgency.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || c.status === statusFilter;

    return matchesCategory && matchesSearch && matchesStatus;
  });

  return (
    <div className="p-3.5 sm:p-5 md:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Staff Scope Notice Banner */}
      {!isAdmin && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center space-x-2.5">
            <Shield className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold">Giao diện Phân công Nhân sự ({currentUser.role}):</span>{' '}
              <span className="text-amber-900">
                Bạn chỉ thấy <strong>{cases.length} vụ việc</strong> do Admin giao phụ trách. Hồ sơ của luật sư khác được ẩn bảo mật theo quy định của hãng luật.
              </span>
            </div>
          </div>
          <span className="text-[10px] bg-amber-200/70 text-amber-900 font-bold px-2 py-0.5 rounded-full shrink-0">
            RBAC Cấp phép
          </span>
        </div>
      )}

      {/* Category selector cards matching Image 3 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
        {categoryCards.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all border ${
                isSelected
                  ? 'border-red-800 bg-white ring-2 ring-red-800/10 shadow-xs'
                  : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-2xs'
              }`}
            >
              <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">{cat.label}</div>
              <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 font-medium truncate">
                {cat.id === 'Tất cả hồ sơ'
                  ? `${cases.length} hồ sơ đang xử lý`
                  : cat.countStr}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 sm:gap-3 flex-wrap">
          {/* Search box */}
          <div className="relative flex-1 min-w-[180px] max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mã hồ sơ, khách hàng, tòa án..."
              className="w-full pl-9 pr-3 sm:pr-4 py-2 sm:py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white text-slate-900 shadow-2xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 sm:top-3" />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-800 text-slate-700 font-medium shadow-2xs cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Đang xử lý">Đang xử lý</option>
              <option value="Khẩn">Khẩn cấp</option>
              <option value="Chờ KH">Chờ KH cung cấp</option>
              <option value="Đã hoàn thành">Đã hoàn thành</option>
              <option value="Tạm hoãn">Tạm hoãn</option>
            </select>
          </div>

          {/* Role Filter Toggle */}
          {hasViewAll ? (
            <button
              onClick={() => setOnlyMyCases(!onlyMyCases)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center space-x-1.5 transition-colors ${
                onlyMyCases
                  ? 'bg-red-800 text-white border-red-800 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">{onlyMyCases ? 'Hồ sơ của tôi' : 'Tất cả hồ sơ'}</span>
            </button>
          ) : (
            <span className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center space-x-1.5 whitespace-nowrap">
              <Shield className="w-3.5 h-3.5 text-amber-700" />
              <span>Hồ sơ được giao</span>
            </span>
          )}
        </div>

        {/* Create Case Button */}
        {canCreateCase && (
          <button
            onClick={onOpenCreateCase}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#8b1d24] hover:bg-[#72171d] text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo hồ sơ</span>
          </button>
        )}
      </div>

      {/* Mobile Card List (< md) */}
      <div className="md:hidden space-y-3">
        {filteredCases.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs">
            <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
            Không tìm thấy hồ sơ nào phù hợp với bộ lọc
          </div>
        ) : (
          filteredCases.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectCase(c)}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-red-800">{c.id}</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                      {c.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-1 line-clamp-1">{c.title}</h4>
                </div>
                <div className="flex items-center space-x-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onOpenEditCase(c)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Chỉnh sửa hồ sơ"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  {canDeleteCase && (
                    <button
                      onClick={() => onDeleteCase(c.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa hồ sơ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-600 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block">Thân chủ:</span>
                  <span className="font-semibold text-slate-800 truncate block">{c.clientName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Phụ trách:</span>
                  <span className="font-medium text-slate-700 truncate block">{c.leadLawyer}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center space-x-2 flex-1 mr-4">
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-red-800 h-1.5 rounded-full" style={{ width: `${c.progress}%` }} />
                  </div>
                  <span className="font-bold text-slate-700 text-[11px] shrink-0">{c.progress}%</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono shrink-0 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{c.nextDeadline}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop & Tablet Cases Table (>= md) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/50">
                <th className="py-3.5 pl-6">Mã hồ sơ</th>
                <th className="py-3.5">Khách hàng</th>
                <th className="py-3.5">Lĩnh vực</th>
                <th className="py-3.5">Nội dung</th>
                <th className="py-3.5">Phụ trách</th>
                <th className="py-3.5">Deadline</th>
                <th className="py-3.5">Tiến độ</th>
                <th className="py-3.5 pr-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Không tìm thấy hồ sơ nào phù hợp với bộ lọc
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => onSelectCase(c)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 pl-6 font-mono font-bold text-slate-900 group-hover:text-red-800 flex items-center space-x-1.5">
                      <span>{c.id}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-red-800 transition-opacity" />
                    </td>
                    <td className="py-4 text-slate-900 font-semibold">
                      {c.clientName}
                    </td>
                    <td className="py-4 text-slate-600">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {c.category}
                      </span>
                    </td>
                    <td className="py-4 text-slate-700 max-w-xs truncate" title={c.title}>
                      {c.title}
                    </td>
                    <td className="py-4 text-slate-800 font-medium">
                      {c.leadLawyer}
                    </td>
                    <td className="py-4 text-slate-600 font-mono text-[11px]">
                      {c.nextDeadline}
                    </td>
                    <td className="py-4">
                      <div className="inline-flex items-center space-x-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-red-800 h-1.5 rounded-full"
                            style={{ width: `${c.progress}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-700 w-8">{c.progress}%</span>
                      </div>
                    </td>
                    <td className="py-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onOpenEditCase(c)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Chỉnh sửa hồ sơ"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {canDeleteCase && (
                          <button
                            onClick={() => onDeleteCase(c.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa hồ sơ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

