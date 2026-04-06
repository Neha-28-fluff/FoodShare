import { Package, MapPin, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import type { FoodItem, User } from '../App';

interface GlobalListingsProps {
  items: FoodItem[];
  currentUser?: User;
  onReserveClick?: (item: FoodItem) => void;
}

export default function GlobalListings({ items, currentUser, onReserveClick }: GlobalListingsProps) {
  // Sort items by freshness (newest available first)
  const sortedItems = [...items].sort((a, b) => 
    new Date(a.expiry).getTime() - new Date(b.expiry).getTime()
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-blue-100 mt-6">
      <div className="mb-8 flex items-center gap-4">
        <div className="bg-blue-600 p-4 rounded-xl shadow-md text-white">
          <ExternalLink className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Global Network Listings</h2>
          <p className="text-gray-600 text-lg font-medium mt-1">Explore all active food donations across the entire platform.</p>
        </div>
      </div>

      {sortedItems.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-16 text-center border-2 border-gray-200">
          <Package className="w-24 h-24 text-gray-400 mx-auto mb-6" />
          <p className="text-2xl font-bold text-gray-800">The global network is currently empty</p>
          <p className="text-gray-500 mt-2 text-lg">Check back soon for new cross-network available food.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-6 shadow-md border-2 border-blue-50 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-3">
                <h4 className="font-bold text-xl text-gray-900 truncate pr-4">{item.name}</h4>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold uppercase rounded-full tracking-wider whitespace-nowrap border border-green-200">System Wide</span>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-800 font-semibold">
                  <Package className="w-5 h-5 mr-3 text-blue-500" />
                  <span className="truncate">Donor: {item.donorName}</span>
                </div>
                <div className="flex items-start text-gray-700">
                  <MapPin className="w-5 h-5 mr-3 mt-0.5 text-blue-500 shrink-0" />
                  <span className="line-clamp-2 leading-tight">{item.location}</span>
                </div>
                <div className="flex items-center text-red-600 font-semibold bg-red-50 p-2 rounded-lg">
                  <AlertCircle className="w-5 h-5 mr-3" />
                  <span>Expires: {new Date(item.expiry).toLocaleDateString()}</span>
                </div>
              </div>

              {currentUser?.type === 'receiver' && onReserveClick && (
                <button
                  onClick={() => onReserveClick(item)}
                  className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md flex items-center justify-center space-x-2 text-lg"
                >
                  <Package className="w-6 h-6" />
                  <span>Reserve Now</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
