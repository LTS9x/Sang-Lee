export type CaseCategory = 
  | 'Tất cả hồ sơ'
  | 'Dân sự'
  | 'Hình sự'
  | 'Hôn nhân gia đình'
  | 'Đất đai'
  | 'Hành chính'
  | 'Doanh nghiệp'
  | 'Soạn đơn';

export type CaseStatus = 'Đang xử lý' | 'Khẩn' | 'Chờ KH' | 'Đã hoàn thành' | 'Tạm hoãn';

export type DocumentCategory = 
  | 'Hợp đồng'
  | 'Giấy tờ tùy thân'
  | 'Chứng cứ'
  | 'Văn bản tố tụng'
  | 'Đơn khởi kiện'
  | 'Ủy quyền'
  | 'Hóa đơn / Biên lai'
  | 'Khác';

export type UserRole = 
  | 'admin'             // Luật sư Điều hành / Quản trị viên tối cao
  | 'partner_lawyer'   // Luật sư Thành viên / Phụ trách tranh tụng
  | 'associate_lawyer' // Chuyên viên Pháp lý / Luật sư cộng sự
  | 'paralegal'        // Trợ lý pháp lý / Thư ký vụ việc
  | 'accountant';      // Kế toán / Quản lý tài chính

export type PermissionKey =
  | 'view_all_cases'          // Xem tất cả hồ sơ (thay vì chỉ hồ sơ được giao)
  | 'create_edit_cases'       // Tạo và chỉnh sửa thông tin hồ sơ
  | 'delete_cases'            // Xóa hồ sơ
  | 'upload_documents'        // Tải lên tài liệu khách hàng
  | 'delete_documents'        // Xóa tài liệu
  | 'view_confidential_notes' // Xem ghi chú nội bộ bảo mật
  | 'assign_lawyers'          // Phân công / thay đổi luật sư phụ trách
  | 'manage_billing'          // Quản lý thù lao dịch vụ và biểu phí
  | 'manage_users_roles'      // Tạo nhân viên và phân quyền quản trị
  | 'system_settings';        // Cấu hình hệ thống công ty luật

export interface Client {
  id: string;
  name: string;
  type: 'Cá nhân' | 'Doanh nghiệp';
  phone: string;
  email: string;
  idCardOrTax: string;
  address: string;
  representative?: string;
  note?: string;
  createdAt: string;
  casesCount: number;
}

export interface LegalCase {
  id: string; // e.g. HS-202610-0001
  title: string;
  clientId: string;
  clientName: string;
  category: CaseCategory;
  status: CaseStatus;
  priority: 'Khẩn' | 'Cao' | 'Bình thường';
  progress: number;
  leadLawyer: string;
  assistants: string[];
  receivedDate: string;
  nextDeadline: string;
  courtAgency: string;
  disputedAmount: string;
  summary: string;
  target: string;
  stageProgress: {
    collectDocuments: number;
    researchEvaluate: number;
    draftPetition: number;
    submitAndWorkWithAgency: number;
  };
  billing?: {
    totalFee: string;
    paidAmount: string;
    pendingAmount: string;
    status: 'Đã thanh toán đủ' | 'Còn nợ đợt 2' | 'Chưa thanh toán';
  };
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  fileType: 'pdf' | 'docx' | 'image' | 'xlsx' | 'other';
  category: DocumentCategory;
  caseId?: string;
  caseTitle?: string;
  clientId?: string;
  clientName?: string;
  uploadedBy: string;
  uploadDate: string;
  fileSize: string;
  fileUrl?: string; // base64 or object URL or simulated preview
  mimeType?: string;
  notes?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  caseId: string;
  caseTitle: string;
  assignee: string;
  deadline: string;
  priority: 'Khẩn' | 'Cao' | 'Bình thường';
  completed: boolean;
  category?: string;
}

export interface CaseTimeline {
  id: string;
  caseId: string;
  date: string;
  title: string;
  description: string;
  actor: string;
  type: 'meeting' | 'court' | 'document' | 'deadline' | 'update';
}

export interface InternalNote {
  id: string;
  caseId: string;
  author: string;
  date: string;
  content: string;
  isConfidential?: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  roleId: UserRole;
  department: string;
  activeCases: number;
  initials: string;
  phone: string;
  email: string;
  googleEmail?: string; // Email Google được Admin cài đặt để đăng nhập 1-chạm Google Auth
  status: 'active' | 'suspended';
  permissions: PermissionKey[];
  avatarColor?: string;
  lawyerCardNumber?: string;
  maxCaseloadQuota?: number;
  specializations?: string[];
  joinedDate?: string;
  lastLogin?: string;
  kpiSuccessRate?: number;
  mustChangePassword?: boolean;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: 'LOGIN' | 'CREATE_CASE' | 'UPLOAD_DOC' | 'DELETE_DOC' | 'CHANGE_PERMISSION' | 'RESET_PASSWORD' | 'TOGGLE_ACCOUNT' | 'UPDATE_SETTINGS' | 'EXPORT_DATA';
  details: string;
  target?: string;
  ipAddress?: string;
}

export interface SystemSettings {
  firmName: string;
  firmEnglishName: string;
  licenseNumber: string;
  taxId: string;
  barAssociation: string;
  address: string;
  branchAddress?: string;
  representative: string;
  hotline: string;
  email: string;
  bankAccount: string;
  bankName: string;
  modules: {
    enableBilling: boolean;
    enableConfidentialNotes: boolean;
    enableClientPortal: boolean;
    enableConflictCheck: boolean;
    enableWatermark: boolean;
    enableActivityAudit: boolean;
    enableDeadlineReminder: boolean;
  };
  security: {
    require2FA: boolean;
    autoLogoutMinutes: number;
    restrictOfficeIp: boolean;
    allowedIpRange: string;
  };
}

