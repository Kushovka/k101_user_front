import { useEffect, useState, useMemo } from "react";
import clsx from "clsx";
import Loader from "../../../components/loader/Loader";
import { useSidebar } from "../../../components/sidebar/SidebarContext";

import { getQuery } from "../../../api/query";
import Toast from "../../../components/toast/Toast";
import { QueryItem, QueryResponse } from "../../../types/query";

const Query: React.FC = () => {
  const [data, setData] = useState<QueryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const { isOpen } = useSidebar();

  const fetchHistory = async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const response: QueryResponse = await getQuery(page, pageSize);
      console.log("API:", response);

      setData(response.requests);
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
        "min-h-screen bg-slate-50 py-10 transition-all pr-[50px]",
        isOpen ? "pl-[116px]" : "pl-[336px]",
      )}
    >
      {error && (
        <Toast message={error} type="error" onClose={() => setError(null)} />
      )}

      {loading ? (
        <Loader />
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
            <div className="grid grid-cols-5 text-xs font-medium text-slate-600 bg-slate-50 border-b border-gray-200">
              <div className="py-3 text-center uppercase">ID</div>
              <div className="py-3 text-center uppercase">Тип</div>
              <div className="py-3 text-center uppercase">Стоимость</div>
              <div className="py-3 text-center uppercase">Статус</div>
              <div className="py-3 text-center uppercase">Дата</div>
            </div>

            {/* ROWS */}
            <div className="flex flex-col divide-y divide-gray-100">
              {data.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-5 text-sm text-slate-700 py-3 items-center text-center hover:bg-slate-50 transition"
                >
                  {/* ID */}
                  <span className="font-mono text-[13px] text-slate-600">
                    {item.id}
                  </span>

                  {/* TYPE */}
                  <span className="text-slate-700">{item.request_type}</span>

                  {/* COST */}
                  <span className="text-slate-800 font-medium">
                    {item.request_cost}
                  </span>

                  {/* STATUS */}
                  <span
                    className={clsx(
                      "px-2 py-[3px] rounded-md text-xs mx-auto font-medium",
                      item.status === "success"
                        ? "bg-green-100 text-green-700"
                        : item.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700",
                    )}
                  >
                    {item.status}
                  </span>

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
