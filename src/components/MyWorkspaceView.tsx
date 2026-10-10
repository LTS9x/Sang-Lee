import React, { useState } from 'react';
import {
  Briefcase,
  CheckSquare,
  Clock,
  Calendar,
  AlertTriangle,
  FolderOpen,
  Plus,
  CheckCircle2,
  ExternalLink,
  Upload,
  User,
  Award,
  Filter,
  Eye,
  Download,
  Settings,
  Scale,
  Search,
} from 'lucide-react';
import {
  LegalCase,
  TaskItem,
  DocumentItem,
  CaseTimeline,
  StaffMember,
} from '../types';

interface MyWorkspaceViewProps {
  currentUser: StaffMember;
  cases: LegalCase[];
  tasks: TaskItem[];
  documents: DocumentItem[];
  timelines: CaseTimeline[];
  onSelectCase: (caseItem: LegalCase) => void;
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Omit<TaskItem, 'id'>) => void;
  onOpenUpload: (caseId?: string, clientId?: string) => void;
  onPreviewDocument: (doc: DocumentItem) => void;
  onOpenProfile: () => void;
}

export const MyWorkspaceView: React.FC<MyWorkspaceViewProps> = ({
  currentUser,
  cases,
  tasks,
  documents,
  timelines,
  onSelectCase,
  onToggleTask,
  onAddTask,
  onOpenUpload,
  onPreviewDocument,
  onOpenProfile,
}) => {
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [showQuickAddTask, setShowQuickAddTask] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskCaseId, setQuickTaskCaseId] = useState('');
  const [quickTaskDeadline, setQuickTaskDeadline] = useState('15/10/2026');
  const [quickTaskPriority, setQuickTaskPriority] = useState<'Khẩn' | 'Cao' | 'Bình thường'>('Bình thường');

  // Filter cases assigned to currentUser
  const myCases = cases.filter(
    (c) =>
      c.leadLawyer === currentUser.name ||
      c.assistants.includes(currentUser.name) ||
      currentUser.roleId === 'admin'
  );

  // Filter tasks assigned to currentUser
  const myTasks = tasks.filter(
    (t) =>
      t.assignee === currentUser.name ||
      t.assignee === currentUser.initials ||
      currentUser.roleId === 'admin'
  );

  const filteredTasks = myTasks.filter((t) => {
    if (taskFilter === 'pending') return !t.completed;
    if (taskFilter === 'completed') return t.completed;
    return true;
  });

  // Timelines for my cases
  const myCaseIds = myCases.map((c) => c.id);
  const myTimelines = timelines.filter((tm) => myCaseIds.includes(tm.caseId));

  // Documents for my cases or uploaded by me
  const myDocs = documents.filter(
    (d) =>
      (d.caseId && myCaseIds.includes(d.caseId)) ||
      d.uploadedBy === currentUser.name ||
      currentUser.roleId === 'admin'
  );

  const pendingTasksCount = myTasks.filter((t) => !t.completed).length;
  const quota = currentUser.maxCaseloadQuota || 15;
  const loadPercentage = Math.min(100, Math.round((myCases.length / quota) * 100));

  const handleCreateQuickTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;

    const targetCase = cases.find((c) => c.id === quickTaskCaseId) || myCases[0] || cases[0];
    onAddTask({
      title: quickTaskTitle.trim(),
      caseId: targetCase?.id || 'HS-202610-0001',
      caseTitle: targetCase?.title || 'Hồ sơ tố tụng',
      assignee: currentUser.name,
      deadline: quickTaskDeadline,
      priority: quickTaskPriority,
      completed: false,
    });

    setQuickTaskTitle('');
    setShowQuickAddTask(false);
  };

  return (
    <div className="p-3.5 sm:p-5 md:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Personalized Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#270e12] to-slate-900 text-white p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-1 sm:space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              currentUser.roleId === 'admin'
                ? 'bg-amber-900/70 border border-amber-600/70 text-amber-200'
                : 'bg-red-900/60 border border-red-700/60 text-red-200'
            }`}>
              {currentUser.roleId === 'admin' ? '👑 BÀN ĐIỀU HÀNH ADMIN' : '⚖️ BÀN LÀM VIỆC NHÂN SỰ'}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-400">
              {currentUser.department}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center space-x-2">
            <span>Xin chào, {currentUser.name}</span>
          </h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-300 pt-0.5">
            <span className="flex items-center space-x-1">
              <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Chức vụ: <strong>{currentUser.role}</strong></span>
            </span>
            {currentUser.lawyerCardNumber && (
              <span className="flex items-center space-x-1 font-mono">
                <Scale className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>Số thẻ CCHN: <strong>{currentUser.lawyerCardNumber}</strong></span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto">
          {currentUser.permissions.includes('upload_documents') && (
            <button
              onClick={() => onOpenUpload()}
              className="flex-1 sm:flex-none px-3 sm:px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-red-400" />
              <span>Tải tài liệu</span>
            </button>
          )}

          <button
            onClick={onOpenProfile}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-750 hover:bg-red-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Cài đặt tài khoản</span>
          </button>
        </div>
      </div>

      {/* Staff Assignment & Permission Summary Card (Only for non-admin) */}
      {currentUser.roleId !== 'admin' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-amber-200/90 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                <Briefcase className="w-4 h-4 text-amber-800" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                  Thông tin phân công nhiệm vụ & Quyền hạn từ Admin
                </h3>
                <p className="text-[11px] text-slate-500">
                  Tài khoản nhân sự được quản lý bảo mật thông qua Email Google Auth: <strong className="text-slate-800 font-mono">{currentUser.googleEmail || currentUser.email}</strong>
                </p>
              </div>
            </div>
            <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-full border border-amber-200/80 shrink-0">
              {currentUser.permissions.length}/10 Quyền tác vụ được cấp
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Phạm vi thụ lý hồ sơ</span>
              <div className="font-bold text-slate-800 text-sm">{myCases.length} vụ việc do Admin phân công</div>
              <p className="text-[11px] text-slate-500">Hạn mức tối đa: {quota} hồ sơ</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Nhiệm vụ cần hoàn tất</span>
              <div className="font-bold text-slate-800 text-sm">{pendingTasksCount} công việc chưa xong</div>
              <p className="text-[11px] text-slate-500">Được phân công trực tiếp</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Quyền tác vụ được phép</span>
              <div className="flex flex-wrap gap-1">
                {currentUser.permissions.map((p) => {
                  const map: Record<string, string> = {
                    view_all_cases: 'Xem hồ sơ',
                    create_edit_cases: 'Soạn đơn/Hồ sơ',
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
                    <span key={p} className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[9px] font-semibold text-slate-700">
                      ✓ {map[p] || p}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI & Workload Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Active cases */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <Briefcase className="w-3.5 h-3.5 text-red-800" />
              <span>Hồ sơ đang phụ trách</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Quota: {quota}
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {myCases.length}{' '}
            <span className="text-xs font-normal text-slate-500">hồ sơ</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className={`h-1.5 rounded-full ${
                loadPercentage > 85
                  ? 'bg-red-700'
                  : loadPercentage > 60
                  ? 'bg-amber-600'
                  : 'bg-emerald-600'
              }`}
              style={{ width: `${loadPercentage}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 text-right">
            Đạt {loadPercentage}% công suất
          </div>
        </div>

        {/* Pending tasks */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
            <CheckSquare className="w-3.5 h-3.5 text-blue-700" />
            <span>Nhiệm vụ cần xử lý</span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {pendingTasksCount}{' '}
            <span className="text-xs font-normal text-slate-500">chưa xong</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Tổng cộng {myTasks.length} nhiệm vụ được giao
          </div>
        </div>

        {/* Hearings & Meetings */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 text-amber-700" />
            <span>Lịch Tòa & Cơ quan</span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {myTimelines.length}{' '}
            <span className="text-xs font-normal text-slate-500">sự kiện</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Trong các hồ sơ bạn phụ trách
          </div>
        </div>

        {/* Success / On-time rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Hiệu suất đúng hạn</span>
          </div>
          <div className="text-2xl font-black text-emerald-700">
            {currentUser.kpiSuccessRate || 95}%
          </div>
          <div className="text-[11px] text-slate-500">
            Đánh giá chất lượng nghiệp vụ
          </div>
        </div>
      </div>

      {/* Main Grid: Left Tasks & Cases / Right Calendar & Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide): Tasks & Cases */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: My Tasks */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <CheckSquare className="w-4 h-4 text-red-800" />
                  <span>Việc cần làm hôm nay của tôi ({filteredTasks.length})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Danh sách nhiệm vụ tố tụng được phân công riêng cho bạn
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex bg-white rounded-lg border border-slate-200 p-0.5 text-xs">
                  <button
                    onClick={() => setTaskFilter('pending')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                      taskFilter === 'pending'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Chưa xong ({pendingTasksCount})
                  </button>
                  <button
                    onClick={() => setTaskFilter('all')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                      taskFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tất cả
                  </button>
                </div>

                <button
                  onClick={() => setShowQuickAddTask(!showQuickAddTask)}
                  className="px-3 py-1 bg-red-850 hover:bg-red-900 text-white text-xs font-bold rounded-lg transition-colors flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm việc</span>
                </button>
              </div>
            </div>

            {/* Quick Add Task Form */}
            {showQuickAddTask && (
              <form
                onSubmit={handleCreateQuickTask}
                className="p-4 bg-red-50/50 border-b border-red-100 space-y-3 animate-in fade-in"
              >
                <div className="text-xs font-bold text-red-950">
                  Tạo nhiệm vụ mới cho bản thân:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Nội dung công việc (VD: Soạn bản luận cứ bảo vệ)"
                    value={quickTaskTitle}
                    onChange={(e) => setQuickTaskTitle(e.target.value)}
                    className="sm:col-span-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-red-800"
                    required
                  />

                  <select
                    value={quickTaskCaseId}
                    onChange={(e) => setQuickTaskCaseId(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 truncate"
                  >
                    <option value="">Gắn vào hồ sơ...</option>
                    {myCases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.id} - {c.clientName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1.5 text-slate-600">
                      <span>Hạn chót:</span>
                      <input
                        type="text"
                        value={quickTaskDeadline}
                        onChange={(e) => setQuickTaskDeadline(e.target.value)}
                        className="w-28 px-2 py-1 bg-white border border-slate-300 rounded font-mono text-[11px]"
                      />
                    </div>

                    <div className="flex items-center space-x-1 text-slate-600">
                      <span>Ưu tiên:</span>
                      <select
                        value={quickTaskPriority}
                        onChange={(e) => setQuickTaskPriority(e.target.value as any)}
                        className="px-2 py-1 bg-white border border-slate-300 rounded text-[11px]"
                      >
                        <option value="Bình thường">Bình thường</option>
                        <option value="Cao">Cao</option>
                        <option value="Khẩn">Khẩn</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowQuickAddTask(false)}
                      className="px-3 py-1 text-slate-500 hover:text-slate-800 text-xs"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1 bg-red-800 hover:bg-red-900 text-white font-bold rounded-lg text-xs"
                    >
                      Lưu việc
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Tasks List */}
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {filteredTasks.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  🎉 Tuyệt vời! Bạn không còn nhiệm vụ nào tồn đọng trong danh sách.
                </div>
              ) : (
                filteredTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`p-3.5 flex items-start justify-between gap-3 hover:bg-slate-50 transition-colors ${
                      t.completed ? 'opacity-60 bg-slate-50/40' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => onToggleTask(t.id)}
                        className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-colors shrink-0 ${
                          t.completed
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 hover:border-red-800 bg-white'
                        }`}
                      >
                        {t.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>

                      <div className="min-w-0">
                        <div
                          className={`text-xs font-semibold text-slate-900 ${
                            t.completed ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {t.title}
                        </div>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-mono text-slate-600">{t.caseId}</span>
                          <span>•</span>
                          <span className="truncate max-w-[180px]">{t.caseTitle}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.priority === 'Khẩn'
                            ? 'bg-red-100 text-red-800'
                            : t.priority === 'Cao'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {t.priority}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{t.deadline}</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section: My Assigned Cases */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-red-800" />
                  <span>Hồ sơ vụ việc tôi đang phụ trách ({myCases.length})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Nhấn vào hồ sơ để mở không gian làm việc chi tiết
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {myCases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSelectCase(c)}
                  className="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between gap-4 group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-red-850 group-hover:underline">
                        {c.id}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                        {c.category}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                        {c.status}
                      </span>
                    </div>

                    <div className="font-bold text-xs text-slate-900 truncate">
                      {c.title}
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center space-x-3">
                      <span>Thân chủ: <strong>{c.clientName}</strong></span>
                      <span>•</span>
                      <span>Hạn chót tiếp theo: <strong className="font-mono text-red-900">{c.nextDeadline}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-bold text-slate-800">{c.progress}%</div>
                      <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className="bg-red-800 h-1.5 rounded-full"
                          style={{ width: `${c.progress}%` }}
                        />
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-red-800 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col wide): Calendar Timeline & Recent Docs */}
        <div className="space-y-6">
          {/* Section: Hearing & Court Calendar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-amber-700" />
                <span>Lịch Tòa án & Kỳ hạn ({myTimelines.length})</span>
              </h3>
            </div>

            <div className="p-4 space-y-3.5 max-h-80 overflow-y-auto">
              {myTimelines.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-4">
                  Không có lịch Tòa hoặc buổi làm việc sắp tới.
                </div>
              ) : (
                myTimelines.map((tm) => (
                  <div
                    key={tm.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-red-850">
                        {tm.date}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                        {tm.type === 'court' ? 'Phiên Tòa' : 'Làm việc'}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900">{tm.title}</div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {tm.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section: Recent Documents */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                <FolderOpen className="w-4 h-4 text-red-800" />
                <span>Tài liệu hồ sơ của tôi ({myDocs.length})</span>
              </h3>
              <button
                onClick={() => onOpenUpload()}
                className="text-xs text-red-800 hover:underline font-bold"
              >
                + Tải thêm
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {myDocs.slice(0, 5).map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate" title={doc.name}>
                      {doc.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {doc.category} • {doc.fileSize}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => onPreviewDocument(doc)}
                      className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded"
                      title="Xem trước"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
