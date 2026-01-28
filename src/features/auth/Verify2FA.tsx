import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { verify2FA } from "./auth";
import Toast from "../../components/toast/Toast";

export default function Verify2FA() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const sessionId = localStorage.getItem("session_id");

  useEffect(() => {
    if (!sessionId) navigate("/sign-in");
  }, []);

  const submit = async () => {
    try {
      const tokens = await verify2FA(code, sessionId!);

      localStorage.setItem("access_token_user", tokens.access_token);
      localStorage.setItem("refresh_token_user", tokens.refresh_token);
      localStorage.removeItem("session_id");

      navigate("/account/profile");
    } catch (err) {
      setError("Неверный или истёкший код");
      localStorage.removeItem("session_id");
      setTimeout(() => navigate("/sign-in"), 2000);
    }
  };

  return (
    <section className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      {error && (
        <Toast type="error" message={error} onClose={() => setError(null)} />
      )}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 shadow-sm rounded-xl w-full max-w-[380px] px-6 py-8 flex flex-col gap-6"
      >
        <h3 className="text-[22px] tracking-tight text-slate-900 text-center">
          Подтверждение
        </h3>

        <p className="text-[14px] text-gray-600 text-center leading-snug">
          Введите код, который пришёл вам в Telegram
        </p>

        <input
          maxLength={6}
          placeholder="123456"
          className="w-full px-3 py-2 rounded-lg border text-[14px] focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition text-center tracking-[0.3em] font-medium"
          onChange={(e) => setCode(e.target.value)}
        />

        <button
          disabled={code.length !== 6}
          onClick={submit}
          className="mt-2 w-full py-2 rounded-lg text-[15px] font-medium text-white bg-cyan-600 hover:bg-cyan-700 transition disabled:opacity-50"
        >
          Подтвердить
        </button>
      </motion.div>
    </section>
  );
}
