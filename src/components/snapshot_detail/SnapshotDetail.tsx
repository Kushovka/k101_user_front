import clsx from "clsx";
import { motion } from "framer-motion";
import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoExitOutline } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "../sidebar/SidebarContext";
import Toast from "../toast/Toast";

const fieldLabels: Record<string, string> = {
  height: "Рост",
  weight: "Вес",
  breast: "Грудь",
  "clothing size": "Размер одежды",
  "shoes size": "Размер обуви",
  nickname: "Имя",
  anketa_id: "Номер анкеты",
  area: "Район",
  metro: "Метро",
  "updated ": "Дата обновления",
  humannumber: "Номер очереди",
  pic_max: "Фотография",
  external_share_link: "Ссылка на профиль",
  number: "Номер паспорта",
  serial: "Серия паспорта",
  snils: "СНИЛС",
  delivery: "Доставка",
  delivery2: "Доставка",
  yandex: "Яндекс",
  comment: "Комментарий",
  commission: "Комиссия",
  "currency code": "Валюта",
  "date added": "Дата заказа",
  ip: "IP адрес",
  "order id": "ID заказа",
  "order status id": "ID статуса",
  password: "Пароль",
  "payment code": "Код оплаты",
  "payment country": "Страна оплаты",
  "payment method": "Метод оплаты",
  "payment postcode": "Посткод оплаты",
  "payment zone": "Зона оплаты",
  "shipping address 1": "Адрес доставки",
  "shipping city": "Город доставки",
  "shipping country": "Страна доставки",
  "shipping method": "Метод доставки",
  status: "Статус",
  "user agent": "Устройство пользователя",
};

const SnapshotDetail = () => {
  const { isOpen } = useSidebar();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [notify, setNotify] = useState(false);
  const [openMain, setOpenMain] = useState(true);
  const [openDossier, setOpenDossier] = useState(false);

  const snapshot = state?.snapshot;

  const isValidName = (val: string) => /^\p{L}+$/u.test(val);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setNotify(true);
    setTimeout(() => setNotify(false), 1200);
  };

  if (!snapshot) {
    return (
      <div className="p-6">
        <p>Данные не найдены</p>
        <button onClick={() => navigate(-1)}>Назад</button>
      </div>
    );
  }
  const user = snapshot.data.entity;

  const groupedSources = user?.grouped_sources ?? [];
  const sourceFiles = user.source_files ?? [];
  const sortGroups = (a: { group_name: string }, b: { group_name: string }) => {
    if (a.group_name === "other") return 1;
    if (b.group_name === "other") return -1;
    return 0;
  };

  return (
    <section className={clsx("section", isOpen ? "pl-[116px]" : "pl-[336px]")}>
      {notify && (
        <Toast
          type="access"
          message="СКОПИРОВАНО!"
          onClose={() => setNotify(false)}
        />
      )}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm">
        Сохранённый результат от{" "}
        {new Date(snapshot.request_date).toLocaleString("ru-RU")}
      </div>

      <h2 className="font-medium mt-4">Результаты:</h2>
      <div className="w-[1100px] mx-auto flex flex-col gap-6">
        {/* title */}
        <h1 className="text-[20px] font-semibold text-slate-900">
          Досье: {user.last_name} {user.first_name} {user.middle_name}
        </h1>

        {/* back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 h-[40px] w-fit border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition px-3 text-[14px]"
        >
          <IoExitOutline className="rotate-180 h-[20px] w-[20px] text-slate-600" />
          Назад
        </button>

        {/* MAIN INFO */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
        >
          <div
            onClick={() => setOpenMain(!openMain)}
            className="flex justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition  select-none"
          >
            <div className="font-medium text-slate-800">
              Основная информация
            </div>
            <IoIosArrowDown
              className={clsx(
                "transition",
                openMain && "rotate-180 text-slate-600",
              )}
            />
          </div>

          {openMain && (
            <div className="px-4 py-3 border-t border-gray-200 space-y-2 text-[14px] text-slate-700">
              {user?.first_name && isValidName(user.first_name) && (
                <p>
                  Имя: <span>{user?.first_name}</span>
                </p>
              )}

              {user?.last_name && isValidName(user.last_name) && (
                <p>
                  Фамилия: <span>{user?.last_name}</span>
                </p>
              )}

              {user?.middle_name && isValidName(user.middle_name) && (
                <p>
                  Отчество: <span>{user?.middle_name}</span>
                </p>
              )}

              {user.phones?.[0] && (
                <p>
                  Телефон:{" "}
                  <span
                    className="cursor-copy text-cyan-600 hover:text-cyan-700 transition"
                    onClick={() => handleCopy(user.phones![0])}
                  >
                    {user.phones![0]}
                  </span>
                </p>
              )}
              {user.snils?.[0] && <p>СНИЛС: {user.snils[0]}</p>}
              {user.age && <p>Возраст: {user.age}</p>}
              {user.gender && (
                <p>Пол: {user.gender === "male" ? "Мужской" : "Женский"}</p>
              )}
              {user.birthdays?.[0] && <p>Дата рождения: {user.birthdays[0]}</p>}
              {user.emails?.map((e, i) => (
                <p key={i}>
                  Email {i + 1}:{" "}
                  <span
                    className="cursor-copy text-cyan-600 hover:text-cyan-700 transition"
                    onClick={() => handleCopy(e)}
                  >
                    {e}
                  </span>
                </p>
              ))}

              {user.cities?.[0] && <p>Город: {user.cities[0]}</p>}
              {user.ipn?.[0] && <p>ИНН: {user.ipn[0]}</p>}

              {user.addresses?.map((a, i) => (
                <p key={i}>
                  Адрес {i + 1}: {a}
                </p>
              ))}

              {/* {user.entity_id && <p>ID: {user.entity_id}</p>} */}
            </div>
          )}
        </motion.div>

        {/* DOSSIER */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
        >
          <div
            onClick={() => setOpenDossier(!openDossier)}
            className="flex justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition select-none"
          >
            <div className="font-medium text-slate-800">Полное досье</div>
            <IoIosArrowDown
              className={clsx(
                "transition",
                openDossier && "rotate-180 text-slate-600",
              )}
            />
          </div>

          {openDossier && (
            <div className="px-4 py-4 border-t border-gray-200 space-y-6">
              {groupedSources
                .slice()
                .sort(sortGroups)
                .map((group) => {
                  if (!group.sources?.length) return null;

                  return (
                    <div key={group.group_name} className="space-y-4">
                      {/* Заголовок группы */}
                      <div className="font-medium text-slate-800">
                        {group.group_name === "other"
                          ? "Другие источники"
                          : `${group.group_name}`}
                      </div>

                      {/* Источники внутри группы */}
                      {group.sources.map((source, index) => {
                        const sourceName =
                          source.display_name || source.raw_file_id;

                        return (
                          <div
                            key={`${source.raw_file_id}-${index}`}
                            className="border border-gray-200 rounded-lg p-3 space-y-3"
                          >
                            {/* Верхняя строка */}
                            <div className="flex justify-between items-center">
                              <div className="text-xs text-slate-500">
                                Источник: {sourceName}
                              </div>
                            </div>

                            {/* Поля */}
                            <div className="flex flex-col gap-1 text-[14px]">
                              {Object.entries(source.fields).map(
                                ([fieldKey, fieldValue], fieldIndex) => {
                                  const label =
                                    fieldLabels[fieldKey.toLowerCase()] ??
                                    fieldKey;

                                  return (
                                    <div
                                      key={`${source.doc_id}-${fieldKey}-${fieldIndex}`}
                                      className="flex gap-2"
                                    >
                                      <span className="text-slate-500">
                                        {label}:
                                      </span>
                                      <span>{String(fieldValue)}</span>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
            </div>
          )}
        </motion.div>

        {/* SOURCE FILES */}
        {sourceFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="font-medium text-slate-800">Источники данных</div>
            </div>

            <div className="px-4 py-3 space-y-2 text-[14px]">
              {sourceFiles.map((file, i) => {
                const name =
                  file.display_name && file.display_name !== "unknown"
                    ? file.display_name
                    : file.file_name;

                return (
                  <div
                    key={`${file.raw_file_id}-${i}`}
                    className="flex justify-between items-center text-slate-700"
                  >
                    <span>{name || "Неизвестный файл"}</span>

                    <span className="text-xs text-slate-400">
                      {file.raw_file_id}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default SnapshotDetail;
