'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = {
  Grid: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  ),
  Package: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l9 4.9V17L12 22 3 17V6.9L12 2z"/><polyline points="12 22 12 11.1"/><polyline points="3 6.9 12 11.1 21 6.9"/>
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Edit: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Tag: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  BarChart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  RefreshCw: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
  Toggle: ({ on }) => (
    <svg width="36" height="20" viewBox="0 0 36 20">
      <rect x="0" y="0" width="36" height="20" rx="10" fill={on ? '#10b981' : '#d1d5db'}/>
      <circle cx={on ? 26 : 10} cy="10" r="8" fill="white" style={{ transition: 'cx 0.2s' }}/>
    </svg>
  ),
  Folder: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  AlertCircle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  Filter: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  ),
  Eye: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
};

// ─── TOAST ─────────────────────────────────────────────────────────────────────
function Toast({ toasts, removeToast }) {
  return (
    <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 16px', borderRadius: '10px', minWidth: '280px', maxWidth: '380px',
          background: t.type === 'success' ? '#f0fdf4' : t.type === 'error' ? '#fef2f2' : '#fffbeb',
          border: `1px solid ${t.type === 'success' ? '#bbf7d0' : t.type === 'error' ? '#fecaca' : '#fde68a'}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          animation: 'slideIn 0.3s ease',
          fontFamily: 'var(--font-body)',
        }}>
          <span style={{ color: t.type === 'success' ? '#16a34a' : t.type === 'error' ? '#dc2626' : '#d97706' }}>
            {t.type === 'success' ? <Icon.CheckCircle /> : <Icon.AlertCircle />}
          </span>
          <span style={{ flex: 1, fontSize: '13px', color: '#374151', fontWeight: 500 }}>{t.message}</span>
          <button onClick={() => removeToast(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0', display: 'flex' }}>
            <Icon.X />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── CONFIRM MODAL ─────────────────────────────────────────────────────────────
function ConfirmModal({ open, title, message, onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', maxWidth: '400px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', fontFamily: 'var(--font-body)' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 700, color: '#111' }}>{title}</h3>
        <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} disabled={loading} style={{ padding: '9px 20px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Cancel</button>
          <button onClick={onConfirm} disabled={loading} style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#ef4444', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#fff', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CATEGORY FORM MODAL ───────────────────────────────────────────────────────
function CategoryModal({ open, onClose, onSave, editData, categories, loading }) {
  const [form, setForm] = useState({ name: '', description: '', parentId: '', icon: '📦', displayOrder: 0, isActive: true });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || '',
        description: editData.description || '',
        parentId: editData.parentId || '',
        icon: editData.icon || '📦',
        displayOrder: editData.displayOrder ?? 0,
        isActive: editData.isActive ?? true,
      });
    } else {
      setForm({ name: '', description: '', parentId: '', icon: '📦', displayOrder: 0, isActive: true });
    }
    setErrors({});
  }, [editData, open]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Category name is required';
    else if (form.name.trim().length > 100) e.name = 'Name cannot exceed 100 characters';
    if (form.description && form.description.length > 500) e.description = 'Description cannot exceed 500 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({ ...form, parentId: form.parentId || null });
  };

  // Only show top-level categories as parent options (no sub-sub allowed)
  const parentOptions = categories.filter(c => !c.parentId);
  const ICONS = ['📦', '🛒', '🏪', '🍎', '👕', '💻', '🏠', '🚗', '📱', '💊', '🎮', '📚', '🎨', '🌿', '⚡', '🔧'];

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 8000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: '18px', padding: '32px', maxWidth: '520px', width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.2)', fontFamily: 'var(--font-body)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#111', fontFamily: 'var(--font-display)' }}>
              {editData ? 'Edit Category' : 'New Category'}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#9ca3af' }}>
              {editData ? 'Update category details' : 'Create a main category or subcategory'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', color: '#6b7280' }}><Icon.X /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Name */}
          <div>
            <label style={labelStyle}>Category Name <span style={{ color: '#ef4444' }}>*</span></label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Electronics, Food & Beverages"
              style={{ ...inputStyle, ...(errors.name ? { borderColor: '#ef4444' } : {}) }} />
            {errors.name && <p style={errorStyle}>{errors.name}</p>}
          </div>

          {/* Parent Category */}
          <div>
            <label style={labelStyle}>Parent Category <span style={{ color: '#9ca3af', fontWeight: 400 }}>(leave empty for main category)</span></label>
            <select value={form.parentId} onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))} style={inputStyle}>
              <option value="">— Main Category (no parent) —</option>
              {parentOptions.map(c => (
                <option key={c._id} value={c._id}>{c.icon} {c.name}</option>
              ))}
            </select>
            {form.parentId && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#3b82f6' }}>This will be created as a subcategory</p>}
          </div>

          {/* Icon Picker */}
          <div>
            <label style={labelStyle}>Icon</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
              {ICONS.map(ic => (
                <button key={ic} type="button" onClick={() => setForm(f => ({ ...f, icon: ic }))}
                  style={{ width: '40px', height: '40px', borderRadius: '8px', border: form.icon === ic ? '2px solid #6366f1' : '1px solid #e5e7eb', background: form.icon === ic ? '#eef2ff' : '#fff', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of this category..."
              rows={3} style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} />
            {errors.description && <p style={errorStyle}>{errors.description}</p>}
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9ca3af' }}>{form.description.length}/500</p>
          </div>

          {/* Display Order & Active */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Display Order</label>
              <input type="number" min="0" value={form.displayOrder}
                onChange={e => setForm(f => ({ ...f, displayOrder: parseInt(e.target.value) || 0 }))}
                style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}>
                  <Icon.Toggle on={form.isActive} />
                </button>
                <span style={{ fontSize: '13px', fontWeight: 600, color: form.isActive ? '#16a34a' : '#9ca3af' }}>
                  {form.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '28px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 22px', borderRadius: '9px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#374151' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            style={{ padding: '10px 22px', borderRadius: '9px', border: 'none', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', cursor: 'pointer', fontSize: '14px', fontWeight: 700, color: '#fff', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
            {loading ? 'Saving...' : editData ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── REUSABLE STYLES ───────────────────────────────────────────────────────────
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '9px', fontSize: '14px', color: '#111', background: '#fafafa', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.15s' };
const errorStyle = { margin: '4px 0 0', fontSize: '12px', color: '#ef4444' };

// ─── STAT CARD ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, icon, loading }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '14px', padding: '20px 22px',
      border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      display: 'flex', alignItems: 'flex-start', gap: '14px',
      fontFamily: 'var(--font-body)', transition: 'box-shadow 0.2s',
    }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        {loading ? (
          <div style={{ height: '28px', width: '60px', background: '#f3f4f6', borderRadius: '6px', marginTop: '6px', animation: 'pulse 1.5s infinite' }} />
        ) : (
          <p style={{ margin: '4px 0 2px', fontSize: '26px', fontWeight: 800, color: '#111', lineHeight: 1, fontFamily: 'var(--font-display)' }}>{value ?? '—'}</p>
        )}
        {sub && <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── CATEGORY ROW (recursive tree) ─────────────────────────────────────────────
function CategoryRow({ cat, depth = 0, onEdit, onDelete, onToggle, allCategories }) {
  const [expanded, setExpanded] = useState(true);
  const subs = allCategories.filter(c => c.parentId && c.parentId.toString() === cat._id.toString());
  const hasSubs = subs.length > 0;

  return (
    <>
      <tr style={{ background: depth === 0 ? '#fff' : '#fafbff', transition: 'background 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.background = depth === 0 ? '#f8f9ff' : '#f0f4ff'}
        onMouseLeave={e => e.currentTarget.style.background = depth === 0 ? '#fff' : '#fafbff'}>
        <td style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: `${depth * 28}px` }}>
            {hasSubs ? (
              <button onClick={() => setExpanded(e => !e)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', color: '#9ca3af', transition: 'transform 0.2s', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                <Icon.ChevronRight />
              </button>
            ) : (
              <div style={{ width: '18px' }} />
            )}
            <span style={{ fontSize: '18px' }}>{cat.icon || '📦'}</span>
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: depth === 0 ? 700 : 500, color: '#111' }}>{cat.name}</p>
              {cat.description && <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.description}</p>}
            </div>
          </div>
        </td>
        <td style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: depth === 0 ? '#ede9fe' : '#e0f2fe', color: depth === 0 ? '#7c3aed' : '#0369a1' }}>
            {depth === 0 ? <Icon.Folder /> : <Icon.Tag />}
            {depth === 0 ? 'Main' : 'Sub'}
          </span>
        </td>
        <td style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontSize: '13px', color: '#6b7280' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f9fafb', borderRadius: '6px', padding: '3px 8px', fontWeight: 600 }}>
            <Icon.Package />
            {cat.productCount ?? 0}
          </span>
        </td>
        <td style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: '12px', color: '#9ca3af', background: '#f9fafb', padding: '2px 8px', borderRadius: '6px' }}>#{cat.displayOrder ?? 0}</span>
        </td>
        <td style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
          <button type="button" onClick={() => onToggle(cat._id, !cat.isActive)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0' }}>
            <Icon.Toggle on={cat.isActive} />
          </button>
        </td>
        <td style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button onClick={() => onEdit(cat)} title="Edit" style={{ padding: '6px', borderRadius: '7px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', color: '#6366f1', transition: 'all 0.15s' }}>
              <Icon.Edit />
            </button>
            <button onClick={() => onDelete(cat)} title="Delete" style={{ padding: '6px', borderRadius: '7px', border: '1px solid #fecaca', background: '#fff', cursor: 'pointer', display: 'flex', color: '#ef4444', transition: 'all 0.15s' }}>
              <Icon.Trash />
            </button>
          </div>
        </td>
      </tr>
      {hasSubs && expanded && subs.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map(sub => (
        <CategoryRow key={sub._id} cat={sub} depth={depth + 1} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} allCategories={allCategories} />
      ))}
    </>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function MastersPage() {
  const { user, getAuthHeaders } = useAuth();
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'products'

  // Data state
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  // Loading states
  const [statsLoading, setStatsLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  const [prodLoading, setProdLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination
  const [catPage, setCatPage] = useState(1);
  const [catTotal, setCatTotal] = useState(0);
  const [catTotalPages, setCatTotalPages] = useState(1);
  const [prodPage, setProdPage] = useState(1);
  const [prodTotal, setProdTotal] = useState(0);
  const [prodTotalPages, setProdTotalPages] = useState(1);
  const LIMIT = 50;

  // Filters
  const [catSearch, setCatSearch] = useState('');
  const [catStatus, setCatStatus] = useState('');
  const [catParentFilter, setCatParentFilter] = useState('');
  const [prodSearch, setProdSearch] = useState('');
  const [prodStatus, setProdStatus] = useState('');
  const [prodCategory, setProdCategory] = useState('');

  // Modal state
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // { type, item }
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  // Search debounce
  const searchTimer = useRef(null);

  const addToast = useCallback((message, type = 'success') => {
    const id = ++toastId.current;
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => setToasts(t => t.filter(x => x.id !== id)), []);

  const buildHeaders = useCallback(() => {
    return getAuthHeaders ? getAuthHeaders() : { 'Content-Type': 'application/json' };
  }, [getAuthHeaders]);

  // ─── FETCH STATS ───────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch('/api/masters?type=stats', { headers: buildHeaders() });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (e) {
      console.error('Stats fetch error:', e);
    } finally {
      setStatsLoading(false);
    }
  }, [buildHeaders]);

  // ─── FETCH CATEGORIES ──────────────────────────────────────────────────────
  const fetchCategories = useCallback(async (page = 1) => {
    setCatLoading(true);
    try {
      const params = new URLSearchParams({
        type: 'categories',
        page: String(page),
        limit: String(LIMIT),
        ...(catSearch && { search: catSearch }),
        ...(catStatus && { status: catStatus }),
        ...(catParentFilter === 'main' ? { parentId: 'null' } : catParentFilter ? { parentId: catParentFilter } : {}),
      });
      const res = await fetch(`/api/masters?${params}`, { headers: buildHeaders() });
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
        setCatTotal(data.pagination?.total ?? 0);
        setCatTotalPages(data.pagination?.totalPages ?? 1);
      } else {
        addToast(data.message || 'Failed to load categories', 'error');
      }
    } catch (e) {
      addToast('Network error loading categories', 'error');
    } finally {
      setCatLoading(false);
    }
  }, [catSearch, catStatus, catParentFilter, buildHeaders, addToast]);

  // ─── FETCH PRODUCTS ────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async (page = 1) => {
    setProdLoading(true);
    try {
      const params = new URLSearchParams({
        type: 'products',
        page: String(page),
        limit: String(LIMIT),
        ...(prodSearch && { search: prodSearch }),
        ...(prodStatus && { status: prodStatus }),
        ...(prodCategory && prodCategory !== 'all' && { category: prodCategory }),
      });
      const res = await fetch(`/api/masters?${params}`, { headers: buildHeaders() });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
        setProdTotal(data.pagination?.total ?? 0);
        setProdTotalPages(data.pagination?.totalPages ?? 1);
      } else {
        addToast(data.message || 'Failed to load products', 'error');
      }
    } catch (e) {
      addToast('Network error loading products', 'error');
    } finally {
      setProdLoading(false);
    }
  }, [prodSearch, prodStatus, prodCategory, buildHeaders, addToast]);

  // ─── INIT ──────────────────────────────────────────────────────────────────
  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchCategories(catPage); }, [catSearch, catStatus, catParentFilter, catPage]);
  useEffect(() => { fetchProducts(prodPage); }, [prodSearch, prodStatus, prodCategory, prodPage]);

  // ─── DEBOUNCED SEARCH ──────────────────────────────────────────────────────
  const handleCatSearch = (val) => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setCatSearch(val); setCatPage(1); }, 350);
  };
  const handleProdSearch = (val) => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setProdSearch(val); setProdPage(1); }, 350);
  };

  // ─── CATEGORY CRUD ─────────────────────────────────────────────────────────
  const handleSaveCategory = async (formData) => {
    setActionLoading(true);
    try {
      const isEdit = !!editCat;
      const url = isEdit ? `/api/masters?type=categories&id=${editCat._id}` : '/api/masters?type=categories';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: buildHeaders(), body: JSON.stringify(formData) });
      const data = await res.json();
      if (data.success) {
        addToast(data.message || (isEdit ? 'Category updated' : 'Category created'), 'success');
        setCatModalOpen(false);
        setEditCat(null);
        fetchCategories(catPage);
        fetchStats();
      } else {
        addToast(data.message || 'Operation failed', 'error');
      }
    } catch (e) {
      addToast('Network error', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditCategory = (cat) => { setEditCat(cat); setCatModalOpen(true); };

  const handleDeleteCategory = (cat) => {
    setConfirmDelete({ type: 'categories', item: cat });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/masters?type=${confirmDelete.type}&id=${confirmDelete.item._id}`, { method: 'DELETE', headers: buildHeaders() });
      const data = await res.json();
      if (data.success) {
        addToast(data.message || 'Deleted successfully', 'success');
        setConfirmDelete(null);
        if (confirmDelete.type === 'categories') { fetchCategories(catPage); fetchStats(); }
        else { fetchProducts(prodPage); fetchStats(); }
      } else {
        addToast(data.message || 'Delete failed', 'error');
      }
    } catch (e) {
      addToast('Network error', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleCategory = async (id, isActive) => {
    try {
      const res = await fetch('/api/masters?type=categories', {
        method: 'PATCH',
        headers: buildHeaders(),
        body: JSON.stringify({ action: 'toggle-status', id, isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories(prev => prev.map(c => c._id.toString() === id.toString() ? { ...c, isActive } : c));
        addToast(data.message || `Category ${isActive ? 'activated' : 'deactivated'}`, 'success');
      } else {
        addToast(data.message || 'Toggle failed', 'error');
      }
    } catch (e) {
      addToast('Network error', 'error');
    }
  };

  const handleToggleProduct = async (id, isActive) => {
    try {
      const res = await fetch('/api/masters?type=products', {
        method: 'PATCH',
        headers: buildHeaders(),
        body: JSON.stringify({ action: 'toggle-status', id, isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p._id.toString() === id.toString() ? { ...p, isActive } : p));
        addToast(data.message || `Product ${isActive ? 'activated' : 'deactivated'}`, 'success');
      } else {
        addToast(data.message || 'Toggle failed', 'error');
      }
    } catch (e) {
      addToast('Network error', 'error');
    }
  };

  const handleDeleteProduct = (prod) => {
    setConfirmDelete({ type: 'products', item: prod });
  };

  // Top-level categories for filters / product display
  const mainCategories = categories.filter(c => !c.parentId);

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        :root {
          --font-display: 'Sora', sans-serif;
          --font-body: 'DM Sans', sans-serif;
        }
        * { box-sizing: border-box; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .masters-table tr:hover .row-actions { opacity: 1 !important; }
        .page-btn:hover { background: #6366f1 !important; color: #fff !important; }
        .filter-select:focus, .filter-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .tab-btn { transition: all 0.2s; }
        .action-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.12) !important; }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .filter-row { flex-direction: column !important; }
          .page-header { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .desktop-only { display: none !important; }
          .masters-table { font-size: 12px !important; }
          .masters-table td, .masters-table th { padding: 10px 10px !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f4f5f9', fontFamily: 'var(--font-body)', padding: '24px', animation: 'fadeIn 0.4s ease' }}>

        {/* ── HEADER ── */}
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>
              Masters
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}>
              Manage categories, subcategories & products
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={() => { fetchStats(); fetchCategories(catPage); fetchProducts(prodPage); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '9px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
              <Icon.RefreshCw /> Refresh
            </button>
            {activeTab === 'categories' && (
              <button onClick={() => { setEditCat(null); setCatModalOpen(true); }} className="action-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '9px', border: 'none', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#fff', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
                <Icon.Plus /> Add Category
              </button>
            )}
            {activeTab === 'products' && (
              <button onClick={() => router.push('/admin/products/productForm')} className="action-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '9px', border: 'none', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#fff', boxShadow: '0 4px 14px rgba(16,185,129,0.35)' }}>
                <Icon.Plus /> Add Product
              </button>
            )}
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <StatCard label="Total Categories" value={stats?.categories?.total} sub={`${stats?.categories?.main ?? 0} main · ${stats?.categories?.sub ?? 0} sub`} color="#6366f1" icon={<Icon.Grid />} loading={statsLoading} />
          <StatCard label="Active Categories" value={stats?.categories?.active} sub={`${(stats?.categories?.total ?? 0) - (stats?.categories?.active ?? 0)} inactive`} color="#10b981" icon={<Icon.Tag />} loading={statsLoading} />
          <StatCard label="Total Products" value={stats?.products?.total} sub={`${stats?.products?.active ?? 0} active`} color="#f59e0b" icon={<Icon.Package />} loading={statsLoading} />
          <StatCard label="Stock Alerts" value={(stats?.products?.lowStock ?? 0) + (stats?.products?.outOfStock ?? 0)} sub={`${stats?.products?.outOfStock ?? 0} out of stock`} color="#ef4444" icon={<Icon.BarChart />} loading={statsLoading} />
        </div>

        {/* ── TABS ── */}
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          {/* Tab Header */}
          <div style={{ display: 'flex', borderBottom: '1px solid #f3f4f6', padding: '0 20px' }}>
            {[
              { key: 'categories', label: 'Categories', icon: <Icon.Grid />, count: catTotal },
              { key: 'products', label: 'Products', icon: <Icon.Package />, count: prodTotal },
            ].map(tab => (
              <button key={tab.key} className="tab-btn" onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px', padding: '15px 20px',
                  border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: '14px', fontWeight: activeTab === tab.key ? 700 : 500,
                  color: activeTab === tab.key ? '#6366f1' : '#6b7280',
                  borderBottom: activeTab === tab.key ? '2px solid #6366f1' : '2px solid transparent',
                  marginBottom: '-1px', fontFamily: 'var(--font-body)',
                }}>
                {tab.icon}
                {tab.label}
                <span style={{ background: activeTab === tab.key ? '#eef2ff' : '#f3f4f6', color: activeTab === tab.key ? '#6366f1' : '#9ca3af', borderRadius: '12px', padding: '1px 8px', fontSize: '11px', fontWeight: 700 }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: '20px' }}>

            {/* ── CATEGORIES TAB ── */}
            {activeTab === 'categories' && (
              <>
                {/* Filters */}
                <div className="filter-row" style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex' }}><Icon.Search /></span>
                    <input className="filter-input" defaultValue={catSearch} onChange={e => handleCatSearch(e.target.value)}
                      placeholder="Search categories..." style={{ ...inputStyle, paddingLeft: '38px', background: '#f9fafb' }} />
                  </div>
                  <select className="filter-select" value={catStatus} onChange={e => { setCatStatus(e.target.value); setCatPage(1); }}
                    style={{ ...inputStyle, width: 'auto', minWidth: '130px', cursor: 'pointer' }}>
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <select className="filter-select" value={catParentFilter} onChange={e => { setCatParentFilter(e.target.value); setCatPage(1); }}
                    style={{ ...inputStyle, width: 'auto', minWidth: '150px', cursor: 'pointer' }}>
                    <option value="">All Types</option>
                    <option value="main">Main Only</option>
                    {mainCategories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name} (subs)</option>)}
                  </select>
                  {(catSearch || catStatus || catParentFilter) && (
                    <button onClick={() => { setCatSearch(''); setCatStatus(''); setCatParentFilter(''); setCatPage(1); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '9px 14px', borderRadius: '9px', border: '1px solid #fecaca', background: '#fff5f5', cursor: 'pointer', fontSize: '13px', color: '#ef4444', fontWeight: 600 }}>
                      <Icon.X /> Clear
                    </button>
                  )}
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
                  <table className="masters-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        {['Category', 'Type', 'Products', 'Order', 'Status', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {catLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                          <tr key={i}>
                            {Array.from({ length: 6 }).map((_, j) => (
                              <td key={j} style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
                                <div style={{ height: '14px', background: '#f3f4f6', borderRadius: '4px', animation: 'pulse 1.5s infinite', width: j === 0 ? '140px' : j === 5 ? '70px' : '60px' }} />
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : categories.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📂</div>
                            <p style={{ margin: 0, fontWeight: 600 }}>No categories found</p>
                            <p style={{ margin: '4px 0 0', fontSize: '12px' }}>
                              {catSearch || catStatus ? 'Try adjusting your filters' : 'Create your first category to get started'}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        mainCategories
                          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                          .map(cat => (
                            <CategoryRow key={cat._id} cat={cat} depth={0}
                              onEdit={handleEditCategory} onDelete={handleDeleteCategory}
                              onToggle={handleToggleCategory} allCategories={categories} />
                          ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {catTotalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>
                      Showing {((catPage - 1) * LIMIT) + 1}–{Math.min(catPage * LIMIT, catTotal)} of {catTotal} categories
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="page-btn" disabled={catPage === 1} onClick={() => setCatPage(p => p - 1)}
                        style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', cursor: catPage === 1 ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600, color: catPage === 1 ? '#d1d5db' : '#374151' }}>
                        ← Prev
                      </button>
                      {Array.from({ length: Math.min(catTotalPages, 5) }).map((_, i) => {
                        const pg = i + 1;
                        return (
                          <button key={pg} className="page-btn" onClick={() => setCatPage(pg)}
                            style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid', borderColor: catPage === pg ? '#6366f1' : '#e5e7eb', background: catPage === pg ? '#6366f1' : '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: catPage === pg ? '#fff' : '#374151' }}>
                            {pg}
                          </button>
                        );
                      })}
                      <button className="page-btn" disabled={catPage === catTotalPages} onClick={() => setCatPage(p => p + 1)}
                        style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', cursor: catPage === catTotalPages ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600, color: catPage === catTotalPages ? '#d1d5db' : '#374151' }}>
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── PRODUCTS TAB ── */}
            {activeTab === 'products' && (
              <>
                {/* Filters */}
                <div className="filter-row" style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex' }}><Icon.Search /></span>
                    <input className="filter-input" defaultValue={prodSearch} onChange={e => handleProdSearch(e.target.value)}
                      placeholder="Search by name, SKU..." style={{ ...inputStyle, paddingLeft: '38px', background: '#f9fafb' }} />
                  </div>
                  <select className="filter-select" value={prodStatus} onChange={e => { setProdStatus(e.target.value); setProdPage(1); }}
                    style={{ ...inputStyle, width: 'auto', minWidth: '130px', cursor: 'pointer' }}>
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <select className="filter-select" value={prodCategory} onChange={e => { setProdCategory(e.target.value); setProdPage(1); }}
                    style={{ ...inputStyle, width: 'auto', minWidth: '160px', cursor: 'pointer' }}>
                    <option value="">All Categories</option>
                    {mainCategories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
                  </select>
                  {(prodSearch || prodStatus || prodCategory) && (
                    <button onClick={() => { setProdSearch(''); setProdStatus(''); setProdCategory(''); setProdPage(1); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '9px 14px', borderRadius: '9px', border: '1px solid #fecaca', background: '#fff5f5', cursor: 'pointer', fontSize: '13px', color: '#ef4444', fontWeight: 600 }}>
                      <Icon.X /> Clear
                    </button>
                  )}
                </div>

                {/* Products Table */}
                <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
                  <table className="masters-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        {['Product', 'SKU', 'Category', 'MRP / Price', 'Stock', 'GST', 'Status', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {prodLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                          <tr key={i}>
                            {Array.from({ length: 8 }).map((_, j) => (
                              <td key={j} style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
                                <div style={{ height: '14px', background: '#f3f4f6', borderRadius: '4px', animation: 'pulse 1.5s infinite', width: j === 0 ? '140px' : '70px' }} />
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : products.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📦</div>
                            <p style={{ margin: 0, fontWeight: 600 }}>No products found</p>
                            <p style={{ margin: '4px 0 0', fontSize: '12px' }}>
                              {prodSearch || prodStatus || prodCategory ? 'Try adjusting your filters' : 'Add your first product to get started'}
                            </p>
                          </td>
                        </tr>
                      ) : products.map(prod => (
                        <tr key={prod._id}
                          onMouseEnter={e => e.currentTarget.style.background = '#f8f9ff'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                          style={{ background: '#fff', transition: 'background 0.15s' }}>
                          <td style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {prod.images?.[0] ? (
                                <img src={prod.images[0]} alt={prod.productName} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #f3f4f6', flexShrink: 0 }} />
                              ) : (
                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#9ca3af', fontSize: '16px' }}>📦</div>
                              )}
                              <div>
                                <p style={{ margin: 0, fontWeight: 700, color: '#111', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prod.productName}</p>
                                {prod.isOnSale && <span style={{ fontSize: '10px', background: '#fef3c7', color: '#d97706', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>SALE</span>}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                            <code style={{ fontSize: '11px', background: '#f3f4f6', padding: '3px 7px', borderRadius: '5px', color: '#374151', fontWeight: 600 }}>{prod.sku}</code>
                          </td>
                          <td style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                            <div>
                              <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#374151' }}>{prod.category?.name || '—'}</p>
                              {prod.subCategory?.name && <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>↳ {prod.subCategory.name}</p>}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                            <div>
                              <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', textDecoration: 'line-through' }}>₹{prod.mrp}</p>
                              <p style={{ margin: 0, fontWeight: 800, color: '#111', fontSize: '14px' }}>₹{prod.discountPrice}</p>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                            <span style={{
                              padding: '3px 9px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                              background: prod.stock === 0 ? '#fef2f2' : prod.stock <= 5 ? '#fffbeb' : '#f0fdf4',
                              color: prod.stock === 0 ? '#ef4444' : prod.stock <= 5 ? '#d97706' : '#16a34a',
                            }}>
                              {prod.stock === 0 ? 'Out' : prod.stock <= 5 ? `Low: ${prod.stock}` : prod.stock}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>
                            {prod.gstRate}%
                          </td>
                          <td style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                            <button type="button" onClick={() => handleToggleProduct(prod._id, !prod.isActive)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0' }}>
                              <Icon.Toggle on={prod.isActive} />
                            </button>
                          </td>
                          <td style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button onClick={() => router.push(`/admin/products/productForm?id=${prod._id}`)} title="Edit"
                                style={{ padding: '6px', borderRadius: '7px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', color: '#6366f1' }}>
                                <Icon.Edit />
                              </button>
                              <button onClick={() => handleDeleteProduct(prod)} title="Delete"
                                style={{ padding: '6px', borderRadius: '7px', border: '1px solid #fecaca', background: '#fff', cursor: 'pointer', display: 'flex', color: '#ef4444' }}>
                                <Icon.Trash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Products Pagination */}
                {prodTotalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>
                      Showing {((prodPage - 1) * LIMIT) + 1}–{Math.min(prodPage * LIMIT, prodTotal)} of {prodTotal} products
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="page-btn" disabled={prodPage === 1} onClick={() => setProdPage(p => p - 1)}
                        style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', cursor: prodPage === 1 ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600, color: prodPage === 1 ? '#d1d5db' : '#374151' }}>
                        ← Prev
                      </button>
                      {Array.from({ length: Math.min(prodTotalPages, 5) }).map((_, i) => {
                        const pg = i + 1;
                        return (
                          <button key={pg} className="page-btn" onClick={() => setProdPage(pg)}
                            style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid', borderColor: prodPage === pg ? '#6366f1' : '#e5e7eb', background: prodPage === pg ? '#6366f1' : '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: prodPage === pg ? '#fff' : '#374151' }}>
                            {pg}
                          </button>
                        );
                      })}
                      <button className="page-btn" disabled={prodPage === prodTotalPages} onClick={() => setProdPage(p => p + 1)}
                        style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', cursor: prodPage === prodTotalPages ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600, color: prodPage === prodTotalPages ? '#d1d5db' : '#374151' }}>
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── QUICK SUMMARY FOOTER ── */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { label: 'Main Categories', value: stats?.categories?.main ?? '—', color: '#6366f1' },
            { label: 'Subcategories', value: stats?.categories?.sub ?? '—', color: '#8b5cf6' },
            { label: 'Active Products', value: stats?.products?.active ?? '—', color: '#10b981' },
            { label: 'Low Stock', value: stats?.products?.lowStock ?? '—', color: '#f59e0b' },
            { label: 'Out of Stock', value: stats?.products?.outOfStock ?? '—', color: '#ef4444' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', borderRadius: '10px', padding: '10px 16px', border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
              <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>{item.label}:</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#111' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── MODALS ── */}
      <CategoryModal
        open={catModalOpen}
        onClose={() => { setCatModalOpen(false); setEditCat(null); }}
        onSave={handleSaveCategory}
        editData={editCat}
        categories={categories}
        loading={actionLoading}
      />

      <ConfirmModal
        open={!!confirmDelete}
        title={`Delete ${confirmDelete?.type === 'categories' ? 'Category' : 'Product'}`}
        message={
          confirmDelete?.type === 'categories'
            ? `Are you sure you want to delete "${confirmDelete?.item?.name}"? This action cannot be undone. Products must be removed first.`
            : `Are you sure you want to delete "${confirmDelete?.item?.productName}"? This action cannot be undone.`
        }
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete(null)}
        loading={deleteLoading}
      />

      <Toast toasts={toasts} removeToast={removeToast} />
    </>
  );
}