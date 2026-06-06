import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Shield, Key, User } from 'lucide-react';
import GeneralSettings from './Settings/GeneralSettings';
import RolesTab from './Settings/RolesTab';
import ProfileTab from './Settings/ProfileTab';
import './Settings/Settings.css';

export default function Settings() {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'general');

  const isAdmin = user?.role === 'system_admin' || user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin && (activeTab === 'general' || activeTab === 'roles')) {
      setActiveTab('profile');
    }
  }, [isAdmin]);

  useEffect(() => {
    if ((activeTab === 'roles' || activeTab === 'general') && !isAdmin) {
      setActiveTab('profile');
    }
  }, [activeTab, isAdmin]);

  const tabs = [
    { id: 'general', label: t('General') || 'General', icon: <Shield size={18} />, requiresAdmin: true },
    { id: 'roles', label: t('Roles') || 'Roles', icon: <Key size={18} />, requiresAdmin: true },
    { id: 'profile', label: t('Profile') || 'Profile', icon: <User size={18} /> },
  ];

  const visibleTabs = tabs.filter(tab => !tab.requiresAdmin || isAdmin);

  return (
    <div>
      <div className="page-header">
        <h2>{t('Settings')}</h2>
      </div>

      <div className="settings-tabs">
        {visibleTabs.map(tab => (
          <button
            key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'general' && <GeneralSettings language={language} setLanguage={setLanguage} t={t} />}
      {activeTab === 'roles' && <RolesTab />}
      {activeTab === 'profile' && <ProfileTab />}
    </div>
  );
}
