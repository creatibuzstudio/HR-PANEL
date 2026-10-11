import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useAdminMagicLoginMutation } from "@/services/auth/authApiSlice";
import { userLoggedIn } from "@/services/auth/authSlice";

const AdminMagicLogin = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isCalled = useRef(false); // To prevent double calls in React 18 StrictMode

  const [adminMagicLogin] = useAdminMagicLoginMutation();

  useEffect(() => {
    if (isCalled.current) return;
    isCalled.current = true;

    if (!email || !token) {
      toast.error("Invalid magic link parameters.");
      navigate("/login");
      return;
    }

    const login = async () => {
      try {
        const result = await adminMagicLogin({ email, token }).unwrap();
        if (result.access_token) {
          dispatch(
            userLoggedIn({
              accessToken: result.access_token,
              rememberMe: true,
              user: result.data,
            }),
          );
          toast.success("Successfully Logged In via Magic Link.");
          navigate("/"); // Go to admin dashboard
        } else {
          toast.error("Magic login failed.");
          navigate("/login");
        }
      } catch (error) {
        console.error("Magic login error:", error);
        if (error?.data?.message) {
          toast.error(error.data.message);
        } else {
          toast.error("Magic login failed. Link may be expired.");
        }
        navigate("/login");
      }
    };

    login();
  }, [email, token, navigate, dispatch, adminMagicLogin]);

  return (
    <div className="min-h-screen dark:bg-gray-900 bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="dark:bg-[#242424] bg-white rounded-2xl p-8 border dark:border-white/10 border-gray-200 shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6 dark:text-white text-gray-900">
            Authenticating...
          </h2>
          <div className="flex justify-center items-center">
            {/* Simple spinner */}
            <svg
              className="animate-spin h-10 w-10 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <p className="mt-6 text-gray-500 dark:text-gray-400">
            Please wait while we log you in securely via magic link.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminMagicLogin;
