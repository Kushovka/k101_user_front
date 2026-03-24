import clsx from "clsx";
import { useEffect, useState } from "react";

import { getMyAppeals } from "../../../api/appeals";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import { Appeal } from "../../../types/appeals";
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

  return (
    <section
      className={clsx(
        "min-h-screen bg-slate-50 py-10 transition-all",
        isOpen ? "pl-[116px]" : "pl-[336px]",
      )}
    >
      <div className="bg-white border rounded-xl p-6 max-w-6xl mx-auto">
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
