import { useState, useEffect } from 'react';
import { useLanguage, formatDate } from '../context/LanguageContext';
import { notificationService } from '../services/api';
import { Bell, CheckCircle, AlertCircle, Info, CheckSquare, X, ChevronLeft, ChevronRight, Eye, Calendar, Tag, Link } from 'lucide-react';
import ConfirmModal from '../components/common/ConfirmModal';
import Toast from '../components/common/Toast';

export default function Notifications() {
  const { t, language } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [confirmModal, setConfirmModal] = useState({ show: false, action: null, title: '', message: '' });
  const [toast, setToast] = useState('');
  const [detailModal, setDetailModal] = useState({ show: false, notification: null });

  useEffect(() => {
    fetchNotifications();
  }, [page, limit, filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      
      if (filter !== 'all') {
        params.category = filter;
      }

      const response = await notificationService.getAll(params);
      const data = response.data?.data || response.data || [];
      const totalVal = response.data?.pagination?.total || response.data?.total || data.length || 0;
      setNotifications(data);
      setTotal(totalVal);
      setTotalPages(Math.ceil(totalVal / limit) || 1);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: 1 } : n
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    setConfirmModal({
      show: true,
      action: () => markAllAsReadConfirmed(),
      title: t('ConfirmMarkAllRead'),
      message: t('ConfirmMarkAllReadMsg')
    });
  };

  const markAllAsReadConfirmed = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
      setConfirmModal({ show: false, action: null, title: '', message: '' });
      setToast(t('MarkAllReadSuccess'));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      setConfirmModal({ show: false, action: null, title: '', message: '' });
    }
  };

  const handleDelete = async (id) => {
    setConfirmModal({
      show: true,
      action: () => deleteConfirmed(id),
      title: t('ConfirmDelete'),
      message: t('ConfirmDeleteNotification')
    });
  };

  const deleteConfirmed = async (id) => {
    try {
      await notificationService.delete(id);
      setConfirmModal({ show: false, action: null, title: '', message: '' });
      setToast(t('DeleteSuccess'));
      fetchNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
      setConfirmModal({ show: false, action: null, title: '', message: '' });
    }
  };

  const handleViewDetails = async (notification) => {
    try {
      if (!notification.is_read) {
        await notificationService.markAsRead(notification.id);
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, is_read: 1 } : n
        ));
      }
      setDetailModal({ show: true, notification });
    } catch (error) {
      console.error('Failed to fetch notification details:', error);
      setDetailModal({ show: true, notification });
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'warning':
        return <AlertCircle size={16} className="text-yellow-600" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-600" />;
      case 'info':
      default:
        return <Info size={16} className="text-blue-600" />;
    }
  };

  const getTypeBg = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'error':
        return 'bg-red-50';
      case 'info':
      default:
        return 'bg-blue-50';
    }
  };

  const filteredNotifications = notifications.filter(notif =>
    notif.title.toLowerCase().includes(search.toLowerCase()) ||
    notif.message.toLowerCase().includes(search.toLowerCase())
  );

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return <div className="page-header">{t('Loading')}</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('Notifications')}</h1>
        {unreadCount > 0 && (
          <div className="header-actions">
            <button className="btn btn-sm btn-primary" onClick={handleMarkAllAsRead}>
              {t('MarkAllAsRead')}
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="header-left" style={{ flex: 1, maxWidth: '500px' }}>
            <input
              type="text"
              className="form-input"
              placeholder={t('SearchNotifications')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="header-right">
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '180px' }}
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">{t('AllNotifications')}</option>
              <option value="low_stock">{t('LowStock')}</option>
              <option value="product_expiry">{t('ProductExpiry')}</option>
              <option value="invoice_due">{t('InvoiceDue')}</option>
              <option value="payment_received">{t('PaymentReceived')}</option>
              <option value="field_disabled">{t('FieldDisabled')}</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>{t('Type')}</th>
                <th>{t('Title')}</th>
                <th>{t('Message')}</th>
                <th style={{ width: '150px' }}>{t('Date')}</th>
                <th style={{ width: '100px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map(notification => (
                  <tr key={notification.id} className={!notification.is_read ? 'unread-row' : ''}>
                    <td>
                      <div className={`flex items-center justify-center p-2 rounded-lg ${getTypeBg(notification.type)}`}>
                        {getTypeIcon(notification.type)}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${notification.type === 'success' ? 'badge-success' : notification.type === 'warning' ? 'badge-warning' : notification.type === 'error' ? 'badge-danger' : 'badge-info'}`}>
                        {notification.category?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className={`font-medium ${!notification.is_read ? 'text-primary' : ''}`}>
                      {notification.title}
                    </td>
                    <td className="text-muted" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {notification.message}
                    </td>
                    <td className="text-muted">
                      {formatDate(notification.created_at, language)}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-secondary btn-sm" onClick={() => handleViewDetails(notification)} title={t('ViewDetails')}>
                          <Eye size={14} />
                        </button>
                        {!notification.is_read && (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleMarkAsRead(notification.id)} title={t('MarkAsRead')}>
                            <CheckSquare size={14} />
                          </button>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(notification.id)} title={t('Delete')}>
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center" style={{ textAlign: 'center' }}>
                    <div className="empty-state">
                      <Bell size={48} />
                      <p>{t('NoNotifications')}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {filteredNotifications.length > 0 && (
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
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, action: null, title: '', message: '' })}
        onConfirm={confirmModal.action}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={t('Confirm')}
        cancelText={t('Cancel')}
      />

      <Toast message={toast} onClose={() => setToast('')} />

      {detailModal.show && detailModal.notification && (
        <div className="modal-overlay" onClick={() => setDetailModal({ show: false, notification: null })}>
          <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <Info size={20} className="modal-header-icon" />
                <h3>{detailModal.notification.title}</h3>
              </div>
              <button className="modal-close" onClick={() => setDetailModal({ show: false, notification: null })}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="notification-detail">
                <div className="notification-detail-row">
                  <div className="notification-detail-label">
                    <Tag size={16} />
                    {t('Type')}
                  </div>
                  <div className="notification-detail-value">
                    <span className={`badge ${detailModal.notification.type === 'success' ? 'badge-success' : detailModal.notification.type === 'warning' ? 'badge-warning' : detailModal.notification.type === 'error' ? 'badge-danger' : 'badge-info'}`}>
                      {detailModal.notification.type?.charAt(0).toUpperCase() + detailModal.notification.type?.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="notification-detail-row">
                  <div className="notification-detail-label">
                    <Tag size={16} />
                    {t('Category')}
                  </div>
                  <div className="notification-detail-value">
                    {detailModal.notification.category?.replace(/_/g, ' ') || '-'}
                  </div>
                </div>
                
                <div className="notification-detail-row">
                  <div className="notification-detail-label">
                    {t('Message')}
                  </div>
                  <div className="notification-detail-value">
                    {detailModal.notification.message}
                  </div>
                </div>
                
                <div className="notification-detail-row">
                  <div className="notification-detail-label">
                    <Calendar size={16} />
                    {t('Created')}
                  </div>
                  <div className="notification-detail-value">
                    {formatDate(detailModal.notification.created_at, language)}
                  </div>
                </div>
                
                {detailModal.notification.updated_at && (
                  <div className="notification-detail-row">
                    <div className="notification-detail-label">
                      <Calendar size={16} />
                      {t('Updated')}
                    </div>
                    <div className="notification-detail-value">
                      {formatDate(detailModal.notification.updated_at, language)}
                    </div>
                  </div>
                )}
                
                <div className="notification-detail-row">
                  <div className="notification-detail-label">
                    <CheckSquare size={16} />
                    {t('Status')}
                  </div>
                  <div className="notification-detail-value">
                    <span className={`badge ${detailModal.notification.is_read ? 'badge-success' : 'badge-warning'}`}>
                      {detailModal.notification.is_read ? t('Read') : t('Unread')}
                    </span>
                  </div>
                </div>
                
                {detailModal.notification.reference_type && (
                  <div className="notification-detail-row">
                    <div className="notification-detail-label">
                      <Link size={16} />
                      {t('Reference')}
                    </div>
                    <div className="notification-detail-value">
                      {detailModal.notification.reference_type} #{detailModal.notification.reference_id || '-'}
                    </div>
                  </div>
                )}
                
                {detailModal.notification.action_url && (
                  <div className="notification-detail-row">
                    <div className="notification-detail-label">
                      {t('ActionURL')}
                    </div>
                    <div className="notification-detail-value">
                      <code style={{ background: 'var(--background)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                        {detailModal.notification.action_url}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              {!detailModal.notification.is_read && (
                <button className="btn btn-secondary" onClick={() => {
                  handleMarkAsRead(detailModal.notification.id);
                  setDetailModal({ ...detailModal, notification: { ...detailModal.notification, is_read: 1 } });
                }}>
                  <CheckSquare size={16} />
                  {t('MarkAsRead')}
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => setDetailModal({ show: false, notification: null })}>
                {t('Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
