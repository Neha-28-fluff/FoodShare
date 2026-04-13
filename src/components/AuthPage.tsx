import { useState } from 'react';
import { ArrowLeft, LogIn, UserPlus } from 'lucide-react';
import type { User, UserType } from '../App';

interface AuthPageProps {
  userType: UserType;
  onLogin: (user: User) => void;
  onBack: () => void;
}

export default function AuthPage({ userType, onLogin, onBack }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let lat = 40.7128;
    let lng = -74.0060;

    if (navigator.geolocation && !isLogin) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      } catch (err) {
        console.warn("Geolocation denied or failed, using defaults", err);
      }
    }
    
    const user: any = {
      name: formData.name || formData.email.split('@')[0],
      email: formData.email,
      type: userType,
      latitude: lat,
      longitude: lng,
      address: formData.address,
      phone: formData.phone
    };
    
    onLogin(user);
  };

  const bgColor = userType === 'donor' ? 'from-green-50 to-emerald-50' : 'from-blue-50 to-cyan-50';
  const accentColor = userType === 'donor' ? 'green' : 'blue';
  const focusBorderClass = userType === 'donor' ? 'focus:border-green-500' : 'focus:border-blue-500';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgColor} flex items-center justify-center p-4`}>
      <div className="max-w-md w-full">
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-800 text-lg"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-600 text-lg">
              {userType === 'donor' ? 'Donor' : 'Receiver'} Portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
              <div>
                <label className="block text-gray-700 text-lg font-semibold mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required={!isLogin}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl ${focusBorderClass} focus:outline-none`}
                  placeholder="Enter your name"
                  autoComplete="name"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-lg font-semibold mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl ${focusBorderClass} focus:outline-none`}
                  placeholder="Enter your local area or street address"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-lg font-semibold mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required={!isLogin}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl ${focusBorderClass} focus:outline-none`}
                  placeholder="Enter your contact number"
                />
              </div>

              </>
            )}

            <div>
              <label className="block text-gray-700 text-lg font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl ${focusBorderClass} focus:outline-none`}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-lg font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl ${focusBorderClass} focus:outline-none`}
                placeholder="Enter your password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </div>

            <button
              type="submit"
              className={`w-full bg-${accentColor}-600 hover:bg-${accentColor}-700 text-white font-bold py-4 px-6 rounded-xl text-lg flex items-center justify-center space-x-2 transition-colors`}
              style={{
                backgroundColor: userType === 'donor' ? '#059669' : '#2563eb',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = userType === 'donor' ? '#047857' : '#1d4ed8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = userType === 'donor' ? '#059669' : '#2563eb';
              }}
            >
              {isLogin ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
              <span>{isLogin ? 'Login' : 'Sign Up'}</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-600 hover:text-gray-800 text-lg"
            >
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <span className="font-semibold">
                {isLogin ? 'Sign Up' : 'Login'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}