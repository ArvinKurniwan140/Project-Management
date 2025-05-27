import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/Components/ui/card';
import { Progress } from '@/Components/ui/progress';
import Chart from 'chart.js/auto';

// Import the global User type instead of defining our own
import { User } from '@/types';

// Or if you need to extend it, use intersection types
interface DashboardUser extends User {
  avatar?: string;
}

interface DashboardStats {
  totalProjects: number;
  activeTasks: number;
  completedTasks: number;
  recentActivities: string[];
  teamPerformance: Array<{
    name: string;
    completed: number;
    total: number;
  }>;
}

interface Activity {
  id: number;
  description: string;
  type: 'project' | 'task' | 'team';
  timestamp: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    recentActivities: [],
    teamPerformance: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchData = async (token: string) => {
  try {
    setLoading(true);
    setError(null);

    const authResponse = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!authResponse.ok) {
      if (authResponse.status === 401) {
        localStorage.removeItem('auth_token');
        router.visit('/login');
        return;
      }
      throw new Error('Failed to authenticate user');
    }

    const userData = await authResponse.json();
    const userWithDefaults: User = {
      ...userData.user,
      email_verified_at: userData.user.email_verified_at || new Date().toISOString(),
    };
    setUser(userWithDefaults);

    const statsResponse = await fetch('/api/dashboard', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!statsResponse.ok) {
      throw new Error('Failed to fetch dashboard data');
    }

    const statsData = await statsResponse.json();
    setStats(statsData);
    setTimeout(() => initializeChart(statsData), 100);
  } catch (err) {
    console.error('Dashboard error:', err);
    setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
  } finally {
    setLoading(false);
  }
};

  const initializeChart = (statsData: DashboardStats) => {
    if (!canvasRef.current) return;

    // Destroy existing chart if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const todoTasks = Math.max(0, statsData.totalProjects - statsData.completedTasks - statsData.activeTasks);

    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'In Progress', 'To Do'],
        datasets: [
          {
            label: 'Tasks',
            data: [statsData.completedTasks, statsData.activeTasks, todoTasks],
            backgroundColor: ['#10b981', '#3b82f6', '#fbbf24'],
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
            },
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                return `${label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.visit('/login');
      return;
    }
    fetchData(token);

    // Cleanup chart on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const getCompletionPercentage = () => {
    const total = stats.totalProjects;
    if (total === 0) return 0;
    return Math.round((stats.completedTasks / total) * 100);
  };

  const refreshData = () => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    fetchData(token);
  } else {
    router.visit('/login');
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Dashboard</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No user data available</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <Head title="Dashboard" />

      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold">Welcome back, {user.name}!</h1>
          <p className="mt-1 opacity-90">Here's what's happening with your projects today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Total Projects</h3>
                  <p className="text-3xl font-bold text-indigo-600">{stats.totalProjects}</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Active Tasks</h3>
                  <p className="text-3xl font-bold text-yellow-600">{stats.activeTasks}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Completed Tasks</h3>
                  <p className="text-3xl font-bold text-green-600">{stats.completedTasks}</p>
                  <Progress
                    value={getCompletionPercentage()}
                    className="mt-2 h-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">{getCompletionPercentage()}% complete</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart and Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Project Progress</h3>
                <button
                  onClick={refreshData}
                  className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Refresh
                </button>
              </div>
              <div className="relative h-64">
                <canvas 
                  ref={canvasRef}
                  id="projectChart" 
                  className="w-full h-full"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {stats.recentActivities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p>No recent activity</p>
                  </div>
                ) : (
                  stats.recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                      <p className="text-sm text-gray-700">{activity}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}