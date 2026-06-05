import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { noticeService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Megaphone, Save, Search, Calendar, User, ToggleLeft, ToggleRight } from 'lucide-react';
import ConfirmModal from '../components/common/ConfirmModal';
import Toast from '../components/common/Toast';

export default function Notices() {
  const { t } = useLanguage();
  const { hasPermission } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [toast, setToast] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const canEdit = hasPermission('notices_edit');
  const canDelete = hasPermission('notices_delete');

  useEffect(() => {
    fetchNotices();
  }, [search, page, limit]);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await noticeService.getAll({ page, limit, search });
      const data = res.data?.data || res.data || [];
      const totalVal = res.data?.pagination?.total || res.data?.total || data.length || 0;
      setNotices(data);
      setTotal(totalVal);
      setTotalPages(Math.ceil(totalVal / limit) || 1);
    } catch (error) {
      console.error('Failed to fetch:', error);
      setNotices([]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    try {
      if (editItem) {
        await noticeService.update(editItem.id, formData);
        setToast(t('UpdateSuccess'));
      } else {
        await noticeService.create(formData);
        setToast(t('SaveSuccess'));
      }
      setShowModal(false);
      setEditItem(null);
      setFormData({ title: '', content: '' });
      fetchNotices();
      window.dispatchEvent(new CustomEvent('notice-changed'));
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
        setFieldErrors(errors);
      } else {
        alert(error.response?.data?.message || t('SaveError'));
      }
    }
  };

  const handleDelete = async (id) => {
    setDeleteModal({ show: true, id });
  };

  const confirmDelete = async () => {
    try {
      await noticeService.delete(deleteModal.id);
      setDeleteModal({ show: false, id: null });
      setToast(t('DeleteSuccess'));
      fetchNotices();
      window.dispatchEvent(new CustomEvent('notice-changed'));
    } catch (error) {
      setToast(t('DeleteError'));
      setDeleteModal({ show: false, id: null });
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      const res = await noticeService.togglePublished(id);
      setToast(t('UpdateSuccess'));
      fetchNotices();
      window.dispatchEvent(new CustomEvent('notice-changed', {
        detail: res.data?.is_published ? res.data : null
      }));
    } catch (error) {
      setToast(t('SaveError'));
    }
  };

  const openModal = (item = null) => {
    setEditItem(item);
    setFormData(item || { title: '', content: '' });
    setFieldErrors({});
    setShowModal(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('NoticeBoard')}</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> {t('AddNotice')}
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ flex: 1, maxWidth: '500px' }}>
            <Search size={18} />
            <input
              type="text"
              placeholder={t('SearchNotices')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="hide-mobile" style={{ width: '40px' }}>#</th>
                <th>{t('Title')}</th>
                <th>{t('Message')}</th>
                <th style={{ width: '80px' }}>{t('Status')}</th>
                <th className="hide-mobile" style={{ width: '130px' }}>{t('CreatedBy')}</th>
                <th className="hide-mobile" style={{ width: '150px' }}>{t('Date')}</th>
                <th style={{ width: '100px' }}>{t('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7">{t('LoadingEllipsis')}</td></tr>
              ) : !notices || notices.length === 0 ? (
                <tr><td colSpan="7" className="text-center" style={{ padding: '40px', color: 'var(--text-secondary)', textAlign: 'center' }}>{t('NoNoticesFound')}</td></tr>
              ) : (
                notices.map((n, idx) => (
                  <tr key={n.id}>
                    <td className="hide-mobile" style={{ color: 'var(--text-secondary)' }}>{(page - 1) * limit + idx + 1}</td>
                    <td style={{ fontWeight: 500 }}>{n.title}</td>
                    <td style={{ whiteSpace: 'pre-wrap', maxWidth: '250px' }}>{n.content}</td>
                    <td>
                      <span className={`badge ${n.is_published ? 'badge-success' : 'badge-secondary'}`}>
                        {n.is_published ? t('Active') : t('Inactive')}
                      </span>
                    </td>
                    <td className="hide-mobile">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} style={{ color: 'var(--text-secondary)' }} />
                        {n.created_by_name || '-'}
                      </div>
                    </td>
                    <td className="hide-mobile">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} style={{ color: 'var(--text-secondary)' }} />
                        {formatDate(n.created_at)}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {canEdit && (
                          <button
                            className="btn btn-sm"
                            style={{
                              background: n.is_published ? 'var(--success)' : 'var(--border)',
                              color: n.is_published ? '#fff' : 'var(--text)',
                              border: 'none'
                            }}
                            onClick={() => handleTogglePublish(n.id)}
                            title={n.is_published ? t('Deactivate') : t('Activate')}
                          >
                            {n.is_published ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          </button>
                        )}
                        {canEdit && (
                          <button className="btn btn-secondary btn-sm" onClick={() => openModal(n)}>
                            <Pencil size={14} />
                          </button>
                        )}
                        {canDelete && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(n.id)}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '14px' }}>Show</span>
          <select
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border)' }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span style={{ fontSize: '14px', marginLeft: 'auto' }}>
            {Math.min((page - 1) * limit + limit, total)} of {total} entries
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '14px' }}>{t('Page')} {page} / {totalPages}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, id: null })}
        onConfirm={confirmDelete}
        title={t('ConfirmDelete')}
        message={t('DeleteConfirmMessage')}
        confirmText={t('Delete')}
        cancelText={t('Cancel')}
        confirmVariant="danger"
      />

      <Toast message={toast} onClose={() => setToast('')} />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <Megaphone size={24} className="modal-header-icon" />
                <h3>{editItem ? t('EditNotice') : t('AddNotice')}</h3>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>{t('Title')} *</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={e => { setFormData({...formData, title: e.target.value}); setFieldErrors({...fieldErrors, title: null}); }}
                  required
                  placeholder={t('NoticeTitlePlaceholder')}
                  className={`form-input ${fieldErrors.title ? 'input-error' : ''}`}
                />
                {fieldErrors.title && <div className="field-error">{fieldErrors.title}</div>}
              </div>
              <div className="form-group">
                <label>{t('Message')} *</label>
                <textarea
                  value={formData.content || ''}
                  onChange={e => { setFormData({...formData, content: e.target.value}); setFieldErrors({...fieldErrors, content: null}); }}
                  required
                  placeholder={t('NoticeContentPlaceholder')}
                  rows={5}
                  className={`form-input ${fieldErrors.content ? 'input-error' : ''}`}
                />
                {fieldErrors.content && <div className="field-error">{fieldErrors.content}</div>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  <X size={18} /> {t('Cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} /> {editItem ? t('Update') : t('Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
