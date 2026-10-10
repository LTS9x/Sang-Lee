import React, { useState } from 'react';
import {
  FolderOpen,
  Search,
  Upload,
  FileText,
  Image as ImageIcon,
  Eye,
  Download,
  Trash2,
  HardDrive,
  Filter,
  CheckCircle2,
  Calendar,
  User,
  Briefcase,
} from 'lucide-react';
import { DocumentItem, LegalCase, Client, DocumentCategory, StaffMember } from '../types';

interface DocumentsViewProps {
  documents: DocumentItem[];
  cases: LegalCase[];
  clients: Client[];
  currentUser?: StaffMember;
  onOpenUpload: (caseId?: string, clientId?: string) => void;
  onPreviewDocument: (doc: DocumentItem) => void;
  onDeleteDocument: (docId: string) => void;
}

const CATEGORIES: ('all' | DocumentCategory)[] = [
  'all',
  'Hợp đồng',
  'Giấy tờ tùy thân',
  'Chứng cứ',
  'Văn bản tố tụng',
  'Đơn khởi kiện',
  'Ủy quyền',
  'Hóa đơn / Biên lai',
  'Khác',
];

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  cases,
  clients,
  currentUser,
  onOpenUpload,
  onPreviewDocument,
  onDeleteDocument,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | DocumentCategory>('all');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('all');
  const [selectedClientId, setSelectedClientId] = useState<string>('all');

  const isAdmin = currentUser?.roleId === 'admin';
  const canUpload = isAdmin || (currentUser?.permissions.includes('upload_documents') ?? false);
  const canDelete = isAdmin || (currentUser?.permissions.includes('delete_documents') ?? false);

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesCase = selectedCaseId === 'all' || doc.caseId === selectedCaseId;
    const matchesClient = selectedClientId === 'all' || doc.clientId === selectedClientId;
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.clientName && doc.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.caseTitle && doc.caseTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.caseId && doc.caseId.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesCase && matchesClient && matchesSearch;
  });

  return (
    <div className="p-3.5 sm:p-5 md:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Upload Call to action */}
      <div className="bg-gradient-to-r from-slate-900 to-[#2e0e13] text-white p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-900/60 border border-red-700/60 text-red-200">
              KHO LƯU TRỮ PHÁP LÝ TẬP TRUNG
            </span>
            <span className="text-[11px] text-slate-400">• Chuẩn mã hóa văn phòng luật</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold mt-1">Quản lý & Tải lên tài liệu khách hàng</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Lưu trữ tập trung hợp đồng, CCCD, chứng cứ tranh chấp và văn bản tố tụng theo từng hồ sơ thân chủ.
          </p>
        </div>

        {canUpload && (
          <button
            onClick={() => onOpenUpload()}
            className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Tải tài liệu mới lên</span>
          </button>
        )}
      </div>

      {/* Staff Scope Notice Banner */}
      {!isAdmin && currentUser && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center space-x-2.5">
            <FolderOpen className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold">Tài liệu Hồ sơ phân công ({currentUser.role}):</span>{' '}
              <span className="text-amber-900">
                Hiển thị <strong>{documents.length} tài liệu</strong> thuộc các vụ việc bạn phụ trách hoặc do bạn trực tiếp tải lên. Tài liệu của các hồ sơ khác được bảo mật.
              </span>
            </div>
          </div>
          <span className="text-[10px] bg-amber-200/70 text-amber-900 font-bold px-2 py-0.5 rounded-full shrink-0">
            Hồ sơ được giao
          </span>
        </div>
      )}

      {/* Filter Row */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        {/* Search & Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên file, thân chủ, vụ việc..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white text-slate-900"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Case selector */}
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-800 text-slate-700 font-medium"
          >
            <option value="all">Tất cả vụ việc / hồ sơ</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} - {c.title}
              </option>
            ))}
          </select>

          {/* Client selector */}
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-800 text-slate-700 font-medium"
          >
            <option value="all">Tất cả khách hàng thân chủ</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type})
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pt-1 text-xs no-scrollbar">
          <span className="text-slate-400 text-[11px] font-semibold shrink-0 mr-1">Loại file:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#8b1d24] text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium'
              }`}
            >
              {cat === 'all' ? 'Tất cả tài liệu' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Documents Card List (< md) */}
      <div className="md:hidden space-y-3">
        {filteredDocs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs">
            <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            Không tìm thấy tài liệu nào
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onPreviewDocument(doc)}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-800 flex items-center justify-center shrink-0">
                    {doc.fileType === 'image' ? (
                      <ImageIcon className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs truncate" title={doc.name}>
                      {doc.name}
                    </h4>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-800 border border-red-100">
                      {doc.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onPreviewDocument(doc)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {canDelete && (
                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa tài liệu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-600 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block">Thân chủ / Hồ sơ:</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {doc.clientName || doc.caseId || 'Chung'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Dung lượng:</span>
                  <span className="font-mono text-slate-600 text-[11px] block">{doc.fileSize}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop & Tablet Documents Table (>= md) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div>
            Hiển thị <span className="font-bold text-slate-900">{filteredDocs.length}</span> / {documents.length} tài liệu
          </div>
          <div className="text-[11px] text-slate-400">
            Click vào dòng để xem chi tiết hoặc tải file về máy
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/50">
                <th className="py-3.5 pl-6">Tài liệu / Văn bản</th>
                <th className="py-3.5">Phân loại</th>
                <th className="py-3.5">Hồ sơ / Vụ việc</th>
                <th className="py-3.5">Khách hàng</th>
                <th className="py-3.5">Ngày tải</th>
                <th className="py-3.5">Dung lượng</th>
                <th className="py-3.5 pr-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                    Không tìm thấy tài liệu nào phù hợp với bộ lọc tìm kiếm
                    <div className="mt-3">
                      <button
                        onClick={() => onOpenUpload()}
                        className="px-3.5 py-1.5 bg-[#8b1d24] text-white text-xs font-semibold rounded-lg hover:bg-[#72171d] transition-colors"
                      >
                        Tải tài liệu mới lên
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <td
                      onClick={() => onPreviewDocument(doc)}
                      className="py-3.5 pl-6 font-bold text-slate-900 group-hover:text-red-800"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-800 flex items-center justify-center shrink-0">
                          {doc.fileType === 'image' ? (
                            <ImageIcon className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs truncate" title={doc.name}>
                          {doc.name}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-800 border border-red-100">
                        {doc.category}
                      </span>
                    </td>

                    <td className="py-3.5 text-slate-700 max-w-[200px] truncate" title={doc.caseTitle || 'Chung'}>
                      {doc.caseId ? (
                        <div>
                          <span className="font-mono text-xs font-semibold text-slate-900">{doc.caseId}</span>
                          <span className="block text-[11px] text-slate-500 truncate">{doc.caseTitle}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Chưa gắn hồ sơ</span>
                      )}
                    </td>

                    <td className="py-3.5 text-slate-800 font-semibold">
                      {doc.clientName || 'N/A'}
                    </td>

                    <td className="py-3.5 text-slate-500 text-[11px]">
                      {doc.uploadDate}
                      <span className="block text-[10px] text-slate-400">Bởi {doc.uploadedBy}</span>
                    </td>

                    <td className="py-3.5 font-mono text-slate-600 text-[11px]">
                      {doc.fileSize}
                    </td>

                    <td className="py-3.5 pr-6 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPreviewDocument(doc);
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPreviewDocument(doc);
                          }}
                          className="p-1.5 text-slate-500 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          title="Tải về"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {canDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteDocument(doc.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa tài liệu"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
