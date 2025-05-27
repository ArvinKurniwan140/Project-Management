import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/Layouts/Layout';
import InputField from '@/Components/InputField';
import Button from '@/Components/Button';
import SuccessMessage from '@/Components/SuccessMessage';
import ErrorMessage from '@/Components/ErrorMessage';
import api from '@/services/api';

const Profile: React.FC = () => {
  const { user, fetchUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/user/profile', formData);
      setSuccess('Profile updated successfully!');
      // Re-fetch user data
      if (fetchUser) {
        await fetchUser();
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="py-6 sm:py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                Profile Information
              </h3>

              {success && <SuccessMessage message={success} className="mb-4" />}
              {error && <ErrorMessage message={error} className="mb-4" />}

              <form onSubmit={handleSubmit} className="space-y-4">
                <InputField
                  label="Full Name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />

                <InputField
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;