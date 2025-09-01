import { useState } from "react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa"
import Carousel from "../components/carousel";

interface Review {
  rating: number;
  title: string;
  text: string;
  images: string[];
  user: string;
  location: string;
  timeAgo: string;
  likes: number;
  dislikes: number;
}

const progressCircle = (value: number) => {
  const radius = 25;
  const stroke = 5;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 5) * circumference;

  return { strokeDashoffset, circumference, normalizedRadius, stroke };
};

export default function RatingReviews() {
  const [ratingStats] = useState({
    average: 4.1,
    totalRatings: 3913,
    totalReviews: 375,
    distribution: {
      5: 2181,
      4: 229,
      3: 323,
      2: 121,
      1: 359,
    },
  });

  const [featureRatings] = useState([
    { label: "Quality", value: 4.0 },
    { label: "Looks & Design", value: 4.4 },
    { label: "Gear", value: 3.7 },
    { label: "Brake", value: 4.0 },
  ]);

  const [reviews] = useState<Review[]>([
    {
      rating: 5,
      title: "Just wow!",
      text: "Good product at good price",
      images: ["/bike1.jpg", "/bike2.jpg"],
      user: "Aniket Yadav",
      location: "Allahabad",
      timeAgo: "11 months ago",
      likes: 105,
      dislikes: 15,
    },
    {
      rating: 4,
      title: "Nice Bike",
      text: "Looks good and rides well",
      images: ["/bike3.jpg"],
      user: "Rahul Singh",
      location: "Mumbai",
      timeAgo: "6 months ago",
      likes: 68,
      dislikes: 9,
    },
    {
      rating: 3,
      title: "Average",
      text: "Performance is okay, not great",
      images: [],
      user: "Priya Sharma",
      location: "Delhi",
      timeAgo: "2 months ago",
      likes: 42,
      dislikes: 17,
    },
     {
      rating: 3,
      title: "Average",
      text: "Performance is okay, not great",
      images: [],
      user: "Priya Sharma",
      location: "Delhi",
      timeAgo: "2 months ago",
      likes: 42,
      dislikes: 17,
    },
     {
      rating: 3,
      title: "Average",
      text: "Performance is okay, not great",
      images: [],
      user: "Priya Sharma",
      location: "Delhi",
      timeAgo: "2 months ago",
      likes: 42,
      dislikes: 17,
    },
    
  ]);

  const [sliderVisible, setSliderVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  // Add this to your useState section
  const [visibleCount, setVisibleCount] = useState(3);

  const handleToggle = () => {
    if (visibleCount >= reviews.length) {
      setVisibleCount(3); // Show less
    } else {
      setVisibleCount((prev) => Math.min(prev + 10, reviews.length));
    }
  };

  return (
    <div className="bg-background p-6 rounded-md shadow-sm space-y-6">
      {/* header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold mb-2">Ratings & Reviews</h2>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">{ratingStats.average}★</div>
            <div className="text-sm text-foreground/60">
              {ratingStats.totalRatings.toLocaleString()} Ratings & <br />
              {ratingStats.totalReviews.toLocaleString()} Reviews
            </div>
          </div>
          <div className="space-y-1 mt-4">
            {Object.entries(ratingStats.distribution)
              .reverse()
              .map(([star, count]) => {
                const percentage =
                  (count / ratingStats.totalRatings) * 100 + "%";
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-sm w-5">{star}★</span>
                    <div className="flex-1 bg-foreground/60 h-2 rounded">
                      <div
                        className="h-2 rounded bg-green-500"
                        style={{ width: percentage }}
                      />
                    </div>
                    <span className="text-sm w-10 text-right">{count}</span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Rate Product Button */}
        <button className="border px-4 py-2 rounded hover:bg-update text-sm">
          Rate Product
        </button>
      </div>

      {/* Feature Ratings */}
      <div className="flex flex-wrap gap-6">
        {featureRatings.map((feature, idx) => {
          const { strokeDashoffset, circumference, normalizedRadius, stroke } =
            progressCircle(feature.value);
          return (
            <div key={idx} className="flex flex-col items-center">
              <svg height="50" width="50">
                <circle
                  stroke="#e5e7eb"
                  fill="none"
                  strokeWidth={stroke}
                  r={normalizedRadius}
                  cx="25"
                  cy="25"
                />
                <circle
                  stroke="#16a34a"
                  fill="none"
                  strokeWidth={stroke}
                  r={normalizedRadius}
                  cx="25"
                  cy="25"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="12"
                  fill="#16a34a"
                  fontWeight="bold"
                >
                  {feature.value.toFixed(1)}
                </text>
              </svg>
              <span className="text-xs text-foreground/60 text-center">
                {feature.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Gallery Preview */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {Array.from({ length: 20 }).map((_, i) => (
          <img
            key={i}
            src={'/assets/category/vehicles.png'}
            alt={`bike ${i}`}
            className="h-20 w-auto object-contain rounded cursor-pointer flex-shrink-0"
            onClick={() => {
              setSelectedIndex(i);
              setSliderVisible(true);
            }}
          />
        ))}
        {sliderVisible && (
          <div
            className="bg-black/80 w-full h-full fixed top-0 left-0 z-50 flex items-center justify-center"
            onClick={() => setSliderVisible(false)}
          >
            <div
              className="w-[90%] md:w-[60%] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Carousel autoSlide={false} startIndex={selectedIndex}>
                {Array.from({ length: 20 }).map((_, i) => (
                  <img
                    key={i}
                    src={'/assets/category/vehicles.png'}
                    alt={`bike ${i}`}
                    className="w-full h-[80vh] object-contain"
                  />
                ))}
              </Carousel>
            </div>
          </div>
        )}
      </div>

      {/* Multiple Reviews */}
      {/* Multiple Reviews with Show More / Less */}
      <div className="border-t border-ring/30 pt-4 space-y-6">
        {reviews.slice(0, visibleCount).map((review, index) => (
          <div key={index} className="space-y-3 border-b border-ring/30 pb-4 last:border-none">
            <div className="flex items-center gap-2">
              <div className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                {review.rating}★
              </div>
              <span className="font-semibold">{review.title}</span>
            </div>
            <p className="text-sm text-foreground/80">{review.text}</p>
            {review.images.length > 0 && (
              <div className="flex gap-2">
                {review.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    className="h-16 w-16 object-cover rounded"
                    alt={`review-${index}-${idx}`}
                  />
                ))}
              </div>
            )}
            <div className="text-sm text-gray-500">
              <span className="font-semibold">{review.user}</span>{" "}
              <span>• Certified Buyer, {review.location}</span>{" "}
              <span>• {review.timeAgo}</span>
            </div>
            <div className="flex gap-4 text-gray-500 text-sm">
              <div className="flex items-center gap-1">
                <FaThumbsUp className="text-gray-600" /> {review.likes}
              </div>
              <div className="flex items-center gap-1">
                <FaThumbsDown className="text-gray-600" /> {review.dislikes}
              </div>
            </div>
          </div>
        ))}

        {/* Show More / Show Less button */}
        {reviews.length > 3 && (
          <div className="text-center mt-4">
            <button
              onClick={handleToggle}
              className="text-blue-600 font-medium hover:underline"
            >
              {visibleCount >= reviews.length ? "Show Less" : "Show More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
