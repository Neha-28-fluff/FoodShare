import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface UserReputationProps {
  userId: string | undefined;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000';

export default function UserReputation({ userId }: UserReputationProps) {
  const [reputation, setReputation] = useState<{ averageRating: number; totalReviews: number } | null>(null);

  useEffect(() => {
    if (!userId) return;
    
    fetch(`${BACKEND_URL}/api/user/${userId}/reputation`)
      .then(res => res.json())
      .then(data => setReputation(data))
      .catch(err => console.error(err));
  }, [userId]);

  if (!reputation) return <div className="text-sm text-gray-500 mt-1">Loading reputation...</div>;

  return (
    <div className="flex items-center space-x-1 text-sm font-medium mt-1">
      <Star 
        className="w-4 h-4 mr-0.5" 
        color={reputation.totalReviews > 0 ? "#facc15" : "#d1d5db"} 
        fill={reputation.totalReviews > 0 ? "#facc15" : "none"} 
      />
      <span className="text-gray-800">{reputation.averageRating > 0 ? reputation.averageRating.toFixed(1) : 'No Ratings Yet'}</span>
      <span className="text-gray-500">
        ({reputation.totalReviews} {reputation.totalReviews === 1 ? 'review' : 'reviews'})
      </span>
    </div>
  );
}
