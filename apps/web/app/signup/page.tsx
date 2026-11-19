"use client";

import { useState } from "react";
import { trpc } from "~/trpc/client";
import { useRouter } from "next/navigation";
import { AuthShell } from "~/components/AuthShell";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const mutation = trpc.auth.createUserWithEmailAndPassword.useMutation({
    onSuccess: () => {
      router.push("/");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <AuthShell title="Create your account">
      <form onSubmit={handleSubmit} className="space-y-4.5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="firstName"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-1"
            >
              First name
            </label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="Jane"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="lastName"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-1"
            >
              Last name
            </label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="Doe"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-1 mt-4"
          >
            Work email
          </label>
          <input
            type="email"
            required
            className="form-control"
            placeholder="jane@company.com"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-1 mt-4"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              className="form-control pr-12"
              placeholder="••••••••"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {mutation.error && (
          <div className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive border border-border">
            {mutation.error.message}
          </div>
        )}

        <div className="pt-6">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="action w-full disabled:opacity-60"
          >
            {mutation.isPending ? "Creating account..." : "Sign up"}
          </button>
        </div>
      </form>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-foreground transition hover:text-foreground"
        >
          Log in
        </Link>
      </div>
    </AuthShell>
  );
}
