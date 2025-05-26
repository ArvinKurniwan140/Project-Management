<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Task;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $totalProjects = Project::count();

        $activeTasks = Task::where('status', '!=', 'completed')->count();
        $completedTasks = Task::where('status', 'completed')->count();

        return response()->json([
            'totalProjects' => $totalProjects,
            'activeTasks' => $activeTasks,
            'completedTasks' => $completedTasks,
            'recentActivities' => Task::latest()->limit(5)->pluck('title'),
            'teamPerformance' => [],  // Optional
        ]);
    }
}
