import { useState, useEffect } from 'react';
import { Plus, LogOut, Package, Clock, CheckCircle, AlertCircle, User as UserIcon, Globe, ClipboardList, ThumbsUp, XCircle, Bell } from 'lucide-react';
import { toast } from 'sonner';
import type { User, FoodItem } from '../App';
import AddFoodForm from './AddFoodForm';
import UserProfile from './UserProfile';
import GlobalListings from './GlobalListings';
import NotificationPanel from './NotificationPanel';
import ReviewsList from './ReviewsList';
import UserReputation from './UserReputation';
import GoogleMapView from './GoogleMapView';
import { MessageCircle, MapPin } from 'lucide-react';
interface AppNotification {
  id: string;
  type: 'push' | 'email' | 'sms';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface DonorDashboardProps {
  user: User;
  foodItems: FoodItem[];
  onAddFood: (item: Omit<FoodItem, 'id' | 'donorId' | 'donorName' | 'status'>) => void;
  onUpdateFood: (id: string, updates: Partial<FoodItem>) => void;
  onUpdateUser?: (updates: Partial<User>) => void;
  onDeleteFood: (id: string) => void;
  onLogout: () => void;
}

export default function DonorDashboard({ 
  user, 
  foodItems, 
  onAddFood, 
  onUpdateFood,
  onUpdateUser,
  onDeleteFood,
  onLogout 
}: DonorDashboardProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLiveMap, setShowLiveMap] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState<'my_donations' | 'global' | 'requests'>('my_donations');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});

  const toggleReviews = (id: string) => {
    setExpandedReviews(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const myDonations = foodItems.filter(item => item.status === 'available' || item.status === 'expired');
  const reservedRequests = foodItems.filter(item => item.status === 'reserved');
  const approvedRequests = foodItems.filter(item => item.status === 'approved');
  const pickedRequests = foodItems.filter(item => item.status === 'completed');

  useEffect(() => {
    if (reservedRequests.length > 0) {
      const newNotifs = reservedRequests.map(item => ({
        id: `reservation-${item.id}`,
        type: 'push' as const,
        title: 'New Reservation Request',
        message: `${item.name} has been requested by a receiver.`,
        timestamp: 'Just now',
        read: false
      }));
      setNotifications(prev => {
        const existingIds = prev.map(n => n.id);
        const unique = newNotifs.filter(n => !existingIds.includes(n.id));
        return [...unique, ...prev];
      });
    }
  }, [reservedRequests.length]);

  const unreadCount = notifications.filter(n => !n.read).length;


  const handleAddFood = (item: Omit<FoodItem, 'id' | 'donorId' | 'donorName' | 'status'>) => {
    onAddFood(item);
    setShowAddForm(false);
    toast.success('Food item added successfully!');
  };

  const handleApproveReservation = (id: string) => {
    onUpdateFood(id, { status: 'approved' });
    toast.success('Reservation approved!');
  };

  const handleRejectReservation = (id: string) => {
    // Reset to available and remove reservedBy
    onUpdateFood(id, { status: 'available', reservedBy: undefined });
    toast.info('Reservation rejected and item returned to available pool.');
  };

  const handleMarkComplete = (id: string) => {
    onUpdateFood(id, { status: 'completed' });
    toast.success('Pickup completed!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <div className="w-3 h-3 bg-green-500 rounded-full" />;
      case 'reserved':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full" />;
      case 'expired':
        return <div className="w-3 h-3 bg-red-500 rounded-full" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Donor Dashboard</h1>
              <p className="text-gray-600 text-lg mt-1">Welcome, {user.name}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowLiveMap(!showLiveMap); setShowProfile(false); setShowAddForm(false); }}
                className={`flex items-center space-x-2 px-6 py-3 border-2 rounded-xl font-semibold transition-colors ${
                  showLiveMap ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-green-600 text-green-600 hover:bg-green-50'
                }`}
              >
                <MapPin className="w-5 h-5" />
                <span>Live Map</span>
              </button>
              <button
                onClick={() => { setShowProfile(true); setShowLiveMap(false); setShowAddForm(false); }}
                className="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 rounded-xl font-semibold transition-colors"
              >
                <UserIcon className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors shadow-sm"
              >
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
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
        ) : showLiveMap ? (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <MapPin className="w-8 h-8 mr-3 text-green-600" />
              Donor Live Map
            </h2>
            <GoogleMapView 
              items={foodItems.filter(item => (item.status === 'approved' || item.status === 'completed') && item.donorId === user.id)} 
              userLocation={{ lat: user.latitude || 40.7128, lng: user.longitude || -74.0060 }} 
            />
          </div>
        ) : (
          <>
          {showNotifications && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="max-w-2xl w-full overflow-hidden rounded-2xl shadow-[0_0_40px_rgba(22,163,74,0.3)] animate-in fade-in zoom-in duration-200">
                <NotificationPanel 
                  onClose={() => setShowNotifications(false)} 
                  notifications={notifications}
                  setNotifications={setNotifications}
                />
              </div>
            </div>
          )}

          {/* Add Food Button */}
          {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="mb-8 w-full md:w-auto flex items-center justify-center space-x-3 px-8 py-5 bg-green-600 hover:bg-green-700 text-white rounded-2xl text-xl font-bold shadow-lg transition-colors"
          >
            <Plus className="w-8 h-8" />
            <span>Add Food Donation</span>
          </button>
        )}

        {/* Add Food Form */}
        {showAddForm && (
          <AddFoodForm 
            onSubmit={handleAddFood}
            onCancel={() => setShowAddForm(false)}
            userLat={user.latitude}
            userLng={user.longitude}
            defaultPhone={user.phone}
          />
        )}

        {/* Status Legend */}
        <div className="mb-6 bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Status Guide</h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full" />
              <span className="text-lg text-gray-700">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full" />
              <span className="text-lg text-gray-700">Reserved</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full" />
              <span className="text-lg text-gray-700">Expired</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 flex gap-4 border-b-2 border-gray-200 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('my_donations')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-lg transition-colors shadow-sm whitespace-nowrap border-2 ${
              activeTab === 'my_donations'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Package className="w-6 h-6" />
            <span>My Donations</span>
          </button>
          <button
            onClick={() => setActiveTab('global')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-lg transition-colors shadow-sm whitespace-nowrap border-2 ${
              activeTab === 'global'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Globe className="w-6 h-6" />
            <span>Global Network</span>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-lg transition-colors shadow-sm whitespace-nowrap border-2 ${
              activeTab === 'requests'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
            }`}
          >
            <ClipboardList className="w-6 h-6" />
            <span>My Requests</span>
          </button>
        </div>

        {activeTab === 'requests' ? (
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <ClipboardList className="w-7 h-7 mr-3 text-yellow-500" />
                Action Needed: Approve Reservation ({reservedRequests.length})
              </h2>
              {reservedRequests.length === 0 ? <p className="text-gray-500 italic">No pending reservations.</p> : (
                <div className="grid gap-6">
                  {reservedRequests.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl p-6 shadow-md border-l-8 border-yellow-400 border-y border-r border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                          <h3 className="text-2xl font-bold text-gray-800">{item.name}</h3>
                        </div>
                        <span className="px-4 py-2 rounded-full font-semibold bg-yellow-100 text-yellow-800 border-yellow-300">Reserved</span>
                      </div>
                      <p className="text-gray-600 mb-2">A receiver has requested this item. Please approve their reservation to coordinate pickup.</p>
                      <div className="mb-4 bg-white/50 p-3 rounded-lg flex items-center shadow-sm">
                        <span className="font-semibold text-gray-700 mr-3">Receiver Reputation:</span>
                        <UserReputation userId={item.reservedBy} />
                      </div>
                      <div className="mb-4 bg-blue-50 p-3 rounded-lg flex items-center shadow-sm">
                        <span className="font-semibold text-blue-700 mr-3">Receiver Contact:</span>
                        <span className="text-blue-800 text-lg">{item.receiverContact || 'Not provided'}</span>
                      </div>
                      <div className="flex gap-4 flex-wrap">
                        <button onClick={() => handleApproveReservation(item.id)} className="px-6 py-3 flex items-center bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors">
                          <ThumbsUp className="w-5 h-5 mr-2" /> Approve Reservation
                        </button>
                        <button onClick={() => handleRejectReservation(item.id)} className="px-6 py-3 flex items-center bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-semibold transition-colors">
                          <XCircle className="w-5 h-5 mr-2" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Clock className="w-7 h-7 mr-3 text-blue-500" />
                Approved: Waiting for Pickup ({approvedRequests.length})
              </h2>
              {approvedRequests.length === 0 ? <p className="text-gray-500 italic">No approved items waiting for pickup.</p> : (
                <div className="grid gap-6">
                  {approvedRequests.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl p-6 shadow-md border-l-8 border-blue-500 border-y border-r border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full" />
                          <h3 className="text-2xl font-bold text-gray-800">{item.name}</h3>
                        </div>
                        <span className="px-4 py-2 rounded-full font-semibold bg-blue-100 text-blue-800 border-blue-300">Approved</span>
                      </div>
                      <p className="text-gray-600 mb-4">You have approved this. Waiting for the receiver to arrive and pick it up.</p>
                      <div className="mb-4 bg-green-50 p-3 rounded-lg flex items-center shadow-sm">
                        <span className="font-semibold text-green-700 mr-3">Receiver Contact:</span>
                        <span className="text-green-800 text-lg font-bold">{item.receiverContact || 'Not provided'}</span>
                      </div>
                      <button onClick={() => handleMarkComplete(item.id)} className="px-6 py-3 flex items-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors">
                        <CheckCircle className="w-5 h-5 mr-2" /> Mark as Picked
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <CheckCircle className="w-7 h-7 mr-3 text-emerald-500" />
                Picked & Completed ({pickedRequests.length})
              </h2>
              {pickedRequests.length === 0 ? <p className="text-gray-500 italic">No picked items yet.</p> : (
                <div className="grid gap-6 opacity-60">
                  {pickedRequests.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl p-6 shadow-md border-l-8 border-emerald-500 border-y border-r border-gray-200">
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <p className="text-xl font-bold text-gray-700 line-through">{item.name}</p>
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800 border-emerald-300">Picked</span>
                        </div>

                        <button 
                          onClick={() => toggleReviews(item.id)}
                          className="self-start flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors mt-2"
                        >
                          <MessageCircle className="w-5 h-5 mr-1" />
                          {expandedReviews[item.id] ? 'Hide Discussion' : 'Rate & Review This Receiver'}
                        </button>
                        
                        {expandedReviews[item.id] && (
                            <div className="opacity-100">
                                <ReviewsList 
                                    foodItemId={item.id} 
                                    currentUserId={user.id} 
                                    currentUserName={user.name} 
                                    targetUserId={item.reservedBy}
                                />
                            </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'global' ? (
          <GlobalListings 
            items={foodItems.filter(item => item.status === 'available')} 
          />
        ) : (
          <div>
        {/* Active Listings */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Package className="w-7 h-7 mr-3" />
            My Active Donations ({myDonations.length})
          </h2>

          {foodItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-md">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">No active listings</p>
              <p className="text-gray-500 mt-2">Add a food donation to get started</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {myDonations.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(item.status)}
                      <h3 className="text-2xl font-bold text-gray-800">{item.name}</h3>
                    </div>
                    <span className={`px-4 py-2 rounded-full font-semibold text-lg border-2 ${getStatusColor(item.status)}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center space-x-3 text-gray-700">
                      <Package className="w-6 h-6 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Quantity</p>
                        <p className="text-lg font-semibold">{item.quantity}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-gray-700">
                      <AlertCircle className="w-6 h-6 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Expiry</p>
                        <p className="text-lg font-semibold">
                          {new Date(item.expiry).toLocaleDateString()} at {item.expiryTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-gray-700">
                      <Clock className="w-6 h-6 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Pickup Slots</p>
                        <p className="text-lg font-semibold">
                          {item.pickupSlots?.length || 0} available
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-gray-700">
                      <Package className="w-6 h-6 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="text-lg font-semibold">{item.location}</p>
                      </div>
                    </div>
                  </div>

                  {/* Show Pickup Slots */}
                  {item.pickupSlots && item.pickupSlots.length > 0 && (
                    <div className="mb-4 bg-gray-50 rounded-xl p-4">
                      <p className="text-sm font-semibold text-gray-600 mb-2">Available Pickup Times:</p>
                      <div className="flex flex-wrap gap-2">
                        {item.pickupSlots.map((slot) => (
                          <span
                            key={slot.id}
                            className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                              slot.isAvailable
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {slot.startTime} - {slot.endTime}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => onDeleteFood(item.id)}
                      className="flex-1 px-6 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-semibold text-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}