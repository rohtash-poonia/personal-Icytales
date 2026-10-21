/**
 * Star Rating Display Component
 * Shows dynamic star rating based on numerical value
 */

"use client";

export const StarIcon = ({ filled = true, size = "w-5 h-5" }) => {
  return (
    <svg
      className={`${size} ${filled ? "text-yellow-400" : "text-gray-300"}`}
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
};

/**
 * StarRating Component
 * Displays stars based on rating value (1-5)
 * @param {number} rating - Rating value (e.g., 4.3)
 * @param {string} size - Size class for stars (default: "w-5 h-5")
 * @param {boolean} showText - Show rating text (default: true)
 * @param {string} textClass - Custom text class styling
 * @returns {JSX.Element}
 */
export function StarRating({
  rating = 0,
  size = "w-5 h-5",
  showText = true,
  textClass = "text-sm font-semibold leading-4 text-darkbrown",
}) {
  // Convert string rating to number
  const ratingValue = typeof rating === "string" ? parseFloat(rating) : rating;

  if (!ratingValue || ratingValue < 0 || ratingValue > 5) {
    return null;
  }

  // Calculate full stars and half star
  const fullStars = Math.floor(ratingValue);
  const hasHalfStar = ratingValue % 1 !== 0;

  return (
    <div className="flex gap-0.75 items-center">
      {/* Full Stars */}
      {[...Array(fullStars)].map((_, i) => (
        <StarIcon key={`full-${i}`} filled={true} size={size} />
      ))}

      {/* Half Star */}
      {hasHalfStar && (
        <div className="relative inline-block">
          <StarIcon filled={false} size={size} />
          <div
            className={`absolute top-0 left-0 overflow-hidden ${size}`}
            style={{ width: "50%" }}
          >
            <StarIcon filled={true} size={size} />
          </div>
        </div>
      )}

      {/* Empty Stars */}
      {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
        <StarIcon key={`empty-${i}`} filled={false} size={size} />
      ))}

      {/* Rating Text */}
      {showText && <p className={textClass}>{ratingValue.toFixed(1)}</p>}
    </div>
  );
}

/**
 * Alternative: Inline StarRating (no separate component file)
 * Use directly in ProductDetails.jsx
 */
export function renderStarRating(rating, size = "w-5 h-5") {
  const ratingValue = typeof rating === "string" ? parseFloat(rating) : rating;

  if (!ratingValue || ratingValue < 0 || ratingValue > 5) {
    return null;
  }

  const fullStars = Math.floor(ratingValue);
  const hasHalfStar = ratingValue % 1 !== 0;

  const stars = [];

  // Full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(<StarIcon key={`full-${i}`} filled={true} size={size} />);
  }

  // Half star
  if (hasHalfStar) {
    stars.push(
      <div key="half" className="relative inline-block">
        <StarIcon filled={false} size={size} />
        <div
          className={`absolute top-0 left-0 overflow-hidden ${size}`}
          style={{ width: "50%" }}
        >
          <StarIcon filled={true} size={size} />
        </div>
      </div>,
    );
  }

  // Empty stars
  for (let i = 0; i < 5 - fullStars - (hasHalfStar ? 1 : 0); i++) {
    stars.push(<StarIcon key={`empty-${i}`} filled={false} size={size} />);
  }

  return stars;
}

/**
 * StarRatingSimple - Alternative simple version
 * Hardcoded star icons (if you prefer)
 */
export function StarRatingSimple({ rating = 0, size = "w-5 h-5" }) {
  const ratingValue = typeof rating === "string" ? parseFloat(rating) : rating;
  const fullStars = Math.floor(ratingValue);

  return (
    <div className="flex gap-1 items-center">
      {[...Array(5)].map((_, i) => (
        <StarIcon key={i} filled={i < fullStars} size={size} />
      ))}
      <p className="text-sm font-semibold ml-2">{ratingValue.toFixed(1)}/5</p>
    </div>
  );
}
