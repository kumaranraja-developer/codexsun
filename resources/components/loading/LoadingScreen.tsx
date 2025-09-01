interface LoadingScreenProps {
  image: string;
}

function LoadingScreen({ image }: LoadingScreenProps) {
  return (
    <div className="relative h-screen bg-white text-gray-700 flex flex-col items-center">
      {/* Image positioned above spinner */}
      <img
        src={image}
        alt="Loading Logo"
        className="w-72  mb-6 mt-30"
      />

      {/* Spinner centered vertically */}
      <div className="flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}

export default LoadingScreen;
