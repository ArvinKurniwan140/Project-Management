import { useEffect, useState, FormEventHandler } from 'react';
import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, router } from '@inertiajs/react';

interface LoginProps {
  status?: string;
  canResetPassword: boolean;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  authorization?: {
    token: string;
    refresh_token: string;
    type: string;
    expires_in: number;
  };
  user?: any;
}

export default function Login({ status, canResetPassword }: LoginProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Clean up password on unmount for security
    return () => {
      setFormData(prev => ({ ...prev, password: '' }));
    };
  }, []);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid.';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const submit: FormEventHandler = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setProcessing(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include', // Include cookies for CSRF protection
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          remember: formData.remember,
        }),
      });

      const result: LoginResponse = await response.json();

      if (response.ok && result.success) {
        // Store tokens securely (httpOnly cookies would be better)
        if (result.authorization) {
            localStorage.setItem('auth_token', result.authorization.token);
            localStorage.setItem('refresh_token', result.authorization.refresh_token);
          // Use Inertia's visit method for proper SPA navigation
          router.visit('/dashboard', {
            method: 'get',
            data: { token: result.authorization.token },
            onSuccess: () => {
              // Token will be handled by the server/backend
              console.log('Login successful');
            },
          });
        }
      } else {
        // Handle specific error cases
        if (response.status === 401) {
          setErrors({ general: 'Invalid email or password.' });
        } else if (response.status === 422 && result.message) {
          setErrors({ general: result.message });
        } else {
          setErrors({ general: result.message || 'Login failed. Please try again.' });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ 
        general: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <GuestLayout>
      <Head title="Log in" />

      {status && (
        <div className="mb-4 font-medium text-sm text-green-600" role="alert">
          {status}
        </div>
      )}

      {errors.general && (
        <div className="mb-4 font-medium text-sm text-red-600 bg-red-50 p-3 rounded-md" role="alert">
          {errors.general}
        </div>
      )}

      <form onSubmit={submit} noValidate>
        <div>
          <InputLabel htmlFor="email" value="Email" />
          <TextInput
            id="email"
            type="email"
            name="email"
            value={formData.email}
            className="mt-1 block w-full"
            autoComplete="username"
            isFocused={true}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            disabled={processing}
          />
          <InputError message={errors.email} className="mt-2" />
        </div>

        <div className="mt-4">
          <InputLabel htmlFor="password" value="Password" />
          <TextInput
            id="password"
            type="password"
            name="password"
            value={formData.password}
            className="mt-1 block w-full"
            autoComplete="current-password"
            onChange={(e) => handleInputChange('password', e.target.value)}
            required
            disabled={processing}
          />
          <InputError message={errors.password} className="mt-2" />
        </div>

        <div className="block mt-4">
          <label className="flex items-center">
            <Checkbox 
              name="remember" 
              checked={formData.remember} 
              onChange={(e) => handleInputChange('remember', e.target.checked)}
              disabled={processing}
            />
            <span className="ms-2 text-sm text-gray-600">Remember me</span>
          </label>
        </div>

        <div className="flex items-center justify-end mt-4">
          {canResetPassword && (
            <Link
              href={route('password.request')}
              className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Forgot your password?
            </Link>
          )}
          <PrimaryButton 
            className="ms-4" 
            disabled={processing}
          >
            {processing ? 'Signing in...' : 'Log in'}
          </PrimaryButton>
        </div>
      </form>
    </GuestLayout>
  );
}