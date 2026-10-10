import React, { useState, useEffect } from 'react';
import { X, Edit, AlertCircle, Save } from 'lucide-react';
import { LegalCase, CaseCategory, CaseStatus, StaffMember, Client } from '../../types';

interface EditCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: LegalCase | null;
  clients: Client[];
  staff: StaffMember[];
  onSave: (updatedCase: LegalCase) => void;
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

const STATUSES: CaseStatus[] = [
  'Đang xử lý',
  'Khẩn',
  'Chờ KH',
  'Đã hoàn thành',
  'Tạm hoãn',
];

export const EditCaseModal: React.FC<EditCaseModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  clients,
  staff,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [category, setCategory] = useState<CaseCategory>('Dân sự');
  const [status, setStatus] = useState<CaseStatus>('Đang xử lý');
  const [priority, setPriority] = useState<'Khẩn' | 'Cao' | 'Bình thường'>('Bình thường');
  const [leadLawyer, setLeadLawyer] = useState('');
  const [courtAgency, setCourtAgency] = useState('');
  const [disputedAmount, setDisputedAmount] = useState('');
  const [nextDeadline, setNextDeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [target, setTarget] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (caseItem) {
      setTitle(caseItem.title);
      setClientId(caseItem.clientId);
      setCategory(caseItem.category);
      setStatus(caseItem.status);
      setPriority(caseItem.priority);
      setLeadLawyer(caseItem.leadLawyer);
      setCourtAgency(caseItem.courtAgency);
      setDisputedAmount(caseItem.disputedAmount);
      setNextDeadline(caseItem.nextDeadline);
      setSummary(caseItem.summary);
      setTarget(caseItem.target);
      setError('');
    }
  }, [caseItem, isOpen]);

  if (!isOpen || !caseItem) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tên vụ việc');
      return;
    }

    const matchedClient = clients.find((c) => c.id === clientId);

    const updated: LegalCase = {
      ...caseItem,
      title: title.trim(),
      clientId: clientId || caseItem.clientId,
      clientName: matchedClient ? matchedClient.name : caseItem.clientName,
      category,
      status,
      priority,
      leadLawyer: leadLawyer || caseItem.leadLawyer,
      courtAgency: courtAgency.trim() || caseItem.courtAgency,
      disputedAmount: disputedAmount.trim() || caseItem.disputedAmount,
      nextDeadline: nextDeadline.trim() || caseItem.nextDeadline,
      summary: summary.trim() || caseItem.summary,
      target: target.trim() || caseItem.target,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200 my-8">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-800 flex items-center justify-center">
              <Edit className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Chỉnh sửa thông tin hồ sơ</h3>
              <p className="text-xs text-slate-300 font-mono">{caseItem.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên vụ việc / Nội dung tranh chấp <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Khách hàng thân chủ
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lĩnh vực vụ việc
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CaseCategory)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trạng thái vụ việc
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CaseStatus)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
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
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800"
              >
                <option value="Khẩn">Khẩn</option>
                <option value="Cao">Cao</option>
                <option value="Bình thường">Bình thường</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Luật sư phụ trách
              </label>
              <select
                value={leadLawyer}
                onChange={(e) => setLeadLawyer(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800"
              >
                {staff.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tòa án / Cơ quan thụ lý
              </label>
              <input
                type="text"
                value={courtAgency}
                onChange={(e) => setCourtAgency(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deadline gần nhất
              </label>
              <input
                type="text"
                value={nextDeadline}
                onChange={(e) => setNextDeadline(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Giá trị tranh chấp / Hợp đồng
            </label>
            <input
              type="text"
              value={disputedAmount}
              onChange={(e) => setDisputedAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tóm tắt nội dung vụ việc
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mục tiêu xử lý của thân chủ
            </label>
            <textarea
              rows={2}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800"
            />
          </div>

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
              className="px-5 py-2 text-sm bg-[#8b1d24] hover:bg-[#72171d] text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
