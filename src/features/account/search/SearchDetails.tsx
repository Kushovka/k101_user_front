import clsx from "clsx";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoExitOutline } from "react-icons/io5";
import ReactMarkdown from "react-markdown";
import { useLocation, useNavigate } from "react-router-dom";
import { exportPersonDossier } from "../../../api/search";
import userApi from "../../../api/userApi";
import { ComplaintModal } from "../../../components/field-complaint/ComplaintModal";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import Toast from "../../../components/toast/Toast";
import { useUserStore } from "../../../store/useUserStore";
import type { SearchUser } from "../../../types/searchDetails.types";

const fieldLabels: Record<string, string> = {
 
};

type SearchDetailsState = {
  item: SearchUser;
  page?: number;
  mode?: string;
  values?: Record<string, string>;
};

const getHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("Access token not found");
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
};

const SearchDetails: React.FC = () => {
  const { fetchUser } = useUserStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen, setIsOpen } = useSidebar();

  const [notify, setNotify] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openMain, setOpenMain] = useState(true);
  const [openDossier, setOpenDossier] = useState(false);
  const [aiDossier, setAIDossier] = useState("");
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  const [dossierLoading, setDossierLoading] = useState(false);
  const [navDossierOpen, setNavDossierOpen] = useState(true);

  const [exportFormat, setExportFormat] = useState<"pdf" | "txt" | "docx">(
    "pdf",
  );
  const [exportLoading, setExportLoading] = useState(false);

  const [complaintTarget, setComplaintTarget] = useState<{
    docId: string;
    fields: string[];
  } | null>(null);

  /* ---------------- helpers ---------------- */
  const state = location.state as SearchDetailsState | null;
  const from = location.state?.from;
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const sectionRefs = useRef<{
    main: HTMLDivElement | null;
    dossier: HTMLDivElement | null;
    ai: HTMLDivElement | null;
    sources: HTMLDivElement | null;
  }>({
    main: null,
    dossier: null,
    ai: null,
    sources: null,
  });

  const scrollToGroup = (groupName: string) => {
    const element = groupRefs.current[groupName];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToSection = (key: keyof typeof sectionRefs.current) => {
    const el = sectionRefs.current[key];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const user = state?.item ?? null;

  const groupedSources = user?.grouped_sources ?? [];

  const sortGroups = (a: { group_name: string }, b: { group_name: string }) => {
    if (a.group_name === "other") return 1;
    if (b.group_name === "other") return -1;
    return 0;
  };

  if (!user) {
    return (
      <p className={clsx("pl-[336px] py-6 text-slate-700")}>
        Пользователь не найден
      </p>
    );
  }

  useEffect(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const sourceFiles = Array.from(
    new Map(
      (user.source_files ?? []).map((file) => [file.raw_file_id, file]),
    ).values(),
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setNotify(true);
    setTimeout(() => setNotify(false), 1200);
  };

  const cleanValue = (value: unknown): string => {
    if (value === null || value === undefined) return "";

    let str = String(value).trim();

    str = str.replace(/^['"]+|['"]+$/g, "");

    return str;
  };

  const uniqueEmails = Array.from(
    new Set(
      (user.emails ?? []).map((e) => e.trim().toLowerCase()).filter(Boolean),
    ),
  );

  const uniquePhones = Array.from(
    new Set(
      (user.phones ?? []).map((e) => e.trim().toLowerCase()).filter(Boolean),
    ),
  );

  const uniqueAddress = Array.from(
    new Set((user.addresses ?? []).map((e) => e.trim()).filter(Boolean)),
  );

  const handleAIDossier = async (id: string) => {
    try {
      setDossierLoading(true);
      const response = await userApi.post(
        "/api/v1/search/dossier",
        { person_id: id },
        { headers: getHeaders() },
      );
      await fetchUser();
      setAIDossier(response.data.dossier);
      setGenerationTime(response.data.generation_time);
    } catch (err) {
      console.error(err);
    } finally {
      setDossierLoading(false);
    }
  };

  const handleExport = async (format: "pdf" | "txt" | "docx") => {
    try {
      setExportLoading(true);

      const blob = await exportPersonDossier(personId, format);

      const safeName =
        `${user.last_name || "person"}_${user.first_name || ""}`.trim();
      const filename = `dossier_${safeName || personId}.${format}`;
      await fetchUser();
      downloadBlob(blob, filename);
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;

      if (status === 402) {
        setError("Недостаточно средств. Пополните баланс");
      } else if (status === 500) {
        setError("Ошибка сервера");
      } else {
        setError(data?.message || "Ошибка поиска");
      }
    } finally {
      setExportLoading(false);
    }
  };

  console.log(sourceFiles);

  const isValidName = (val: string) => /^\p{L}+$/u.test(val);

  const personId = user.entity_id;

  return (
    <section
      className={clsx(
        "section py-20 pr-[36px]",
        isOpen ? "pl-[116px]" : "pl-[336px]",
      )}
    >
      {notify && (
        <Toast
          type="access"
          message="СКОПИРОВАНО!"
          onClose={() => setNotify(false)}
        />
      )}
      {error && (
        <Toast message={error} type="error" onClose={() => setError(null)} />
      )}
      <div className="w-[1100px] ml-[420px]">
        {/* ЛЕВАЯ ФИКС НАВИГАЦИЯ */}
        <div
          className={clsx(
            "fixed top-12 bottom-0 h-full w-[260px]",
            isOpen ? "left-[140px]" : "left-[360px]",
          )}
        >
          <div className="h-full bg-white border-r border-l border-gray-200 p-4 shadow-sm flex flex-col">
            <div className="text-sm font-semibold text-slate-700 mb-4">
              Навигация по досье
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-sm">
              {/* Основное */}
              <button
                onClick={() => scrollToSection("main")}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-cyan-50"
              >
                Основная информация
              </button>

              {/* Досье */}
              <div>
                <button
                  onClick={() => setNavDossierOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-cyan-50 font-medium"
                >
                  <span>Полное досье</span>
                  <IoIosArrowDown
                    className={clsx(
                      "transition text-slate-500",
                      navDossierOpen && "rotate-180",
                    )}
                  />
                </button>

                {navDossierOpen && (
                  <div className="ml-3 mt-2 space-y-1">
                    {groupedSources
                      .slice()
                      .sort(sortGroups)
                      .map((group) => (
                        <button
                          key={group.group_name}
                          onClick={() => {
                            scrollToSection("dossier");
                            scrollToGroup(group.group_name);
                          }}
                          className="w-full text-left px-3 py-1 text-xs rounded hover:bg-cyan-50"
                        >
                          {group.group_name === "other"
                            ? "Другие источники"
                            : group.group_name}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* AI */}
              <button
                onClick={() => scrollToSection("ai")}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-cyan-50"
              >
                AI-досье
              </button>

              {/* Источники */}
              <button
                onClick={() => scrollToSection("sources")}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-cyan-50"
              >
                Источники данных
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-6">
          {/* title */}
          <h1 className="text-[20px] font-semibold text-slate-900">
            Досье: {cleanValue(user.last_name)} {cleanValue(user.first_name)}{" "}
            {cleanValue(user.middle_name)}
          </h1>
          {/* button */}
          <div className="flex items-center justify-between">
            {/* back button */}
            <button
              onClick={() =>
                navigate(
                  from === "search-car"
                    ? "/account/search-car"
                    : "/account/search",
                  {
                    state: {
                      restore: true,
                      page: location.state?.page,
                      mode: location.state?.mode,
                      values: location.state?.values,
                    },
                  },
                )
              }
              className="flex items-center gap-3 h-[40px] w-fit border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition px-3 text-[14px]"
            >
              <IoExitOutline className="rotate-180 h-[20px] w-[20px] text-slate-600" />
              Назад
            </button>
            <div className="flex items-center gap-3">
              {/* Select формата */}
              <select
                value={exportFormat}
                onChange={(e) =>
                  setExportFormat(e.target.value as "pdf" | "txt" | "docx")
                }
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="pdf">PDF</option>
                <option value="txt">TXT</option>
                <option value="docx">DOCX</option>
              </select>

              {/* Кнопка скачать */}
              <button
                disabled={exportLoading}
                onClick={() => handleExport(exportFormat)}
                className={clsx(
                  "px-4 py-2 rounded-lg text-sm font-medium transition",
                  exportLoading
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-cyan-500 hover:bg-cyan-600 text-white",
                )}
              >
                {exportLoading ? "Скачивание..." : "Скачать"}
              </button>
            </div>
          </div>
          {/* MAIN INFO */}
          <motion.div
            ref={(el) => {
              sectionRefs.current.main = el;
            }}
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
                {user?.last_name && isValidName(user.last_name) && (
                  <p>
                    Фамилия: <span>{cleanValue(user?.last_name)}</span>
                  </p>
                )}
                {user?.first_name && isValidName(user.first_name) && (
                  <p>
                    Имя: <span>{cleanValue(user?.first_name)}</span>
                  </p>
                )}

                {user?.middle_name && isValidName(user.middle_name) && (
                  <p>
                    Отчество: <span>{cleanValue(user?.middle_name)}</span>
                  </p>
                )}

                {uniquePhones.length > 0 && (
                  <div className="flex items-start gap-1">
                    <span className="min-w-[50px]">Телефоны:</span>

                    <div className="flex flex-col gap-1">
                      {uniquePhones.map((phone, i) => (
                        <span
                          key={i}
                          className="cursor-copy text-cyan-600 hover:text-cyan-700 transition"
                          onClick={() => handleCopy(phone)}
                        >
                          {cleanValue(phone)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {user.snils?.[0] && <p>СНИЛС: {cleanValue(user.snils[0])}</p>}

                {user.age && <p>Возраст: {cleanValue(user.age)}</p>}

                {user.gender && (
                  <p>Пол: {user.gender === "male" ? "Мужской" : "Женский"}</p>
                )}

                {user.birthdays?.[0] && (
                  <p>Дата рождения: {cleanValue(user.birthdays[0])}</p>
                )}
                {uniqueEmails.length > 0 && (
                  <div className="flex items-start">
                    <span className="min-w-[50px]">Email:</span>

                    <div className="flex flex-col gap-1">
                      {uniqueEmails.map((email, i) => (
                        <span
                          key={i}
                          className="cursor-copy text-cyan-600 hover:text-cyan-700 transition"
                          onClick={() => handleCopy(email)}
                        >
                          {email}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {user.ipn?.[0] && <p>ИНН: {cleanValue(user.ipn[0])}</p>}
                {uniqueAddress.length > 0 && (
                  <div className="flex items-start gap-1">
                    <span className="min-w-[50px]">Адреса:</span>

                    <div className="flex flex-col gap-1">
                      {uniqueAddress.map((address, i) => (
                        <span key={i}>{address}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* {user.entity_id && <p>ID: {user.entity_id}</p>} */}
              </div>
            )}
          </motion.div>

          {/* DOSSIER */}
          <motion.div
            ref={(el) => {
              sectionRefs.current.dossier = el;
            }}
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
                      <div
                        key={group.group_name}
                        ref={(el) => {
                          groupRefs.current[group.group_name] = el;
                        }}
                        className="space-y-4 scroll-mt-24"
                      >
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

                                <button
                                  onClick={() =>
                                    setComplaintTarget({
                                      docId: source.doc_id,
                                      fields: Object.keys(source.fields),
                                    })
                                  }
                                  className="text-xs px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
                                >
                                  Пожаловаться
                                </button>
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
                                        <span>{cleanValue(fieldValue)}</span>
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

          {/* досье ии */}
          <motion.div
            ref={(el) => {
              sectionRefs.current.ai = el;
            }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
          >
            <div className="bg-white p-4 flex justify-between items-center select-none">
              <div className="text-[15px] font-medium text-slate-800">
                AI-Досье
              </div>
              {generationTime && (
                <div className="text-xs text-slate-500">
                  Сгенерировано за {generationTime.toFixed(2)} мс
                </div>
              )}

              <button
                disabled={dossierLoading}
                onClick={() => handleAIDossier(personId)}
                className={clsx(
                  "px-4 py-2 rounded-lg text-sm font-medium",
                  dossierLoading
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-cyan-500 hover:bg-cyan-600 text-white",
                )}
              >
                {dossierLoading ? "Генерация..." : "Сгенерировать"}
              </button>
            </div>

            {aiDossier && (
              <motion.div
                className="bg-white border-t p-4 whitespace-pre-wrap text-[14px]"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="prose prose-slate max-w-none">
                  <ReactMarkdown>{aiDossier}</ReactMarkdown>
                </div>
              </motion.div>
            )}
          </motion.div>
          {/* SOURCE FILES */}
          {sourceFiles.length > 0 && (
            <motion.div
              ref={(el) => {
                sectionRefs.current.sources = el;
              }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="font-medium text-slate-800">
                  Источники данных
                </div>
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
      </div>
      {complaintTarget && (
        <ComplaintModal
          docId={complaintTarget.docId}
          fields={complaintTarget.fields}
          onClose={() => setComplaintTarget(null)}
        />
      )}
    </section>
  );
};

export default SearchDetails;
