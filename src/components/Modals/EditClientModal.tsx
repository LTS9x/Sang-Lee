import React, { useState, useEffect } from 'react';
import { X, Edit3, AlertCircle } from 'lucide-react';
import { Client } from '../../types';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onSave: (updatedClient: Client) => void;
}

export const EditClientModal: React.FC<EditClientModalProps> = ({
  isOpen,
  onClose,
  client,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'Cá nhân' | 'Doanh nghiệp'>('Cá nhân');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [idCardOrTax, setIdCardOrTax] = useState('');
  const [address, setAddress] = useState('');
  const [representative, setRepresentative] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (client) {
      setName(client.name);
      setType(client.type);
      setPhone(client.phone);
      setEmail(client.email);
      setIdCardOrTax(client.idCardOrTax);
      setAddress(client.address);
      setRepresentative(client.representative || '');
      setNote(client.note || '');
      setError('');
    }
  }, [client, isOpen]);

  if (!isOpen || !client) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên khách hàng');
      return;
    }
    if (!phone.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return;
    }

    const updated: Client = {
      ...client,
      name: name.trim(),
      type,
      phone: phone.trim(),
      email: email.trim() || 'chuaco@gmail.com',
      idCardOrTax: idCardOrTax.trim() || 'Chưa cung cấp',
      address: address.trim() || 'TP. Hồ Chí Minh',
      representative: type === 'Doanh nghiệp' ? representative.trim() || undefined : undefined,
      note: note.trim() || undefined,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-800 flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Chỉnh sửa thông tin thân chủ</h3>
              <p className="text-xs text-slate-300 font-mono">{client.id} • {client.name}</p>
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
                    ? 'bg-red-50 border-red-800 text-red-800 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cá nhân (Thân chủ)
              </button>
              <button
                type="button"
                onClick={() => setType('Doanh nghiệp')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                  type === 'Doanh nghiệp'
                    ? 'bg-red-50 border-red-800 text-red-800 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Doanh nghiệp / Tổ chức
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {type === 'Doanh nghiệp' ? 'Tên doanh nghiệp / Pháp nhân' : 'Họ và tên thân chủ'}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
              required
            />
          </div>

          {type === 'Doanh nghiệp' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Người đại diện theo pháp luật
              </label>
              <input
                type="text"
                value={representative}
                onChange={(e) => setRepresentative(e.target.value)}
                placeholder="VD: Ông Nguyễn Văn A - Tổng Giám Đốc"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại liên hệ <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email trao đổi
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {type === 'Doanh nghiệp' ? 'Mã số thuế doanh nghiệp' : 'Số CCCD / Hộ chiếu'}
              </label>
              <input
                type="text"
                value={idCardOrTax}
                onChange={(e) => setIdCardOrTax(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Địa chỉ / Trụ sở
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú nội bộ về thân chủ
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Đặc điểm tâm lý, yêu cầu riêng, lưu ý liên hệ..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#8b1d24] hover:bg-[#72171d] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
