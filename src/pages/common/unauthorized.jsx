import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full mb-6">
          <Lock className="w-10 h-10 text-red-600 dark:text-red-300" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          403
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You don’t have permission to access this page.
        </p>
        <Link
          to="/"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
