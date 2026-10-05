import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, RefreshCw, PackagePlus, DollarSign } from 'lucide-react';
import { User } from '../types';

interface PharmacyPortalProps {
  currentUser: User | null;
}

export const PharmacyPortal: React.FC<PharmacyPortalProps> = ({ currentUser }) => {
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [editingStock, setEditingStock] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form states
  const [newMedSlug, setNewMedSlug] = useState('');
  const [newQty, setNewQty] = useState(50);
  const [newPrice, setNewPrice] = useState('2.50');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchStock = () => {
    setLoading(true);
    const pharmacyId = currentUser?.pharmacyId || 'pharma-1';
    fetch(`/api/pharmacy/stocks/?pharmacyId=${pharmacyId}`)
      .then(res => res.json())
      .then(data => {
        setStocks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStock();
    fetch('/api/medicines/')
      .then(res => res.json())
      .then(data => setMedicines(data));
  }, [currentUser]);

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStock) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/pharmacy/stocks/${editingStock.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: editingStock.quantity,
          priceUSD: editingStock.priceUSD
        })
      });

      if (res.ok) {
        setStatusMessage('Stock successfully updated!');
        setEditingStock(null);
        fetchStock();
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedSlug) return;
    setIsSubmitting(true);

    try {
      const pharmacyId = currentUser?.pharmacyId || 'pharma-1';
      const res = await fetch('/api/pharmacy/stocks/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pharmacyId,
          medicineSlug: newMedSlug,
          quantity: newQty,
          priceUSD: parseFloat(newPrice)
        })
      });

      if (res.ok) {
        setStatusMessage('New medication stock registered!');
        setShowAddModal(false);
        fetchStock();
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this medication from your pharmacy stock listing?')) return;
    try {
      await fetch(`/api/pharmacy/stocks/${id}/`, { method: 'DELETE' });
      fetchStock();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {currentUser?.name || 'Pharmacy Dispensary Portal'}
              </h1>
              <p className="text-xs text-slate-500">Live Inventory Management & Price Control</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStock}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh inventory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              if (medicines.length > 0) setNewMedSlug(medicines[0].slug);
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Medication To Inventory
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Stock Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Current Stock Items ({stocks.length})</h2>
          <span className="text-xs text-slate-500">Auto-synced with public search and AI symptom locator</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading stock items...
          </div>
        ) : stocks.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No stock records found. Click "Add Medication To Inventory" to add items.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Medication Name</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Available Qty</th>
                  <th className="py-3 px-4">Unit Price (USD)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stocks.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {item.medicine?.name || item.medicineSlug}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.prescriptionRequired ? (
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-medium">Rx Only</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium">OTC</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {item.quantity} units
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      ${item.priceUSD?.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.status === 'in_stock' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          In Stock
                        </span>
                      ) : item.status === 'low_stock' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(item.lastUpdated).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingStock({ ...item })}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-300 transition-colors"
                          title="Edit quantity and price"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Update Stock: {editingStock.medicine?.name || editingStock.medicineSlug}
            </h3>
            <p className="text-xs text-slate-500 mb-4">Modify stock count and retail customer price.</p>

            <form onSubmit={handleUpdateStock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Units In Stock</label>
                <input
                  type="number"
                  min="0"
                  value={editingStock.quantity}
                  onChange={(e) => setEditingStock({ ...editingStock, quantity: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Retail Price (USD)</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  value={editingStock.priceUSD}
                  onChange={(e) => setEditingStock({ ...editingStock, priceUSD: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStock(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Add Medication to Pharmacy Stock
            </h3>
            <p className="text-xs text-slate-500 mb-4">Select medicine and provide inventory count.</p>

            <form onSubmit={handleAddStock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Medication</label>
                <select
                  value={newMedSlug}
                  onChange={(e) => setNewMedSlug(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {medicines.map(m => (
                    <option key={m.slug} value={m.slug}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={newQty}
                  onChange={(e) => setNewQty(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Price in USD</label>
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                >
                  Add Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
