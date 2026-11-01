import { X, CheckCircle2, ArrowUpCircle, ArrowDownCircle, AlertTriangle } from 'lucide-react';

interface PendingPlan {
  current_plan_id: string;
  current_plan_name: string;
  pending_plan_id: string;
  pending_plan_name: string;
  is_upgrade: boolean;
  is_downgrade: boolean;
  status: string;
  message: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  onCancel: () => Promise<void>;
  pending: PendingPlan | null;
  confirming: boolean;
}

export default function PlanConfirmationModal({ isOpen, onClose, onConfirm, onCancel, pending, confirming }: Props) {
  if (!isOpen || !pending) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-800">Confirm Plan Change</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-5">
          {/* Current Plan */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Current Plan</p>
            <p className="text-base font-bold text-slate-700">{pending.current_plan_name}</p>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            {pending.is_upgrade ? (
              <ArrowUpCircle size={32} className="text-green-500" />
            ) : pending.is_downgrade ? (
              <ArrowDownCircle size={32} className="text-amber-500" />
            ) : (
              <ArrowDownCircle size={32} className="text-slate-300" />
            )}
          </div>

          {/* New Plan */}
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">New Plan</p>
            <p className="text-base font-bold text-indigo-700">{pending.pending_plan_name}</p>
          </div>

          {/* Upgrade/Downgrade Info */}
          {pending.is_upgrade && (
            <div className="bg-green-50 rounded-xl p-4 border border-green-200 flex items-start gap-3">
              <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-green-800">Upgrade</p>
                <p className="text-xs text-green-700 mt-1">Your new plan will be activated immediately after confirmation.</p>
              </div>
            </div>
          )}
          {pending.is_downgrade && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800">Downgrade</p>
                <p className="text-xs text-amber-700 mt-1">
                  Your downgrade will take effect at the end of your current billing cycle. Your current plan benefits remain until then.
                </p>
              </div>
            </div>
          )}

          {!pending.is_upgrade && !pending.is_downgrade && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-start gap-3">
              <AlertTriangle size={20} className="text-slate-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-slate-700">Plan Change</p>
                <p className="text-xs text-slate-500 mt-1">Your subscription plan will be updated.</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 pt-2 flex gap-3">
          <button
            onClick={async () => { await onCancel(); onClose(); }}
            disabled={confirming}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={confirming}
            className="flex-1 py-3 rounded-xl bg-[#2563EB] text-white font-bold text-sm hover:bg-[#1E40AF] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {confirming ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={16} />
                Confirm {pending.is_upgrade ? 'Upgrade' : pending.is_downgrade ? 'Downgrade' : 'Change'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

