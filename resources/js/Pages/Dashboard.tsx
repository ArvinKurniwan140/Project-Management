import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/Components/ui/card';
import { Progress } from '@/Components/ui/progress';
import Chart from 'chart.js/auto';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    recentActivities: [],
    teamPerformance: [],
  });

  useEffect(() => {
    const fetchUserAndStats = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return (window.location.href = '/login');

      // Ambil user dari JWT token
      const userRes = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!userRes.ok) return (window.location.href = '/login');

      const userData = await userRes.json();
      setUser(userData.user); // simpan user untuk DashboardLayout

      // Fetch data dashboard
      const statsRes = await fetch('/api/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!statsRes.ok) return;

      const statsData = await statsRes.json();
      setStats(statsData);

      // Tampilkan chart
      setTimeout(() => {
        const ctx = document.getElementById('projectChart') as HTMLCanvasElement;
        if (ctx) {
          new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: ['Completed', 'In Progress', 'To Do'],
              datasets: [
                {
                  label: 'Tasks',
                  data: [
                    statsData.completedTasks,
                    statsData.activeTasks,
                    statsData.totalProjects - statsData.completedTasks - statsData.activeTasks,
                  ],
                  backgroundColor: ['#10b981', '#3b82f6', '#fbbf24'],
                },
              ],
            },
          });
        }
      }, 300);
    };

    fetchUserAndStats();
  }, []);

  if (!user) {
    return <div className="p-4">Loading...</div>; // fallback
  }

  return (
    <DashboardLayout user={user}>
      <Head title="Dashboard" />

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold">Total Projects</h3>
            <p className="text-3xl font-bold text-indigo-600">{stats.totalProjects}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold">Active Tasks</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.activeTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold">Completed Tasks</h3>
            <p className="text-3xl font-bold text-green-600">{stats.completedTasks}</p>
            <Progress
              value={Math.round((stats.completedTasks / (stats.totalProjects || 1)) * 100)}
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Project Progress Chart</h3>
            <canvas id="projectChart" className="w-full h-64"></canvas>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              {stats.recentActivities.length === 0 ? (
                <li>No activity yet.</li>
              ) : (
                stats.recentActivities.map((act: any, idx: number) => <li key={idx}>• {act}</li>)
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
