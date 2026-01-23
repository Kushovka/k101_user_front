import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import Toast from "../../components/toast/Toast";

const API_URL = import.meta.env.VITE_USER_API_URL;

type FormValues = {
  username: string;
  password: string;
};

type NotifyState = {
  message: string;
  type: "access" | "error";
} | null;

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<FormValues>();

  const navigate = useNavigate();
  const [notify, setNotify] = useState<NotifyState>(null);

  const token = new URLSearchParams(location.search).get("token");

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!token) {
      setNotify({ type: "error", message: "Ссылка устарела или неверна" });
      return;
    }

    try {
      await axios.post(`${API_URL}/api/v1/auth/setup-password`, {
        token,
        username: data.username.trim(),
        password: data.password.trim(),
      });

      setNotify({
        type: "access",
        message: "Пароль установлен! Теперь войдите",
      });

      setTimeout(() => navigate("/sign-in"), 800);
    } catch (err: any) {
      console.log(err?.response?.data);
      setNotify({
        type: "error",
        message: "Ошибка регистрации",
      });
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center h-screen"
    >
      <form
        className="relative flex flex-col gap-4 p-8 bg-white rounded w-80"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h3 className="text-2xl text-black/80 text-center mb-2">Регистрация</h3>

        <input
          type="text"
          placeholder="Username"
          className="border p-2 rounded w-full"
          {...register("username", { required: true, minLength: 4 })}
        />

        <input
          type="password"
          placeholder="Пароль"
          className="border p-2 rounded w-full"
          {...register("password", { required: true, minLength: 4 })}
        />

        <button
          type="submit"
          className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Зарегистрироваться
        </button>
      </form>

      {notify && (
        <Toast
          message={notify.message}
          type={notify.type}
          onClose={() => setNotify(null)}
        />
      )}
    </motion.section>
  );
}
