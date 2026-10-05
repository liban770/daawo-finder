import React, { useState } from 'react';
import { Pill, Sparkles, MapPin, Heart, Building2, ShieldCheck, User, LogOut, ChevronDown, CheckCircle2 } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  currentUser: UserType | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLoginAs: (username: string) => void;
  onLogout: () => void;
  favoritesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onLoginAs,
  onLogout,
  favoritesCount
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => setActiveTab('medicines')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Pill className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">Daawo<span className="text-emerald-600">Finder</span></span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">Live</span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Medicine & Pharmacy Stock Network</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab('medicines')}
              className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'medicines'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Pill className="w-4 h-4" />
              Find Medicines
            </button>

            <button
              onClick={() => setActiveTab('ai-advisor')}
              className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'ai-advisor'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
              AI Symptom Advisor
            </button>

            <button
              onClick={() => setActiveTab('pharmacies')}
              className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'pharmacies'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Pharmacies
            </button>

            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'favorites'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Heart className="w-4 h-4" />
              Saved
              {favoritesCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-emerald-600 text-white text-[11px] rounded-full font-bold">
                  {favoritesCount}
                </span>
              )}
            </button>

            {currentUser?.role === 'pharmacy' && (
              <button
                onClick={() => setActiveTab('pharmacy-portal')}
                className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  activeTab === 'pharmacy-portal'
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Stock Portal
              </button>
            )}

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  activeTab === 'admin'
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Admin Dashboard
              </button>
            )}
          </nav>

          {/* User Account / Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-sm font-medium shadow-2xs hover:bg-slate-50 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                {currentUser ? currentUser.username[0].toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold leading-tight text-slate-900">
                  {currentUser ? currentUser.name : 'Guest User'}
                </p>
                <p className="text-[10px] text-slate-500 capitalize leading-tight">
                  {currentUser ? `${currentUser.role} account` : 'Switch Demo Role'}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-0.5" />
            </button>

            {/* Switcher Dropdown */}
            {showUserMenu && (
              <div 
                className="absolute right-0 mt-2 w-72 rounded-xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onMouseLeave={() => setShowUserMenu(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Switch Account Role</p>
                  <p className="text-xs text-slate-500 mt-0.5">Test Daawo Finder under different permissions</p>
                </div>

                <div className="p-1.5 space-y-1">
                  <button
                    onClick={() => { onLoginAs('demo'); setShowUserMenu(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      currentUser?.username === 'demo' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-slate-900">Patient / Customer (demo)</p>
                      <p className="text-[11px] text-slate-500">Search, favorites, symptom advisor, alerts</p>
                    </div>
                    {currentUser?.username === 'demo' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>

                  <button
                    onClick={() => { onLoginAs('pharmacy1'); setShowUserMenu(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      currentUser?.username === 'pharmacy1' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-slate-900">Hodan Pharmacy (pharmacy1)</p>
                      <p className="text-[11px] text-slate-500">Manage real-time medicine inventory & prices</p>
                    </div>
                    {currentUser?.username === 'pharmacy1' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>

                  <button
                    onClick={() => { onLoginAs('pharmacy2'); setShowUserMenu(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      currentUser?.username === 'pharmacy2' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-slate-900">Banadir Pharmacy (pharmacy2)</p>
                      <p className="text-[11px] text-slate-500">Update stock quantities, shortage management</p>
                    </div>
                    {currentUser?.username === 'pharmacy2' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>

                  <button
                    onClick={() => { onLoginAs('admin'); setShowUserMenu(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      currentUser?.username === 'admin' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-slate-900">Super Administrator (admin)</p>
                      <p className="text-[11px] text-slate-500">System oversight, stock watch dispatcher</p>
                    </div>
                    {currentUser?.username === 'admin' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                </div>

                {currentUser && (
                  <div className="pt-1.5 mt-1 border-t border-slate-100 px-2">
                    <button
                      onClick={() => { onLogout(); setShowUserMenu(false); }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign out to Guest
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
      
      {/* Mobile Bar */}
      <div className="md:hidden flex overflow-x-auto border-t border-slate-200 px-3 py-2 gap-1.5 text-xs bg-slate-50 no-scrollbar">
        <button
          onClick={() => setActiveTab('medicines')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
            activeTab === 'medicines' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          Find Medicines
        </button>
        <button
          onClick={() => setActiveTab('ai-advisor')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium flex items-center gap-1 ${
            activeTab === 'ai-advisor' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          <Sparkles className="w-3 h-3 text-emerald-400" />
          AI Advisor
        </button>
        <button
          onClick={() => setActiveTab('pharmacies')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
            activeTab === 'pharmacies' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          Pharmacies
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium flex items-center gap-1 ${
            activeTab === 'favorites' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          Saved ({favoritesCount})
        </button>
        {currentUser?.role === 'pharmacy' && (
          <button
            onClick={() => setActiveTab('pharmacy-portal')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
              activeTab === 'pharmacy-portal' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            Stock Portal
          </button>
        )}
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
              activeTab === 'admin' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            Admin
          </button>
        )}
      </div>
    </header>
  );
};
