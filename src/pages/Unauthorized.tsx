import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, LogIn } from "lucide-react";

export default function Unauthorized() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login", { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unauthorized Access</h1>
          <p className="text-gray-500 mb-6">You need to be logged in to access this page.</p>

          <button
            onClick={() => navigate("/login", { replace: true })}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Go to Login
          </button>

          <p className="mt-4 text-sm text-gray-400">Redirecting automatically in 3 seconds...</p>
        </div>
      </div>
    </div>
  );
}
