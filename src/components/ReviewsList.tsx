import { useState, useEffect } from 'react';
import { Star, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

export interface Review {
  id: string;
  foodItemId: string;
  authorId: string;
  authorName: string;
  rating: number;
  comment: string;
  timestamp: string;
}

interface ReviewsListProps {
    foodItemId: string;
    currentUserId: string;
    currentUserName: string;
    targetUserId?: string;
    onReviewAdded?: () => void;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000';

export default function ReviewsList({ foodItemId, currentUserId, currentUserName, targetUserId, onReviewAdded }: ReviewsListProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [foodItemId]);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/reviews/${foodItemId}`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch(e) {
            console.error("Failed to fetch reviews", e);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    foodItemId,
                    targetUserId,
                    authorId: currentUserId,
                    authorName: currentUserName,
                    rating: newRating,
                    comment: newComment,
                    timestamp: new Date().toISOString()
                })
            });
            if (res.ok) {
                toast.success('Review posted!');
                setNewComment('');
                setNewRating(5);
                fetchReviews();
                if (onReviewAdded) onReviewAdded();
            } else {
                toast.error('Failed to post review');
            }
        } catch(err) {
            toast.error('Network Error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h4 className="font-bold text-lg mb-4 flex items-center text-gray-800">
                <MessageCircle className="w-5 h-5 mr-2 text-blue-500" />
                Discussion & Reviews ({reviews.length})
            </h4>

            {/* List */}
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {reviews.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No comments yet. Be the first to leave a review!</p>
                ) : (
                    reviews.map(r => (
                        <div key={r.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-gray-800">{r.authorName}</span>
                                <span className="text-xs text-gray-500">{new Date(r.timestamp).toLocaleDateString()}</span>
                            </div>
                            <div className="flex mb-2">
                                {[1,2,3,4,5].map(star => {
                                    const isFilled = star <= r.rating;
                                    return (
                                        <Star 
                                            key={star} 
                                            className="w-4 h-4 mr-0.5" 
                                            color={isFilled ? "#facc15" : "#d1d5db"} 
                                            fill={isFilled ? "#facc15" : "none"} 
                                        />
                                    );
                                })}
                            </div>
                            <p className="text-gray-700 text-sm">{r.comment}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="border-t pt-4">
                <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm font-semibold text-gray-600">Rate your experience:</span>
                    <div className="flex">
                        {[1,2,3,4,5].map(star => {
                            const isFilled = star <= newRating;
                            return (
                                <button type="button" key={star} onClick={() => setNewRating(star)} className="focus:outline-none hover:scale-110 transition-transform mr-1">
                                    <Star 
                                        className="w-6 h-6" 
                                        color={isFilled ? "#facc15" : "#d1d5db"} 
                                        fill={isFilled ? "#facc15" : "none"} 
                                    />
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                        type="text" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Leave a public comment or review..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                    <button 
                        type="submit" 
                        disabled={isSubmitting || !newComment.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg font-semibold flex items-center justify-center transition-colors"
                    >
                        <Send className="w-5 h-5 mr-2" />
                        Post
                    </button>
                </div>
            </form>
        </div>
    );
}
