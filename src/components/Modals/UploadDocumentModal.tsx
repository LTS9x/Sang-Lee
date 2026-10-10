import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Client, LegalCase, DocumentCategory, DocumentItem } from '../../types';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (newDoc: DocumentItem) => void;
  clients: Client[];
  cases: LegalCase[];
  defaultCaseId?: string;
  defaultClientId?: string;
}

const CATEGORIES: DocumentCategory[] = [
  'Hợp đồng',
  'Giấy tờ tùy thân',
  'Chứng cứ',
  'Văn bản tố tụng',
  'Đơn khởi kiện',
  'Ủy quyền',
  'Hóa đơn / Biên lai',
  'Khác',
];

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  clients,
  cases,
  defaultCaseId,
  defaultClientId,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('Hợp đồng');
  const [caseId, setCaseId] = useState(defaultCaseId || '');
  const [clientId, setClientId] = useState(defaultClientId || '');
  const [uploaderName, setUploaderName] = useState('CV. Sang');
  const [notes, setNotes] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  // Sync if defaultCaseId changes
  React.useEffect(() => {
    if (defaultCaseId) {
      setCaseId(defaultCaseId);
      const c = cases.find((item) => item.id === defaultCaseId);
      if (c) {
        setClientId(c.clientId);
      }
    } else if (defaultClientId) {
      setClientId(defaultClientId);
    }
  }, [defaultCaseId, defaultClientId, cases]);

  // When case is selected, auto-select client
  const handleCaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCaseId(val);
    const targetCase = cases.find((c) => c.id === val);
    if (targetCase) {
      setClientId(targetCase.clientId);
    }
  };

  const handleFileSelection = (file: File) => {
    setSelectedFile(file);
    if (!customName) {
      setCustomName(file.name);
    }
    setError('');

    // Guess category from file name
    const lower = file.name.toLowerCase();
    if (lower.includes('hop dong') || lower.includes('hd') || lower.includes('contract')) {
      setCategory('Hợp đồng');
    } else if (lower.includes('cccd') || lower.includes('cmnd') || lower.includes('ho chieu') || lower.includes('id')) {
      setCategory('Giấy tờ tùy thân');
    } else if (lower.includes('don') || lower.includes('khoi kien') || lower.includes('to cao')) {
      setCategory('Đơn khởi kiện');
    } else if (lower.includes('chung cu') || lower.includes('so do') || lower.includes('so hong')) {
      setCategory('Chứng cứ');
    } else if (lower.includes('uy quyen') || lower.includes('uq')) {
      setCategory('Ủy quyền');
    } else if (lower.includes('bien lai') || lower.includes('hoa don') || lower.includes('sao ke')) {
      setCategory('Hóa đơn / Biên lai');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !customName) {
      setError('Vui lòng chọn tài liệu hoặc nhập tên tài liệu');
      return;
    }

    const matchedCase = cases.find((c) => c.id === caseId);
    const matchedClient = clients.find((c) => c.id === clientId);

    let fileType: DocumentItem['fileType'] = 'other';
    const ext = (selectedFile?.name || customName).split('.').pop()?.toLowerCase();
    if (ext === 'pdf') fileType = 'pdf';
    else if (ext === 'doc' || ext === 'docx') fileType = 'docx';
    else if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp') fileType = 'image';
    else if (ext === 'xls' || ext === 'xlsx') fileType = 'xlsx';

    let fileUrl: string | undefined = undefined;
    if (selectedFile) {
      try {
        fileUrl = URL.createObjectURL(selectedFile);
      } catch {
        fileUrl = undefined;
      }
    }

    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newDocument: DocumentItem = {
      id: `doc-${Date.now().toString().slice(-6)}`,
      name: customName || selectedFile?.name || 'Tài liệu không tên',
      fileType,
      category,
      caseId: caseId || undefined,
      caseTitle: matchedCase ? matchedCase.title : undefined,
      clientId: clientId || matchedCase?.clientId || undefined,
      clientName: matchedClient ? matchedClient.name : matchedCase?.clientName || undefined,
      uploadedBy: uploaderName,
      uploadDate: formattedDate,
      fileSize: selectedFile ? formatFileSize(selectedFile.size) : '1.2 MB',
      fileUrl,
      notes: notes.trim() || undefined,
    };

    onUpload(newDocument);
    // Reset form
    setSelectedFile(null);
    setCustomName('');
    setNotes('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-red-800 flex items-center justify-center">
              <Upload className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Tải lên tài liệu khách hàng</h3>
              <p className="text-xs text-slate-300">Lưu trữ bảo mật trong hồ sơ pháp lý công ty Luật</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-red-600 bg-red-50/50'
                : selectedFile
                ? 'border-emerald-500 bg-emerald-50/30'
                : 'border-slate-300 hover:border-red-800 bg-slate-50/70 hover:bg-slate-50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelection(e.target.files[0]);
                }
              }}
            />

            {selectedFile ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="font-semibold text-slate-800 text-sm">{selectedFile.name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Kích thước: {formatFileSize(selectedFile.size)} • Nhấn để chọn file khác
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-800 flex items-center justify-center mb-2">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  Kéo thả file tài liệu vào đây, hoặc <span className="text-red-700 underline">chọn từ thiết bị</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Hỗ trợ định dạng: PDF, DOCX, DOC, JPG, PNG, XLS, XLSX (Tối đa 50MB)
                </p>
              </div>
            )}
          </div>

          {/* Document Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên tài liệu / Văn bản <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="VD: Hop_dong_dat_coc_ngay_15-08-2026.pdf"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
                required
              />
              <FileText className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
          </div>

          {/* Category & Associated Case */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phân loại tài liệu <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thuộc Hồ sơ / Vụ việc
              </label>
              <select
                value={caseId}
                onChange={handleCaseChange}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
              >
                <option value="">-- Tài liệu chung (Chưa gắn vụ việc) --</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} • {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Client & Uploader */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Khách hàng sở hữu
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
              >
                <option value="">-- Chọn khách hàng --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Người tải lên
              </label>
              <select
                value={uploaderName}
                onChange={(e) => setUploaderName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
              >
                <option value="CV. Sang">CV. Sang</option>
                <option value="LS. Mai Tiến Luật">LS. Mai Tiến Luật</option>
                <option value="LS. Nguyễn C">LS. Nguyễn C</option>
                <option value="Trợ lý D">Trợ lý D</option>
                <option value="Khách hàng gửi trực tiếp">Khách hàng gửi trực tiếp</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú nội bộ / Tóm tắt nội dung tài liệu
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Bản sao có chứng thực gốc từ phòng công chứng, bao gồm 4 trang..."
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
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm bg-[#8b1d24] hover:bg-[#72171d] text-white font-medium rounded-lg shadow-sm hover:shadow transition-all flex items-center space-x-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Xác nhận Tải lên</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
