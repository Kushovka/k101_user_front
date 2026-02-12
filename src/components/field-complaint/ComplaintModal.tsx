import axios from "axios";
import { useState } from "react";
import { createComplaint } from "../../api/search";
import Toast from "../toast/Toast";

type ComplaintModalProps = {
  docId: string;
  fieldName: string;
  onClose: () => void;
  onSent?: () => void;
};

export function ComplaintModal({
  docId,
  fieldName,
  onClose,
  onSent,
}: ComplaintModalProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notify, setNotify] = useState("");

  const canSend = message.trim().length >= 5 && !loading;

  const handleSend = async () => {
    try {
      if (!message.trim()) return;

      setLoading(true);
      setErr(null);

      await createComplaint({
        doc_id: docId,
        field_name: fieldName,
        message: message.trim(),
      });
      setNotify("accessComplaint");

      setTimeout(() => {
        onSent?.();
        onClose();
      }, 1500);
      console.log({
        doc_id: docId,
        field_name: fieldName,
        message,
      });
    } catch (error) {
      console.error(error);
      setNotify("errorComplaint");

      if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail;

        if (Array.isArray(detail)) {
          setErr(detail.map((d) => d.msg).join(", "));
        } else if (typeof detail === "string") {
          setErr(detail);
        } else {
          setErr("Ошибка отправки жалобы");
        }
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {notify === "accessComplaint" && (
        <Toast
          type="access"
          message={"Ваше обращение успешно отправлено!"}
          onClose={() => setNotify("")}
        />
      )}
      {notify === "errorComplaint" && (
        <Toast type="error" message={`${err}`} onClose={() => setNotify("")} />
      )}
      <div className="w-[520px] max-w-[90vw] rounded-2xl bg-white p-6 shadow-xl flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Жалоба на данные</h2>
            <p className="text-sm text-zinc-500">
              Поле:{" "}
              <span className="font-medium text-zinc-700">{fieldName}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700"
            title="Закрыть"
          >
            ✕
          </button>
        </div>

        <textarea
          className="min-h-[120px] w-full resize-none rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:border-zinc-400"
          placeholder="Опиши, что именно неверно и почему"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {err && <div className="text-sm text-red-600">{err}</div>}

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50"
          >
            Отмена
          </button>
          <button
            type="button"
            disabled={!canSend}
            onClick={handleSend}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-40"
          >
            {loading ? "Отправляю..." : "Отправить"}
          </button>
        </div>
      </div>
    </div>
  );
}
