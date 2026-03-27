import clsx from "clsx";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getNewsById, getNewsList } from "../../../api/news";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import type { NewsItem } from "../../../types/news";

const News = () => {
  const { isOpen } = useSidebar();

  const [items, setItems] = useState<NewsItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  /* ---------------- helpers ---------------- */

  const formatDateTime = (date?: string | null) => {
    if (!date) return "";

    return new Date(date).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const pinnedNews = items.filter((item) => item.pinned);
  const otherNews = items.filter((item) => !item.pinned);

  /* ---------------- API ---------------- */

  const fetchNews = async () => {
    try {
      setLoading(true);

      const res = await getNewsList({
        page,
        page_size: 8,
      });

      // pinned + сортировка по дате
      const sorted = [...res.items].sort((a, b) => {
        if (a.pinned !== b.pinned) {
          return Number(b.pinned) - Number(a.pinned);
        }

        const dateA = new Date(a.published_at || a.created_at).getTime();
        const dateB = new Date(b.published_at || b.created_at).getTime();

        return dateB - dateA;
      });

      setItems(sorted);
      setTotalPages(res.total_pages);
    } catch (e) {
      console.error("Ошибка загрузки новостей", e);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (id: number) => {
    try {
      setLoadingDetail(true);
      const data = await getNewsById(id);
      setSelectedNews(data);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [page]);

  return (
    <section
      className={clsx(
        "min-h-screen bg-slate-50 py-20 pr-[36px] transition-all",
        isOpen ? "pl-[116px]" : "pl-[336px]",
      )}
    >
      <div className="mx-auto w-full my-6">
        {/* header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Новости</h1>
          <p className="text-sm text-gray-500 mt-1">
            Обновления и важная информация
          </p>
        </div>

        {/* loading */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white p-5 rounded-xl border"
              >
                <div className="h-5 w-1/3 bg-gray-200 rounded mb-3" />
                <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                <div className="h-4 w-[80%] bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* empty */}
        {!loading && items.length === 0 && (
          <div className="text-center text-gray-500">Новостей пока нет</div>
        )}

        {/* list */}
        <div className="mt-6 space-y-10">
          {/* PINNED */}
          {pinnedNews.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">📌</span>
                <h2 className="text-lg font-semibold text-slate-900">
                  Важные новости
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {pinnedNews.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => openDetail(item.id)}
                    className="relative flex flex-col justify-between bg-blue-50/40 border border-blue-300 rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition cursor-pointer"
                  >
                    {/* PIN */}
                    <div className="absolute top-3 right-3 text-xs text-blue-600">
                      📌
                    </div>

                    <div className="flex flex-col gap-5">
                      <span className="w-fit px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                        {item.category_label}
                      </span>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                          {item.title}
                        </h3>

                        <p className="text-sm text-slate-600 line-clamp-4">
                          {item.content}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between text-xs text-slate-400">
                      <span>
                        {formatDateTime(item.published_at || item.created_at)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* ALL */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Все новости
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {otherNews.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => openDetail(item.id)}
                  className="relative flex flex-col justify-between bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition cursor-pointer"
                >
                  <div className="flex flex-col gap-5">
                    <span className="w-fit px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                      {item.category_label}
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                        {item.title}
                      </h3>

                      <p className="text-sm text-slate-600 line-clamp-4">
                        {item.content}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between text-xs text-slate-400">
                    <span>
                      {formatDateTime(item.published_at || item.created_at)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Назад
            </button>

            <span>
              {page} / {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Вперед
            </button>
          </div>
        )}
      </div>
      {selectedNews && (
        <div
          onClick={() => setSelectedNews(null)}
          className="fixed inset-0 bg-black/40 backdrop-blur-[3px] flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white max-w-2xl w-full rounded-2xl shadow-xl p-12 overflow-hidden"
          >
            {loadingDetail ? (
              <p>Загрузка...</p>
            ) : (
              <>
                {/* TITLE */}
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                  {selectedNews.title}
                </h2>

                {/* META */}
                <div className="flex gap-4 text-xs text-slate-400 mb-4">
                  <span className="w-fit px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                    {selectedNews.category_label}
                  </span>
                </div>

                {/* PIN */}
                {selectedNews.pinned && (
                  <div className="inline-block mb-4 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded">
                    Закреплено
                  </div>
                )}

                {/* CONTENT */}
                <div className="text-[14px] text-slate-700 whitespace-pre-line leading-6">
                  {selectedNews.content}
                </div>

                {/* ACTION */}
                <div className="mt-6 flex justify-between items-center">
                  <span className="text-xs text-slate-400">
                    {formatDateTime(
                      selectedNews.published_at || selectedNews.created_at,
                    )}
                  </span>
                  <button
                    onClick={() => setSelectedNews(null)}
                    className="px-4 py-2 rounded-lg border text-sm hover:bg-slate-100 transition"
                  >
                    Закрыть
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default News;
