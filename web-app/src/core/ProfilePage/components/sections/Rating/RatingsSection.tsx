"use client";

import { Star, ThumbsUp, MessageCircle } from "lucide-react";

export function RatingsSection() {
  // Mock ratings data - replace with actual API call
  const ratings = [
    {
      id: 1,
      serviceName: "House Cleaning",
      rating: 5,
      review:
        "Excellent service! The worker was very professional and did a great job cleaning my house.",
      date: "2024-01-15T10:00:00Z",
      workerName: "Rahul Kumar",
      helpful: 3,
      replies: 1,
    },
    {
      id: 2,
      serviceName: "Plumbing Service",
      rating: 4,
      review:
        "Good service overall. Fixed the issue quickly but was a bit late.",
      date: "2024-01-10T14:00:00Z",
      workerName: "Amit Singh",
      helpful: 1,
      replies: 0,
    },
    {
      id: 3,
      serviceName: "Electrician Service",
      rating: 5,
      review:
        "Outstanding work! Very knowledgeable and professional. Highly recommended.",
      date: "2024-01-05T09:00:00Z",
      workerName: "Vikram Patel",
      helpful: 5,
      replies: 2,
    },
  ];

  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length
      : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">My Ratings</h2>
        <p className="text-gray-600 mt-1">
          View and manage your service ratings and reviews
        </p>
      </div>

      {/* Rating Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-900">
            Average Rating
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-2xl font-bold text-yellow-600">
              {averageRating.toFixed(1)}
            </p>
            <div className="flex">{renderStars(Math.round(averageRating))}</div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900">Total Reviews</h3>
          <p className="text-2xl font-bold text-blue-600">{ratings.length}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-900">
            5-Star Reviews
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {ratings.filter((r) => r.rating === 5).length}
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-purple-900">
            Helpful Votes
          </h3>
          <p className="text-2xl font-bold text-purple-600">
            {ratings.reduce((sum, rating) => sum + rating.helpful, 0)}
          </p>
        </div>
      </div>

      {/* Ratings List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">My Reviews</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {ratings.length > 0 ? (
            ratings.map((rating) => (
              <div key={rating.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {rating.serviceName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Worker: {rating.workerName}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      {renderStars(rating.rating)}
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDate(rating.date)}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">
                    {rating.review}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{rating.helpful} helpful</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{rating.replies} replies</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No ratings yet</p>
              <p className="text-sm">
                Your ratings and reviews will appear here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Rating Distribution
        </h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratings.filter((r) => r.rating === stars).length;
            const percentage =
              ratings.length > 0 ? (count / ratings.length) * 100 : 0;

            return (
              <div key={stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-gray-700">
                    {stars}
                  </span>
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
