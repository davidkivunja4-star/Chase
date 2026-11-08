import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Property } from '../types';
import { X, Save, Trash2 } from 'lucide-react';

interface AdminEditPropertyModalProps {
  property: Property;
  onClose: () => void;
}

export const AdminEditPropertyModal: React.FC<AdminEditPropertyModalProps> = ({ property, onClose }) => {
  const { updatePropertyOffering, deletePropertyOffering } = useAdmin();

  const [title, setTitle] = useState(property.title);
  const [status, setStatus] = useState(property.status);
  const [sharesRemaining, setSharesRemaining] = useState(property.sharesRemaining);
  const [occupancyRate, setOccupancyRate] = useState(property.occupancyRate);
  const [monthlyGrossRent, setMonthlyGrossRent] = useState(property.financials.monthlyGrossRent);
  const [netRentalYield, setNetRentalYield] = useState(property.netRentalYield);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePropertyOffering(property.id, {
      title,
      status,
      sharesRemaining,
      occupancyRate,
      netRentalYield,
      financials: {
        ...property.financials,
        monthlyGrossRent,
      }
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to archive "${property.title}"?`)) {
      deletePropertyOffering(property.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Edit Property Offering</h3>
            <div className="text-xs text-slate-500">{property.id} · Plan {property.plan}</div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Offering Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="funding">Active Funding</option>
                <option value="nearly_funded">Nearly Funded</option>
                <option value="funded">100% Fully Funded</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Occupancy Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={occupancyRate}
                onChange={(e) => setOccupancyRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Shares Remaining</label>
              <input
                type="number"
                min="0"
                max={property.totalShares}
                value={sharesRemaining}
                onChange={(e) => setSharesRemaining(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Net Rental Yield (%)</label>
              <input
                type="number"
                step="0.1"
                value={netRentalYield}
                onChange={(e) => setNetRentalYield(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Monthly Contracted Gross Rent ($)</label>
            <input
              type="number"
              step="100"
              value={monthlyGrossRent}
              onChange={(e) => setMonthlyGrossRent(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-200">
            <button
              type="button"
              onClick={handleDelete}
              className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Archive Asset</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
