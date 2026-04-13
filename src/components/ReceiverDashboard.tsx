import { useState, useEffect } from 'react';
import { LogOut, MapPin, List, Calendar, Clock, Package, AlertCircle, Bell, TrendingUp, Zap, User as UserIcon, Globe, ClipboardList, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { User, FoodItem } from '../App';
import NotificationPanel from './NotificationPanel';
import UserProfile from './UserProfile';
import GlobalListings from './GlobalListings';
import ReviewsList from './ReviewsList';
import UserReputation from './UserReputation';
import { MessageCircle } from 'lucide-react';

interface ReceiverDashboardProps {
  user: User;
  foodItems: FoodItem[];
  onUpdateFood: (id: string, updates: Partial<FoodItem>) => void;
  onUpdateUser?: (updates: Partial<User>) => void;
  onLogout: () => void;
}

interface AppNotification {
  id: string;
  type: 'push' | 'email' | 'sms';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export default function ReceiverDashboard({ 
  user, 
  foodItems, 
  onUpdateFood,
  onUpdateUser,
  onLogout 
}: ReceiverDashboardProps) {
  const [activeTab, setActiveTab] = useState<'nearby' | 'global' | 'requests'>('nearby');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [smartRecommendations, setSmartRecommendations] = useState<FoodItem[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [prevStatuses, setPrevStatuses] = useState<Record<string, string>>({});
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});
  const [reservingItem, setReservingItem] = useState<{item: FoodItem, slotId?: string} | null>(null);
  const [receiverPhone, setReceiverPhone] = useState(user.phone || '');

  const toggleReviews = (id: string) => {
    setExpandedReviews(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const availableItems = foodItems.filter(item => item.status === 'available');
  const myReservations = foodItems.filter(item => 
    (item.status === 'reserved' || item.status === 'approved' || item.status === 'completed') && item.reservedBy === user.id
  );
  
  // Real-time Notification Generator for Receiver
  useEffect(() => {
    // Only generate notifications for newly detected nearby items
    if (foodItems.length > 0) {
      const nearbyNow = foodItems.filter(item => item.status === 'available' && calculateDistance(item) < 50);
      if (nearbyNow.length > 0) {
        const generated = nearbyNow.map(item => ({
          id: `nearby-${item.id}`,
          type: 'push' as const,
          title: 'New food available nearby!',
          message: `${item.name} is available near you at ${item.location}`,
          timestamp: 'Just now',
          read: false
        }));

        setNotifications(prev => {
          const prevIds = prev.map(n => n.id);
          const newUnique = generated.filter(n => !prevIds.includes(n.id));
          return [...newUnique, ...prev].slice(0, 50); // keep a history limit
        });
      }
    }
  }, [foodItems, user]);

  // Track Status Transitions for Notifications
  useEffect(() => {
    const currentStatuses = foodItems.reduce((acc, item) => {
      if (item.reservedBy === user.id) {
        acc[item.id] = item.status;
      }
      return acc;
    }, {} as Record<string, string>);

    if (Object.keys(prevStatuses).length > 0) {
      const newNotifs: AppNotification[] = [];

      foodItems.forEach(item => {
        const prevStatus = prevStatuses[item.id];
        const currentStatus = item.status;

        // Approved
        if (prevStatus === 'reserved' && currentStatus === 'approved' && item.reservedBy === user.id) {
          newNotifs.push({
            id: `approved-${item.id}-${Date.now()}`,
            type: 'email',
            title: 'Reservation Approved!',
            message: `Your reservation for ${item.name} has been approved. Please coordinate pickup.`,
            timestamp: 'Just now',
            read: false
          });
        }
        // Completed / Picked
        else if (prevStatus === 'approved' && currentStatus === 'completed' && item.reservedBy === user.id) {
          newNotifs.push({
            id: `completed-${item.id}-${Date.now()}`,
            type: 'push',
            title: 'Pickup Confirmed',
            message: `Your pickup for ${item.name} is complete. Thanks for using the platform!`,
            timestamp: 'Just now',
            read: false
          });
        }
        // Rejected / Cancelled (previously reserved by user, now available or reserved by someone else)
        else if (prevStatus && prevStatus !== 'available' && currentStatus === 'available' && item.reservedBy !== user.id) {
          newNotifs.push({
            id: `rejection-${item.id}-${Date.now()}`,
            type: 'sms',
            title: 'Reservation Cancelled',
            message: `Your request for ${item.name} was rejected by the donor.`,
            timestamp: 'Just now',
            read: false
          });
        }
      });

      if (newNotifs.length > 0) {
        setNotifications(prev => [...newNotifs, ...prev]);
      }
    }
    
    // Track state for next render
    setPrevStatuses(currentStatuses);
  }, [foodItems, user.id]);

  const reservedItems = myReservations.filter(i => i.status === 'reserved');
  const approvedItems = myReservations.filter(i => i.status === 'approved');
  const receivedItems = myReservations.filter(i => i.status === 'completed');

  const calculateDistance = (item: FoodItem) => {
    if (!user.latitude || !user.longitude || !item.latitude || !item.longitude) return 0;
    
    // Quick approximation for proximity (not true haversine but fine for mocking)
    const distance = Math.sqrt(
      Math.pow(item.latitude - user.latitude, 2) + 
      Math.pow(item.longitude - user.longitude, 2)
    ) * 111;
    
    return Math.round(distance * 10) / 10;
  };

  const nearbyItems = availableItems.filter(item => calculateDistance(item) < 50);

  // Smart Matching Algorithm
  useEffect(() => {
    // Simulate smart matching based on location proximity and user preferences
    const userLat = user.latitude || 40.7128;
    const userLng = user.longitude || -74.0060;

    const scored = availableItems.map(item => {
      // Calculate distance (simplified)
      const distance = Math.sqrt(
        Math.pow(item.latitude - userLat, 2) + 
        Math.pow(item.longitude - userLng, 2)
      );

      // Filter out items further than 50km
      if (distance > 50) return null;

      let score = 100 - (distance * 2);

      // Bonus for user preferences (mock)
      if (user.preferences?.includes(item.name.toLowerCase())) {
        score += 30;
      }

      // Bonus for soon-to-expire items
      const daysUntilExpiry = (new Date(item.expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysUntilExpiry < 2) {
        score += 20;
      }

      return { ...item, score, distance };
    }).filter(item => item !== null) as (FoodItem & { score: number, distance: number })[];

    // Sort by score and take top 3
    const top = scored.sort((a, b) => b.score - a.score).slice(0, 3);
    setSmartRecommendations(top);

    // Notify about new matches
    if (top.length > 0) {
      toast.success('🎯 New food matches found near you!', {
        description: `${top.length} recommendations based on your location`,
        duration: 5000
      });
    }
  }, [foodItems, user]);

  const handleReserve = (item: FoodItem, slotId?: string) => {
    setReservingItem({ item, slotId });
  };

  const confirmReservation = () => {
    if (!reservingItem) return;
    const { item, slotId } = reservingItem;
    
    if (!receiverPhone) {
      toast.error('Please provide a contact number');
      return;
    }

    // Update slot availability if slot is selected
    let updatedSlots = item.pickupSlots;
    if (slotId) {
      updatedSlots = item.pickupSlots.map(slot => 
        slot.id === slotId ? { ...slot, isAvailable: false } : slot
      );
    }

    onUpdateFood(item.id, { 
      status: 'reserved', 
      reservedBy: user.id,
      receiverContact: receiverPhone,
      pickupSlots: updatedSlots
    });
    
    setReservingItem(null);
    
    // Multi-channel notification simulation
    toast.success('🎉 Food reserved successfully!', {
      description: `${item.name} from ${item.donorName}`,
      duration: 5000
    });

    // Update local user phone if it was empty
    if (!user.phone && onUpdateUser) {
      onUpdateUser({ phone: receiverPhone });
    }
  };

  const handleCancelReservation = (item: FoodItem) => {
    onUpdateFood(item.id, { 
      status: 'available', 
      reservedBy: undefined 
    });
    toast.info('Reservation cancelled');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
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
      default:
        return null;
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Receiver Dashboard</h1>
              <p className="text-gray-600 text-lg mt-1">Welcome, {user.name}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl font-semibold transition-colors"
              >
                <UserIcon className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-sm"
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
        ) : (
          <>
          {/* Real-time Notifications Panel */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-2xl w-full overflow-hidden rounded-2xl shadow-[0_0_40px_rgba(37,99,235,0.3)] animate-in fade-in zoom-in duration-200">
            <NotificationPanel 
              onClose={() => setShowNotifications(false)} 
              notifications={notifications}
              setNotifications={setNotifications}
            />
          </div>
        </div>
      )}

        {/* Smart Recommendations */}
        {smartRecommendations.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-8 h-8" />
              <h3 className="text-2xl font-bold">Smart Matches For You</h3>
            </div>
            <p className="mb-4 text-blue-100">
              AI-powered recommendations based on your location and preferences
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {smartRecommendations.map((item) => (
                <div key={item.id} className="bg-white/10 backdrop-blur rounded-xl p-4 hover:bg-white/20 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-lg">{item.name}</h4>
                    <TrendingUp className="w-5 h-5 text-green-300" />
                  </div>
                  <p className="text-sm text-blue-100 mb-2">📍 {calculateDistance(item)} km away</p>
                  <p className="text-sm text-blue-100">{item.donorName}</p>
                </div>
              ))}
            </div>
          </div>
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
          </div>
        </div>

        {/* Available Food */}
        {/* Navigation Tabs */}
        <div className="mb-6 flex gap-4 border-b-2 border-gray-200 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('nearby')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-lg transition-colors shadow-sm whitespace-nowrap border-2 ${
              activeTab === 'nearby'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
            }`}
          >
            <MapPin className="w-6 h-6" />
            <span>Nearby Food</span>
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
                <Calendar className="w-7 h-7 mr-3 text-yellow-500" />
                Reserved ({reservedItems.length})
              </h2>
              {reservedItems.length === 0 ? <p className="text-gray-500 italic">No reserved items awaiting approval.</p> : (
                <div className="grid gap-6">
                  {reservedItems.map((item) => (
                    <div key={item.id} className="bg-yellow-50 rounded-2xl p-6 shadow-md border-2 border-yellow-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                          <h3 className="text-2xl font-bold text-gray-800">{item.name} <span className="text-sm font-normal text-gray-600">from {item.donorName}</span></h3>
                        </div>
                        <span className="px-4 py-2 rounded-full font-semibold bg-yellow-100 text-yellow-800 border-yellow-300">Reserved (Pending)</span>
                      </div>
                      <p className="text-gray-600 mb-4">Awaiting donor to approve your reservation.</p>
                      <button onClick={() => handleCancelReservation(item)} className="px-6 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold transition-colors">Cancel Request</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <CheckCircle className="w-7 h-7 mr-3 text-emerald-500" />
                Approved Pickups ({approvedItems.length})
              </h2>
              {approvedItems.length === 0 ? <p className="text-gray-500 italic">No approved pickups at the moment.</p> : (
                <div className="grid gap-6">
                  {approvedItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl p-6 shadow-md border-l-8 border-emerald-400 border-y border-r border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                          <h3 className="text-2xl font-bold text-gray-800">{item.name} <span className="text-sm font-normal text-gray-600">from {item.donorName}</span></h3>
                        </div>
                        <span className="px-4 py-2 rounded-full font-semibold bg-emerald-100 text-emerald-800 border-emerald-300">Approved</span>
                      </div>
                      <div className="flex items-center text-gray-700 bg-emerald-100/50 p-4 rounded-lg">
                        <Clock className="w-6 h-6 mr-3 text-emerald-600" />
                        <div>
                          <p className="font-semibold">Ready for Pickup!</p>
                          <p className="text-sm text-gray-600">Head to {item.location}</p>
                        </div>
                      </div>
                      {item.donorContact && (
                        <div className="mt-4 bg-blue-50 p-4 rounded-xl flex items-center shadow-sm">
                           <span className="text-2xl mr-3">📞</span>
                           <div>
                             <p className="text-sm text-blue-600 font-semibold uppercase">Donor Contact</p>
                             <p className="text-xl font-bold text-blue-800">{item.donorContact}</p>
                           </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Package className="w-7 h-7 mr-3 text-gray-500" />
                Received & Completed ({receivedItems.length})
              </h2>
              {receivedItems.length === 0 ? <p className="text-gray-500 italic">No completed pickups yet.</p> : (
                <div className="grid gap-6 opacity-60">
                  {receivedItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl p-6 shadow-md border-l-8 border-gray-400 border-y border-r border-gray-200">
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <p className="text-xl font-bold text-gray-700 line-through">{item.name}</p>
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-200 text-gray-600">Completed</span>
                        </div>
                        
                        <button 
                          onClick={() => toggleReviews(item.id)}
                          className="self-start flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors mt-2"
                        >
                          <MessageCircle className="w-5 h-5 mr-1" />
                          {expandedReviews[item.id] ? 'Hide Discussion' : 'Rate & Review This Pickup'}
                        </button>
                        
                        {expandedReviews[item.id] && (
                            <div className="opacity-100">
                                <ReviewsList 
                                    foodItemId={item.id} 
                                    currentUserId={user.id} 
                                    currentUserName={user.name} 
                                    targetUserId={item.donorId}
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
            items={availableItems} 
            currentUser={user} 
            onReserveClick={(item) => handleReserve(item)}
            reservingItem={reservingItem}
            receiverPhone={receiverPhone}
            onPhoneChange={setReceiverPhone}
            onConfirmReserve={confirmReservation}
            onCancelReserve={() => setReservingItem(null)}
          />
        ) : (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Package className="w-7 h-7 mr-3" />
            Available Food Nearby ({nearbyItems.length})
          </h2>

          {nearbyItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-md">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">No available food items nearby</p>
              <p className="text-gray-500 mt-2">Check back later or explore the Global Network tab</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {nearbyItems.map((item) => (
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
                      Available
                    </span>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 mb-4 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold text-gray-700">
                        Donated by: {item.donorName}
                        </p>
                        <UserReputation userId={item.donorId} />
                    </div>
                    <p className="text-gray-600 mt-1">📍 {calculateDistance(item)} km away</p>
                    {item.donorContact && (
                       <p className="text-green-700 font-semibold mt-1 flex items-center">
                         <span className="mr-2">📞</span> Donor Contact: {item.donorContact}
                       </p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
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
                      <MapPin className="w-6 h-6 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="text-lg font-semibold">{item.location}</p>
                      </div>
                    </div>
                  </div>

                  {/* Available Pickup Slots */}
                  {item.pickupSlots && item.pickupSlots.some(slot => slot.isAvailable) && (
                    <div className="mb-4 bg-gray-50 rounded-xl p-4">
                      <p className="text-sm font-semibold text-gray-600 mb-3">Choose Pickup Time:</p>
                      <div className="flex flex-wrap gap-2">
                        {item.pickupSlots.filter(slot => slot.isAvailable).map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => handleReserve(item, slot.id)}
                            className="px-4 py-2 rounded-lg font-semibold bg-green-100 hover:bg-green-200 text-green-700 transition-colors"
                          >
                            <Clock className="w-4 h-4 inline mr-2" />
                            {slot.startTime} - {slot.endTime}
                          </button>
                        ))}
                      </div>
                      
                      {reservingItem?.item.id === item.id && reservingItem?.slotId && (
                        <div className="w-full bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mt-4 animate-in slide-in-from-top-2 duration-200">
                          <p className="text-gray-800 font-bold text-lg mb-2">Confirm Slot Reservation</p>
                          <label className="block text-gray-700 font-semibold mb-2 text-sm">
                            Contact Number (Shared with Donor)
                          </label>
                          <input
                            type="tel"
                            required
                            value={receiverPhone}
                            onChange={(e) => setReceiverPhone(e.target.value)}
                            className="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl focus:outline-none text-base mb-2"
                            placeholder="e.g., +91 9876543210"
                          />
                          <div className="flex gap-3 mt-4">
                            <button
                              onClick={confirmReservation}
                              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setReservingItem(null)}
                              className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {reservingItem?.item.id === item.id && !reservingItem?.slotId ? (
                    <div className="w-full bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mt-4 animate-in slide-in-from-top-2 duration-200">
                      <p className="text-gray-800 font-bold text-lg mb-2">Confirm Your Reservation</p>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm">
                        Contact Number (Shared with Donor)
                      </label>
                      <input
                        type="tel"
                        required
                        value={receiverPhone}
                        onChange={(e) => setReceiverPhone(e.target.value)}
                        className="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl focus:outline-none text-base mb-2"
                        placeholder="e.g., +91 9876543210"
                      />
                      <p className="text-sm text-gray-500 mb-4 italic">
                        The donor will use this number to coordinate the pickup with you.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={confirmReservation}
                          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setReservingItem(null)}
                          className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleReserve(item)}
                      className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-colors"
                    >
                      <Package className="w-6 h-6" />
                      <span>Reserve This Food</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        )}
        </>
        )}
      </div>

    </div>
  );
}
