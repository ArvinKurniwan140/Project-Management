import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/Layouts/Layout';
import InputField from '@/Components/InputField';
import Button from '@/Components/Button';
import SuccessMessage from '@/Components/SuccessMessage';
import ErrorMessage from '@/Components/ErrorMessage';
import api from '@/services/api';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.password !== passwordData.password_confirmation) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await api.put('/user/password', passwordData);
      setSuccess('Password updated successfully!');
      setPasswordData({
        current_password: '',
        password: '',
        password_confirmation: '',
      });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="py-6 sm:py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Account Information */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Account Information
                </h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Account ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user?.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email Status</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user?.email_verified_at 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user?.email_verified_at ? 'Verified' : 'Unverified'}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                  Change Password
                </h3>

                {success && <SuccessMessage message={success} className="mb-4" />}
                {error && <ErrorMessage message={error} className="mb-4" />}

                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <InputField
                    label="Current Password"
                    type="password"
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handleChange}
                    placeholder="Enter your current password"
                    required
                  />

                  <InputField
                    label="New Password"
                    type="password"
                    name="password"
                    value={passwordData.password}
                    onChange={handleChange}
                    placeholder="Enter your new password"
                    required
                  />

                  <InputField
                    label="Confirm New Password"
                    type="password"
                    name="password_confirmation"
                    value={passwordData.password_confirmation}
                    onChange={handleChange}
                    placeholder="Confirm your new password"
                    required
                  />

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto"
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default Settings;