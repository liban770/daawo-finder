import React from 'react';
import { Pill, Building2, Heart, AlertCircle, CheckCircle, ChevronRight, ShieldAlert, Sparkles } from 'lucide-react';
import { Medicine } from '../types';

interface MedicineCardProps {
  medicine: Medicine;
  isFavorite: boolean;
  onToggleFavorite: (slug: string) => void;
  onSelect: (medicine: Medicine) => void;
  onWatchStock: (medicine: Medicine) => void;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({
  medicine,
  isFavorite,
  onToggleFavorite,
  onSelect,
  onWatchStock
}) => {
  const isInStock = medicine.totalInStock > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between group">
      <div className="p-5">
        
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            {medicine.category?.name || 'General Health'}
          </span>

          <div className="flex items-center gap-1.5">
            {medicine.prescriptionRequired ? (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-amber-600" />
                Rx Required
              </span>
            ) : (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                OTC
              </span>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(medicine.slug);
              }}
              title={isFavorite ? "Remove from saved" : "Save medicine"}
              className={`p-1.5 rounded-full transition-colors ${
                isFavorite 
                  ? 'bg-rose-50 text-rose-600' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 stroke-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Medicine Name & Generic */}
        <div className="cursor-pointer" onClick={() => onSelect(medicine)}>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
            {medicine.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
            Active: {medicine.genericName}
          </p>

          {/* Brand names pills */}
          <div className="flex flex-wrap gap-1 mt-2.5">
            {medicine.brandNames.map((brand, idx) => (
              <span key={idx} className="text-[11px] bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                {brand}
              </span>
            ))}
          </div>

          {/* Indications snippet */}
          <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
            {medicine.indications}
          </p>
        </div>

      </div>

      {/* Card Footer: Stock & Pricing */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
        <div>
          {isInStock ? (
            <div>
              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>In Stock at {medicine.pharmacyCount} {medicine.pharmacyCount === 1 ? 'pharmacy' : 'pharmacies'}</span>
              </div>
              <p className="text-xs font-bold text-slate-900 mt-0.5">
                From ${medicine.minPrice?.toFixed(2)}
                {medicine.maxPrice && medicine.maxPrice > (medicine.minPrice || 0) && (
                  <span className="text-slate-500 font-normal text-[11px]"> - ${medicine.maxPrice.toFixed(2)}</span>
                )}
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-1 text-xs font-medium text-amber-700">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Temporarily Out of Stock</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onWatchStock(medicine);
                }}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline mt-0.5 block"
              >
                Notify me when back
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => onSelect(medicine)}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1 transition-all group-hover:translate-x-0.5"
        >
          View Stock
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
