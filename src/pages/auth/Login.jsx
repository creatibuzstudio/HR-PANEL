import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Mail, Lock } from "lucide-react";

// API and Redux
import {
  useAdminLoginMutation,
  useAdminRequestMagicLinkMutation,
} from "@/services/auth/authApiSlice";
import { useDispatch } from "react-redux";
import { userLoggedIn } from "@/services/auth/authSlice";

// Components
import TextField from "@/components/ui/input/TextField";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import logo from "@/assets/logo/logo.png";

const AdminLogin = () => {
  const [adminLogin, { isLoading }] = useAdminLoginMutation();
  const [requestMagicLink, { isLoading: isMagicLinkLoading }] =
    useAdminRequestMagicLinkMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loginMode, setLoginMode] = useState("password"); // "magic-link" or "password"

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleAuthSuccess = (accessToken, rememberMe, user) => {
    dispatch(userLoggedIn({ accessToken, rememberMe, user }));
    toast.success("You are Successfully Logged In.");
    // Redirect to the intended page or home
    navigate("/");
  };
  const onSubmit = async (data) => {
    if (loginMode === "magic-link") {
      try {
        const result = await requestMagicLink({
          email: data.username,
        }).unwrap();
        toast.success(
          result?.message || "Magic link sent successfully! Check your email.",
        );
      } catch (error) {
        console.error("Magic link error:", error);
        toast.error(error?.data?.message || "Failed to send magic link.");
      }
      return;
    }

    try {
      const result = await adminLogin({
        username: data.username,
        password: data.password,
      }).unwrap();

      if (result.accessToken) {
        // Store tokens
        handleAuthSuccess(result?.accessToken, true, result?.data);
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);

      // Handle different types of errors
      if (error?.status === 401) {
        toast.error(
          error.data?.message ||
            "Invalid credentials. Please check your username and password.",
        );
      } else if (error?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    }
  };

  return (
    <div className="min-h-screen dark:bg-gray-900 bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-full  rounded-full flex items-center justify-center mb-4">
            <img src={logo} alt="logo" className="w-[200px] text-white" />
          </div>
          {/* <h2 className="text-3xl font-bold dark:text-white/75 text-gray-900 mb-2">
                        Celestial Weather
                    </h2> */}
        </div>

        {/* Login Form */}
        <div className="dark:bg-[#242424] bg-white rounded-2xl p-8 border dark:border-white/10 border-gray-200 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username/Email Field */}
            <TextField
              label="Email"
              placeholder="Enter email"
              name="username"
              register={register}
              icon={<Mail className="h-5 w-5 text-gray-400" />}
              error={errors.username?.message}
              className=""
              {...register("username", {
                required: "Email is required",
                pattern: {
                  value:
                    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/,
                  message: "Please enter a valid email",
                },
              })}
            />

            {/* Password Field */}
            {loginMode === "password" && (
              <TextField
                label="Password"
                placeholder="Enter password"
                name="password"
                type="password"
                register={register}
                icon={<Lock className="h-5 w-5 text-gray-400" />}
                error={errors.password?.message}
                className=""
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 4,
                    message: "Password must be at least 4 characters",
                  },
                })}
              />
            )}

            {/* Submit Button */}
            {loginMode === "magic-link" ? (
              <PrimaryButton
                type="submit"
                className="w-full"
                isLoading={isMagicLinkLoading}
                disabled={isMagicLinkLoading}
              >
                {isMagicLinkLoading ? "Sending..." : "Login with Magic Link"}
              </PrimaryButton>
            ) : (
              <PrimaryButton
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </PrimaryButton>
            )}

            {/* Toggle Mode Button */}
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() =>
                  setLoginMode(
                    loginMode === "magic-link" ? "password" : "magic-link",
                  )
                }
                className="text-sm text-blue-600 hover:text-blue-500 hover:underline dark:text-blue-400"
              >
                {loginMode === "magic-link"
                  ? "Login with Password"
                  : "Login with Magic Link"}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="dark:text-white/50 text-gray-500 text-xs">
              Secure access to administrative functions
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="dark:text-white/50 text-gray-500 text-xs">
            Need help? Contact system administrator
          </p>

          {/* Demo Credentials - Remove in production */}
          {/* <div className="mt-4 p-4 dark:bg-white/5 bg-gray-50 rounded-lg border dark:border-white/10 border-gray-200">
                        <p className="dark:text-gray-300 text-gray-600 text-xs font-medium mb-2">Demo Credentials:</p>
                        <div className="text-left text-xs dark:text-gray-400 text-gray-500 space-y-1">
                            <p><span className="dark:text-gray-300 text-gray-600">Username:</span> superadmin@gmail.com</p>
                            <p><span className="dark:text-gray-300 text-gray-600">Password:</span> 12345</p>
                        </div>
                        <p className="text-gray-500 text-xs mt-2 italic">Remove this section in production</p>
                    </div> */}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
