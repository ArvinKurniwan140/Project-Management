import { ReactNode, useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { User } from '@/types';
import {
  Bell,
  UserCircle,
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  Users,
  LogOut,
  UserCog,
} from 'lucide-react';

interface LayoutProps {
  user: User;
  children: ReactNode;
}

export default function DashboardLayout({ user, children }: LayoutProps) {
  const isAdmin = user.roles?.includes('Admin') ?? false;
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const closeDropdown = () => setDropdownOpen(false);

  // ✅ Close dropdown if click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow hidden md:block">
        <div className="p-4 font-bold text-xl text-indigo-600">TaskFlow</div>
        <nav className="mt-6 space-y-2 px-4 text-sm">
          <Link href="/dashboard" className="flex items-center gap-2 py-2 hover:text-indigo-500">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link href="/projects" className="flex items-center gap-2 py-2 hover:text-indigo-500">
            <FolderKanban className="w-4 h-4" />
            Projects
          </Link>
          <Link href="/tasks" className="flex items-center gap-2 py-2 hover:text-indigo-500">
            <ListChecks className="w-4 h-4" />
            Tasks
          </Link>
          {isAdmin && (
            <Link href="/users" className="flex items-center gap-2 py-2 hover:text-indigo-500">
              <Users className="w-4 h-4" />
              User Management
            </Link>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <div className="text-lg font-semibold text-gray-700">Dashboard</div>
          <div className="flex items-center space-x-4">
            <button className="relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                3
              </span>
            </button>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <span>{user.name}</span>
                <UserCircle className="w-6 h-6 text-gray-600" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-50">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <UserCog className="inline-block mr-2 w-4 h-4" />
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                  <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <LogOut className="inline-block mr-2 w-4 h-4" />
                    Logout
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
