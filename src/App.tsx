import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { io, Socket } from 'socket.io-client';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import DonorDashboard from './components/DonorDashboard';
import ReceiverDashboard from './components/ReceiverDashboard';
import AdminDashboard from './components/AdminDashboard';

export type UserType = 'donor' | 'receiver' | 'admin' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  latitude?: number;
  longitude?: number;
  address?: string;
  preferences?: string[];
  isBanned?: boolean;
}

export interface PickupSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface FoodItem {
  id: string;
  donorId: string;
  donorName: string;
  name: string;
  quantity: string;
  expiry: string;
  expiryTime: string;
  pickupSlots: PickupSlot[];
  status: 'available' | 'reserved' | 'approved' | 'expired' | 'completed';
  reservedBy?: string;
  location: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  isFlagged?: boolean;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<UserType>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  const fetchFoodItems = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/food`);
      if (response.ok) {
        const data = await response.json();
        
        // Process items to automatically flag them as expired based on date/time
        const now = new Date();
        const processedData = data.map((item: FoodItem) => {
          if (item.status === 'available') {
            const timeStr = item.expiryTime || '23:59';
            // Parse robustly: handle if date format isn't perfectly zero-padded
            const expiryDate = new Date(`${item.expiry}T${timeStr}`);
            if (now > expiryDate) {
              return { ...item, status: 'expired' };
            }
          }
          return item;
        });
        
        setFoodItems(processedData);
      }
    } catch (error) {
      console.error('Error fetching food items:', error);
    }
  };

  useEffect(() => {
    // Load user from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    // Initial fetch
    fetchFoodItems();

    // Setup Socket.io
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('food_updated', (data) => {
      console.log('Real-time update received:', data);
      fetchFoodItems();
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedUserType(null);
    localStorage.removeItem('currentUser');
  };

  const handleLogin = async (user: any) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           email: user.email,
           name: user.name,
           type: user.type,
           latitude: user.latitude,
           longitude: user.longitude,
           address: user.address,
           adminKey: user.adminKey
        })
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
      } else {
        const errData = await response.json();
        alert(errData.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed', error);
      alert('Network Error');
    }
  };

  const handleUpdateUser = async (updates: Partial<User>) => {
    if (!currentUser) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/user/${currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setCurrentUser(updatedUser);
      } else {
        alert('Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      alert('Network Error while updating');
    }
  };

  const addFoodItem = async (item: Omit<FoodItem, 'id' | 'donorId' | 'donorName' | 'status'>) => {
    const newItem = {
      ...item,
      donorId: currentUser!.id,
      donorName: currentUser!.name
    };
    try {
      const response = await fetch(`${BACKEND_URL}/api/food`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      if (!response.ok) throw new Error('Failed to add food');
    } catch (error) {
      console.error(error);
    }
  };

  const updateFoodItem = async (id: string, updates: Partial<FoodItem>) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/food/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update food');
    } catch (error) {
      console.error(error);
    }
  };

  const deleteFoodItem = async (id: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/food/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete food');
    } catch (error) {
      console.error(error);
    }
  };

  if (!currentUser && !selectedUserType) {
    return (
      <>
        <LandingPage onSelectUserType={setSelectedUserType} />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (!currentUser) {
    return (
      <>
        <AuthPage 
          userType={selectedUserType!} 
          onLogin={handleLogin}
          onBack={() => setSelectedUserType(null)}
        />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  return (
    <>
      {currentUser.type === 'donor' ? (
        <DonorDashboard 
          user={currentUser}
          foodItems={foodItems.filter(item => item.donorId === currentUser.id)}
          onAddFood={addFoodItem}
          onUpdateFood={updateFoodItem}
          onUpdateUser={handleUpdateUser}
          onDeleteFood={deleteFoodItem}
          onLogout={handleLogout}
        />
      ) : currentUser.type === 'receiver' ? (
        <ReceiverDashboard 
          user={currentUser}
          foodItems={foodItems}
          onUpdateFood={updateFoodItem}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
        />
      ) : (
        <AdminDashboard 
          user={currentUser}
          foodItems={foodItems}
          onUpdateFood={updateFoodItem}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
        />
      )}
      <Toaster position="top-center" richColors />
    </>
  );
}