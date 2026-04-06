import { useState } from 'react';
import { 
  LogOut, 
  BarChart3, 
  Users, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  Shield,
  Flag,
  UserX,
  Trash2,
  CheckCircle,
  XCircle,
  User as UserIcon,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import type { User, FoodItem } from '../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import UserProfile from './UserProfile';
import GlobalListings from './GlobalListings';

interface AdminDashboardProps {
  user: User;
  foodItems: FoodItem[];
  onUpdateFood: (id: string, updates: Partial<FoodItem>) => void;
  onUpdateUser?: (updates: Partial<User>) => void;
  onLogout: () => void;
}

export default function AdminDashboard({ 
  user, 
  foodItems, 
  onUpdateFood,
  onUpdateUser,
  onLogout 
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'reports' | 'global'>('analytics');
  const [showProfile, setShowProfile] = useState(false);

  // Analytics calculations
  const totalDonations = foodItems.length;
  const completedDonations = foodItems.filter(item => item.status === 'completed').length;
  const activeDonations = foodItems.filter(item => item.status === 'available').length;
  const mealsServed = completedDonations * 3; // Estimate 3 meals per donation
  const flaggedListings = foodItems.filter(item => item.isFlagged).length;

  // Mock users data
  const mockUsers = [
    { id: '1', name: 'John Donor', type: 'donor', email: 'john@example.com', donations: 15, isBanned: false },
    { id: '2', name: 'Jane Receiver', type: 'receiver', email: 'jane@example.com', received: 8, isBanned: false },
    { id: '3', name: 'Bob Restaurant', type: 'donor', email: 'bob@example.com', donations: 23, isBanned: false },
    { id: '4', name: 'Alice Shelter', type: 'receiver', email: 'alice@example.com', received: 12, isBanned: false },
  ];

  const [users, setUsers] = useState(mockUsers);

  // Mock reports data
  const mockReports = [
    { id: '1', reporterId: '2', itemId: '1', reason: 'Food quality concern', status: 'pending' as const, timestamp: '2026-02-10T14:30:00Z' },
    { id: '2', reporterId: '4', userId: '3', reason: 'Unprofessional behavior', status: 'pending' as const, timestamp: '2026-02-10T12:00:00Z' },
  ];

  const [reports, setReports] = useState(mockReports);

  // Chart data
  const monthlyData = [
    { month: 'Jan', donations: 45, meals: 135 },
    { month: 'Feb', donations: 52, meals: 156 },
    { month: 'Mar', donations: 61, meals: 183 },
    { month: 'Apr', donations: 58, meals: 174 },
    { month: 'May', donations: 70, meals: 210 },
    { month: 'Jun', donations: 85, meals: 255 },
  ];

  const impactData = [
    { metric: 'Food Saved (kg)', value: 450 },
    { metric: 'CO2 Reduced (kg)', value: 1200 },
    { metric: 'People Helped', value: 340 },
  ];

  const handleBanUser = (userId: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, isBanned: !u.isBanned } : u));
    toast.success('User status updated');
  };

  const handleDeleteListing = (itemId: string) => {
    onUpdateFood(itemId, { status: 'expired' });
    toast.success('Listing removed');
  };

  const handleResolveReport = (reportId: string, action: string) => {
    setReports(reports.map(r => r.id === reportId ? { ...r, status: action as any } : r));
    toast.success(`Report ${action}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-gray-600 text-lg mt-1">Welcome, {user.name}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 rounded-xl font-semibold transition-colors"
              >
                <UserIcon className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl text-gray-700 font-semibold transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {showProfile ? (
          <UserProfile user={user} onUpdate={(updates) => { onUpdateUser?.(updates); setShowProfile(false); }} onClose={() => setShowProfile(false)} />
        ) : (
          <>
        {/* Tab Navigation */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-lg transition-colors ${
              activeTab === 'analytics'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="w-6 h-6" />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-lg transition-colors ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users className="w-6 h-6" />
            <span>User Management</span>
          </button>
          <button
            onClick={() => setActiveTab('global')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-lg transition-colors ${
              activeTab === 'global'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Globe className="w-6 h-6" />
            <span>Global Network</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-lg transition-colors ${
              activeTab === 'reports'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Flag className="w-6 h-6" />
            <span>Reports ({reports.filter(r => r.status === 'pending').length})</span>
          </button>
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <Package className="w-10 h-10 text-green-600" />
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-gray-600 text-lg">Total Donations</p>
                <p className="text-4xl font-bold text-gray-800 mt-2">{totalDonations}</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <Package className="w-10 h-10 text-blue-600" />
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-gray-600 text-lg">Meals Served</p>
                <p className="text-4xl font-bold text-gray-800 mt-2">{mealsServed}</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-10 h-10 text-purple-600" />
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-gray-600 text-lg">Active Users</p>
                <p className="text-4xl font-bold text-gray-800 mt-2">{users.length}</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <AlertTriangle className="w-10 h-10 text-orange-600" />
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-gray-600 text-lg">Flagged Listings</p>
                <p className="text-4xl font-bold text-gray-800 mt-2">{flaggedListings}</p>
              </div>
            </div>

            {/* Monthly Trends Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Monthly Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="donations" stroke="#8b5cf6" strokeWidth={2} name="Donations" />
                  <Line type="monotone" dataKey="meals" stroke="#10b981" strokeWidth={2} name="Meals Served" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Impact Metrics */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Impact Metrics</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={impactData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Funding Impact */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 shadow-md text-white">
              <h3 className="text-2xl font-bold mb-4">Funding Impact Potential</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-purple-100 text-lg">Environmental Impact</p>
                  <p className="text-3xl font-bold mt-2">1,200 kg CO₂ saved</p>
                </div>
                <div>
                  <p className="text-purple-100 text-lg">Social Impact</p>
                  <p className="text-3xl font-bold mt-2">340 people helped</p>
                </div>
                <div>
                  <p className="text-purple-100 text-lg">Economic Value</p>
                  <p className="text-3xl font-bold mt-2">$12,500 saved</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Manage Users</h3>
              <div className="space-y-4">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className={`p-6 rounded-xl border-2 ${
                      u.isBanned ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xl font-bold text-gray-800">{u.name}</h4>
                        <p className="text-gray-600">{u.email}</p>
                        <div className="flex gap-4 mt-2">
                          <span className="text-sm text-gray-500">
                            Type: <span className="font-semibold capitalize">{u.type}</span>
                          </span>
                          {u.type === 'donor' && (
                            <span className="text-sm text-gray-500">
                              Donations: <span className="font-semibold">{u.donations}</span>
                            </span>
                          )}
                          {u.type === 'receiver' && (
                            <span className="text-sm text-gray-500">
                              Received: <span className="font-semibold">{u.received}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleBanUser(u.id)}
                          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-colors ${
                            u.isBanned
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-red-600 hover:bg-red-700 text-white'
                          }`}
                        >
                          <UserX className="w-5 h-5" />
                          <span>{u.isBanned ? 'Unban' : 'Ban'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Flagged Listings */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Flagged Listings</h3>
              <div className="space-y-4">
                {foodItems.filter(item => item.isFlagged).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No flagged listings</p>
                ) : (
                  foodItems.filter(item => item.isFlagged).map((item) => (
                    <div key={item.id} className="p-6 rounded-xl bg-orange-50 border-2 border-orange-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-xl font-bold text-gray-800">{item.name}</h4>
                          <p className="text-gray-600">Donor: {item.donorName}</p>
                          <p className="text-gray-600">Location: {item.location}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteListing(item.id)}
                          className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Dispute Reports</h3>
            <div className="space-y-4">
              {reports.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending reports</p>
              ) : (
                reports.map((report) => (
                  <div
                    key={report.id}
                    className={`p-6 rounded-xl border-2 ${
                      report.status === 'pending'
                        ? 'bg-yellow-50 border-yellow-200'
                        : report.status === 'resolved'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-xl font-bold text-gray-800">{report.reason}</h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            report.status === 'pending'
                              ? 'bg-yellow-200 text-yellow-800'
                              : report.status === 'resolved'
                              ? 'bg-green-200 text-green-800'
                              : 'bg-gray-200 text-gray-800'
                          }`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-600">
                          Reported: {new Date(report.timestamp).toLocaleString()}
                        </p>
                        {report.itemId && (
                          <p className="text-gray-600">Item ID: {report.itemId}</p>
                        )}
                        {report.userId && (
                          <p className="text-gray-600">User ID: {report.userId}</p>
                        )}
                      </div>
                      {report.status === 'pending' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleResolveReport(report.id, 'resolved')}
                            className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors"
                          >
                            <CheckCircle className="w-5 h-5" />
                            <span>Resolve</span>
                          </button>
                          <button
                            onClick={() => handleResolveReport(report.id, 'dismissed')}
                            className="flex items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
                          >
                            <XCircle className="w-5 h-5" />
                            <span>Dismiss</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Global Tab */}
        {activeTab === 'global' && (
          <GlobalListings items={foodItems.filter(i => i.status === 'available')} />
        )}
        </>
        )}
      </div>
    </div>
  );
}
