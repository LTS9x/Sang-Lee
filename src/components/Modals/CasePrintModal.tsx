import React from 'react';
import { X, Printer, Download, Scale, Calendar, User, FileText, CheckCircle2 } from 'lucide-react';
import { LegalCase, DocumentItem, TaskItem, CaseTimeline, InternalNote } from '../../types';

interface CasePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: LegalCase;
  documents: DocumentItem[];
  tasks: TaskItem[];
  timelines: CaseTimeline[];
}

export const CasePrintModal: React.FC<CasePrintModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  documents,
  tasks,
  timelines,
}) => {
  if (!isOpen) return null;

  const caseDocs = documents.filter((d) => d.caseId === caseItem.id);
  const caseTasks = tasks.filter((t) => t.caseId === caseItem.id);
  const caseTimelines = timelines.filter((t) => t.caseId === caseItem.id);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 my-6 flex flex-col max-h-[90vh]">
        {/* Header - Not printed */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-850 flex items-center justify-center">
              <Printer className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Bản in Tóm tắt Hồ sơ Vụ việc (Case Dossier Brief)</h3>
              <p className="text-xs text-slate-300">
                Phiếu trích lục hồ sơ tố tụng dùng cho Luật sư mang ra Tòa hoặc báo cáo thân chủ
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In bản tóm tắt (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Body */}
        <div className="p-8 space-y-6 overflow-y-auto font-serif text-slate-900 bg-white" id="printable-case-dossier">
          {/* Law Firm Letterhead */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div>
              <div className="font-sans font-black text-lg tracking-tight text-slate-900">
                HÃNG LUẬT BIGBOSS LAW (BIGBOSS LAW FIRM)
              </div>
              <div className="text-xs text-slate-600 font-sans mt-0.5">
                Đoàn Luật sư TP. Hồ Chí Minh • GP Hoạt động số: 41.01.2890/TP/ĐKHĐ
              </div>
              <div className="text-[11px] text-slate-500 font-sans">
                Trụ sở: Landmark 81, 720A Điện Biên Phủ, P.22, Bình Thạnh, TP.HCM • Hotline: 1900 6889
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-xs text-red-900 px-2.5 py-1 bg-red-50 border border-red-200 rounded">
                MÃ HỒ SƠ: {caseItem.id}
              </span>
              <div className="text-[11px] text-slate-400 font-sans mt-1">
                Ngày in: {new Date().toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center py-2">
            <h2 className="text-xl font-bold uppercase tracking-wide">
              PHIẾU TÓM TẮT TIẾN TRÌNH VỤ VIỆC PHÁP LÝ
            </h2>
            <div className="text-sm italic text-slate-600 mt-1">
              "{caseItem.title}"
            </div>
          </div>

          {/* 1. General Info Table */}
          <div className="space-y-2">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              I. THÔNG TIN CHUNG VỤ ÁN
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <span className="font-bold">Thân chủ / Khách hàng:</span> {caseItem.clientName}
              </div>
              <div>
                <span className="font-bold">Lĩnh vực pháp luật:</span> {caseItem.category}
              </div>
              <div>
                <span className="font-bold">Luật sư phụ trách chính:</span> {caseItem.leadLawyer}
              </div>
              <div>
                <span className="font-bold">Chuyên viên / Trợ lý:</span> {caseItem.assistants.join(', ') || 'Chưa phân công'}
              </div>
              <div>
                <span className="font-bold">Cơ quan thụ lý / Tòa án:</span> {caseItem.courtAgency}
              </div>
              <div>
                <span className="font-bold">Giá trị tranh chấp / Hợp đồng:</span> {caseItem.disputedAmount}
              </div>
              <div>
                <span className="font-bold">Ngày tiếp nhận hồ sơ:</span> {caseItem.receivedDate}
              </div>
              <div>
                <span className="font-bold">Thời hạn tiếp theo:</span> {caseItem.nextDeadline}
              </div>
              <div>
                <span className="font-bold">Tình trạng hiện tại:</span> {caseItem.status} ({caseItem.progress}%)
              </div>
            </div>
          </div>

          {/* 2. Summary & Objective */}
          <div className="space-y-2 text-xs">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              II. NỘI DUNG TÓM TẮT & MỤC TIÊU BẢO VỆ
            </h4>
            <div>
              <div className="font-bold text-slate-800">Tóm tắt bối cảnh vụ việc:</div>
              <p className="mt-1 leading-relaxed text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200">
                {caseItem.summary}
              </p>
            </div>
            <div>
              <div className="font-bold text-slate-800">Mục tiêu pháp lý bảo vệ thân chủ:</div>
              <p className="mt-1 leading-relaxed text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200">
                {caseItem.target}
              </p>
            </div>
          </div>

          {/* 3. Stage Progress */}
          <div className="space-y-2 text-xs">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              III. TIẾN ĐỘ THỰC HIỆN 4 GIAI ĐOẠN
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 border border-slate-200 rounded bg-slate-50">
                <div className="text-[10px] text-slate-500 font-sans">Thu thập tài liệu</div>
                <div className="font-bold text-sm text-red-900">{caseItem.stageProgress.collectDocuments}%</div>
              </div>
              <div className="p-2 border border-slate-200 rounded bg-slate-50">
                <div className="text-[10px] text-slate-500 font-sans">Nghiên cứu & Đánh giá</div>
                <div className="font-bold text-sm text-red-900">{caseItem.stageProgress.researchEvaluate}%</div>
              </div>
              <div className="p-2 border border-slate-200 rounded bg-slate-50">
                <div className="text-[10px] text-slate-500 font-sans">Soạn thảo văn bản</div>
                <div className="font-bold text-sm text-red-900">{caseItem.stageProgress.draftPetition}%</div>
              </div>
              <div className="p-2 border border-slate-200 rounded bg-slate-50">
                <div className="text-[10px] text-slate-500 font-sans">Làm việc với cơ quan</div>
                <div className="font-bold text-sm text-red-900">{caseItem.stageProgress.submitAndWorkWithAgency}%</div>
              </div>
            </div>
          </div>

          {/* 4. Documents List */}
          <div className="space-y-2 text-xs">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              IV. DANH MỤC TÀI LIỆU & BÚT LỤC CHỨNG CỨ ({caseDocs.length})
            </h4>
            <table className="w-full text-left text-xs border border-slate-200 border-collapse">
              <thead>
                <tr className="bg-slate-100 font-sans text-slate-700 border-b border-slate-200">
                  <th className="py-1.5 px-2">STT</th>
                  <th className="py-1.5 px-2">Tên tài liệu / Văn bản</th>
                  <th className="py-1.5 px-2">Phân loại</th>
                  <th className="py-1.5 px-2">Dung lượng</th>
                  <th className="py-1.5 px-2">Ngày nộp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {caseDocs.map((doc, idx) => (
                  <tr key={doc.id}>
                    <td className="py-1 px-2 font-mono">{idx + 1}</td>
                    <td className="py-1 px-2 font-semibold">{doc.name}</td>
                    <td className="py-1 px-2">{doc.category}</td>
                    <td className="py-1 px-2 font-mono">{doc.fileSize}</td>
                    <td className="py-1 px-2 font-mono">{doc.uploadDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 5. Timelines & Hearing Schedule */}
          <div className="space-y-2 text-xs">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              V. NHẬT KÝ DIỄN BIẾN & LỊCH TỐ TỤNG
            </h4>
            <div className="space-y-1.5">
              {caseTimelines.map((tm) => (
                <div key={tm.id} className="flex items-start space-x-2 text-xs">
                  <span className="font-mono font-bold w-32 shrink-0 text-slate-700">• {tm.date}:</span>
                  <span className="font-semibold">{tm.title}</span> - <span className="text-slate-600">{tm.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-6 grid grid-cols-2 text-center text-xs font-sans">
            <div>
              <div className="font-bold">LUẬT SƯ THỤ LÝ CHÍNH</div>
              <div className="italic text-slate-500 text-[11px] mt-0.5">(Ký và ghi rõ họ tên)</div>
              <div className="h-16 flex items-end justify-center font-bold font-serif text-sm">
                {caseItem.leadLawyer}
              </div>
            </div>
            <div>
              <div className="font-bold">TRƯỞNG VĂN PHÒNG / BAN GIÁM ĐỐC</div>
              <div className="italic text-slate-500 text-[11px] mt-0.5">(Ký duyệt lưu trữ)</div>
              <div className="h-16 flex items-end justify-center font-bold font-serif text-sm">
                LS. Điều Hành BigBoss
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
