import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useToastStore } from "../stores/toastStore";
import { getUserFromToken } from "../utils/jwt";
import { logger } from "../utils/logger";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { addToast } = useToastStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    mode: "onBlur",
    resolver: zodResolver(loginSchema),
    delayError: 300,
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Invalid credentials");

      const result = await response.json();
      // Check for different possible response structures
      const accessToken =
        result.data?.access_token || result.data?.tokens?.access_token || result.access_token;

      if (!accessToken) {
        addToast("Invalid response from server", "error");
        return;
      }

      const user = getUserFromToken(accessToken);

      if (!user) {
        logger.error("[Login] Failed to extract user from token");
        addToast("Failed to process login response", "error");
        return;
      }

      setAuth(user, accessToken);
      addToast("Login successful", "success");
      navigate("/");
    } catch (error) {
      logger.error("[Login] Login error", error);
      addToast("Invalid email or password", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Welcome Back</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">
              Email *
            </label>
            <input
              {...register("email")}
              type="email"
              id="email"
              autoComplete="email"
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-1">
              Password *
            </label>
            <input
              {...register("password")}
              type="password"
              id="password"
              autoComplete="current-password"
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <a href="/register" className="text-primary hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
