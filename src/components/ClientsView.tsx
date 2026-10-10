import React, { useState } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  FileText,
  Briefcase,
  Upload,
  Eye,
  Building,
  CreditCard,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Edit3,
  Trash2,
} from 'lucide-react';
import { Client, LegalCase, DocumentItem, StaffMember } from '../types';
import { ConflictCheckModal } from './Modals/ConflictCheckModal';
import { EditClientModal } from './Modals/EditClientModal';

interface ClientsViewProps {
  clients: Client[];
  cases: LegalCase[];
  documents: DocumentItem[];
  currentUser?: StaffMember;
  onSelectCase: (caseItem: LegalCase) => void;
  onOpenCreateClient: () => void;
  onOpenUpload: (caseId?: string, clientId?: string) => void;
  onPreviewDocument: (doc: DocumentItem) => void;
  onUpdateClient?: (updatedClient: Client) => void;
  onDeleteClient?: (clientId: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  cases,
  documents,
  currentUser,
  onSelectCase,
  onOpenCreateClient,
  onOpenUpload,
  onPreviewDocument,
  onUpdateClient,
  onDeleteClient,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Cá nhân' | 'Doanh nghiệp'>('all');
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [mobileTab, setMobileTab] = useState<'list' | 'detail'>('list');
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isAdmin = currentUser?.roleId === 'admin';
  const canCreateClient = isAdmin || (currentUser?.permissions.includes('create_edit_cases') ?? false);

  // Always resolve the freshest client object
  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0] || null;

  const filteredClients = clients.filter((c) => {
    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.idCardOrTax.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const clientCases = selectedClient
    ? cases.filter((item) => item.clientId === selectedClient.id)
    : [];

  const clientDocs = selectedClient
    ? documents.filter((d) => d.clientId === selectedClient.id)
    : [];

  return (
    <div className="p-3.5 sm:p-5 md:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 sm:gap-3 flex-wrap">
          {/* Search box */}
          <div className="relative flex-1 min-w-[180px] max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên, SĐT, CCCD/MST..."
              className="w-full pl-9 pr-3 sm:pr-4 py-2 sm:py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-800 text-slate-900 shadow-2xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 sm:top-3" />
          </div>

          {/* Type filter */}
          <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-300 text-xs">
            {(['all', 'Cá nhân', 'Doanh nghiệp'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium transition-colors ${
                  typeFilter === t
                    ? 'bg-red-800 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {t === 'all' ? 'Tất cả' : t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {/* Conflict of interest scan button */}
          <button
            onClick={() => setIsConflictModalOpen(true)}
            className="flex-1 sm:flex-none px-3 sm:px-3.5 py-2 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl border border-slate-300 shadow-2xs transition-colors flex items-center justify-center space-x-1.5"
            title="Kiểm tra xung đột lợi ích thân chủ theo đạo đức nghề nghiệp"
          >
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span className="hidden sm:inline">Kiểm tra Xung đột Lợi ích</span>
            <span className="sm:hidden">Kiểm tra xung đột</span>
          </button>

          {/* Add client button */}
          {canCreateClient && (
            <button
              onClick={onOpenCreateClient}
              className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2 sm:py-2.5 bg-[#8b1d24] hover:bg-[#72171d] text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center space-x-1.5 sm:space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm KH</span>
            </button>
          )}
        </div>
      </div>

      {/* Staff Scope Notice Banner */}
      {!isAdmin && currentUser && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center space-x-2.5">
            <Users className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold">Danh bạ Thân chủ liên quan ({currentUser.role}):</span>{' '}
              <span className="text-amber-900">
                Hiển thị <strong>{clients.length} khách hàng</strong> thuộc các vụ việc bạn được Admin phân công thụ lý. Thông tin khách hàng của các hồ sơ khác được ẩn bảo mật theo quy định của hãng luật.
              </span>
            </div>
          </div>
          <span className="text-[10px] bg-amber-200/70 text-amber-900 font-bold px-2 py-0.5 rounded-full shrink-0">
            Hồ sơ được giao
          </span>
        </div>
      )}

      {/* Mobile view toggle tabs (< lg) */}
      <div className="lg:hidden flex items-center space-x-2 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
            mobileTab === 'list' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
          }`}
        >
          Danh sách ({filteredClients.length})
        </button>
        <button
          onClick={() => setMobileTab('detail')}
          className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
            mobileTab === 'detail' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
          }`}
        >
          Chi tiết & Hồ sơ {selectedClient ? `(${selectedClient.name.split(' ').slice(-1)})` : ''}
        </button>
      </div>

      {/* Main 2 Column Master-Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Col: Client List */}
        <div className={`lg:col-span-5 space-y-3 ${mobileTab === 'detail' ? 'hidden lg:block' : 'block'}`}>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Danh sách thân chủ ({filteredClients.length})
          </div>

          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
            {filteredClients.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                Không tìm thấy khách hàng phù hợp
              </div>
            ) : (
              filteredClients.map((client) => {
                const isSelected = selectedClient?.id === client.id;
                const clientCaseCount = cases.filter((c) => c.clientId === client.id).length;
                const clientDocCount = documents.filter((d) => d.clientId === client.id).length;

                return (
                  <div
                    key={client.id}
                    onClick={() => {
                      setSelectedClientId(client.id);
                      setMobileTab('detail');
                    }}
                    className={`p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'border-red-800 bg-white ring-2 ring-red-800/10 shadow-sm'
                        : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            client.type === 'Doanh nghiệp'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-red-100 text-red-900'
                          }`}
                        >
                          {client.type === 'Doanh nghiệp' ? (
                            <Building className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 text-xs sm:text-sm truncate">{client.name}</div>
                          <div className="text-[11px] sm:text-xs text-slate-500 flex items-center space-x-1.5 mt-0.5 truncate">
                            <span>{client.phone}</span>
                            <span>•</span>
                            <span className="text-slate-400 font-mono">{client.idCardOrTax}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {client.type}
                        </span>
                        <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1">
                          {clientCaseCount} vụ việc
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Selected Client Details & Documents & Cases */}
        <div className={`lg:col-span-7 ${mobileTab === 'list' ? 'hidden lg:block' : 'block'}`}>
          {selectedClient ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-xs ${
                      selectedClient.type === 'Doanh nghiệp'
                        ? 'bg-amber-900 text-white'
                        : 'bg-red-900 text-white'
                    }`}
                  >
                    {selectedClient.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-bold text-slate-900">{selectedClient.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800">
                        {selectedClient.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Mã thân chủ: <span className="font-mono text-slate-700 font-semibold">{selectedClient.id}</span> • Ngày tạo: {selectedClient.createdAt}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-center">
                  {/* Direct Upload For This Client Button */}
                  <button
                    onClick={() => onOpenUpload(undefined, selectedClient.id)}
                    className="px-3.5 py-2 bg-[#8b1d24] hover:bg-[#72171d] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải tài liệu</span>
                  </button>

                  {/* Edit Client Button */}
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center space-x-1.5"
                    title="Chỉnh sửa thông tin thân chủ"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sửa</span>
                  </button>

                  {/* Delete Client Button: strictly for Admin */}
                  {isAdmin && onDeleteClient && (
                    <button
                      onClick={() => onDeleteClient(selectedClient.id)}
                      className="p-2 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-700 rounded-xl transition-colors cursor-pointer"
                      title="Xóa khách hàng (Admin)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Contact Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center space-x-2.5">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Điện thoại</div>
                    <div className="font-semibold text-slate-800">{selectedClient.phone}</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center space-x-2.5">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Email</div>
                    <div className="font-semibold text-slate-800">{selectedClient.email}</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center space-x-2.5">
                  <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      {selectedClient.type === 'Doanh nghiệp' ? 'Mã số thuế' : 'CCCD / Hộ chiếu'}
                    </div>
                    <div className="font-semibold text-slate-800 font-mono">{selectedClient.idCardOrTax}</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center space-x-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Địa chỉ</div>
                    <div className="font-semibold text-slate-800 truncate">{selectedClient.address}</div>
                  </div>
                </div>
              </div>

              {/* Note */}
              {selectedClient.note && (
                <div className="p-3.5 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-900 leading-relaxed">
                  <strong className="font-semibold">Ghi chú thân chủ:</strong> {selectedClient.note}
                </div>
              )}

              {/* Client Cases Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <Briefcase className="w-4 h-4 text-red-800" />
                    <span>Hồ sơ / Vụ việc của khách hàng ({clientCases.length})</span>
                  </h4>
                </div>

                {clientCases.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-xs">
                    Khách hàng chưa có hồ sơ vụ việc nào được khởi tạo
                  </div>
                ) : (
                  <div className="space-y-2">
                    {clientCases.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => onSelectCase(c)}
                        className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer transition-colors group"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-red-800">
                              {c.id}
                            </span>
                            <span className="text-xs font-semibold text-slate-800">• {c.title}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            Lĩnh vực: {c.category} • Phụ trách: {c.leadLawyer} • Tiến độ: {c.progress}%
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-red-800" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Client Documents Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-red-800" />
                    <span>Tài liệu đã tải lên của khách hàng ({clientDocs.length})</span>
                  </h4>
                  <button
                    onClick={() => onOpenUpload(undefined, selectedClient.id)}
                    className="text-xs text-red-800 hover:text-red-950 font-bold flex items-center space-x-1"
                  >
                    <span>+ Tải thêm</span>
                  </button>
                </div>

                {clientDocs.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                    Chưa có tài liệu nào của khách hàng này.
                    <button
                      onClick={() => onOpenUpload(undefined, selectedClient.id)}
                      className="block mx-auto mt-2 text-red-800 font-bold hover:underline"
                    >
                      Bấm để tải tài liệu lên ngay
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {clientDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1 mr-2">
                          <FileText className="w-4 h-4 text-red-800 shrink-0" />
                          <div className="min-w-0">
                            <div
                              onClick={() => onPreviewDocument(doc)}
                              className="font-bold text-slate-800 hover:text-red-800 cursor-pointer truncate"
                            >
                              {doc.name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {doc.category} • {doc.fileSize} • {doc.uploadDate}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => onPreviewDocument(doc)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-[11px]"
                        >
                          Xem
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              Vui lòng chọn một khách hàng để xem chi tiết
            </div>
          )}
        </div>
      </div>

      {/* Conflict of Interest Check Modal */}
      <ConflictCheckModal
        isOpen={isConflictModalOpen}
        onClose={() => setIsConflictModalOpen(false)}
        clients={clients}
        cases={cases}
      />

      {/* Edit Client Modal */}
      <EditClientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        client={selectedClient}
        onSave={(updated) => {
          if (onUpdateClient) {
            onUpdateClient(updated);
          }
        }}
      />
    </div>
  );
};
