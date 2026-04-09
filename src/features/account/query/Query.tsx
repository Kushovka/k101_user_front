import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import Loader from "../../../components/loader/Loader";
import { useSidebar } from "../../../components/sidebar/SidebarContext";

import { useNavigate } from "react-router-dom";
import { getSnapshotId, getSnapshots } from "../../../api/query";
import Toast from "../../../components/toast/Toast";
import { SnapshotItem, SnapshotResponse } from "../../../types/query";

const Query: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<SnapshotItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const { isOpen } = useSidebar();

  const searchTypeLabels: Record<string, string> = {
    cascade_phone: "Поиск по телефону",
    search_name: "Поиск по имени",
    cascade_email: "Поиск по email",
    cascade_snils: "Поиск по СНИЛС",
    cascade_ipn: "Поиск по ИНН",
    search_address: "Поиск по адресу",
    advanced_phone: "Поиск по телефону",
    advanced_name: "Поиск по ФИО",
    advanced_email: "Поиск по email",
    advanced_birthday: "Поиск по дате рождения",
    advanced_snils: "Поиск по СНИЛС",
    advanced_ipn: "Поиск по ИНН",
    advanced_address: "Поиск по адресу",
    advanced_passport: "Поиск по паспорту",
    search_license_plate: "Поиск по автомобильному номеру",
    search_vin: "Поиск по VIN-номеру",
  };

  const fetchHistory = async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const response: SnapshotResponse = await getSnapshots(page, pageSize);

      setData(response.snapshots);
      setTotalPages(response.total_pages);
      setTotal(response.total);
    } catch (err: any) {
      const response = (err as { response?: { status?: number } }).response;
      let msg = "";

      if (!response) {
        msg = "Сетевая ошибка или CORS";
      } else if (response.status === 500) {
        msg = "Сервер временно недоступен. Попробуйте позже.";
      } else if (response.status === 403) {
        msg = "Требуется подтвердить почту";
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const openSnapshot = async (snapshotId: number) => {
    try {
      setLoading(true);

      const response = await getSnapshotId(snapshotId);

      navigate("/account/snapshot-details", {
        state: {
          snapshot: response,
        },
      });
    } catch (err) {
      setError("Не удалось загрузить snapshot");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(currentPage);
  }, [currentPage]);

  const visiblePages = useMemo(() => {
    const maxVisible = 7;
    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(start + maxVisible - 1, totalPages);

    if (end - start < maxVisible) {
      start = Math.max(end - maxVisible + 1, 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  const points = [
    { title: "Идентификатор", id: 1 },
    { title: "Тип запроса", id: 2 },
    { title: "Цена запроса", id: 3 },
    { title: "Статус", id: 4 },
    { title: "Дата запроса", id: 5 },
  ];

  return (
    <section
      className={clsx(
        "min-h-screen bg-slate-50 py-20 pr-[36px] transition-all",
        isOpen ? "pl-[116px]" : "pl-[336px]",
      )}
    >
      {error && (
        <Toast message={error} type="error" onClose={() => setError(null)} />
      )}

      {loading ? (
        <Loader fullScreen />
      ) : (
        <div className="w-full mx-auto flex flex-col gap-6">
          {/* TITLE */}
          <h1 className="text-[24px] font-semibold text-slate-900 tracking-tight">
            История запросов
          </h1>

          {/* STATS */}
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Всего запросов: {total}</span>
          </div>

          {/* TABLE CONTAINER */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* HEADER */}
            <div className="grid grid-cols-[80px_1fr_1fr_1fr] text-xs font-medium text-slate-600 bg-slate-50 border-b border-gray-200">
              <div className="py-3 text-center uppercase">ID</div>
              <div className="py-3 text-center uppercase">Тип</div>
              <div className="py-3 text-center uppercase">Запрос</div>
              <div className="py-3 text-center uppercase">Дата</div>
            </div>

            {/* ROWS */}
            <div className="flex flex-col divide-y divide-gray-100">
              {data.map((item) => (
                <div
                  key={item.id}
                  onClick={() => openSnapshot(item.id)}
                  className="grid grid-cols-[80px_1fr_1fr_1fr] text-sm text-slate-700 py-3 items-center text-center hover:bg-slate-50 transition"
                >
                  {/* ID */}
                  <span className="font-mono text-[13px] text-slate-600">
                    {item.id}
                  </span>

                  {/* query */}
                  <span className="text-slate-700">
                    {item.request_type === "dossier"
                      ? ""
                      : (searchTypeLabels[item.request_type] ??
                        item.request_type)}
                  </span>

                  {/* TYPE */}
                  <span className="text-slate-700">{item.search_query}</span>

                  {/* DATE */}
                  <span className="text-slate-600 text-xs">
                    {item.request_date
                      ? new Date(item.request_date).toLocaleString("ru-RU", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-3">
              {visiblePages.map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={clsx(
                    "px-3 py-1.5 border rounded-md text-sm transition",
                    page === currentPage
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 text-slate-700 hover:bg-slate-100",
                  )}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default Query;
