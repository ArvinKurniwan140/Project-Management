import { useEffect, useState, FormEventHandler } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, router } from '@inertiajs/react';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface RegisterResponse {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  user?: any;
}

export default function Register() {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Clean up sensitive data on unmount
    return () => {
      setFormData(prev => ({
        ...prev,
        password: '',
        password_confirmation: '',
      }));
    };
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid.';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number.';
    }
    
    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'Password confirmation is required.';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Real-time validation for password confirmation
    if (field === 'password_confirmation' && formData.password && value !== formData.password) {
      setErrors(prev => ({ ...prev, password_confirmation: 'Passwords do not match.' }));
    } else if (field === 'password_confirmation' && value === formData.password) {
      setErrors(prev => ({ ...prev, password_confirmation: '' }));
    }
  };

  const submit: FormEventHandler = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setProcessing(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const result: RegisterResponse = await response.json();

      if (response.ok && result.success) {
        // Registration successful, redirect to login or dashboard
        router.visit('/login', {
          method: 'get',
          data: { message: 'Registration successful! Please log in.' },
        });
      } else {
        // Handle validation errors from server
        if (response.status === 422 && result.errors) {
          const serverErrors: Record<string, string> = {};
          Object.entries(result.errors).forEach(([field, messages]) => {
            serverErrors[field] = Array.isArray(messages) ? messages[0] : messages;
          });
          setErrors(serverErrors);
        } else {
          setErrors({ 
            general: result.message || 'Registration failed. Please try again.' 
          });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ 
        general: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <GuestLayout>
      <Head title="Register" />

      {errors.general && (
        <div className="mb-4 font-medium text-sm text-red-600 bg-red-50 p-3 rounded-md" role="alert">
          {errors.general}
        </div>
      )}

      <form onSubmit={submit} noValidate>
        <div>
          <InputLabel htmlFor="name" value="Name" />
          <TextInput
            id="name"
            name="name"
            value={formData.name}
            className="mt-1 block w-full"
            autoComplete="name"
            isFocused={true}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            disabled={processing}
          />
          <InputError message={errors.name} className="mt-2" />
        </div>

        <div className="mt-4">
          <InputLabel htmlFor="email" value="Email" />
          <TextInput
            id="email"
            type="email"
            name="email"
            value={formData.email}
            className="mt-1 block w-full"
            autoComplete="username"
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
            autoComplete="new-password"
            onChange={(e) => handleInputChange('password', e.target.value)}
            required
            disabled={processing}
          />
          <InputError message={errors.password} className="mt-2" />
          <div className="mt-1 text-xs text-gray-500">
            Password must be at least 8 characters with uppercase, lowercase, and number.
          </div>
        </div>

        <div className="mt-4">
          <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
          <TextInput
            id="password_confirmation"
            type="password"
            name="password_confirmation"
            value={formData.password_confirmation}
            className="mt-1 block w-full"
            autoComplete="new-password"
            onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
            required
            disabled={processing}
          />
          <InputError message={errors.password_confirmation} className="mt-2" />
        </div>

        <div className="flex items-center justify-end mt-4">
          <Link
            href={route('login')}
            className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Already registered?
          </Link>

          <PrimaryButton 
            className="ms-4" 
            disabled={processing}
          >
            {processing ? 'Creating Account...' : 'Register'}
          </PrimaryButton>
        </div>
      </form>
    </GuestLayout>
  );
}