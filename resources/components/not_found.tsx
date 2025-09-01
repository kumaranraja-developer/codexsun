import React from 'react';

const Not_found: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-4">
      <h1 className="text-4xl font-bold text-red-600">404 - Page Not Found</h1>
      <p className="text-lg text-gray-600">Sorry, the page you are looking for does not exist.</p>
      <a href="/frontend/react/codexsun/public" className="text-blue-500 underline hover:text-blue-700">
        Go back to Home
      </a>
    </div>
  );
};

export default Not_found;
