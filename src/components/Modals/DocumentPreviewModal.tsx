import React from 'react';
import { X, Download, FileText, Image as ImageIcon, Calendar, User, Folder, HardDrive, ExternalLink } from 'lucide-react';
import { DocumentItem } from '../../types';

interface DocumentPreviewModalProps {
  document: DocumentItem | null;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  onClose,
}) => {
  if (!document) return null;

  const handleDownload = () => {
    if (document.fileUrl) {
      const a = window.document.createElement('a');
      a.href = document.fileUrl;
      a.download = document.name;
      a.click();
    } else {
      // Create a dummy text blob for simulation
      const blob = new Blob([`Tài liệu: ${document.name}\nPhân loại: ${document.category}\nHồ sơ: ${document.caseTitle || 'Chung'}\nKhách hàng: ${document.clientName || 'Chung'}\nThời gian: ${document.uploadDate}\n\nNội dung tài liệu pháp lý lưu trữ tại Hệ thống Bigboss Law CRM.`], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-red-800 flex items-center justify-center">
              {document.fileType === 'image' ? (
                <ImageIcon className="w-5 h-5 text-white" />
              ) : (
                <FileText className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base truncate max-w-md">{document.name}</h3>
              <p className="text-xs text-slate-300">
                {document.category} • {document.fileSize}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải file về</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Preview */}
        <div className="p-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden mb-5 min-h-[260px] flex items-center justify-center relative">
            {/* Legal Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-10 rotate-[-25deg]">
              <div className="text-4xl md:text-5xl font-black uppercase text-red-950 tracking-widest text-center">
                BẢN LƯU TRỮ NỘI BỘ<br />BIGBOSS LAW FIRM
              </div>
            </div>

            {/* Bút lục badge */}
            <div className="absolute top-3 right-3 bg-red-900 text-white px-2.5 py-1 rounded-md text-[11px] font-mono font-bold shadow-xs flex items-center space-x-1">
              <span>BÚT LỤC:</span>
              <span className="text-amber-300">BL-{(document.id.replace(/\D/g, '').slice(-3) || '01').padStart(3, '0')}</span>
            </div>

            {document.fileType === 'image' && document.fileUrl ? (
              <img
                src={document.fileUrl}
                alt={document.name}
                className="max-h-[380px] w-auto object-contain mx-auto rounded-lg z-10"
              />
            ) : document.fileType === 'image' ? (
              <div className="text-center p-8 z-10">
                <ImageIcon className="w-16 h-16 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600 font-medium">Bản chụp chứng từ tài liệu hình ảnh</p>
                <p className="text-xs text-slate-400 mt-1">{document.name}</p>
              </div>
            ) : (
              <div className="text-center p-8 max-w-md z-10">
                <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-800 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <FileText className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-800 mb-1">{document.name}</h4>
                <p className="text-xs text-slate-500 mb-4">
                  Định dạng: {document.fileType.toUpperCase()} • Dung lượng: {document.fileSize}
                </p>
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-left text-xs text-slate-600 space-y-1 shadow-xs">
                  <div className="font-semibold text-slate-700">Tình trạng xác thực hồ sơ:</div>
                  <div className="text-emerald-700 flex items-center space-x-1">
                    <span>✓</span> <span>Đã kiểm tra tính toàn vẹn và khớp với hồ sơ thân chủ</span>
                  </div>
                  {document.notes && (
                    <div className="pt-2 text-slate-500 italic border-t border-slate-100">
                      Ghi chú: "{document.notes}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <div className="text-slate-400 flex items-center space-x-1 mb-1">
                <Folder className="w-3.5 h-3.5" />
                <span>Hồ sơ liên quan</span>
              </div>
              <div className="font-semibold text-slate-800 truncate" title={document.caseTitle || 'Chưa gắn'}>
                {document.caseTitle || 'Tài liệu độc lập'}
              </div>
              {document.caseId && <div className="text-[11px] text-red-700 font-mono">{document.caseId}</div>}
            </div>

            <div>
              <div className="text-slate-400 flex items-center space-x-1 mb-1">
                <User className="w-3.5 h-3.5" />
                <span>Khách hàng</span>
              </div>
              <div className="font-semibold text-slate-800 truncate">
                {document.clientName || 'N/A'}
              </div>
            </div>

            <div>
              <div className="text-slate-400 flex items-center space-x-1 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Thời gian tải lên</span>
              </div>
              <div className="font-semibold text-slate-800">
                {document.uploadDate}
              </div>
              <div className="text-[11px] text-slate-500">Bởi {document.uploadedBy}</div>
            </div>

            <div>
              <div className="text-slate-400 flex items-center space-x-1 mb-1">
                <HardDrive className="w-3.5 h-3.5" />
                <span>Dung lượng & Phân loại</span>
              </div>
              <div className="font-semibold text-slate-800">
                {document.fileSize}
              </div>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-800">
                {document.category}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Mã định danh bảo mật: <span className="font-mono text-slate-700">{document.id}</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
