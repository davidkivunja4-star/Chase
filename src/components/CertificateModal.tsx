import React from 'react';
import { UserHolding, Property } from '../types';
import { X, Award, ShieldCheck, Printer, CheckCircle } from 'lucide-react';

interface CertificateModalProps {
  data: {
    holding: UserHolding;
    property: Property;
  };
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ data, onClose }) => {
  const { holding, property } = data;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-300 relative print:shadow-none print:border-none print:max-w-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-slate-50 print:hidden">
          <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Digital Share Certificate · Plan {property.plan} (SEC Reg A+)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Outer Border Frame */}
        <div className="p-8 sm:p-10 bg-radial from-amber-50/20 via-white to-slate-50 relative">
          <div className="border-2 border-slate-800 p-6 sm:p-8 rounded-lg relative">
            <div className="border border-slate-400 p-6 rounded-xs relative bg-white/70">
              {/* Corner Accents */}
              <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-slate-900" />
              <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-slate-900" />
              <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-slate-900" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-slate-900" />

              {/* Certificate Header */}
              <div className="text-center space-y-1 mb-6">
                <div className="text-[10px] tracking-widest text-slate-500 uppercase font-semibold">
                  Official Fractional Real Estate Title Deed
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
                  H&D CHASE PLATFORM
                </h1>
                <div className="text-xs text-slate-700 font-semibold">
                  Series LLC Protected Cell Company · Investment Plan: {property.plan === 'HABIBI' ? 'Plan 1 (HABIBI)' : 'Plan 2 (DUBAJ)'}
                </div>
              </div>

              {/* Certificate Number & Date Bar */}
              <div className="flex justify-between items-center text-xs border-y border-slate-200 py-2.5 mb-6 bg-slate-50/60 px-3">
                <div>
                  <span className="text-slate-500">Certificate No: </span>
                  <strong className="font-mono tabular-nums text-slate-900">{holding.certificateId}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Record Date: </span>
                  <strong className="font-mono tabular-nums text-slate-900">{holding.purchaseDate}</strong>
                </div>
              </div>

              {/* Main Legal Body */}
              <div className="text-center space-y-4 mb-6">
                <p className="text-xs text-slate-600 leading-relaxed">
                  This legally certifies that <strong>David Kivunja (Member #HDC-8942)</strong> holds beneficial fractional equity ownership interest of:
                </p>

                <div className="py-2">
                  <div className="text-3xl font-black font-mono tabular-nums text-slate-900">
                    {holding.shares.toLocaleString()} Fractional Membership Units
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Capital Par Value: KSh {property.sharePrice.toLocaleString()} per Unit · Plan: {property.plan === 'HABIBI' ? 'Plan 1 (HABIBI - 60d)' : 'Plan 2 (DUBAJ - 72d)'}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 max-w-md mx-auto text-left text-xs">
                  <div className="font-bold text-slate-900">{property.title}</div>
                  <div className="text-slate-600">{property.address}, {property.city}, {property.state}</div>
                  <div className="text-slate-400 text-[11px] mt-1">
                    Asset Class: {property.categoryLabel} · Series Cell: HDC-{property.id.toUpperCase()}
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed max-w-lg mx-auto">
                  The holder of these registered units is entitled to pro-rata monthly cash rental distributions, voting rights on designated property liquidations, and equity appreciation proceeds under the H&D CHASE PLATFORM Operating Agreement.
                </p>
              </div>

              {/* Signatures & Seal */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-end pt-4 border-t border-slate-200 text-xs">
                <div className="text-center">
                  <div className="font-serif italic text-base text-slate-800 pb-1 border-b border-slate-400">
                    H. & D. Chase
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                    Managing Principals
                  </div>
                </div>

                <div className="text-center flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-full border-2 border-emerald-700 border-dashed flex items-center justify-center bg-emerald-50 text-emerald-800 mb-1">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div className="text-[9px] text-emerald-800 font-bold uppercase tracking-wider">
                    Secured by Cryptographic Seal
                  </div>
                </div>

                <div className="text-center col-span-2 sm:col-span-1">
                  <div className="font-serif italic text-base text-slate-800 pb-1 border-b border-slate-400">
                    K. R. Alverez
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                    Authorized Transfer Agent
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between print:hidden">
          <span className="flex items-center gap-1 text-emerald-700 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            Verified H&D CHASE PLATFORM Title Registry
          </span>
          <span className="font-mono">Timestamp: {new Date().toISOString()}</span>
        </div>
      </div>
    </div>
  );
};
