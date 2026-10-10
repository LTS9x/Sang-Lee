import React, { useState } from 'react';
import { X, ShieldCheck, AlertTriangle, Search, CheckCircle2, Scale, Users, Briefcase } from 'lucide-react';
import { Client, LegalCase } from '../../types';

interface ConflictCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  cases: LegalCase[];
}

export const ConflictCheckModal: React.FC<ConflictCheckModalProps> = ({
  isOpen,
  onClose,
  clients,
  cases,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hasScanned, setHasScanned] = useState(false);
  const [matchedClients, setMatchedClients] = useState<Client[]>([]);
  const [matchedCases, setMatchedCases] = useState<LegalCase[]>([]);

  if (!isOpen) return null;

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const term = searchTerm.trim().toLowerCase();

    // Scan clients
    const clientsFound = clients.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.representative && c.representative.toLowerCase().includes(term)) ||
        c.idCardOrTax.toLowerCase().includes(term)
    );

    // Scan cases
    const casesFound = cases.filter(
      (c) =>
        c.clientName.toLowerCase().includes(term) ||
        c.title.toLowerCase().includes(term) ||
        c.summary.toLowerCase().includes(term)
    );

    setMatchedClients(clientsFound);
    setMatchedCases(casesFound);
    setHasScanned(true);
  };

  const hasConflict = matchedClients.length > 0 || matchedCases.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-850 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                Kiểm tra Xung đột Lợi ích Tự động (Conflict of Interest Check)
              </h3>
              <p className="text-xs text-slate-300">
                Tuân thủ Quy tắc Đạo đức hành nghề Luật sư & Bảo vệ tính độc lập tố tụng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Scan input */}
          <form onSubmit={handleScan} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">
              Nhập tên Khách hàng mới, Người đại diện hoặc Bên đối tụng cần rà soát:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="VD: Nguyễn Văn An, Công ty Hoàng Gia..."
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-800 text-slate-900 focus:bg-white"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-red-850 hover:bg-red-900 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center space-x-1.5 shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Rà soát xung đột</span>
              </button>
            </div>
          </form>

          {/* Results */}
          {hasScanned && (
            <div className="space-y-4 pt-2">
              {hasConflict ? (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>CẢNH BÁO: Phát hiện dữ liệu trùng khớp trong hệ thống!</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Đối tượng <strong>"{searchTerm}"</strong> có liên hệ với các thân chủ hoặc vụ việc đã từng thụ lý dưới đây. Luật sư cần xem xét cẩn trọng để tránh vi phạm nghĩa vụ bảo mật hoặc xung đột lợi ích thân chủ.
                  </p>

                  {/* Matched Clients */}
                  {matchedClients.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-bold text-amber-950 uppercase tracking-wider">
                        Khách hàng liên quan ({matchedClients.length}):
                      </div>
                      <div className="divide-y divide-amber-200 bg-white rounded-xl border border-amber-200 p-2">
                        {matchedClients.map((c) => (
                          <div key={c.id} className="py-1.5 px-2 text-xs flex items-center justify-between">
                            <span className="font-semibold text-slate-900">{c.name}</span>
                            <span className="text-[11px] text-slate-500">{c.phone} • {c.idCardOrTax}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matched Cases */}
                  {matchedCases.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-bold text-amber-950 uppercase tracking-wider">
                        Hồ sơ vụ án liên quan ({matchedCases.length}):
                      </div>
                      <div className="divide-y divide-amber-200 bg-white rounded-xl border border-amber-200 p-2">
                        {matchedCases.map((cs) => (
                          <div key={cs.id} className="py-1.5 px-2 text-xs flex items-center justify-between">
                            <div>
                              <span className="font-mono font-bold text-red-900 mr-2">{cs.id}</span>
                              <span className="font-semibold text-slate-900">{cs.title}</span>
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium">{cs.clientName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-3 text-xs text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm text-emerald-950">
                      Xác nhận: An toàn - Không phát hiện xung đột lợi ích!
                    </div>
                    <p className="mt-1 leading-relaxed text-emerald-800">
                      Tên <strong>"{searchTerm}"</strong> không trùng khớp với bất kỳ thân chủ hoặc bên liên quan nào trong hệ thống vụ việc của văn phòng. Luật sư có thể tiến hành ký kết hợp đồng dịch vụ pháp lý bình thường.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end text-xs">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
