import React, { useState } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Phone,
  FileText,
  AlertCircle,
  Scale,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { LegalCase, DocumentItem } from '../../types';

interface ClientPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: LegalCase[];
  documents: DocumentItem[];
}

export const ClientPortalModal: React.FC<ClientPortalModalProps> = ({
  isOpen,
  onClose,
  cases,
  documents,
}) => {
  const [caseCode, setCaseCode] = useState('HS-202610-0001');
  const [phone, setPhone] = useState('0988 123 456');
  const [searchedCase, setSearchedCase] = useState<LegalCase | null>(cases[0] || null);
  const [hasSearched, setHasSearched] = useState(true);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanCode = caseCode.trim().toUpperCase();
    const cleanPhone = phone.trim().replace(/\D/g, '');

    const found = cases.find(
      (c) =>
        c.id.toUpperCase() === cleanCode ||
        c.clientName.toLowerCase().includes(caseCode.toLowerCase())
    );

    if (found) {
      setSearchedCase(found);
      setHasSearched(true);
    } else {
      setSearchedCase(null);
      setHasSearched(true);
      setError(
        'Không tìm thấy hồ sơ với thông tin tra cứu trên. Vui lòng kiểm tra lại mã vụ án hoặc liên hệ hotline 1900 6889.'
      );
    }
  };

  const caseDocs = searchedCase
    ? documents.filter((d) => d.caseId === searchedCase.id)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-[#2c0d12] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-red-800 flex items-center justify-center text-white shadow-inner">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-red-900 text-red-200 border border-red-700">
                  DÀNH CHO KHÁCH HÀNG
                </span>
                <span className="text-xs text-slate-400">• Tra cứu trực tuyến</span>
              </div>
              <h3 className="font-black text-base mt-0.5">
                Cổng Tra cứu Tiến độ Hồ sơ Thân chủ (Client Portal)
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
          >
            <div className="text-xs font-bold text-slate-800">
              Nhập mã hồ sơ hoặc số điện thoại đăng ký hợp đồng:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Mã hồ sơ pháp lý (VD: HS-202610-0001)
                </label>
                <input
                  type="text"
                  value={caseCode}
                  onChange={(e) => setCaseCode(e.target.value)}
                  placeholder="HS-202610-0001"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-red-800"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Số điện thoại thân chủ
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0988 123 456"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-800"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-5 py-2 bg-red-850 hover:bg-red-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Tra cứu tiến độ ngay</span>
              </button>
            </div>
          </form>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Searched Case Result Card */}
          {searchedCase && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5 animate-in fade-in">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-sm text-red-900">
                      {searchedCase.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {searchedCase.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-slate-900 mt-1">
                    {searchedCase.title}
                  </h4>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Thân chủ: <strong>{searchedCase.clientName}</strong> • {searchedCase.category}
                  </div>
                </div>

                <div className="text-right sm:border-l sm:pl-4 border-slate-100">
                  <div className="text-xs text-slate-400">Tiến độ tổng thể</div>
                  <div className="text-2xl font-black text-red-900">
                    {searchedCase.progress}%
                  </div>
                </div>
              </div>

              {/* 4 Stages Progress Visualization */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-800">
                  Tiến trình thực hiện vụ việc (4 Giai đoạn):
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500">1. Thu thập chứng cứ</div>
                    <div className="font-bold text-slate-900 mt-1">
                      {searchedCase.stageProgress.collectDocuments}%
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500">2. Nghiên cứu & Luận cứ</div>
                    <div className="font-bold text-slate-900 mt-1">
                      {searchedCase.stageProgress.researchEvaluate}%
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500">3. Soạn đơn & Văn bản</div>
                    <div className="font-bold text-slate-900 mt-1">
                      {searchedCase.stageProgress.draftPetition}%
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500">4. Tố tụng / Cơ quan</div>
                    <div className="font-bold text-slate-900 mt-1">
                      {searchedCase.stageProgress.submitAndWorkWithAgency}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Lawyer Contact for Client */}
              <div className="p-4 bg-red-50/40 rounded-xl border border-red-100 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-red-800" />
                    <span>Luật sư phụ trách bảo vệ bạn:</span>
                  </div>
                  <div className="text-sm font-black text-red-950 mt-0.5">
                    {searchedCase.leadLawyer}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Cơ quan thụ lý: {searchedCase.courtAgency}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] text-slate-500">Kỳ hạn làm việc tiếp theo:</div>
                  <div className="font-mono font-bold text-xs text-red-900 mt-0.5">
                    {searchedCase.nextDeadline}
                  </div>
                  <a
                    href="tel:19006889"
                    className="inline-flex items-center space-x-1 mt-1 text-[11px] font-bold text-red-800 hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Hotline: 1900 6889</span>
                  </a>
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Hồ sơ & Tài liệu đã lưu trữ ({caseDocs.length} tệp):</span>
                </div>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-36 overflow-y-auto">
                  {caseDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-900 truncate">
                          {doc.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {doc.uploadDate}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Cam kết bảo mật thông tin thân chủ theo Luật Luật sư 2012</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors"
          >
            Đóng tra cứu
          </button>
        </div>
      </div>
    </div>
  );
};
