import React, { useState } from 'react';
import { Property } from '../types';
import { useInvestment } from '../context/InvestmentContext';
import { 
  X, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  FileText, 
  Download, 
  Percent, 
  CheckCircle2, 
  Coins
} from 'lucide-react';

interface PropertyDetailModalProps {
  property: Property;
  onClose: () => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({ property, onClose }) => {
  const { setSelectedPropertyForInvest, setActiveTab } = useInvestment();
  const [activeTab, setActiveDetailTab] = useState<'overview' | 'financials' | 'calculator' | 'documents'>('overview');
  const [calcShares, setCalcShares] = useState<number>(10);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const totalCalculatedInvestment = calcShares * property.sharePrice;
  const calculatedMonthlyDividend = calcShares * property.monthlyDividendPerShare;
  const calculatedAnnualDividend = calculatedMonthlyDividend * 12;
  const calculated5YearAppreciation = totalCalculatedInvestment * Math.pow(1 + property.projectedAppreciation / 100, 5) - totalCalculatedInvestment;
  const calculated5YearTotalReturn = (calculatedAnnualDividend * 5) + calculated5YearAppreciation;

  const handleSimulatedDownload = (docName: string) => {
    setDownloadSuccess(docName);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const isHabibi = property.plan === 'HABIBI';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                isHabibi ? 'bg-amber-100 text-amber-900' : 'bg-sky-100 text-sky-900'
              }`}>
                {isHabibi ? 'Plan 1: HABIBI' : 'Plan 2: DUBAJ'}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {property.address}, {property.city}, {property.state}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{property.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-white">
          <button
            onClick={() => setActiveDetailTab('overview')}
            className={`pb-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Property Overview
          </button>
          <button
            onClick={() => setActiveDetailTab('financials')}
            className={`pb-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'financials'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Financial Pro-Forma & Waterfall
          </button>
          <button
            onClick={() => setActiveDetailTab('calculator')}
            className={`pb-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'calculator'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Yield & Return Calculator
          </button>
          <button
            onClick={() => setActiveDetailTab('documents')}
            className={`pb-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'documents'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            SEC Disclosures & Due Diligence ({property.documents.length})
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Image Banner */}
              <div className="relative aspect-16/9 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={property.imageUrl}
                  alt={property.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                  {property.headline}
                </div>
              </div>

              {/* Key Quantitative Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <div className="text-xs text-slate-500 font-medium">Share Price</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                    ${property.sharePrice.toFixed(0)}
                  </div>
                  <div className="text-[11px] text-slate-400">Total Shares: {property.totalShares.toLocaleString()}</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <div className="text-xs text-slate-500 font-medium">Net Rental Yield</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-0.5">
                    {property.netRentalYield.toFixed(1)}%
                  </div>
                  <div className="text-[11px] text-slate-400">Paid monthly into wallet</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <div className="text-xs text-slate-500 font-medium">Projected IRR</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                    {property.projectedIRR.toFixed(1)}%
                  </div>
                  <div className="text-[11px] text-slate-400">Total annualized return</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <div className="text-xs text-slate-500 font-medium">Total Asset Value</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                    ${property.totalValuation.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400">Unleveraged equity owned</div>
                </div>
              </div>

              {/* Physical Specifications */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Architectural & Property Specifications</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Bedrooms / Baths</span>
                    <span className="font-semibold text-slate-800 font-mono tabular-nums">
                      {property.bedrooms} Beds / {property.bathrooms} Baths
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Finished Area</span>
                    <span className="font-semibold text-slate-800 font-mono tabular-nums">
                      {property.sqft.toLocaleString()} sq ft
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Year Built</span>
                    <span className="font-semibold text-slate-800 font-mono tabular-nums">
                      {property.yearBuilt}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Occupancy & Lease</span>
                    <span className="font-semibold text-emerald-700 font-mono tabular-nums">
                      {property.occupancyRate}% ({property.leaseType})
                    </span>
                  </div>
                </div>
              </div>

              {/* Investment Highlights */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900">Investment Thesis & Asset Highlights</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {property.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financials' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Capital Offering Breakdown</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs mt-3">
                  <div className="flex justify-between p-3 bg-slate-50 font-semibold text-slate-700">
                    <span>Component</span>
                    <span>Amount (USD)</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-slate-600">Contract Acquisition Price</span>
                    <span className="font-mono tabular-nums font-medium">${property.financials.purchasePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-slate-600">Initial Modernization & Fixtures</span>
                    <span className="font-mono tabular-nums font-medium">${property.financials.renovations.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-slate-600">Dedicated Maintenance & Cash Reserve</span>
                    <span className="font-mono tabular-nums font-medium">${property.financials.reserveFund.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-slate-600">Legal, Title, SEC Sponsoring & Escrow Fees</span>
                    <span className="font-mono tabular-nums font-medium">${property.financials.closingFees.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-100 font-bold text-slate-900">
                    <span>Total Fractional Offering Capital</span>
                    <span className="font-mono tabular-nums">${property.financials.totalOffering.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Monthly Cash Flow Waterfall</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs mt-3">
                  <div className="flex justify-between p-3 bg-slate-50 font-semibold text-slate-700">
                    <span>Cash Flow Line Item</span>
                    <span>Monthly</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-slate-600 font-medium">Gross Rental Revenue (Contracted)</span>
                    <span className="font-mono tabular-nums text-emerald-700 font-semibold">+${property.financials.monthlyGrossRent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-slate-600">Property Management ({property.financials.propertyManagementFeePct}%)</span>
                    <span className="font-mono tabular-nums text-slate-600">-${Math.round(property.financials.monthlyGrossRent * (property.financials.propertyManagementFeePct / 100)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-slate-600">Maintenance Reserve Provision ({property.financials.maintenanceReservePct}%)</span>
                    <span className="font-mono tabular-nums text-slate-600">-${Math.round(property.financials.monthlyGrossRent * (property.financials.maintenanceReservePct / 100)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-slate-600">Property Taxes, Hazard & Liability Insurance</span>
                    <span className="font-mono tabular-nums text-slate-600">-${property.financials.insuranceAndTaxesMonthly.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-emerald-50 text-emerald-950 font-bold">
                    <span>Net Operating Income (Distributed to Investors)</span>
                    <span className="font-mono tabular-nums">+${property.financials.monthlyNetOperatingIncome.toLocaleString()} / mo</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-50 font-bold text-slate-900">
                    <span>Projected Dividend Per Share</span>
                    <span className="font-mono tabular-nums font-semibold text-emerald-700">
                      ${property.monthlyDividendPerShare.toFixed(3)} / month (${(property.monthlyDividendPerShare * 12).toFixed(2)}/yr)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calculator' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-900">
                    Number of Fractional Shares:
                  </span>
                  <span className="font-mono tabular-nums text-base font-bold text-emerald-700">
                    {calcShares} share{calcShares > 1 ? 's' : ''} (${totalCalculatedInvestment.toLocaleString()})
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max={Math.min(200, property.sharesRemaining || 200)}
                  value={calcShares}
                  onChange={(e) => setCalcShares(parseInt(e.target.value) || 1)}
                  className="w-full accent-slate-900 cursor-pointer"
                />

                <div className="flex items-center gap-2 mt-3">
                  {[1, 5, 10, 25, 50, 100].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setCalcShares(preset)}
                      className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                        calcShares === preset
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset} shares (${preset * property.sharePrice})
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white border border-slate-200 p-4 rounded-xl">
                  <div className="text-xs text-slate-500 font-medium">Monthly Rental Dividend</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
                    ${calculatedMonthlyDividend.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    ${calculatedAnnualDividend.toFixed(2)} / year
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-xl">
                  <div className="text-xs text-slate-500 font-medium">5-Year Equity Growth</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                    +${Math.round(calculated5YearAppreciation).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Property appreciation
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-4 rounded-xl">
                  <div className="text-xs text-slate-300 font-medium">5-Year Total Return</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
                    ${Math.round(totalCalculatedInvestment + calculated5YearTotalReturn).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Initial + Dividends + Growth
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Every property on H&D CHASE PLATFORM is held in an isolated Series LLC under SEC Form 1-A qualified regulations.
              </p>

              {downloadSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Downloaded verified document: <strong>{downloadSuccess}</strong></span>
                </div>
              )}

              <div className="space-y-2">
                {property.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{doc.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {doc.type} · Filed {doc.date} · {doc.fileSize}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSimulatedDownload(doc.name)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-200/80 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="text-xs text-slate-500">
            Investment Plan: <strong className="text-slate-900 font-bold">Plan {property.plan}</strong> · Capital: <strong className="font-mono">KSh {property.sharePrice.toLocaleString()}</strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Close
            </button>

            {property.status === 'funded' ? (
              <button
                onClick={() => {
                  onClose();
                  setActiveTab('marketplace');
                }}
                className="px-5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              >
                Fully Subscribed · Explore Active Plans
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  setSelectedPropertyForInvest(property);
                }}
                className={`px-5 py-2 text-xs font-semibold text-white rounded-lg transition-colors whitespace-nowrap shadow-xs ${
                  isHabibi ? 'bg-amber-600 hover:bg-amber-700' : 'bg-sky-700 hover:bg-sky-800'
                }`}
              >
                Invest in Plan {property.plan}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
