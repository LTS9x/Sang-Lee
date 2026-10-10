import React, { useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { Client } from '../../types';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newClient: Client) => void;
}

export const CreateClientModal: React.FC<CreateClientModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'Cá nhân' | 'Doanh nghiệp'>('Cá nhân');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [idCardOrTax, setIdCardOrTax] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên khách hàng');
      return;
    }
    if (!phone.trim()) {
      setError('Vui lòng nhập số điện thoại liên hệ');
      return;
    }

    const clientId = `KH-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

    const newClient: Client = {
      id: clientId,
      name: name.trim(),
      type,
      phone: phone.trim(),
      email: email.trim() || 'chuaco@gmail.com',
      idCardOrTax: idCardOrTax.trim() || 'Chưa cung cấp',
      address: address.trim() || 'TP. Hồ Chí Minh',
      note: note.trim() || undefined,
      createdAt: formattedDate,
      casesCount: 0,
    };

    onCreate(newClient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-red-800 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Thêm khách hàng mới</h3>
              <p className="text-xs text-slate-300">Lưu trữ thông tin thân chủ và đại diện pháp lý</p>
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

          {/* Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Loại hình khách hàng
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('Cá nhân')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                  type === 'Cá nhân'
                    ? 'border-red-800 bg-red-50 text-red-900'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                👤 Cá nhân
              </button>
              <button
                type="button"
                onClick={() => setType('Doanh nghiệp')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                  type === 'Doanh nghiệp'
                    ? 'border-red-800 bg-red-50 text-red-900'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                🏢 Doanh nghiệp / Tổ chức
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {type === 'Cá nhân' ? 'Họ và tên khách hàng' : 'Tên doanh nghiệp / Pháp nhân'}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'Cá nhân' ? 'VD: Nguyễn Văn A' : 'VD: Công ty TNHH Giải Pháp Alpha'}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
              required
            />
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại liên hệ <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0903 123 456"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="VD: client@example.com"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
              />
            </div>
          </div>

          {/* CCCD / MST */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {type === 'Cá nhân' ? 'Số CCCD / CMND / Hộ chiếu' : 'Mã số thuế doanh nghiệp'}
            </label>
            <input
              type="text"
              value={idCardOrTax}
              onChange={(e) => setIdCardOrTax(e.target.value)}
              placeholder={type === 'Cá nhân' ? 'VD: 079088012345' : 'VD: 0314987654'}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Địa chỉ liên hệ / Trụ sở chính
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="VD: 142 Hai Bà Trưng, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú về khách hàng
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú về người liên hệ, thói quen giao tiếp, nhu cầu tư vấn..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
            />
          </div>

          {/* Actions */}
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
              className="px-5 py-2 text-sm bg-[#8b1d24] hover:bg-[#72171d] text-white font-medium rounded-lg shadow-sm hover:shadow transition-all flex items-center space-x-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Lưu khách hàng</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
