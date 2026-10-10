import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Users,
  Building,
  DollarSign,
  Upload,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  Download,
  Share2,
  Lock,
  MessageSquare,
  HelpCircle,
  CreditCard,
  Check,
  Sliders,
  Printer,
} from 'lucide-react';
import {
  LegalCase,
  DocumentItem,
  TaskItem,
  CaseTimeline,
  InternalNote,
  StaffMember,
  DocumentCategory,
} from '../types';
import { AssignStaffModal } from './Modals/AssignStaffModal';
import { CasePrintModal } from './Modals/CasePrintModal';

interface CaseWorkspaceViewProps {
  caseItem: LegalCase;
  documents: DocumentItem[];
  tasks: TaskItem[];
  timelines: CaseTimeline[];
  notes: InternalNote[];
  staff: StaffMember[];
  currentUser: StaffMember;
  onBack: () => void;
  onUpdateCase: (updatedCase: LegalCase) => void;
  onOpenUpload: (caseId?: string, clientId?: string) => void;
  onPreviewDocument: (doc: DocumentItem) => void;
  onDeleteDocument: (docId: string) => void;
  onAddTask: (task: Omit<TaskItem, 'id'>) => void;
  onToggleTask: (taskId: string) => void;
  onAddTimeline: (timeline: Omit<CaseTimeline, 'id'>) => void;
  onAddNote: (note: Omit<InternalNote, 'id'>) => void;
  onDeleteTask?: (taskId: string) => void;
  onDeleteTimeline?: (timelineId: string) => void;
  onDeleteNote?: (noteId: string) => void;
}

type WorkspaceTab = 'overview' | 'tasks' | 'timeline' | 'documents' | 'notes' | 'billing';

export const CaseWorkspaceView: React.FC<CaseWorkspaceViewProps> = ({
  caseItem,
  documents,
  tasks,
  timelines,
  notes,
  staff,
  currentUser,
  onBack,
  onUpdateCase,
  onOpenUpload,
  onPreviewDocument,
  onDeleteDocument,
  onAddTask,
  onToggleTask,
  onAddTimeline,
  onAddNote,
  onDeleteTask,
  onDeleteTimeline,
  onDeleteNote,
}) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // RBAC permissions check
  const isAdmin = currentUser.roleId === 'admin';
  const canManageBilling = currentUser.permissions.includes('manage_billing') || isAdmin;
  const canViewConfidential = currentUser.permissions.includes('view_confidential_notes') || isAdmin;
  const canAssignLawyers = currentUser.permissions.includes('assign_lawyers') || isAdmin;
  const canUploadDoc = currentUser.permissions.includes('upload_documents') || isAdmin;
  const canDeleteDoc = currentUser.permissions.includes('delete_documents') || isAdmin;
  const canEditCase = currentUser.permissions.includes('create_edit_cases') || isAdmin;

  // Auto redirect away from billing if not permitted
  React.useEffect(() => {
    if (activeTab === 'billing' && !canManageBilling) {
      setActiveTab('overview');
    }
  }, [activeTab, canManageBilling]);

  // Billing record state
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  // Local stage progress state for real-time adjusting
  const [stages, setStages] = useState(caseItem.stageProgress);

  // Filter items belonging to this case
  const caseDocs = documents.filter((d) => d.caseId === caseItem.id);
  const caseTasks = tasks.filter((t) => t.caseId === caseItem.id);
  const caseTimelines = timelines.filter((d) => d.caseId === caseItem.id);
  const caseNotes = notes.filter((n) => {
    if (n.caseId !== caseItem.id) return false;
    if (n.isConfidential && !canViewConfidential) return false;
    return true;
  });

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('CV. Sang');
  const [newTaskDeadline, setNewTaskDeadline] = useState('15/10/2026');
  const [newTaskPriority, setNewTaskPriority] = useState<'Khẩn' | 'Cao' | 'Bình thường'>('Bình thường');

  // New note form state
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteAuthor, setNewNoteAuthor] = useState(currentUser.name);
  const [newNoteConfidential, setNewNoteConfidential] = useState(true);

  // New timeline form state
  const [showAddTimeline, setShowAddTimeline] = useState(false);
  const [timelineTitle, setTimelineTitle] = useState('');
  const [timelineDate, setTimelineDate] = useState('08/10/2026 09:00');
  const [timelineDesc, setTimelineDesc] = useState('');
  const [timelineType, setTimelineType] = useState<CaseTimeline['type']>('court');

  // Doc filter
  const [docCategoryFilter, setDocCategoryFilter] = useState<string>('all');

  const filteredDocs = caseDocs.filter((d) =>
    docCategoryFilter === 'all' ? true : d.category === docCategoryFilter
  );

  const handleStageChange = (key: keyof LegalCase['stageProgress'], value: number) => {
    const updatedStages = { ...stages, [key]: value };
    setStages(updatedStages);

    // Compute average progress
    const avg = Math.round(
      (updatedStages.collectDocuments +
        updatedStages.researchEvaluate +
        updatedStages.draftPetition +
        updatedStages.submitAndWorkWithAgency) /
        4
    );

    onUpdateCase({
      ...caseItem,
      progress: avg,
      stageProgress: updatedStages,
      status: avg === 100 ? 'Đã hoàn thành' : caseItem.status,
    });
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaymentAmount) return;

    const currentPaidNum = parseInt(caseItem.billing?.paidAmount.replace(/\D/g, '') || '0', 10);
    const addedNum = parseInt(newPaymentAmount.replace(/\D/g, '') || '0', 10);
    const totalNum = parseInt(caseItem.billing?.totalFee.replace(/\D/g, '') || '75000000', 10);

    const newPaid = currentPaidNum + addedNum;
    const newPending = Math.max(0, totalNum - newPaid);

    const updatedBilling: LegalCase['billing'] = {
      totalFee: totalNum.toLocaleString('vi-VN') + ' đ',
      paidAmount: newPaid.toLocaleString('vi-VN') + ' đ',
      pendingAmount: newPending.toLocaleString('vi-VN') + ' đ',
      status: newPending === 0 ? 'Đã thanh toán đủ' : 'Còn nợ đợt 2',
    };

    onUpdateCase({
      ...caseItem,
      billing: updatedBilling,
    });

    // Also add timeline item
    onAddTimeline({
      caseId: caseItem.id,
      title: `Thu phí dịch vụ pháp lý: ${addedNum.toLocaleString('vi-VN')} đ`,
      date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN').slice(0, 5),
      description: paymentNote || 'Khách hàng thanh toán phí dịch vụ theo hợp đồng.',
      actor: currentUser.name,
      type: 'document',
    });

    setNewPaymentAmount('');
    setPaymentNote('');
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask({
      title: newTaskTitle.trim(),
      caseId: caseItem.id,
      caseTitle: caseItem.title,
      assignee: newTaskAssignee,
      deadline: newTaskDeadline,
      priority: newTaskPriority,
      completed: false,
    });
    setNewTaskTitle('');
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    onAddNote({
      caseId: caseItem.id,
      author: newNoteAuthor,
      date: formattedDate,
      content: newNoteContent.trim(),
      isConfidential: newNoteConfidential,
    });
    setNewNoteContent('');
  };

  const handleCreateTimeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timelineTitle.trim()) return;
    onAddTimeline({
      caseId: caseItem.id,
      title: timelineTitle.trim(),
      date: timelineDate,
      description: timelineDesc.trim() || 'Cập nhật tiến trình hồ sơ theo lịch làm việc.',
      actor: caseItem.leadLawyer,
      type: timelineType,
    });
    setTimelineTitle('');
    setTimelineDesc('');
    setShowAddTimeline(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Khẩn':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Chờ KH':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Đang xử lý':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Đã hoàn thành':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-3.5 sm:p-5 md:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Top back button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại danh sách hồ sơ</span>
        </button>

        <div className="text-xs text-slate-500 font-medium">
          Vai trò xử lý: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.role})
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left 2 Columns: Main Case Details & Workspace Tabs */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Header Card matching Image 4 */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    {caseItem.id} • {caseItem.title}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(
                      caseItem.status
                    )}`}
                  >
                    {caseItem.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1 font-medium">
                  Khách hàng: <strong className="text-slate-800">{caseItem.clientName}</strong> • {caseItem.category} • Mức độ:{' '}
                  <span className="text-red-700 font-semibold">{caseItem.priority}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto">
                {/* Print case brief shortcut */}
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="flex-1 sm:flex-none px-3 sm:px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-colors flex items-center justify-center space-x-1.5"
                  title="In bản tóm tắt hồ sơ tố tụng"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>In tóm tắt</span>
                </button>

                {/* Upload trigger shortcut */}
                {canUploadDoc && (
                  <button
                    onClick={() => onOpenUpload(caseItem.id, caseItem.clientId)}
                    className="flex-1 sm:flex-none px-3 sm:px-3.5 py-2 bg-[#8b1d24] hover:bg-[#72171d] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải tài liệu</span>
                  </button>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-700">Tiến độ hồ sơ: {caseItem.progress}%</span>
                <span className="text-slate-400 text-[11px] truncate max-w-[200px] sm:max-w-none">
                  {caseItem.progress < 50
                    ? 'Giai đoạn thu thập & rà soát ban đầu'
                    : caseItem.progress < 80
                    ? 'Giai đoạn chuẩn bị đơn & chứng cứ'
                    : 'Giai đoạn tố tụng & hòa giải'}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#8b1d24] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${caseItem.progress}%` }}
                />
              </div>
            </div>

            {/* 6 Grid Metadata items */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5 mt-4 sm:mt-6">
              <div className="bg-slate-50/80 p-3 sm:p-3.5 rounded-xl border border-slate-100">
                <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Ngày tiếp nhận</div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                  {caseItem.receivedDate}
                </div>
              </div>

              <div className="bg-slate-50/80 p-3 sm:p-3.5 rounded-xl border border-slate-100">
                <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Deadline gần nhất</div>
                <div className="text-xs sm:text-sm font-bold text-red-800 mt-0.5">
                  {caseItem.nextDeadline}
                </div>
              </div>

              <div className="bg-slate-50/80 p-3 sm:p-3.5 rounded-xl border border-slate-100">
                <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Người phụ trách</div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 truncate">
                  {caseItem.leadLawyer}
                </div>
              </div>

              <div className="bg-slate-50/80 p-3 sm:p-3.5 rounded-xl border border-slate-100">
                <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Người hỗ trợ</div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 truncate">
                  {caseItem.assistants.join(', ')}
                </div>
              </div>

              <div className="bg-slate-50/80 p-3 sm:p-3.5 rounded-xl border border-slate-100">
                <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Tòa/Cơ quan</div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 truncate">
                  {caseItem.courtAgency}
                </div>
              </div>

              <div className="bg-slate-50/80 p-3 sm:p-3.5 rounded-xl border border-slate-100">
                <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Giá trị tranh chấp</div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 truncate">
                  {caseItem.disputedAmount}
                </div>
              </div>
            </div>
          </div>

          {/* Workspace Tabs Navigation */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="flex border-b border-slate-200 px-4 pt-3 space-x-1 overflow-x-auto bg-slate-50/40">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors shrink-0 ${
                  activeTab === 'overview'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Tổng quan
              </button>

              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5 shrink-0 ${
                  activeTab === 'tasks'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>Công việc</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-bold">
                  {caseTasks.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors shrink-0 ${
                  activeTab === 'timeline'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Diễn biến
              </button>

              <button
                onClick={() => setActiveTab('documents')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5 shrink-0 ${
                  activeTab === 'documents'
                    ? 'bg-[#8b1d24] text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>Tài liệu</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === 'documents' ? 'bg-red-950 text-white' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {caseDocs.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5 shrink-0 ${
                  activeTab === 'notes'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>Ghi chú nội bộ</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-bold">
                  {caseNotes.length}
                </span>
              </button>

              {/* Billing Tab: Strictly rendered only if permitted by Admin */}
              {canManageBilling && (
                <button
                  onClick={() => setActiveTab('billing')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5 shrink-0 ${
                    activeTab === 'billing'
                      ? 'bg-amber-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Thù lao & Phí</span>
                </button>
              )}
            </div>

            {/* Tab Contents */}
            <div className="p-6">
              {/* TAB 1: TỔNG QUAN */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-2">Tóm tắt vụ việc</h4>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700 text-xs leading-relaxed font-normal">
                      {caseItem.summary}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-2">Mục tiêu xử lý</h4>
                    <div className="p-4 rounded-xl bg-red-50/50 border border-red-100 text-slate-700 text-xs leading-relaxed font-normal">
                      {caseItem.target}
                    </div>
                  </div>

                  {/* Highlights box */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="font-bold text-slate-800 mb-1 flex items-center space-x-1.5">
                        <FileText className="w-4 h-4 text-red-800" />
                        <span>Hồ sơ & Tài liệu thân chủ</span>
                      </div>
                      <p className="text-slate-500 mb-3">
                        Đã nạp {caseDocs.length} tài liệu chứng cứ, bao gồm hợp đồng đặt cọc, bản sao sổ hồng và sao kê giao dịch ngân hàng.
                      </p>
                      <button
                        onClick={() => setActiveTab('documents')}
                        className="text-red-800 font-bold hover:underline"
                      >
                        Mở thư mục tài liệu →
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="font-bold text-slate-800 mb-1 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Kế hoạch tố tụng</span>
                      </div>
                      <p className="text-slate-500 mb-3">
                        Có {caseTasks.filter((t) => !t.completed).length} công việc chưa hoàn thành. Cần nộp đơn khởi kiện bổ sung trước hạn {caseItem.nextDeadline}.
                      </p>
                      <button
                        onClick={() => setActiveTab('tasks')}
                        className="text-red-800 font-bold hover:underline"
                      >
                        Xem danh sách công việc →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CÔNG VIỆC */}
              {activeTab === 'tasks' && (
                <div className="space-y-6">
                  {/* Task Creation Form */}
                  <form onSubmit={handleCreateTask} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="text-xs font-bold text-slate-800">Thêm công việc vụ việc mới</div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Nội dung công việc (VD: Soạn bản ý kiến gửi Tòa án...)"
                        className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800"
                        required
                      />
                      <select
                        value={newTaskAssignee}
                        onChange={(e) => setNewTaskAssignee(e.target.value)}
                        className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 text-slate-700"
                      >
                        {staff.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as any)}
                        className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 text-slate-700"
                      >
                        <option value="Khẩn">Khẩn</option>
                        <option value="Cao">Cao</option>
                        <option value="Bình thường">Bình thường</option>
                      </select>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#8b1d24] text-white text-xs font-semibold rounded-lg hover:bg-[#72171d] transition-colors shrink-0 flex items-center justify-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm</span>
                      </button>
                    </div>
                  </form>

                  {/* Task list */}
                  <div className="space-y-2">
                    {caseTasks.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs">
                        Chưa có công việc nào cho hồ sơ này.
                      </div>
                    ) : (
                      caseTasks.map((t) => (
                        <div
                          key={t.id}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            t.completed
                              ? 'bg-slate-50/60 border-slate-200 text-slate-400'
                              : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0 mr-2">
                            <input
                              type="checkbox"
                              checked={t.completed}
                              onChange={() => onToggleTask(t.id)}
                              className="w-4 h-4 rounded-md text-red-800 focus:ring-red-800 cursor-pointer accent-[#8b1d24]"
                            />
                            <div className="min-w-0">
                              <div
                                className={`text-xs font-semibold ${
                                  t.completed ? 'line-through text-slate-400' : 'text-slate-900'
                                }`}
                              >
                                {t.title}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Phân công: <span className="font-medium text-slate-700">{t.assignee}</span> • Deadline: {t.deadline}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                t.priority === 'Khẩn'
                                  ? 'bg-red-100 text-red-800'
                                  : t.priority === 'Cao'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {t.priority}
                            </span>
                            {onDeleteTask && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteTask(t.id);
                                }}
                                className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Xóa nhiệm vụ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: DIỄN BIẾN */}
              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Lịch trình & Nhật ký vụ việc
                    </h4>
                    <button
                      onClick={() => setShowAddTimeline(!showAddTimeline)}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center space-x-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm mốc sự kiện</span>
                    </button>
                  </div>

                  {showAddTimeline && (
                    <form onSubmit={handleCreateTimeline} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="text-xs font-bold text-slate-800">Thêm sự kiện diễn biến</div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={timelineTitle}
                          onChange={(e) => setTimelineTitle(e.target.value)}
                          placeholder="Tiêu đề (VD: Tiếp nhận hồ sơ...)"
                          className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                          required
                        />
                        <input
                          type="text"
                          value={timelineDate}
                          onChange={(e) => setTimelineDate(e.target.value)}
                          placeholder="Ngày giờ (VD: 10/10/2026 09:00)"
                          className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                          required
                        />
                        <select
                          value={timelineType}
                          onChange={(e) => setTimelineType(e.target.value as any)}
                          className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                        >
                          <option value="meeting">Làm việc với KH</option>
                          <option value="court">Làm việc Tòa án / Cơ quan</option>
                          <option value="document">Giao nhận tài liệu</option>
                          <option value="update">Cập nhật khác</option>
                        </select>
                      </div>
                      <textarea
                        rows={2}
                        value={timelineDesc}
                        onChange={(e) => setTimelineDesc(e.target.value)}
                        placeholder="Mô tả chi tiết nội dung sự kiện và kết quả..."
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowAddTimeline(false)}
                          className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-[#8b1d24] text-white text-xs font-semibold rounded-lg hover:bg-[#72171d]"
                        >
                          Lưu sự kiện
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Timeline Tree */}
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {caseTimelines.map((tl) => (
                      <div key={tl.id} className="relative">
                        <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-red-800 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-red-800" />
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900 text-xs">{tl.title}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-[11px] font-mono text-slate-400">{tl.date}</span>
                              {onDeleteTimeline && (
                                <button
                                  onClick={() => onDeleteTimeline(tl.id)}
                                  className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Xóa sự kiện"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed font-normal">{tl.description}</p>
                          <div className="mt-2 text-[10px] text-slate-400 font-medium">
                            Người thực hiện: <span className="text-slate-700">{tl.actor}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: TÀI LIỆU */}
              {activeTab === 'documents' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-red-50/50 rounded-xl border border-red-100">
                    <div>
                      <div className="text-xs font-bold text-red-950">
                        Quản lý tài liệu & Hồ sơ khách hàng ({caseDocs.length} tài liệu)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Hợp đồng, Giấy tờ nhân thân, Chứng cứ, Đơn từ đã được lưu trữ bảo mật
                      </div>
                    </div>
                    {canUploadDoc && (
                      <button
                        onClick={() => onOpenUpload(caseItem.id, caseItem.clientId)}
                        className="px-4 py-2 bg-[#8b1d24] hover:bg-[#72171d] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center space-x-1.5 shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải tài liệu mới lên</span>
                      </button>
                    )}
                  </div>

                  {/* Filter by Category */}
                  <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
                    <span className="text-slate-400 text-[11px] font-medium shrink-0">Lọc theo:</span>
                    {['all', 'Hợp đồng', 'Giấy tờ tùy thân', 'Chứng cứ', 'Văn bản tố tụng', 'Đơn khởi kiện', 'Ủy quyền', 'Hóa đơn / Biên lai'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setDocCategoryFilter(cat)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                          docCategoryFilter === cat
                            ? 'bg-red-800 text-white font-semibold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat === 'all' ? 'Tất cả' : cat}
                      </button>
                    ))}
                  </div>

                  {/* Document List */}
                  <div className="space-y-2.5">
                    {filteredDocs.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 font-medium">Chưa có tài liệu nào thuộc danh mục này</p>
                        {canUploadDoc && (
                          <button
                            onClick={() => onOpenUpload(caseItem.id, caseItem.clientId)}
                            className="mt-3 px-3 py-1.5 bg-[#8b1d24] text-white text-xs font-medium rounded-lg hover:bg-[#72171d] inline-flex items-center space-x-1"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Tải tài liệu đầu tiên</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      filteredDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-2xs transition-all group"
                        >
                          <div className="flex items-center space-x-3 min-w-0 flex-1 mr-3">
                            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-800 flex items-center justify-center shrink-0">
                              {doc.fileType === 'image' ? (
                                <ImageIcon className="w-5 h-5" />
                              ) : (
                                <FileText className="w-5 h-5" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div
                                onClick={() => onPreviewDocument(doc)}
                                className="text-xs font-bold text-slate-900 group-hover:text-red-800 cursor-pointer truncate max-w-sm"
                                title={doc.name}
                              >
                                {doc.name}
                              </div>
                              <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                                <span className="font-semibold text-red-800 bg-red-50 px-1.5 py-0.2 rounded-xs">
                                  {doc.category}
                                </span>
                                <span>•</span>
                                <span>{doc.fileSize}</span>
                                <span>•</span>
                                <span>{doc.uploadDate}</span>
                                <span>•</span>
                                <span>Bởi {doc.uploadedBy}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              onClick={() => onPreviewDocument(doc)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onPreviewDocument(doc)}
                              className="p-1.5 text-slate-500 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                              title="Tải về"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {currentUser.permissions.includes('delete_documents') && (
                              <button
                                onClick={() => onDeleteDocument(doc.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Xóa tài liệu"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: GHI CHÚ NỘI BỘ (Protected by Permission) */}
              {activeTab === 'notes' && (
                <div className="space-y-6">
                  {!canViewConfidential ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                      <Lock className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                      <h4 className="font-bold text-slate-800 text-sm">Hạn chế quyền truy cập</h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                        Tài khoản hiện tại ({currentUser.role}) không có quyền <strong>Xem ghi chú & Chiến lược mật</strong>. Hãy chuyển sang vai trò Luật sư Điều hành hoặc Luật sư Thành viên để xem nội dung này.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Note creation form */}
                      <form onSubmit={handleCreateNote} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                        <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                          <Lock className="w-3.5 h-3.5 text-red-800" />
                          <span>Thêm ghi chú chiến lược bảo mật</span>
                        </div>
                        <textarea
                          rows={3}
                          value={newNoteContent}
                          onChange={(e) => setNewNoteContent(e.target.value)}
                          placeholder="Ghi chú nhận định pháp lý, phân tích điểm yếu của đối phương, kế hoạch đàm phán..."
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800"
                          required
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 text-xs">
                            <span className="text-slate-600 text-[11px]">
                              Tác giả: <strong>{currentUser.name}</strong>
                            </span>
                            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-600 text-xs">
                              <input
                                type="checkbox"
                                checked={newNoteConfidential}
                                onChange={(e) => setNewNoteConfidential(e.target.checked)}
                                className="rounded-xs text-red-800 accent-[#8b1d24]"
                              />
                              <span>Bảo mật nội bộ</span>
                            </label>
                          </div>

                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-[#8b1d24] text-white text-xs font-semibold rounded-lg hover:bg-[#72171d]"
                          >
                            Lưu ghi chú
                          </button>
                        </div>
                      </form>

                      {/* Notes list */}
                      <div className="space-y-3">
                        {caseNotes.length === 0 ? (
                          <div className="text-center py-8 text-slate-400 text-xs">
                            Chưa có ghi chú nội bộ nào cho hồ sơ này.
                          </div>
                        ) : (
                          caseNotes.map((note) => (
                            <div key={note.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-slate-900 text-xs">{note.author}</span>
                                <div className="flex items-center space-x-2">
                                  {note.isConfidential && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                                      Bảo mật
                                    </span>
                                  )}
                                  <span className="text-[11px] text-slate-400">{note.date}</span>
                                  {onDeleteNote && (
                                    <button
                                      onClick={() => onDeleteNote(note.id)}
                                      className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Xóa ghi chú"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-slate-700 leading-relaxed font-normal">{note.content}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 6: THÙ LAO & PHÍ DỊCH VỤ (BILLING) */}
              {activeTab === 'billing' && (
                <div className="space-y-6">
                  {/* Financial Overview Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="text-slate-500 font-semibold mb-1">Tổng phí dịch vụ theo hợp đồng</div>
                      <div className="text-xl font-black text-slate-900">
                        {caseItem.billing?.totalFee || '75.000.000 đ'}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">Đã ký kết dịch vụ pháp lý</div>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
                      <div className="text-emerald-800 font-semibold mb-1">Đã thanh toán thực tế</div>
                      <div className="text-xl font-black text-emerald-800">
                        {caseItem.billing?.paidAmount || '45.000.000 đ'}
                      </div>
                      <div className="text-[10px] text-emerald-600 mt-1">Có phiếu thu / biên lai ngân hàng</div>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                      <div className="text-amber-800 font-semibold mb-1">Còn nợ / Phí giai đoạn tiếp theo</div>
                      <div className="text-xl font-black text-amber-800">
                        {caseItem.billing?.pendingAmount || '30.000.000 đ'}
                      </div>
                      <div className="text-[10px] text-amber-600 mt-1">
                        Trạng thái: <strong>{caseItem.billing?.status || 'Còn nợ đợt 2'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Payment form */}
                  {canManageBilling && (
                    <form onSubmit={handleRecordPayment} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-amber-800" />
                        <span>Ghi nhận đợt thanh toán từ thân chủ</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={newPaymentAmount}
                          onChange={(e) => setNewPaymentAmount(e.target.value)}
                          placeholder="Số tiền thu thêm (VD: 30000000 hoặc 30.000.000 đ)"
                          className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800"
                          required
                        />
                        <input
                          type="text"
                          value={paymentNote}
                          onChange={(e) => setPaymentNote(e.target.value)}
                          placeholder="Ghi chú đợt thanh toán (VD: Chuyển khoản đợt 2 sau hòa giải)"
                          className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                        >
                          Xác nhận thu tiền & Cập nhật số dư
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                    <div className="font-bold text-slate-800">Quy định thanh toán thù lao Hãng Luật:</div>
                    <p>• Đợt 1 (60%): Ngay sau khi ký hợp đồng dịch vụ pháp lý và nộp đơn khởi kiện ban đầu.</p>
                    <p>• Đợt 2 (40%): Sau khi có thông báo thụ lý / quyết định hòa giải hoặc kết thúc xét xử sơ thẩm.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column matching Image 4 */}
        <div className="space-y-6">
          {/* Nhân sự hồ sơ Card matching Image 4 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-base mb-4">Nhân sự hồ sơ</h3>

            <div className="space-y-3">
              {/* Lead Lawyer */}
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  ML
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 text-xs">{caseItem.leadLawyer}</div>
                  <div className="text-[11px] text-slate-500">Người phụ trách chính</div>
                </div>
              </div>

              {/* Assistants */}
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  S
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 text-xs">CV. Sang</div>
                  <div className="text-[11px] text-slate-500">Hỗ trợ pháp lý</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  D
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 text-xs">Trợ lý D</div>
                  <div className="text-[11px] text-slate-500">Hỗ trợ hồ sơ</div>
                </div>
              </div>
            </div>

            {/* Button: Phân công / thay đổi nhân sự (Subject to Permission) */}
            <button
              onClick={() => setIsAssignModalOpen(true)}
              disabled={!canAssignLawyers}
              className={`mt-4 w-full py-2.5 px-3 border text-xs font-semibold rounded-xl transition-colors shadow-2xs ${
                canAssignLawyers
                  ? 'bg-white border-slate-300 hover:bg-slate-50 text-slate-800 cursor-pointer'
                  : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              title={canAssignLawyers ? 'Phân công nhân sự' : 'Bạn không có quyền phân công nhân sự'}
            >
              Phân công / thay đổi nhân sự {!canAssignLawyers && '(Khóa)'}
            </button>
          </div>

          {/* Tiến độ tổng thể matching Image 4 (Interactive stage adjustment) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base">Tiến độ tổng thể</h3>
              {canEditCase && (
                <button
                  onClick={() => setIsEditingProgress(!isEditingProgress)}
                  className="text-xs text-red-800 hover:underline font-bold flex items-center space-x-1"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{isEditingProgress ? 'Hoàn tất' : 'Chỉnh %'}</span>
                </button>
              )}
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Thu thập tài liệu</span>
                  <span className="font-bold">{stages.collectDocuments}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#8b1d24] h-1.5 rounded-full transition-all"
                    style={{ width: `${stages.collectDocuments}%` }}
                  />
                </div>
                {isEditingProgress && (
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={stages.collectDocuments}
                    onChange={(e) => handleStageChange('collectDocuments', Number(e.target.value))}
                    className="w-full mt-1 accent-[#8b1d24]"
                  />
                )}
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Nghiên cứu & đánh giá</span>
                  <span className="font-bold">{stages.researchEvaluate}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#8b1d24] h-1.5 rounded-full transition-all"
                    style={{ width: `${stages.researchEvaluate}%` }}
                  />
                </div>
                {isEditingProgress && (
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={stages.researchEvaluate}
                    onChange={(e) => handleStageChange('researchEvaluate', Number(e.target.value))}
                    className="w-full mt-1 accent-[#8b1d24]"
                  />
                )}
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Soạn hồ sơ</span>
                  <span className="font-bold">{stages.draftPetition}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#8b1d24] h-1.5 rounded-full transition-all"
                    style={{ width: `${stages.draftPetition}%` }}
                  />
                </div>
                {isEditingProgress && (
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={stages.draftPetition}
                    onChange={(e) => handleStageChange('draftPetition', Number(e.target.value))}
                    className="w-full mt-1 accent-[#8b1d24]"
                  />
                )}
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Nộp / làm việc cơ quan</span>
                  <span className="font-bold">{stages.submitAndWorkWithAgency}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#8b1d24] h-1.5 rounded-full transition-all"
                    style={{ width: `${stages.submitAndWorkWithAgency}%` }}
                  />
                </div>
                {isEditingProgress && (
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={stages.submitAndWorkWithAgency}
                    onChange={(e) => handleStageChange('submitAndWorkWithAgency', Number(e.target.value))}
                    className="w-full mt-1 accent-[#8b1d24]"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Deadline sắp tới matching Image 4 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-base mb-3">Deadline sắp tới</h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-red-50/80 border border-red-100">
                <div className="flex items-center space-x-1.5 text-red-800 font-bold text-[11px] mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{caseItem.nextDeadline} (Cận kề)</span>
                </div>
                <div className="font-semibold text-slate-900">
                  Phiên hòa giải lần 1 tại {caseItem.courtAgency}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {caseItem.leadLawyer} đại diện tham gia
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff assignment modal */}
      <AssignStaffModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        caseItem={caseItem}
        staff={staff}
        onUpdate={onUpdateCase}
      />

      {/* Case print dossier modal */}
      <CasePrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        caseItem={caseItem}
        documents={documents}
        tasks={tasks}
        timelines={timelines}
      />
    </div>
  );
};
