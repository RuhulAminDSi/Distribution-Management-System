import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { authService } from '../../services/api';
import { User, Camera, Trash2, Check, Save } from 'lucide-react';

export default function ProfileTab() {
  const { user, setUser } = useAuth();
  const { t } = useLanguage();
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || user.fullName || user.name || '',
        email: user.email || '',
        phone: user.phone || user.phone_number || ''
      });
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(false);

    try {
      const userId = user.id || user.user_id;
      await authService.updateUser(userId, {
        full_name: profileData.full_name,
        email: profileData.email,
        phone: profileData.phone
      });

      setUser(prev => ({
        ...prev,
        full_name: profileData.full_name,
        email: profileData.email,
        phone: profileData.phone
      }));

      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append('profile_picture', file);
      const res = await authService.uploadProfilePicture(user.id, formData);
      user.profile_picture = res.data.profile_picture;
      setProfileData({ ...profileData, profile_picture: res.data.profile_picture });
    } catch (error) {
      alert(error.response?.data?.message || 'Upload failed');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handlePhotoDelete = async () => {
    if (!confirm('Remove profile picture?')) return;
    try {
      await authService.deleteProfilePicture(user.id);
      user.profile_picture = null;
      setProfileData({ ...profileData, profile_picture: null });
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="settings-content">
      <div className="settings-section">
        <div className="section-header">
          <User size={20} />
          <h3>{t('Profile')} {t('Settings')}</h3>
        </div>
        <div className="settings-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {user?.profile_picture ? (
                <img src={user.profile_picture} alt="" className="profile-avatar-img" />
              ) : (
                profileData.full_name?.charAt(0) || 'U'
              )}
              <div className="profile-avatar-overlay" onClick={() => fileInputRef.current?.click()}>
                {photoUploading ? '...' : <Camera size={20} />}
              </div>
              {user?.profile_picture && (
                <div className="profile-avatar-delete" onClick={handlePhotoDelete} title="Remove photo">
                  <Trash2 size={14} />
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handlePhotoUpload}
              />
            </div>
            <div className="profile-info">
              <h4>{profileData.full_name}</h4>
              <p>{user?.username}</p>
              <span className="role-badge">{user?.role}</span>
            </div>
          </div>

          <form className="profile-form" onSubmit={handleProfileSave}>
            <div className="form-row-2">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input type="text" className="form-input" value={user?.username || ''} disabled />
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={profileLoading}>
              {profileLoading ? 'Saving...' : profileSuccess ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
