import React, { useState } from 'react';
import { Sparkles, AlertTriangle, ArrowRight, ShieldCheck, Stethoscope, CheckCircle2, Phone, MapPin, Pill } from 'lucide-react';
import { AiSuggestResponse, Medicine } from '../types';

interface AiSymptomAdvisorProps {
  onSelectMedicine: (medicine: Medicine) => void;
}

export const AiSymptomAdvisor: React.FC<AiSymptomAdvisorProps> = ({ onSelectMedicine }) => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiSuggestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const quickPrompts = [
    'Severe throbbing headache with high fever',
    'Heartburn and acid reflux after meals',
    'Dry persistent cough, sneezing, and runny nose',
    'Severe acute asthma wheeze and shortness of breath',
    'Watery diarrhea, vomiting, and extreme dehydration risk'
  ];

  const handleSubmit = async (queryText?: string) => {
    const textToSubmit = queryText || symptoms;
    if (!textToSubmit.trim()) return;

    setLoading(true);
    setError(null);
    if (queryText) setSymptoms(queryText);

    try {
      const res = await fetch('/api/ai/suggest/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: textToSubmit })
      });

      if (!res.ok) {
        throw new Error('Failed to evaluate clinical guidance');
      }

      const data: AiSuggestResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to symptom intelligence service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-900 via-emerald-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Clinical Rule Engine & Stock Matcher</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            AI Symptom & Medicine Finder
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100 mt-2 leading-relaxed">
            Describe your current symptoms or illness in plain language (English or Somali). Our system analyzes standard clinical guidelines, suggests safe over-the-counter remedies, and instantly connects you to nearby pharmacies that currently have stock.
          </p>
        </div>
      </div>

      {/* Input Box */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Describe what you are feeling:
        </label>
        
        <div className="relative mb-3">
          <textarea
            rows={3}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="E.g., I have been experiencing a throbbing headache, muscle fever, and mild dizziness since yesterday morning..."
            className="w-full p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm leading-relaxed"
          />
        </div>

        {/* Quick prompt buttons */}
        <div className="mb-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Quick Sample Queries:</p>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSubmit(prompt)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-400">
            Confidential & Anonymous. Evaluated against OTC clinical criteria.
          </span>

          <button
            onClick={() => handleSubmit()}
            disabled={loading || !symptoms.trim()}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing Symptoms...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze & Find Medicine
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results View */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Safety Flags Warning */}
          {result.safetyFlags && result.safetyFlags.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <div className="flex items-start gap-3 text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-xs">Important Clinical Triage Flags:</h4>
                  {result.safetyFlags.map((flag, idx) => (
                    <p key={idx} className="text-xs leading-relaxed">{flag}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recommendations Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">
              Recommended Medications & Live Stock Match
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {result.recommendations.length} clinical match{result.recommendations.length === 1 ? '' : 'es'}
            </span>
          </div>

          {/* Recommendations Cards */}
          <div className="space-y-4">
            {result.recommendations.map((rec, i) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-emerald-300 transition-all">
                
                {/* Header & Urgency Badge */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xl font-extrabold text-slate-900">{rec.medicine.name}</h4>
                      {rec.medicine.prescriptionRequired ? (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          Prescription Needed
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Over The Counter (OTC)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Active Ingredient: {rec.medicine.genericName}</p>
                  </div>

                  <button
                    onClick={() => onSelectMedicine(rec.medicine)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Pill className="w-3.5 h-3.5" />
                    Full Medication Card
                  </button>
                </div>

                {/* Rationale & Advice */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-xs">
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
                    <p className="font-bold text-emerald-900 mb-1">Clinical Rationale:</p>
                    <p className="text-emerald-800 leading-relaxed">{rec.rationale}</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                    <p className="font-bold text-slate-700 mb-1">Practical Advice:</p>
                    <p className="text-slate-600 leading-relaxed">{rec.advice}</p>
                  </div>
                </div>

                {/* Nearby Pharmacies with Live Stock */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-800">
                      Verified Pharmacies With Stock Right Now:
                    </p>
                    <span className="text-[11px] font-semibold text-emerald-700">
                      {rec.availablePharmaciesCount} Locations
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {rec.pharmacies.length > 0 ? (
                      rec.pharmacies.map((ph, idx) => (
                        <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-900">{ph.pharmacyName}</p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {ph.district}, {ph.city}
                            </p>
                            <p className="text-[11px] font-semibold text-emerald-700 mt-1">
                              ${ph.priceUSD.toFixed(2)} / pack ({ph.quantity} left)
                            </p>
                          </div>

                          <a
                            href={`tel:${ph.phone}`}
                            className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-emerald-300 rounded-lg text-slate-700 hover:text-emerald-700 text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            Call
                          </a>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic col-span-2">
                        Currently out of stock in nearest partner pharmacies. You can set a restock watch.
                      </p>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="p-4 bg-slate-100 rounded-2xl text-[11px] text-slate-500 leading-relaxed border border-slate-200">
            {result.disclaimer}
          </div>

        </div>
      )}

    </div>
  );
};
