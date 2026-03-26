import clsx from "clsx";
import { useEffect, useState } from "react";

import { getMyAppeals } from "../../../api/appeals";
import { getMyComplaints } from "../../../api/profile";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import { Appeal } from "../../../types/appeals";
import { Complaint } from "../../../types/complaint";
import AppealCreateModal from "./AppealCreateModal";

const statusMap = {
  new: "Новые",
  in_progress: "В работе",
  closed: "Закрытые",
};

const Appeals = () => {
  const { isOpen } = useSidebar();

  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"complaints" | "appeals">("complaints");
  const [myComplaints, setMyComplaints] = useState<Complaint[]>([]);

  const fetchAppeals = async () => {
    try {
      const data = await getMyAppeals();
      setAppeals(data.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppeals();
  }, []);

  useEffect(() => {
    const handleComplaints = async () => {
      try {
        const res = await getMyComplaints();
        setMyComplaints(res.items);
      } catch (err) {}
    };
    handleComplaints();
  }, []);

  return (
    <section
      className={clsx(
        "min-h-screen bg-slate-50 py-10 pr-[50px] transition-all",
        isOpen ? "pl-[116px]" : "pl-[336px]",
      )}
    >
      {/* HEADER */}
      <div className="grid grid-cols-2 rounded-xl overflow-hidden border border-gray-200 bg-white">
        <button
          onClick={() => setMode("complaints")}
          className={clsx(
            "py-3 text-[18px] font-semibold transition",
            mode === "complaints"
              ? "bg-slate-100 text-slate-900"
              : "text-slate-500 hover:bg-slate-50",
          )}
        >
          Жалобы на данные
        </button>

        <button
          onClick={() => setMode("appeals")}
          className={clsx(
            "py-3 text-[18px] font-semibold transition",
            mode === "appeals"
              ? "bg-slate-100 text-slate-900"
              : "text-slate-500 hover:bg-slate-50",
          )}
        >
          Мои обращения
        </button>
      </div>

      {mode === "appeals" && (
        <div className="bg-white border rounded-xl p-6 w-full my-6 mx-auto">
          {/* header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Техподдержка</h2>

            <button
              onClick={() => setOpenModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Написать в поддержку
            </button>
          </div>

          {/* список */}
          {loading ? (
            <div>Загрузка...</div>
          ) : appeals.length === 0 ? (
            <div className="text-slate-400">У вас пока нет обращений</div>
          ) : (
            <div className="flex flex-col gap-3">
              {appeals.map((a) => (
                <div key={a.id} className="border p-4 rounded-lg">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{a.subject}</span>

                    <span className="text-xs text-slate-500">
                      {statusMap[a.status]}
                    </span>
                  </div>

                  <p className="text-sm text-slate-700">{a.message}</p>

                  {/* ответ админа */}
                  {a.admin_reply && (
                    <div className="mt-3 p-3 bg-green-50 text-sm rounded">
                      <b>Ответ:</b> {a.admin_reply}
                    </div>
                  )}

                  <div className="text-xs text-slate-400 mt-2">
                    {new Date(a.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {mode === "complaints" && (
        <div>
          {myComplaints.length === 0 ? (
            <p className="text-sm text-slate-500">У вас пока нет обращений</p>
          ) : (
            <div className="flex flex-col gap-3">
              {myComplaints.map((item) => {
                const statusColor =
                  {
                    pending: "bg-yellow-100 text-yellow-700",
                    resolved: "bg-green-100 text-green-700",
                    rejected: "bg-red-100 text-red-700",
                    reviewed: "bg-blue-100 text-blue-700",
                  }[item.status] ?? "bg-gray-100 text-gray-600";

                const statusLabel =
                  {
                    pending: "На рассмотрении",
                    resolved: "Исправлено",
                    rejected: "Отклонено",
                    reviewed: "Проверено",
                  }[item.status] ?? item.status;

                return (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 flex flex-col gap-2 hover:bg-gray-50 transition"
                  >
                    {/* верхняя строка */}
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-slate-500">
                        Документ:{" "}
                        <span className="font-medium text-slate-700">
                          {item.doc_id}
                        </span>
                      </div>

                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor}`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    {/* поле */}
                    <div className="text-sm">
                      <span className="text-slate-500">Поле:</span>{" "}
                      <span className="font-medium text-slate-800">
                        {item.field_name}
                      </span>
                    </div>

                    {/* сообщение */}
                    <div className="text-sm text-slate-700">{item.message}</div>

                    {/* дата */}
                    <div className="text-xs text-slate-400 mt-1">
                      {new Date(item.created_at).toLocaleString()}
                    </div>
                    {(item.status === "resolved" ||
                      item.status === "rejected") &&
                      item.admin_comment && (
                        <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <div className="text-xs text-slate-500 mb-1">
                            Ответ администратора
                          </div>

                          <div className="text-sm text-slate-800">
                            {item.admin_comment}
                          </div>

                          {item.reviewed_at && (
                            <div className="text-xs text-slate-400 mt-1">
                              {new Date(item.reviewed_at).toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {openModal && (
        <AppealCreateModal
          onClose={() => setOpenModal(false)}
          onCreated={fetchAppeals}
        />
      )}
    </section>
  );
};

export default Appeals;
