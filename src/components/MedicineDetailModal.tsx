import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Phone, MapPin, Clock, Star, Heart, Bell, ShieldAlert, Sparkles, Send } from 'lucide-react';
import { Medicine, Review, User } from '../types';

interface MedicineDetailModalProps {
  slug: string | null;
  onClose: () => void;
  currentUser: User | null;
  isFavorite: boolean;
  onToggleFavorite: (slug: string) => void;
  onWatchStock: (medicine: Medicine) => void;
}

export const MedicineDetailModal: React.FC<MedicineDetailModalProps> = ({
  slug,
  onClose,
  currentUser,
  isFavorite,
  onToggleFavorite,
  onWatchStock
}) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/medicines/${slug}/`)
      .then(res => res.json())
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  if (!slug) return null;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/medicines/${slug}/review/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment,
          name: currentUser?.name || 'Community Patient'
        })
      });

      if (res.ok) {
        const newRev = await res.json();
        setData((prev: any) => ({
          ...prev,
          reviews: [newRev, ...(prev.reviews || [])]
        }));
        setComment('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {loading || !data ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-xs text-slate-500">Loading comprehensive medicine data & pharmacy stocks...</p>
          </div>
        ) : (
          <div>
            {/* Header banner */}
            <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 text-white p-6 relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 text-white">
                  {data.category?.name || 'Healthcare'}
                </span>

                {data.prescriptionRequired ? (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-400 text-slate-950 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Doctor Prescription Required
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-400 text-slate-950">
                    Over-the-Counter (OTC)
                  </span>
                )}
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-white">{data.name}</h2>
                  <p className="text-xs text-emerald-100 mt-1 font-mono">Active Molecule: {data.genericName}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onToggleFavorite(data.slug)}
                    className={`p-2 rounded-xl transition-all ${
                      isFavorite 
                        ? 'bg-rose-500 text-white shadow-md' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                    title={isFavorite ? "Remove from saved" : "Save medicine"}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => onWatchStock(data)}
                    className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                    title="Stock alert notifications"
                  >
                    <Bell className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Brand Pills */}
              <div className="flex flex-wrap items-center gap-1.5 mt-4">
                <span className="text-xs text-emerald-200">Commercial Brands:</span>
                {data.brandNames?.map((b: string, i: number) => (
                  <span key={i} className="text-xs bg-white/15 px-2 py-0.5 rounded-full font-medium">
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Content Tabs / Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              
              {/* Pharmacology Brief */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Therapeutic Indications</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">{data.indications}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Standard Dosage & Guidelines</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">{data.dosage}</p>
                </div>
              </div>

              {/* Additional Specs */}
              <div className="p-4 bg-amber-50/70 border border-amber-200/60 rounded-2xl text-xs text-amber-900 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Precautions & Known Side Effects:</span>
                </div>
                <p className="pl-5 leading-relaxed">{data.sideEffects}</p>
                <div className="pl-5 pt-1 text-[11px] text-amber-700">
                  <strong>Available dosage forms:</strong> {data.forms?.join(', ')} | <strong>Storage:</strong> {data.storage}
                </div>
              </div>

              {/* Verified Pharmacy Stock Locator */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Verified Pharmacy Availability</h3>
                    <p className="text-xs text-slate-500">Live prices and stock levels in nearby verified dispensaries</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                    {data.stocks?.filter((s: any) => s.quantity > 0).length || 0} Locations In Stock
                  </span>
                </div>

                <div className="space-y-2.5">
                  {data.stocks && data.stocks.length > 0 ? (
                    data.stocks.map((stock: any) => {
                      const ph = stock.pharmacy;
                      const hasStock = stock.quantity > 0;
                      return (
                        <div 
                          key={stock.id}
                          className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                            hasStock ? 'bg-white border-slate-200 hover:border-emerald-300' : 'bg-slate-50 border-slate-200 opacity-60'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-900">{ph?.name || 'Pharmacy Partner'}</h4>
                              {ph?.verified && (
                                <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded">
                                  Verified
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {ph?.district}, {ph?.city}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {ph?.hours}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">{ph?.address}</p>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0">
                            <div className="text-right">
                              <p className="text-base font-extrabold text-slate-900">${stock.priceUSD.toFixed(2)}</p>
                              <p className="text-[11px] font-medium text-emerald-600">
                                {hasStock ? `${stock.quantity} packs available` : 'Out of stock'}
                              </p>
                            </div>

                            <a
                              href={`tel:${ph?.phone}`}
                              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Call {ph?.phone}</span>
                            </a>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                      No pharmacy has listed this medication in this area yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews & Patient Experiences */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Patient Experiences & Reviews</h3>
                    <p className="text-xs text-slate-500">Verified feedback on efficacy and availability</p>
                  </div>
                  {data.avgRating && (
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{data.avgRating} / 5.0</span>
                    </div>
                  )}
                </div>

                {/* Add review form */}
                <form onSubmit={handleReviewSubmit} className="mb-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-700 mb-2">Leave a review for other patients:</p>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 focus:outline-hidden"
                      >
                        <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                    <span className="text-xs text-slate-500 ml-2 font-medium">{rating} of 5 stars</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience (e.g. onset of action, pharmacy stock experience)..."
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingReview || !comment.trim()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Post
                    </button>
                  </div>
                </form>

                {/* Review items */}
                <div className="space-y-2.5">
                  {data.reviews && data.reviews.length > 0 ? (
                    data.reviews.map((r: Review) => (
                      <div key={r.id} className="p-3.5 bg-white rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900">{r.name}</span>
                          <div className="flex items-center gap-0.5">
                            {[...Array(r.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic text-center py-2">No reviews yet. Be the first to share your experience!</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
