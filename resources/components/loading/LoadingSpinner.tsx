
const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex justify-center items-center h-screen w-screen bg-white/70 z-50">
       <div className="flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
};

export default LoadingSpinner;
