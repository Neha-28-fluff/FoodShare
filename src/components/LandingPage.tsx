import { Users, Heart } from 'lucide-react';
import type { UserType } from '../App';

interface LandingPageProps {
  onSelectUserType: (type: UserType) => void;
}

export default function LandingPage({ onSelectUserType }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Food Share</h1>
          <p className="text-xl text-gray-600">Connect donors with those in need</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Donor Card */}
          <button
            onClick={() => onSelectUserType('donor')}
            className="group bg-white rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="flex flex-col items-center space-y-6">
              <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Heart className="w-16 h-16 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">I'm a Donor</h2>
              <p className="text-gray-600 text-center text-lg">
                Share surplus food with those who need it
              </p>
              <div className="mt-4 px-8 py-3 bg-green-600 text-white rounded-full font-semibold text-lg group-hover:bg-green-700 transition-colors">
                Continue
              </div>
            </div>
          </button>

          {/* Receiver Card */}
          <button
            onClick={() => onSelectUserType('receiver')}
            className="group bg-white rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="flex flex-col items-center space-y-6">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Users className="w-16 h-16 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">I'm a Receiver</h2>
              <p className="text-gray-600 text-center text-lg">
                Find available food donations nearby
              </p>
              <div className="mt-4 px-8 py-3 bg-blue-600 text-white rounded-full font-semibold text-lg group-hover:bg-blue-700 transition-colors">
                Continue
              </div>
            </div>
          </button>

          {/* Admin Card */}
          <button
            onClick={() => onSelectUserType('admin')}
            className="group bg-white rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="flex flex-col items-center space-y-6">
              <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Users className="w-16 h-16 text-purple-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Admin Panel</h2>
              <p className="text-gray-600 text-center text-lg">
                Manage platform and view analytics
              </p>
              <div className="mt-4 px-8 py-3 bg-purple-600 text-white rounded-full font-semibold text-lg group-hover:bg-purple-700 transition-colors">
                Continue
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}