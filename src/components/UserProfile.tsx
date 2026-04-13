import { useState } from 'react';
import { Save, X, User as UserIcon } from 'lucide-react';
import type { User } from '../App';

interface UserProfileProps {
  user: User;
  onUpdate: (updates: Partial<User>) => void;
  onClose: () => void;
}

export default function UserProfile({ user, onUpdate, onClose }: UserProfileProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    address: user.address || '',
    phone: user.phone || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    onClose();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <UserIcon className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Your Profile</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Email</label>
          {/* Email is typically read-only or strictly handled, but allowing edit per request */}
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
           <label className="block text-gray-700 font-semibold mb-2">Address / Region</label>
           <input
             type="text"
             value={formData.address}
             onChange={(e) => setFormData({ ...formData, address: e.target.value })}
             className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
           />
        </div>

        <div>
           <label className="block text-gray-700 font-semibold mb-2">Phone Number</label>
           <input
             type="tel"
             value={formData.phone}
             onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
             className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
             placeholder="e.g., +91 9876543210"
           />
        </div>

        <div className="pt-4 border-t-2 border-gray-100 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
