import clsx from "clsx";
import { useState } from "react";
import { createAppeal } from "../../../api/appeals";
import Toast from "../../../components/toast/Toast";

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

const categoryMap = {
  general: "Общий вопрос",
  billing: "Оплата",
  technical: "Техническая",
  data_error: "Ошибка в данных",
  other: "Другое",
};

const AppealCreateModal = ({ onClose, onCreated }: Props) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<keyof typeof categoryMap>("general");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notify, setNotify] = useState<string | null>(null);

  const isDisabled = !subject.trim() || !message.trim();

  const handleSubmit = async () => {
    if (isDisabled) return;

    if (subject.trim().length < 5) {
      setError("Тема минимум 5 символов");
      return;
    }

    if (message.trim().length < 10) {
      setError("Сообщение минимум 10 символов");
      return;
    }

    try {
      setLoading(true);

      await createAppeal({
        subject,
        message,
        category,
      });

      setNotify("Ваше обращение успешно оправлено");

      onCreated();
      onClose();
    } catch (e: any) {
      const detail = e?.response?.data?.detail;

      if (Array.isArray(detail)) {
        // берём первую ошибку
        setError(detail[0]?.msg || "Ошибка");
      } else {
        setError("Ошибка при отправке");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      {error && (
        <Toast message={error} type="error" onClose={() => setError(null)} />
      )}
      {notify && (
        <Toast message={notify} type="access" onClose={() => setNotify(null)} />
      )}
      <div
        className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <h3 className="text-lg font-semibold mb-5">Написать в поддержку</h3>

        {/* категория */}
        <div className="mb-4">
          <div className="text-xs text-slate-400 mb-2">Категория</div>

          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryMap).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setCategory(key as keyof typeof categoryMap)}
                className={clsx(
                  "px-3 py-1 rounded-full text-sm border transition",
                  category === key
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-100 text-slate-700 border-transparent hover:bg-gray-200",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* тема */}
        <div className="mb-3">
          <div className="text-xs text-slate-400 mb-1">Тема</div>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Коротко опишите проблему"
            className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* сообщение */}
        <div className="mb-5">
          <div className="text-xs text-slate-400 mb-1">Сообщение</div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Опишите подробнее, что произошло..."
            rows={4}
            className="w-full border rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* кнопки */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Отмена
          </button>

          <button
            onClick={handleSubmit}
            disabled={isDisabled || loading}
            className={clsx(
              "px-4 py-2 text-sm text-white rounded-md transition",
              isDisabled || loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700",
            )}
          >
            {loading ? "Отправка..." : "Отправить"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppealCreateModal;
