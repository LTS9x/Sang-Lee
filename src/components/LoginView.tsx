import React, { useState } from 'react';
import {
  Scale,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Phone,
  FileText,
  Eye,
  Download,
  Building,
  ArrowRight,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { signInWithGoogle, signOutFirebase, signInWithEmail } from '../firebase';
import { StaffMember, LegalCase, DocumentItem, CaseTimeline } from '../types';

interface LoginViewProps {
  onLogin: (email?: string) => void;
  staff: StaffMember[];
  cases: LegalCase[];
  documents?: DocumentItem[];
  timelines?: CaseTimeline[];
}

const DEMO_ACCOUNTS = [
  { role: 'LS. Lý Thanh Sang (Admin Tối cao)', email: 'lythanhsanggg@gmail.com', icon: '⭐', desc: 'Chủ tài khoản • Toàn quyền quản trị' },
  { role: 'Luật sư Điều hành (Admin)', email: 'admin@bigbosslaw.com', icon: '👑', desc: 'Managing Partner' },
  { role: 'LS. Mai Tiến Luật (Partner)', email: 'maitien.luat@bigbosslaw.com', icon: '⚖️', desc: 'Trưởng ban tố tụng' },
  { role: 'CV. Sang (Chuyên viên)', email: 'sang.cv@bigbosslaw.com', icon: '📑', desc: 'Chuyên viên pháp lý hợp đồng' },
  { role: 'Trợ lý D (Thư ký)', email: 'trolyd@bigbosslaw.com', icon: '📂', desc: 'Trợ lý hồ sơ & chứng cứ' },
];

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  staff = [],
  cases = [],
  documents = [],
  timelines = [],
}) => {
  const [activePortalTab, setActivePortalTab] = useState<'staff' | 'client'>('staff');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Client Portal Search State
  const [caseCode, setCaseCode] = useState('HS-202610-0001');
  const [searchedCase, setSearchedCase] = useState<LegalCase | null>(cases[0] || null);
  const [hasSearched, setHasSearched] = useState(true);
  const [searchError, setSearchError] = useState('');

  // Handle Google Sign-in for Staff
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await signInWithGoogle();
      const userEmail = user.email?.trim().toLowerCase();

      if (!userEmail) {
        throw new Error('Không lấy được thông tin email từ tài khoản Google của bạn.');
      }

      // Check if this Google email was configured by Admin in the staff directory
      const staffList = staff && staff.length > 0 ? staff : [];
      const matchedStaff = staffList.find(
        (s) =>
          s.email?.trim().toLowerCase() === userEmail ||
          (s.googleEmail && s.googleEmail.trim().toLowerCase() === userEmail)
      );

      if (!matchedStaff) {
        // Not a staff member configured by Admin!
        await signOutFirebase();
        setErrorMessage(
          `⛔ Quyền truy cập bị từ chối: Tài khoản Google [${user.email}] chưa được Admin cài đặt trong hệ thống nhân sự Bigboss Law. Chỉ nhân sự do Admin tạo tài khoản và cài đặt email Google mới có thể truy cập hệ thống quản trị nội bộ. Người dùng là khách hàng vui lòng sử dụng "Cổng Tra cứu Hồ sơ bằng Mã số hồ sơ".`
        );
        return;
      }

      if (matchedStaff.status === 'suspended') {
        await signOutFirebase();
        setErrorMessage(
          `🔒 Tài khoản nhân sự (${matchedStaff.name}) hiện đang bị tạm khóa. Vui lòng liên hệ Luật sư Điều hành (Admin) để kích hoạt lại.`
        );
        return;
      }

      // Successfully verified staff member
      onLogin(matchedStaff.email);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMessage('Đăng nhập Google thất bại: ' + (err.message || 'Lỗi không xác định'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Test simulation of un-whitelisted user to demonstrate rejection
  const handleSimulateUnauthorizedGoogle = () => {
    setErrorMessage(
      `⛔ Quyền truy cập bị từ chối: Tài khoản Google [khachhang.demo@gmail.com] chưa được Admin cài đặt trong hệ thống nhân sự Bigboss Law. Chỉ nhân sự do Admin tạo tài khoản và cài đặt Email Google mới có thể truy cập hệ thống quản trị nội bộ. Người dùng là khách hàng vui lòng chuyển sang "Cổng Tra cứu Hồ sơ bằng Mã số hồ sơ".`
    );
  };

  // Demo account select helper for testing/preview
  const handleSelectDemo = async (demoEmail: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      try {
        await signInWithEmail(demoEmail, '123456');
      } catch {
        // fallback to local session
      }
      onLogin(demoEmail);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Client Search
  const handleClientSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');

    const cleanCode = caseCode.trim().toUpperCase();
    if (!cleanCode) {
      setSearchError('Vui lòng nhập Mã số hồ sơ hoặc Số điện thoại để tra cứu');
      return;
    }

    const found = cases.find(
      (c) =>
        c.id.toUpperCase() === cleanCode ||
        c.id.toUpperCase().replace(/-/g, '') === cleanCode.replace(/-/g, '') ||
        c.id.toUpperCase().includes(cleanCode) ||
        c.clientName.toLowerCase().includes(caseCode.toLowerCase().trim())
    );

    if (found) {
      setSearchedCase(found);
      setHasSearched(true);
    } else {
      setSearchedCase(null);
      setHasSearched(true);
      setSearchError(
        `Không tìm thấy hồ sơ với thông tin "${caseCode}". Quý khách vui lòng kiểm tra lại Mã số hồ sơ trên Hợp đồng dịch vụ pháp lý hoặc liên hệ Hotline Bigboss Law 1900 6889.`
      );
    }
  };

  const caseDocs = searchedCase
    ? documents.filter((d) => d.caseId === searchedCase.id)
    : [];

  const caseTimelines = searchedCase
    ? timelines.filter((t) => t.caseId === searchedCase.id)
    : [];

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#0e0f12]">
      {/* Left Column - Hero Branding & System Policy */}
      <div className="w-full lg:w-5/12 bg-gradient-to-br from-[#140608] via-[#1a080c] to-[#0e0f12] text-white p-6 sm:p-10 lg:p-14 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-red-950/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-900/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-900/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-800 flex items-center justify-center text-white shadow-lg shadow-red-950/50">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight leading-none">
                BIGBOSS <span className="text-[#c52227]">LAW</span>
              </div>
              <div className="text-[11px] font-medium text-slate-400 mt-1">
                Hệ thống Quản trị Luật sư & Hồ sơ Thân chủ
              </div>
            </div>
          </div>
        </div>

        <div className="my-auto py-8 sm:py-12 relative z-10 max-w-lg">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-900/40 border border-red-700/50 text-red-300 text-xs font-semibold mb-5">
            <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
            <span>Chính sách Bảo mật & Phân quyền Hai Cổng (Dual Portal)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight mb-4">
            Quản trị pháp lý chuyên nghiệp & Tra cứu hồ sơ minh bạch
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-normal">
            Hệ thống phân tách bảo mật giữa Cổng Quản trị nội bộ dành cho Luật sư và Cổng Tra cứu công khai không cần tài khoản dành cho Thân chủ.
          </p>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start space-x-3">
              <div className="w-7 h-7 rounded-lg bg-red-900/50 flex items-center justify-center text-amber-400 shrink-0 font-bold">
                1
              </div>
              <div>
                <div className="font-bold text-white">Dành cho Cán bộ & Nhân sự (Admin cấp phép)</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Admin tạo tài khoản và cài đặt Email Google cho từng nhân sự. Đăng nhập một chạm bằng Google Auth được kiểm soát theo danh mục RBAC.
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start space-x-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-950/60 flex items-center justify-center text-emerald-400 shrink-0 font-bold">
                2
              </div>
              <div>
                <div className="font-bold text-white">Dành cho Khách hàng & Thân chủ (Không cần tài khoản)</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Khách hàng không thể đăng nhập vào hệ thống nội bộ, chỉ tra cứu tiến độ vụ việc, lịch phiên Tòa và tài liệu qua Mã số hồ sơ.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500 flex flex-col sm:flex-row items-start sm:items-center justify-between pt-6 border-t border-slate-800/60 gap-2">
          <span>© 2026 BigBoss Law Firm. Hotline: 1900 6889</span>
          <span className="text-slate-400 font-mono">Firebase Auth & Firestore</span>
        </div>
      </div>

      {/* Right Column - Portals (Staff Login vs Client Lookup) */}
      <div className="w-full lg:w-7/12 bg-white flex flex-col justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-xl mx-auto">
          {/* Top Switcher Tabs between Staff Portal and Client Portal */}
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActivePortalTab('staff');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                activePortalTab === 'staff'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-red-800" />
              <span>Cổng Cán bộ & Nhân sự (Google)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePortalTab('client');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                activePortalTab === 'client'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-red-800" />
              <span>Cổng Tra cứu Thân chủ (Mã hồ sơ)</span>
            </button>
          </div>

          {/* Error Banner if any */}
          {errorMessage && (
            <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start space-x-3 leading-relaxed animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold text-red-950">Thông báo từ hệ thống bảo mật</div>
                <div className="mt-1">{errorMessage}</div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: STAFF LOGIN PORTAL (GOOGLE AUTH ONLY) */}
          {/* ======================================================== */}
          {activePortalTab === 'staff' && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-red-800 uppercase px-2 py-0.5 rounded-full bg-red-50 border border-red-200 inline-block mb-2">
                  DÀNH CHO LUẬT SƯ & NHÂN SỰ NỘI BỘ
                </span>
                <h2 className="text-2xl font-black text-slate-900">
                  Đăng nhập Hệ thống Quản trị
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Đăng nhập bằng tài khoản Google đã được Admin Bigboss Law tạo và liên kết trong hồ sơ nhân sự.
                </p>
              </div>

              {/* Main Google Sign-in Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center space-x-3 text-xs text-slate-600">
                  <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-800 shrink-0">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Xác thực Google Workspace & Gmail</div>
                    <div className="text-[11px] text-slate-500">Bảo mật cấp tài khoản văn phòng luật sư</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 hover:border-slate-400 text-slate-800 font-bold rounded-xl transition-all flex items-center justify-center space-x-3 text-sm shadow-xs cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 text-red-700 animate-spin" />
                      <span>Đang xác thực Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Đăng nhập bằng tài khoản Google</span>
                    </>
                  )}
                </button>

                <div className="p-3 bg-slate-100/70 rounded-xl text-[11px] text-slate-600 leading-relaxed border border-slate-200/60">
                  🛡️ <strong>Chính sách hệ thống:</strong> Chỉ các email Google được <strong>Admin cài đặt trong hồ sơ nhân sự</strong> mới được cấp quyền đăng nhập. Người dùng là khách hàng vui lòng bấm vào tab <em>"Cổng Tra cứu Thân chủ"</em> phía trên.
                </div>
              </div>

              {/* Quick Demo Staff Selector for testing roles */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-700">
                    🧪 Kiểm thử nhanh các vai trò nhân sự (Demo)
                  </span>
                  <span className="text-[11px] text-slate-400">1-Click Preview</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleSelectDemo(acc.email)}
                      disabled={isLoading}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-red-700 bg-white hover:bg-red-50/30 text-left transition-all cursor-pointer group flex items-start space-x-2"
                    >
                      <span className="text-sm shrink-0">{acc.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-red-900 truncate">
                          {acc.role}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          {acc.email}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Simulate Unauthorized Test Button */}
                <div className="mt-2.5">
                  <button
                    type="button"
                    onClick={handleSimulateUnauthorizedGoogle}
                    className="w-full py-2 px-3 text-[11px] font-medium text-slate-500 hover:text-red-800 bg-slate-50 hover:bg-red-50/50 rounded-xl border border-dashed border-slate-300 hover:border-red-300 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>🛡️ Thử nghiệm: Kiểm tra từ chối khi tài khoản Google chưa được Admin cấp phép</span>
                  </button>
                </div>
              </div>

              {/* Client CTA prompt */}
              <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200/70 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-red-950">Bạn là Thân chủ / Khách hàng?</div>
                  <div className="text-[11px] text-red-800">
                    Tra cứu tiến độ hồ sơ pháp lý không cần tài khoản
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePortalTab('client')}
                  className="px-3.5 py-1.5 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <span>Tra cứu hồ sơ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: CLIENT CASE LOOKUP PORTAL (NO ACCOUNT NEEDED) */}
          {/* ======================================================== */}
          {activePortalTab === 'client' && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-emerald-800 uppercase px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 inline-block mb-2">
                  DÀNH CHO KHÁCH HÀNG & THÂN CHỦ
                </span>
                <h2 className="text-2xl font-black text-slate-900">
                  Cổng Tra cứu Tiến độ Hồ sơ
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Khách hàng không cần đăng nhập tài khoản. Nhập <strong>Mã số hồ sơ</strong> ghi trên Hợp đồng dịch vụ pháp lý để xem tiến độ xử lý và lịch phiên Tòa.
                </p>
              </div>

              {/* Search Form */}
              <form onSubmit={handleClientSearch} className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={caseCode}
                      onChange={(e) => setCaseCode(e.target.value)}
                      placeholder="Nhập mã số hồ sơ (VD: HS-202610-0001)..."
                      className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white text-slate-900 shadow-2xs uppercase font-mono font-bold"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-3 bg-[#8b1d24] hover:bg-[#72171d] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 shrink-0 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Tra cứu</span>
                  </button>
                </div>

                {/* Quick Samples */}
                <div className="flex items-center space-x-1.5 flex-wrap text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-400">Mã mẫu thử nghiệm:</span>
                  {cases.slice(0, 4).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCaseCode(c.id);
                        setSearchedCase(c);
                        setHasSearched(true);
                        setSearchError('');
                      }}
                      className="font-mono text-red-800 hover:underline px-1.5 py-0.5 rounded bg-slate-100 hover:bg-red-50 text-[10px] font-bold cursor-pointer"
                    >
                      {c.id}
                    </button>
                  ))}
                </div>
              </form>

              {searchError && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>{searchError}</div>
                </div>
              )}

              {/* Case Result Dossier */}
              {searchedCase && hasSearched && (
                <div className="bg-slate-50 rounded-2xl border border-slate-200/90 p-5 space-y-4 animate-in fade-in">
                  {/* Case Header */}
                  <div className="flex items-start justify-between pb-3 border-b border-slate-200 gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-sm text-red-800 bg-red-100/60 px-2 py-0.5 rounded-md">
                          {searchedCase.id}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {searchedCase.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1.5">
                        {searchedCase.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Thân chủ: <strong className="text-slate-800">{searchedCase.clientName}</strong> • Lĩnh vực: {searchedCase.category}
                      </p>
                    </div>
                  </div>

                  {/* 4 Stage Progress Bar */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">
                        Tiến độ giải quyết: {searchedCase.progress}%
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {searchedCase.progress === 100
                          ? 'Đã hoàn tất vụ việc'
                          : searchedCase.progress >= 70
                          ? 'Giai đoạn tố tụng & hòa giải'
                          : 'Giai đoạn thu thập & soạn thảo đơn'}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-red-800 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${searchedCase.progress}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-1 text-[9px] text-slate-400 font-medium pt-1 text-center">
                      <span className={searchedCase.stageProgress?.collectDocuments ? 'text-red-800 font-bold' : ''}>
                        1. Thu thập HS
                      </span>
                      <span className={searchedCase.stageProgress?.researchEvaluate ? 'text-red-800 font-bold' : ''}>
                        2. Đánh giá
                      </span>
                      <span className={searchedCase.stageProgress?.draftPetition ? 'text-red-800 font-bold' : ''}>
                        3. Soạn đơn
                      </span>
                      <span className={searchedCase.stageProgress?.submitAndWorkWithAgency ? 'text-red-800 font-bold' : ''}>
                        4. Tố tụng/Tòa án
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Luật sư thụ lý chính</div>
                      <div className="font-bold text-slate-900 mt-0.5">{searchedCase.leadLawyer}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Hotline: 1900 6889</div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Lịch phiên Tòa / Hạn xử lý</div>
                      <div className="font-bold text-red-800 mt-0.5">{searchedCase.nextDeadline}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">{searchedCase.courtAgency}</div>
                    </div>
                  </div>

                  {/* Public shared documents for client */}
                  {caseDocs.length > 0 && (
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <div className="text-xs font-bold text-slate-900 mb-2 flex items-center justify-between">
                        <span>Văn bản & Tài liệu đã bàn giao ({caseDocs.length})</span>
                        <span className="text-[10px] text-slate-400 font-normal">Công khai cho thân chủ</span>
                      </div>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {caseDocs.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs hover:bg-red-50/30 transition-colors"
                          >
                            <div className="flex items-center space-x-2 min-w-0">
                              <FileText className="w-3.5 h-3.5 text-red-800 shrink-0" />
                              <span className="font-medium text-slate-800 truncate text-[11px]">
                                {doc.name}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                              {doc.fileSize}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Case Timeline Events */}
                  {caseTimelines.length > 0 && (
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <div className="text-xs font-bold text-slate-900 mb-2">
                        Nhật ký mốc sự kiện & Tiến trình gần nhất
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {caseTimelines.slice(0, 3).map((tm) => (
                          <div key={tm.id} className="text-xs border-l-2 border-red-700 pl-2.5 py-0.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-800">{tm.title}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{tm.date}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{tm.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Staff login shortcut */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActivePortalTab('staff')}
                  className="text-xs font-semibold text-red-800 hover:text-red-950 underline cursor-pointer"
                >
                  ← Bạn là Luật sư / Chuyên viên của Bigboss Law? Quay lại Đăng nhập Cán bộ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
