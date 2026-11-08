import React, { useState } from 'react';
import { Property } from '../types';
import { useInvestment } from '../context/InvestmentContext';
import { Building2, ArrowUpRight, Bed, Bath, Maximize2, Coins, Calendar, RefreshCw, Lock } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const { setSelectedPropertyForDetail, setSelectedPropertyForInvest, hasActiveSubscription, activeSubscription } = useInvestment();
  const [imageFailed, setImageFailed] = useState(false);

  const fundedPercentage = Math.min(
    100,
    Math.round(((property.totalShares - property.sharesRemaining) / property.totalShares) * 100)
  );

  const isHabibi = property.plan === 'HABIBI';
  const dailyReturn = isHabibi ? 300 : 500;
  const periodDays = isHabibi ? 60 : 72;
  const totalReturn = dailyReturn * periodDays;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-all flex flex-col h-full shadow-xs">
      {/* Property Visual Showcase */}
      <div 
        className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden cursor-pointer group"
        onClick={() => setSelectedPropertyForDetail(property)}
      >
        {!imageFailed ? (
          <img
            src={property.imageUrl}
            alt={property.title}
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500">
            <Building2 className="w-12 h-12 text-slate-400 mb-2" />
            <span className="text-xs font-medium text-slate-600">{property.title}</span>
            <span className="text-[11px] text-slate-400">{property.city}, {property.state}</span>
          </div>
        )}

        {/* Plan Identification Banner */}
        <div className={`absolute top-3 left-3 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1.5 ${
          isHabibi ? 'bg-amber-600/95 text-slate-950 font-black' : 'bg-sky-800/95 font-black'
        }`}>
          <span>{isHabibi ? 'Plan 1: HABIBI (60d)' : 'Plan 2: DUBAJ (72d)'}</span>
        </div>

        {/* Quick view button overlay */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1">
          <span>View Details</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Zero-Pill Unboxed Text Metadata */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 flex-wrap">
          <span className="font-bold text-slate-900">Plan {property.plan}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>{property.city}, {property.state}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>{property.occupancyRate}% Occupancy</span>
        </div>

        {/* Title */}
        <h3 
          onClick={() => setSelectedPropertyForDetail(property)}
          className="text-base font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors line-clamp-1 mb-1"
        >
          {property.title}
        </h3>

        <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
          {property.headline}
        </p>

        {/* Financial Metrics Strip */}
        <div className="grid grid-cols-3 gap-2 mb-4 bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
          <div>
            <div className="text-[10px] text-slate-500 font-medium">Capital</div>
            <div className="font-mono tabular-nums font-bold text-slate-900 text-xs">
              KSh {property.sharePrice.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400">{periodDays} Days</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium">Daily Return</div>
            <div className="font-mono tabular-nums font-bold text-emerald-700 text-xs">
              KSh {dailyReturn} / day
            </div>
            <div className="text-[10px] text-slate-400">Daily credit</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium">Total Return</div>
            <div className="font-mono tabular-nums font-bold text-amber-900 text-xs">
              KSh {totalReturn.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400">Re-investable</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 mt-auto">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-600 font-medium text-[11px]">
              KSh {((property.totalShares - property.sharesRemaining) * property.sharePrice).toLocaleString()} subscribed
            </span>
            <span className="font-mono tabular-nums text-slate-500 font-medium text-[11px]">
              {fundedPercentage}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isHabibi ? 'bg-amber-500' : 'bg-sky-600'
              }`}
              style={{ width: `${fundedPercentage}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => setSelectedPropertyForDetail(property)}
            className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap text-center"
          >
            Due Diligence
          </button>

          <button
            onClick={() => setSelectedPropertyForInvest(property)}
            className={`w-full py-2 px-3 text-xs font-bold rounded-lg transition-colors whitespace-nowrap text-center shadow-xs flex items-center justify-center gap-1.5 ${
              hasActiveSubscription
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                : isHabibi 
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black' 
                : 'bg-sky-700 hover:bg-sky-600 text-white font-black'
            }`}
          >
            {hasActiveSubscription ? (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Wait for Maturity ({activeSubscription?.daysRemaining}d)</span>
              </>
            ) : (
              <span>Invest KSh {property.sharePrice.toLocaleString()}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
