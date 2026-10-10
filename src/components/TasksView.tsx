import React, { useState } from 'react';
import {
  CheckSquare,
  Search,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Briefcase,
  User,
  Trash2,
} from 'lucide-react';
import { TaskItem, LegalCase, StaffMember } from '../types';

interface TasksViewProps {
  tasks: TaskItem[];
  cases: LegalCase[];
  staff: StaffMember[];
  currentUser?: StaffMember;
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Omit<TaskItem, 'id'>) => void;
  onSelectCase: (caseItem: LegalCase) => void;
  onDeleteTask?: (taskId: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  cases,
  staff,
  currentUser,
  onToggleTask,
  onAddTask,
  onSelectCase,
  onDeleteTask,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'Khẩn' | 'Cao' | 'Bình thường'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = currentUser?.roleId === 'admin';

  // Add task modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [caseId, setCaseId] = useState(cases[0]?.id || '');
  const [assignee, setAssignee] = useState(currentUser?.name || 'CV. Sang');
  const [deadline, setDeadline] = useState('15/10/2026');
  const [priority, setPriority] = useState<'Khẩn' | 'Cao' | 'Bình thường'>('Bình thường');

  const filteredTasks = tasks.filter((t) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'pending'
        ? !t.completed
        : t.completed;
    const matchesPriority =
      priorityFilter === 'all' ? true : t.priority === priorityFilter;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.caseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.caseId.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesPriority && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const matchedCase = cases.find((c) => c.id === caseId);
    onAddTask({
      title: title.trim(),
      caseId: caseId || 'HS-202610-0001',
      caseTitle: matchedCase ? matchedCase.title : 'Vụ việc chung',
      assignee,
      deadline,
      priority,
      completed: false,
    });
    setTitle('');
    setShowAddModal(false);
  };

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="p-3.5 sm:p-5 md:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            {isAdmin ? 'Quản lý Nhiệm vụ & Tiến độ (Toàn hãng luật)' : 'Công việc & Nhiệm vụ được giao'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin 
              ? 'Theo dõi phân công công việc pháp lý, nghiên cứu hồ sơ và tố tụng toàn bộ nhân sự'
              : `Nhiệm vụ vụ việc được phân công xử lý cho ${currentUser?.name} (${currentUser?.role})`}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto px-4 py-2 sm:py-2.5 bg-[#8b1d24] hover:bg-[#72171d] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm công việc mới</span>
        </button>
      </div>

      {/* Staff Scope Notice Banner */}
      {!isAdmin && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center space-x-2.5">
            <CheckSquare className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold">Giao diện Nhiệm vụ Nhân sự ({currentUser?.role}):</span>{' '}
              <span className="text-amber-900">
                Hiển thị <strong>{tasks.length} nhiệm vụ</strong> được Admin và Luật sư trưởng phân công phụ trách.
              </span>
            </div>
          </div>
          <span className="text-[10px] bg-amber-200/70 text-amber-900 font-bold px-2 py-0.5 rounded-full shrink-0">
            Nhiệm vụ được giao
          </span>
        </div>
      )}

      {/* Filter and stats row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex flex-1 items-center gap-2 sm:gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo nội dung, nhân sự, vụ việc..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-800 text-slate-900 shadow-2xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-300 text-xs overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({tasks.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filter === 'pending'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đang mở ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filter === 'completed'
                  ? 'bg-emerald-700 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đã xong ({completedCount})
            </button>
          </div>
        </div>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as any)}
          className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-800 text-slate-700 font-medium"
        >
          <option value="all">Mọi mức độ ưu tiên</option>
          <option value="Khẩn">Khẩn cấp</option>
          <option value="Cao">Cao</option>
          <option value="Bình thường">Bình thường</option>
        </select>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredTasks.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Không có công việc nào thỏa mãn tiêu chí lọc
            </div>
          ) : (
            filteredTasks.map((task) => {
              const matchedCase = cases.find((c) => c.id === task.caseId);

              return (
                <div
                  key={task.id}
                  className={`p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4 hover:bg-slate-50 transition-colors ${
                    task.completed ? 'bg-slate-50/40 text-slate-400' : 'text-slate-800'
                  }`}
                >
                  <div className="flex items-start sm:items-center space-x-3 flex-1 min-w-0 w-full sm:w-auto">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => onToggleTask(task.id)}
                      className="mt-0.5 sm:mt-0 w-4 h-4 rounded-md text-red-800 accent-[#8b1d24] cursor-pointer shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-xs sm:text-sm font-bold ${
                          task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </div>

                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-1 flex-wrap">
                        <span
                          onClick={() => matchedCase && onSelectCase(matchedCase)}
                          className="font-mono text-red-800 hover:underline cursor-pointer font-semibold"
                        >
                          {task.caseId}
                        </span>
                        <span>•</span>
                        <span className="truncate max-w-[200px]">{task.caseTitle}</span>
                        <span>•</span>
                        <span>Phụ trách: <strong className="text-slate-700">{task.assignee}</strong></span>
                        <span>•</span>
                        <span>Hạn: <strong className="text-red-700">{task.deadline}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-between sm:justify-end w-full sm:w-auto pl-7 sm:pl-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 space-x-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold ${
                        task.priority === 'Khẩn'
                          ? 'bg-red-100 text-red-800'
                          : task.priority === 'Cao'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {task.priority}
                    </span>

                    {onDeleteTask && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTask(task.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa công việc"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Thêm công việc vụ việc mới</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung công việc <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Soạn bản ý kiến gửi TAND..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Thuộc hồ sơ / Vụ việc
                </label>
                <select
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} • {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nhân sự phụ trách
                  </label>
                  <select
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800"
                  >
                    {staff.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mức độ ưu tiên
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800"
                  >
                    <option value="Khẩn">Khẩn</option>
                    <option value="Cao">Cao</option>
                    <option value="Bình thường">Bình thường</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hạn hoàn thành (Deadline)
                </label>
                <input
                  type="text"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="VD: 15/10/2026"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#8b1d24] text-white text-xs font-semibold rounded-lg hover:bg-[#72171d]"
                >
                  Tạo công việc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
