import { useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "../sidebar/SidebarContext";
import clsx from "clsx";

const SnapshotDetail = () => {
  const { isOpen } = useSidebar();
  const { state } = useLocation();
  const navigate = useNavigate();

  const snapshot = state?.snapshot;

  if (!snapshot) {
    return (
      <div className="p-6">
        <p>Данные не найдены</p>
        <button onClick={() => navigate(-1)}>Назад</button>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "p-6 flex flex-col gap-4",
        isOpen ? "pl-[116px]" : "pl-[336px]",
      )}
    >
      <h1 className="text-xl font-semibold">Snapshot #{snapshot.request_id}</h1>

      <div>
        <p>Тип запроса: {snapshot.request_type}</p>
        <p>Поиск: {snapshot.search_query}</p>
        <p>Дата: {new Date(snapshot.request_date).toLocaleString("ru-RU")}</p>
      </div>

      <div>
        <h2 className="font-medium mt-4">Результаты:</h2>
        <pre className="bg-slate-100 p-4 rounded-lg overflow-auto text-xs">
          {JSON.stringify(snapshot.data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default SnapshotDetail;
