import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import { 
  UserIcon, 
  CameraIcon, 
  PencilIcon,
  ShieldCheckIcon,
  BellIcon,
  ChartBarIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, updatePassword, uploadProfileImage, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    skinType: user?.skinType || '',
    skinConcerns: user?.skinConcerns || [],
    allergies: user?.allergies || '',
    preferences: user?.preferences || {
      emailNotifications: true,
      smsNotifications: false,
      analysisReminders: true,
      productRecommendations: true
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const skinTypes = ['Dry', 'Oily', 'Combination', 'Sensitive', 'Normal'];
  const skinConcernOptions = [
    'Acne', 'Dark Spots', 'Wrinkles', 'Fine Lines', 'Dryness', 
    'Oiliness', 'Sensitivity', 'Redness', 'Large Pores', 'Uneven Tone'
  ];

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSkinConcernToggle = (concern) => {
    setProfileData(prev => ({
      ...prev,
      skinConcerns: prev.skinConcerns.includes(concern)
        ? prev.skinConcerns.filter(c => c !== concern)
        : [...prev.skinConcerns, concern]
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Upload image
      try {
        await uploadProfileImage(file);
        toast.success('Profile image updated successfully');
      } catch (error) {
        toast.error('Failed to upload image');
        setImagePreview(null);
      }
    }
  };

  const handleProfileSave = async () => {
    try {
      await updateProfile(profileData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error('Failed to update password');
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Image & Basic Info */}
          <div className="lg:col-span-1">
            <Card className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-3xl font-bold">
                  {imagePreview || user?.profileImage ? (
                    <img
                      src={imagePreview || user.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(user?.firstName, user?.lastName)
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full hover:bg-primary-600 transition-colors"
                >
                  <CameraIcon className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-gray-600 mb-4">{user?.email}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Member since</span>
                  <span className="font-medium">
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Analyses</span>
                  <span className="font-medium">{user?.totalAnalyses || 0}</span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  icon={ShieldCheckIcon}
                  onClick={() => setShowPasswordModal(true)}
                >
                  Change Password
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  icon={ChartBarIcon}
                  href="/history"
                >
                  View Analysis History
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  icon={HeartIcon}
                  href="/products"
                >
                  Browse Products
                </Button>
              </div>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                <Button
                  variant={isEditing ? "primary" : "outline"}
                  icon={isEditing ? null : PencilIcon}
                  onClick={isEditing ? handleProfileSave : () => setIsEditing(true)}
                >
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="First Name"
                  value={profileData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={!isEditing}
                />
                <Input
                  label="Last Name"
                  value={profileData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={!isEditing}
                />
                <Input
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                />
                <Input
                  label="Phone"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </Card>

            {/* Skin Profile */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Skin Profile</h3>
              
              <div className="space-y-6">
                {/* Skin Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skin Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {skinTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => isEditing && handleInputChange('skinType', type)}
                        disabled={!isEditing}
                        className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                          profileData.skinType === type
                            ? 'bg-primary-500 text-white border-primary-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                        } ${!isEditing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skin Concerns */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skin Concerns
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {skinConcernOptions.map((concern) => (
                      <button
                        key={concern}
                        onClick={() => isEditing && handleSkinConcernToggle(concern)}
                        disabled={!isEditing}
                        className={`p-2 rounded-lg border text-sm font-medium transition-colors ${
                          profileData.skinConcerns.includes(concern)
                            ? 'bg-secondary-500 text-white border-secondary-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-secondary-300'
                        } ${!isEditing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {concern}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Allergies */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Known Allergies or Sensitivities
                  </label>
                  <textarea
                    value={profileData.allergies}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="List any ingredients or products you're allergic to..."
                  />
                </div>
              </div>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
              
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive updates via email' },
                  { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive updates via text message' },
                  { key: 'analysisReminders', label: 'Analysis Reminders', description: 'Get reminded to track your skin progress' },
                  { key: 'productRecommendations', label: 'Product Recommendations', description: 'Receive personalized product suggestions' }
                ].map((pref) => (
                  <div key={pref.key} className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{pref.label}</h4>
                      <p className="text-sm text-gray-600">{pref.description}</p>
                    </div>
                    <button
                      onClick={() => isEditing && handleInputChange(`preferences.${pref.key}`, !profileData.preferences[pref.key])}
                      disabled={!isEditing}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        profileData.preferences[pref.key] ? 'bg-primary-500' : 'bg-gray-300'
                      } ${!isEditing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          profileData.preferences[pref.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Password Change Modal */}
        <Modal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title="Change Password"
        >
          <div className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              placeholder="Enter your current password"
            />
            <Input
              label="New Password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              placeholder="Enter new password (min 8 characters)"
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Confirm your new password"
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handlePasswordChange}
                disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              >
                Update Password
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Profile;