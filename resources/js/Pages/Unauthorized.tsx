import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@/Components/Button';

const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link to="/dashboard">
            <Button className="w-full">
              Go to Dashboard
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" className="w-full">
              Login with Different Account
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          If you believe this is an error, please contact support.
        </p>
        </div>
        </div>
    );
}
export default Unauthorized;