import React, { useState } from 'react';
import { X, Users, Check } from 'lucide-react';
import { LegalCase, StaffMember } from '../../types';

interface AssignStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: LegalCase;
  staff: StaffMember[];
  onUpdate: (updatedCase: LegalCase) => void;
}

export const AssignStaffModal: React.FC<AssignStaffModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  staff,
  onUpdate,
}) => {
  const [leadLawyer, setLeadLawyer] = useState(caseItem.leadLawyer);
  const [assistants, setAssistants] = useState<string[]>(caseItem.assistants);

  if (!isOpen) return null;

  const toggleAssistant = (name: string) => {
    if (assistants.includes(name)) {
      setAssistants(assistants.filter((a) => a !== name));
    } else {
      setAssistants([...assistants, name]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...caseItem,
      leadLawyer,
      assistants,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-base">Phân công / Thay đổi nhân sự</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Luật sư phụ trách chính
            </label>
            <select
              value={leadLawyer}
              onChange={(e) => setLeadLawyer(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-800 focus:bg-white"
            >
              {staff.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nhân sự hỗ trợ / Thư ký hồ sơ
            </label>
            <div className="space-y-2 mt-2">
              {staff.map((s) => {
                const isSelected = assistants.includes(s.name);
                const isLead = s.name === leadLawyer;
                if (isLead) return null; // already lead

                return (
                  <div
                    key={s.id}
                    onClick={() => toggleAssistant(s.name)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-red-800 bg-red-50 text-red-950 font-medium'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center">
                        {s.initials}
                      </div>
                      <div>
                        <div>{s.name}</div>
                        <div className="text-[11px] text-slate-500">{s.role}</div>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                        isSelected ? 'bg-red-800 border-red-800 text-white' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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
              className="px-5 py-2 text-sm bg-[#8b1d24] hover:bg-[#72171d] text-white font-medium rounded-lg shadow-sm hover:shadow transition-all"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
