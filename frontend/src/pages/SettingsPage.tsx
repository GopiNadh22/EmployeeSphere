import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Key, Bell, Database, Server, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings & Platform Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage session preferences, account security, and backend connectivity</p>
      </div>

      {/* Account Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Security & Access Profile</h3>
            <p className="text-xs text-slate-500">Authenticated user identity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">User Email</span>
            <span className="font-semibold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg block border border-slate-200">
              {user?.email}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">System Role</span>
            <span className="font-semibold text-indigo-700 bg-indigo-50 px-3 py-2 rounded-lg block border border-indigo-100">
              {user?.role}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Account State</span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg block border border-emerald-100">
              {user?.is_active ? 'Active & Verified' : 'Disabled'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Member Since</span>
            <span className="font-semibold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg block border border-slate-200">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Database & Architecture Specs Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Database size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Architecture & Database Topology</h3>
            <p className="text-xs text-slate-500">Persistent PostgreSQL connection parameters</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-600">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-medium text-slate-700">Database Engine</span>
            <span className="font-mono text-slate-800 font-semibold">PostgreSQL (Relational ORM via SQLAlchemy)</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-medium text-slate-700">Schema Migrations</span>
            <span className="font-mono text-slate-800 font-semibold">Alembic (Version 0001_initial)</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-medium text-slate-700">API Protocol & Serialization</span>
            <span className="font-mono text-slate-800 font-semibold">FastAPI 0.110+ & Pydantic v2</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-medium text-slate-700">Authentication Protocol</span>
            <span className="font-mono text-slate-800 font-semibold">JWT Bearer (HS256)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

