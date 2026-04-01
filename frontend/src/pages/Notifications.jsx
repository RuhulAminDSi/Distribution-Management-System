import { useState, useEffect } from 'react';
import { useLanguage, formatDate } from '../context/LanguageContext';
import { notificationService } from '../services/api';
import { Bell, CheckCircle, AlertCircle, Info, CheckSquare, X } from 'lucide-react';

export default function Notifications() {
  const { t, language } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(20);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

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
      setNotifications(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id, isRead) => {
    try {
      await notificationService.markAsRead(id);
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: 1 } : n
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} className="text-green-600" />;
      case 'warning':
        return <AlertCircle size={18} className="text-yellow-600" />;
      case 'error':
        return <AlertCircle size={18} className="text-red-600" />;
      case 'info':
      default:
        return <Info size={18} className="text-blue-600" />;
    }
  };

  const getBadgeClass = (type) => {
    switch (type) {
      case 'success':
        return 'badge-success';
      case 'warning':
        return 'badge-warning';
      case 'error':
        return 'badge-danger';
      case 'info':
      default:
        return 'badge-primary';
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
          <div className="header-left">
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

        <div className="card-body" style={{ padding: 0 }}>
          {filteredNotifications.length > 0 ? (
            <div className="notifications-list">
              {filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                >
                  <div className="notification-icon">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-header">
                      <h4 className="notification-title">{notification.title}</h4>
                      <span className={`badge ${getBadgeClass(notification.type)}`}>
                        {notification.type}
                      </span>
                    </div>
                    <p className="notification-message">{notification.message}</p>
                    <div className="notification-footer">
                      <small className="notification-time">
                        {formatDate(notification.created_at, language)}
                      </small>
                      {notification.category && (
                        <small className="notification-category">
                          {notification.category.replace(/_/g, ' ')}
                        </small>
                      )}
                    </div>
                  </div>
                  <div className="notification-actions">
                    {!notification.is_read && (
                      <button
                        className="btn-icon"
                        title={t('MarkAsRead')}
                        onClick={() => handleMarkAsRead(notification.id, notification.is_read)}
                      >
                        <CheckSquare size={18} />
                      </button>
                    )}
                    <button
                      className="btn-icon danger"
                      title={t('Delete')}
                      onClick={() => handleDelete(notification.id)}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Bell size={48} />
              <p>{t('NoNotifications')}</p>
            </div>
          )}
        </div>

        {filteredNotifications.length > 0 && (
          <div className="pagination-footer">
            <div className="pagination-left">
              <label>{t('EntriesPerPage')}:</label>
              <select
                className="form-select sm"
                value={limit}
                onChange={(e) => {
                  setLimit(parseInt(e.target.value));
                  setPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="pagination-info">
                {t('Total')}: {notifications.length}
              </span>
            </div>
            <div className="pagination-right">
              <button
                className="btn btn-sm btn-secondary"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                {t('Previous')}
              </button>
              <span className="page-info">
                {t('Page')} {page} {t('Of')} {totalPages}
              </span>
              <button
                className="btn btn-sm btn-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                {t('Next')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
