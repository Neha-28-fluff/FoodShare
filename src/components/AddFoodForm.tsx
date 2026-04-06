import { useState } from 'react';
import { X, Save, Plus, Trash2, MapPin } from 'lucide-react';
import type { FoodItem, PickupSlot } from '../App';

interface AddFoodFormProps {
  onSubmit: (item: Omit<FoodItem, 'id' | 'donorId' | 'donorName' | 'status'>) => void;
  onCancel: () => void;
  userLat?: number;
  userLng?: number;
}

export default function AddFoodForm({ onSubmit, onCancel, userLat, userLng }: AddFoodFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    expiry: '',
    expiryTime: '',
    location: '',
    latitude: userLat || 40.7128,
    longitude: userLng || -74.0060,
    createdAt: new Date().toISOString()
  });

  const [pickupSlots, setPickupSlots] = useState<PickupSlot[]>([
    { id: '1', startTime: '', endTime: '', isAvailable: true }
  ]);

  const addSlot = () => {
    setPickupSlots([
      ...pickupSlots,
      { id: Date.now().toString(), startTime: '', endTime: '', isAvailable: true }
    ]);
  };

  const removeSlot = (id: string) => {
    setPickupSlots(pickupSlots.filter(slot => slot.id !== id));
  };

  const updateSlot = (id: string, field: 'startTime' | 'endTime', value: string) => {
    setPickupSlots(pickupSlots.map(slot =>
      slot.id === id ? { ...slot, [field]: value } : slot
    ));
  };

  const handleLocationChange = (location: string) => {
    setFormData({ ...formData, location });
    
    // Simulate geocoding - in real app, use Google Maps Geocoding API
    const mockCoordinates: { [key: string]: { lat: number; lng: number } } = {
      'downtown': { lat: 40.7128, lng: -74.0060 },
      'main street': { lat: 40.7580, lng: -73.9855 },
      'uptown': { lat: 40.7829, lng: -73.9654 },
      'brooklyn': { lat: 40.6782, lng: -73.9442 },
      'queens': { lat: 40.7282, lng: -73.7949 }
    };

    const key = location.toLowerCase();
    if (mockCoordinates[key]) {
      setFormData(prev => ({
        ...prev,
        latitude: mockCoordinates[key].lat,
        longitude: mockCoordinates[key].lng
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate slots
    const validSlots = pickupSlots.filter(slot => slot.startTime && slot.endTime);
    if (validSlots.length === 0) {
      alert('Please add at least one pickup slot');
      return;
    }

    onSubmit({
      ...formData,
      pickupSlots: validSlots
    });
  };

  return (
    <div className="mb-8 bg-white rounded-2xl p-8 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Add Food Donation</h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 text-lg font-semibold mb-2">
            Food Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none"
            placeholder="e.g., Fresh Vegetables, Cooked Meals"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-lg font-semibold mb-2">
            Quantity
          </label>
          <input
            type="text"
            required
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none"
            placeholder="e.g., 5 kg, 20 pieces"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-lg font-semibold mb-2">
              Expiry Date
            </label>
            <input
              type="date"
              required
              value={formData.expiry}
              onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-lg font-semibold mb-2">
              Expiry Time
            </label>
            <input
              type="time"
              required
              value={formData.expiryTime}
              onChange={(e) => setFormData({ ...formData, expiryTime: e.target.value })}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-lg font-semibold mb-2">
            <MapPin className="w-5 h-5 inline mr-2" />
            Pickup Location
          </label>
          <input
            type="text"
            required
            value={formData.location}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none"
            placeholder="e.g., Downtown, Main Street, Brooklyn"
            list="location-suggestions"
          />
          <datalist id="location-suggestions">
            <option value="Downtown" />
            <option value="Main Street" />
            <option value="Uptown" />
            <option value="Brooklyn" />
            <option value="Queens" />
          </datalist>

        </div>

        {/* Pickup Slots */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-gray-700 text-lg font-semibold">
              Available Pickup Slots
            </label>
            <button
              type="button"
              onClick={addSlot}
              className="flex items-center space-x-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-semibold transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Slot</span>
            </button>
          </div>

          <div className="space-y-3">
            {pickupSlots.map((slot, index) => (
              <div key={slot.id} className="flex gap-3 items-center bg-gray-50 p-4 rounded-xl">
                <span className="text-gray-600 font-semibold">Slot {index + 1}:</span>
                <input
                  type="time"
                  required
                  value={slot.startTime}
                  onChange={(e) => updateSlot(slot.id, 'startTime', e.target.value)}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                  placeholder="Start"
                />
                <span className="text-gray-600">to</span>
                <input
                  type="time"
                  required
                  value={slot.endTime}
                  onChange={(e) => updateSlot(slot.id, 'endTime', e.target.value)}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                  placeholder="End"
                />
                {pickupSlots.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSlot(slot.id)}
                    className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg transition-colors"
          >
            <Save className="w-6 h-6" />
            <span>Add Donation</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold text-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
