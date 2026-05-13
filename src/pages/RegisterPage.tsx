import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getFriendlyAuthErrorMessage,
  normalizeEmail,
  register,
} from "../services/authService";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      setLoading(true);
      await register(normalizeEmail(email), password, {}, "/account");
      navigate("/verify-email");
    } catch (err: unknown) {
      alert(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute left-1/2 top-[-200px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-500 opacity-20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <h1 className="mb-2 text-center text-3xl font-semibold text-white">
          Create account
        </h1>
        <p className="mb-8 text-center text-sm text-slate-400">
          Start with your account, then verify your email to unlock access.
        </p>

        <div className="space-y-4">
          <input
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          className="preserve-light-mode mt-6 w-full rounded-xl bg-white px-4 py-3 font-medium !text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading}
          onClick={handleRegister}
          type="button"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </div>
    </div>
  );
}
