import React, { useState, useEffect } from 'react';
import { X, Briefcase, Plus, AlertCircle } from 'lucide-react';
import { Client, LegalCase, CaseCategory, StaffMember } from '../../types';

interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newCase: LegalCase) => void;
  clients: Client[];
  staff: StaffMember[];
}

const CATEGORIES: CaseCategory[] = [
  'Dân sự',
  'Hình sự',
  'Hôn nhân gia đình',
  'Đất đai',
  'Hành chính',
  'Doanh nghiệp',
  'Soạn đơn',
];

export const CreateCaseModal: React.FC<CreateCaseModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  clients,
  staff,
}) => {
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [category, setCategory] = useState<CaseCategory>('Dân sự');
  const [priority, setPriority] = useState<'Khẩn' | 'Cao' | 'Bình thường'>('Bình thường');
  const [leadLawyer, setLeadLawyer] = useState('LS. Mai Tiến Luật');
  const [courtAgency, setCourtAgency] = useState('TAND Khu vực 2 TP.HCM');
  const [disputedAmount, setDisputedAmount] = useState('');
  const [nextDeadline, setNextDeadline] = useState('15/10/2026');
  const [summary, setSummary] = useState('');
  const [target, setTarget] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (!clientId && clients.length > 0) {
        setClientId(clients[0].id);
      }
      setError('');
    }
  }, [isOpen, clients]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tên vụ việc / nội dung hồ sơ');
      return;
    }
    if (!clientId) {
      setError('Vui lòng chọn khách hàng');
      return;
    }

    const matchedClient = clients.find((c) => c.id === clientId);
    const caseNumber = Math.floor(1000 + Math.random() * 9000);
    const caseId = `HS-202610-${caseNumber}`;

    const now = new Date();
    const formattedReceivedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    const newCase: LegalCase = {
      id: caseId,
      title: title.trim(),
      clientId,
      clientName: matchedClient?.name || 'Khách hàng',
      category,
      status: priority === 'Khẩn' ? 'Khẩn' : 'Đang xử lý',
      priority,
      progress: 15,
      leadLawyer,
      assistants: ['CV. Sang', 'Trợ lý D'],
      receivedDate: formattedReceivedDate,
      nextDeadline: nextDeadline || '20/10/2026',
      courtAgency: courtAgency || 'Tòa án nhân dân có thẩm quyền',
      disputedAmount: disputedAmount.trim() || 'Theo định giá tài sản',
      summary: summary.trim() || 'Hồ sơ mới tiếp nhận, đang tiến hành thu thập tài liệu ban đầu từ thân chủ.',
      target: target.trim() || 'Bảo vệ quyền và lợi ích hợp pháp tối đa cho khách hàng.',
      stageProgress: {
        collectDocuments: 40,
        researchEvaluate: 10,
        draftPetition: 0,
        submitAndWorkWithAgency: 0,
      },
      createdAt: now.toISOString(),
    };

    onCreate(newCase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-red-800 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Tạo hồ sơ / Vụ việc mới</h3>
              <p className="text-xs text-slate-300">Khởi tạo không gian làm việc chuyên biệt cho vụ việc</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên vụ việc / Nội dung tranh chấp <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Tranh chấp hợp đồng mua bán căn hộ / Đơn khởi kiện đòi nợ..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
              required
            />
          </div>

          {/* Client & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Khách hàng <span className="text-red-500">*</span>
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
                required
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type} - {c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lĩnh vực vụ việc <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CaseCategory)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Lead Lawyer & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Luật sư phụ trách chính
              </label>
              <select
                value={leadLawyer}
                onChange={(e) => setLeadLawyer(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
              >
                {staff.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.role})
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
                onChange={(e) => setPriority(e.target.value as 'Khẩn' | 'Cao' | 'Bình thường')}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
              >
                <option value="Khẩn">Khẩn cấp (Deadline gần)</option>
                <option value="Cao">Cao</option>
                <option value="Bình thường">Bình thường</option>
              </select>
            </div>
          </div>

          {/* Court Agency & Disputed Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tòa án / Cơ quan giải quyết
              </label>
              <input
                type="text"
                value={courtAgency}
                onChange={(e) => setCourtAgency(e.target.value)}
                placeholder="VD: TAND Quận 1 / Công an TP.HCM..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giá trị tranh chấp / Thù lao
              </label>
              <input
                type="text"
                value={disputedAmount}
                onChange={(e) => setDisputedAmount(e.target.value)}
                placeholder="VD: 1.500.000.000 đồng"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
              />
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deadline gần nhất (Ngày/Tháng/Năm)
            </label>
            <input
              type="text"
              value={nextDeadline}
              onChange={(e) => setNextDeadline(e.target.value)}
              placeholder="VD: 15/10/2026"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
            />
          </div>

          {/* Summary & Target */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tóm tắt vụ việc ban đầu
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Tóm tắt yêu cầu của khách hàng và tình tiết cơ bản..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mục tiêu xử lý
            </label>
            <textarea
              rows={2}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Mục tiêu kết quả cần đạt được cho thân chủ..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium rounded-lg hover:bg-slate-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm bg-[#8b1d24] hover:bg-[#72171d] text-white font-medium rounded-lg shadow-sm hover:shadow transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Hồ Sơ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
