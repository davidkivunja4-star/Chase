import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { InvestmentPlan, PropertyCategory, Property } from '../types';
import { X, Building2, Plus, Sparkles } from 'lucide-react';

export const AdminAddPropertyModal: React.FC = () => {
  const { isAddPropertyModalOpen, setIsAddPropertyModalOpen, addPropertyOffering } = useAdmin();

  const [title, setTitle] = useState('');
  const [headline, setHeadline] = useState('');
  const [plan, setPlan] = useState<InvestmentPlan>('HABIBI');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('FL');
  const [category, setCategory] = useState<PropertyCategory>('vacation_rental');
  const [sharePrice, setSharePrice] = useState<number>(10000);
  const [totalShares, setTotalShares] = useState<number>(1000);
  const [projectedIRR, setProjectedIRR] = useState<number>(14.5);
  const [netRentalYield, setNetRentalYield] = useState<number>(9.0);
  const [projectedAppreciation, setProjectedAppreciation] = useState<number>(5.5);
  const [monthlyGrossRent, setMonthlyGrossRent] = useState<number>(12500);
  const [bedrooms, setBedrooms] = useState<number>(5);
  const [bathrooms, setBathrooms] = useState<number>(4.5);
  const [sqft, setSqft] = useState<number>(3800);
  const [imageUrl, setImageUrl] = useState('/src/assets/images/property_habibi_oasis_1792321199399.jpg');

  if (!isAddPropertyModalOpen) return null;

  const totalValuation = sharePrice * totalShares;
  const monthlyDividendPerShare = (monthlyGrossRent * 0.65) / totalShares;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !city.trim()) return;

    const newPropertyData: Omit<Property, 'id'> = {
      title,
      headline: headline || `Premium Luxury Asset under Plan ${plan}`,
      plan,
      address: address || '100 Premier Boulevard',
      city,
      state,
      category,
      categoryLabel: plan === 'HABIBI' ? 'Plan 1 · HABIBI Luxury Estate' : 'Plan 2 · DUBAJ Signature Asset',
      imageUrl,
      sharePrice,
      totalShares,
      sharesRemaining: totalShares,
      totalValuation,
      projectedIRR,
      netRentalYield,
      projectedAppreciation,
      occupancyRate: 95,
      status: 'funding',
      bedrooms,
      bathrooms,
      sqft,
      yearBuilt: 2024,
      monthlyDividendPerShare: parseFloat(monthlyDividendPerShare.toFixed(3)),
      dailyReturnKsh: plan === 'HABIBI' ? 300 : 500,
      periodDays: plan === 'HABIBI' ? 60 : 72,
      leaseType: plan === 'HABIBI' ? 'Superhost Luxury Hospitality Lease' : 'Institutional Triple-Net Corporate Lease',
      propertyManager: {
        name: plan === 'HABIBI' ? 'Habibi Hospitality Asset Group' : 'H&D Chase Global Realty',
        experienceYears: 16,
        unitsManaged: 850,
        rating: 4.95,
      },
      highlights: [
        `Underwritten exclusively for Plan ${plan} fractional ownership`,
        'High occupancy historical verified pro-forma',
        'Independent appraisal report on file',
        'Direct monthly rental distributions to token holders'
      ],
      financials: {
        purchasePrice: Math.round(totalValuation * 0.88),
        renovations: Math.round(totalValuation * 0.04),
        reserveFund: Math.round(totalValuation * 0.05),
        closingFees: Math.round(totalValuation * 0.03),
        totalOffering: totalValuation,
        monthlyGrossRent,
        propertyManagementFeePct: 10,
        maintenanceReservePct: 5,
        insuranceAndTaxesMonthly: Math.round(monthlyGrossRent * 0.20),
        monthlyNetOperatingIncome: Math.round(monthlyGrossRent * 0.65),
        projectedAnnualCashDistribution: Math.round(monthlyGrossRent * 0.65 * 12),
      },
      documents: [
        { name: `SEC Form 1-A Offering Circular (Plan ${plan})`, type: 'Offering Circular', date: new Date().toISOString().split('T')[0], fileSize: '3.2 MB' },
        { name: 'Certified Fair Market Appraisal Report', type: 'Appraisal Report', date: new Date().toISOString().split('T')[0], fileSize: '4.5 MB' },
        { name: 'Delaware Series LLC Operating Agreement', type: 'Operating Agreement', date: new Date().toISOString().split('T')[0], fileSize: '1.6 MB' },
      ]
    };

    addPropertyOffering(newPropertyData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
              ADD
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">List New Property Offering</h3>
              <div className="text-[11px] text-slate-500">Configure fractional asset under Plan 1 (HABIBI) or Plan 2 (DUBAJ)</div>
            </div>
          </div>
          <button
            onClick={() => setIsAddPropertyModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Plan Selection */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block font-bold text-slate-800 mb-2">Assign Investment Plan:</label>
            <div className="grid grid-cols-2 gap-3">
              <label 
                className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ${
                  plan === 'HABIBI' ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold' : 'bg-white border-slate-200 text-slate-600'
                }`}
                onClick={() => setPlan('HABIBI')}
              >
                <div>
                  <div className="font-bold">Plan 1: HABIBI</div>
                  <div className="text-[11px] font-normal text-slate-500">High-Yield Vacation & Cash Flow</div>
                </div>
                <input type="radio" checked={plan === 'HABIBI'} onChange={() => setPlan('HABIBI')} className="accent-amber-600" />
              </label>

              <label 
                className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ${
                  plan === 'DUBAJ' ? 'bg-sky-50 border-sky-500 text-sky-950 font-bold' : 'bg-white border-slate-200 text-slate-600'
                }`}
                onClick={() => setPlan('DUBAJ')}
              >
                <div>
                  <div className="font-bold">Plan 2: DUBAJ</div>
                  <div className="text-[11px] font-normal text-slate-500">Trophy Skyline & Capital Growth</div>
                </div>
                <input type="radio" checked={plan === 'DUBAJ'} onChange={() => setPlan('DUBAJ')} className="accent-sky-600" />
              </label>
            </div>
          </div>

          {/* Title & Headline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Property Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. The Palm Jumeirah Sky Villa"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Marketing Headline</label>
              <input
                type="text"
                placeholder="e.g. Ultra-Luxury Waterfront Villa with Private Dock"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          {/* Location & Category */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">City *</label>
              <input
                type="text"
                required
                placeholder="e.g. Miami Beach"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">State / Region</label>
              <input
                type="text"
                placeholder="e.g. FL or UAE"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Asset Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PropertyCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
              >
                <option value="vacation_rental">Vacation Rental</option>
                <option value="single_family">Single Family</option>
                <option value="multi_family">Multi-Family Duplex</option>
                <option value="commercial_lofts">Mixed-Use Lofts & Commercial</option>
              </select>
            </div>
          </div>

          {/* Financials & Shares */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h4 className="font-bold text-slate-900">Capital Structure & Return Projections</h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Share Price ($)</label>
                <input
                  type="number"
                  min="20"
                  step="5"
                  value={sharePrice}
                  onChange={(e) => setSharePrice(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Total Shares</label>
                <input
                  type="number"
                  min="1000"
                  step="500"
                  value={totalShares}
                  onChange={(e) => setTotalShares(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Net Rental Yield (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={netRentalYield}
                  onChange={(e) => setNetRentalYield(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Target IRR (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={projectedIRR}
                  onChange={(e) => setProjectedIRR(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
              <span className="text-slate-500">Calculated Total Valuation:</span>
              <strong className="font-mono text-slate-900 text-sm">${totalValuation.toLocaleString()} USD</strong>
            </div>
          </div>

          {/* Photo Preset Selector */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Select Property Architectural Photograph</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { url: '/src/assets/images/property_habibi_oasis_1792321199399.jpg', label: 'Habibi Desert Oasis' },
                { url: '/src/assets/images/property_dubaj_tower_1792321199611.jpg', label: 'Dubaj Marina Tower' },
                { url: '/src/assets/images/property_miami_villa_1792320591155.jpg', label: 'Miami Luxury Villa' },
                { url: '/src/assets/images/property_austin_home_1792320590968.jpg', label: 'Austin Craftsman' },
              ].map((img, i) => (
                <div
                  key={i}
                  onClick={() => setImageUrl(img.url)}
                  className={`rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                    imageUrl === img.url ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-16 object-cover" />
                  <div className="p-1 text-[10px] text-center font-medium truncate">{img.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddPropertyModalOpen(false)}
              className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-2 py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              Publish Property Offering
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
