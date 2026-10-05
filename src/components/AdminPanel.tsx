import React, { useState, useEffect } from 'react';
import { ShieldCheck, Bell, AlertTriangle, Users, Building2, Pill, Activity, CheckCircle2 } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [trends, setTrends] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [dispatchResult, setDispatchResult] = useState<any | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);

  useEffect(() => {
    fetch('/api/trends/')
      .then(res => res.json())
      .then(data => {
        setTrends(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSimulateNotifications = async () => {
    setIsDispatching(true);
    try {
      const res = await fetch('/api/stock/notify/', { method: 'POST' });
      const data = await res.json();
      setDispatchResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Superuser Operations Control</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">System & Stock Oversight Dashboard</h1>
          <p className="text-xs text-slate-300 mt-1">
            Network analytics, drug shortage surveillance, and notification dispatcher (matches manage.py notify_stock).
          </p>
        </div>

        <button
          onClick={handleSimulateNotifications}
          disabled={isDispatching}
          className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-colors shrink-0 disabled:opacity-50"
        >
          <Bell className="w-4 h-4" />
          {isDispatching ? 'Dispatching...' : 'Dispatch Restock Alerts'}
        </button>
      </div>

      {dispatchResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl animate-in fade-in">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Dispatched {dispatchResult.dispatchedCount} Restock Notifications</span>
          </div>
          {dispatchResult.notifications?.map((notif: any, i: number) => (
            <p key={i} className="text-xs text-emerald-700 mt-1 pl-6">
              To: <strong>{notif.email}</strong> — {notif.message}
            </p>
          ))}
          {dispatchResult.dispatchedCount === 0 && (
            <p className="text-xs text-emerald-700 pl-6">
              No pending watched medications met newly replenished stock criteria.
            </p>
          )}
        </div>
      )}

      {/* KPI Cards */}
      {trends && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase">Network Pharmacies</span>
              <Building2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{trends.totalPharmacies}</p>
            <p className="text-[11px] text-slate-500 mt-1">Mogadishu, Hargeisa, Garowe</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase">Cataloged Drugs</span>
              <Pill className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{trends.totalMedicines}</p>
            <p className="text-[11px] text-slate-500 mt-1">Essential formulary listings</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase">Available Units</span>
              <Activity className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{trends.totalStockUnits}</p>
            <p className="text-[11px] text-slate-500 mt-1">Across all registered stores</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase">Active Watches</span>
              <Bell className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{trends.activeWatchAlerts}</p>
            <p className="text-[11px] text-slate-500 mt-1">Patients awaiting replenishment</p>
          </div>
        </div>
      )}

      {/* Shortage Watch / Low Stock Warnings */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">Low Stock & Shortage Alerts</h3>
          </div>
          <span className="text-xs text-slate-400">Items with &lt; 15 units remaining</span>
        </div>

        {trends?.lowStockAlerts?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {trends.lowStockAlerts.map((alert: any) => (
              <div key={alert.stockId} className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{alert.medicineName}</p>
                  <p className="text-slate-500 text-[11px]">{alert.pharmacyName} ({alert.city})</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded font-bold bg-amber-200 text-amber-900 text-[11px]">
                    {alert.quantity} units left
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic py-2">No critical shortages currently flagged.</p>
        )}
      </div>

    </div>
  );
};
