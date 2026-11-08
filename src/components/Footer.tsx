import React from 'react';
import { useInvestment } from '../context/InvestmentContext';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveTab } = useInvestment();

  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white font-black text-xs">
                H&D
              </span>
              <span className="font-bold text-slate-900 tracking-tight uppercase">H&D CHASE PLATFORM</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Institutional-grade fractional real estate investing structured through Plan 1 (HABIBI) and Plan 2 (DUBAJ). Transparent legal title and monthly dividend distributions.
            </p>
          </div>

          {/* Investment Plans */}
          <div className="space-y-2 text-xs">
            <div className="font-bold text-slate-900">Investment Plans</div>
            <ul className="space-y-1.5 text-slate-600">
              <li>
                <button onClick={() => setActiveTab('marketplace')} className="hover:text-slate-900 transition-colors">
                  Plan 1: HABIBI (High-Yield Cash Flow)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('marketplace')} className="hover:text-slate-900 transition-colors">
                  Plan 2: DUBAJ (Signature Skyline Growth)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('portfolio')} className="hover:text-slate-900 transition-colors">
                  Personalized Portfolio Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Structure */}
          <div className="space-y-2 text-xs">
            <div className="font-bold text-slate-900">Governance & Custody</div>
            <ul className="space-y-1.5 text-slate-600">
              <li>Delaware & Global Series LLC Structure</li>
              <li>SEC Form 1-A Reg A+ Tier 2 Qualified</li>
              <li>Evolve Bank & Trust (FDIC Escrow Account)</li>
              <li>Independent Knight Frank & CBRE Appraisals</li>
            </ul>
          </div>

          {/* Security & Compliance */}
          <div className="space-y-2 text-xs">
            <div className="font-bold text-slate-900">Compliance</div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-900 font-semibold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>FINRA / SIPC Registered Custody</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                All investor funds are kept in isolated bankruptcy-remote custodian accounts prior to property settlement.
              </p>
            </div>
          </div>
        </div>

        {/* Regulatory Disclaimers */}
        <div className="border-t border-slate-200 pt-6 text-[11px] text-slate-400 space-y-2 leading-relaxed">
          <p>
            Disclaimer: Fractional real estate investments carry risk including the potential loss of principal. Projections, rental dividend yields, and target IRRs for Plan 1 (HABIBI) and Plan 2 (DUBAJ) are modeled from verified historical tenant leases and appraisals. Past performance does not guarantee future results.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-2 text-slate-500">
            <span>© {new Date().getFullYear()} H&D CHASE PLATFORM Technologies LLC. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span aria-hidden="true">·</span>
              <span>Terms of Service</span>
              <span aria-hidden="true">·</span>
              <span>SEC Reg A+ Circular</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
