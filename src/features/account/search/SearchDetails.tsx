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
  first_name: "Имя",
  name: "Имя",
  last_name: "Фамилия",
  surname: "Фамилия",
  middle_name: "Отчество",
  fathername: "Отчество",
  address: "Адрес",
  phone: "Телефон",
  city: "Город",
  birthday: "Дата рождения",
  ipn: "ИНН",
  nickname: "Имя",
  number: "Номер паспорта",
  serial: "Серия паспорта",
  snils: "СНИЛС",
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

  const isValidName = (val: string) => /^\p{L}+$/u.test(val);

  const personId = user.entity_id;
  const fullName = [
    cleanValue(user.last_name),
    cleanValue(user.first_name),
    cleanValue(user.middle_name),
  ]
    .filter(Boolean)
    .join(" ");

  const mainInfoRows = [
    {
      label: "Фамилия",
      value:
        user.last_name && isValidName(user.last_name)
          ? cleanValue(user.last_name)
          : "",
    },
    {
      label: "Имя",
      value:
        user.first_name && isValidName(user.first_name)
          ? cleanValue(user.first_name)
          : "",
    },
    {
      label: "Отчество",
      value:
        user.middle_name && isValidName(user.middle_name)
          ? cleanValue(user.middle_name)
          : "",
    },
    { label: "СНИЛС", value: user.snils?.[0] ? cleanValue(user.snils[0]) : "" },
    { label: "Возраст", value: user.age ? cleanValue(user.age) : "" },
    {
      label: "Пол",
      value: user.gender
        ? user.gender === "male"
          ? "Мужской"
          : "Женский"
        : "",
    },
    {
      label: "Дата рождения",
      value: user.birthdays?.[0] ? cleanValue(user.birthdays[0]) : "",
    },
    { label: "ИНН", value: user.ipn?.[0] ? cleanValue(user.ipn[0]) : "" },
  ].filter((item) => item.value);

  const summaryCards = [
    { label: "Телефоны", value: uniquePhones.length },
    { label: "Email", value: uniqueEmails.length },
    { label: "Адреса", value: uniqueAddress.length },
    { label: "Источники", value: sourceFiles.length },
  ];

  const navSections = [
    { key: "main" as const, label: "Основная информация" },
    { key: "dossier" as const, label: "Полное досье" },
    { key: "ai" as const, label: "AI-досье" },
    { key: "sources" as const, label: "Источники данных" },
  ];

  return (
    <section
      className={clsx(
        "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef6ff_100%)] py-20 pr-[36px] md:pr-8",
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

      <div className="mx-auto flex w-full max-w-[1480px] gap-6">
        <aside className="hidden xl:block xl:w-[290px]">
          <div className="sticky top-16 overflow-hidden rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
                Навигация
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">
                Досье пользователя
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Быстрый переход по основным блокам страницы
              </p>
            </div>

            <div className="space-y-2">
              {navSections.map((section) => {
                if (section.key === "dossier") {
                  return (
                    <div
                      key={section.key}
                      className="rounded-2xl border border-slate-200 bg-slate-50/80 p-2"
                    >
                      <button
                        onClick={() => setNavDossierOpen((prev) => !prev)}
                        className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left text-sm font-semibold text-slate-800"
                      >
                        <span>{section.label}</span>
                        <IoIosArrowDown
                          className={clsx(
                            "text-slate-500 transition",
                            navDossierOpen && "rotate-180",
                          )}
                        />
                      </button>

                      {navDossierOpen && (
                        <div className="mt-2 space-y-1">
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
                                className="w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-600 transition hover:bg-white hover:text-cyan-800"
                              >
                                {group.group_name === "other"
                                  ? "Другие источники"
                                  : group.group_name}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={section.key}
                    onClick={() => scrollToSection(section.key)}
                    className="w-full rounded-2xl border border-transparent bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-900"
                  >
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(135deg,rgba(8,145,178,0.98),rgba(37,99,235,0.92))] p-6 text-white shadow-[0_24px_80px_rgba(14,116,144,0.28)] md:p-8">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-3xl">
                  <div className="mb-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-cyan-50">
                    Карточка пользователя
                  </div>
                  <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                    {fullName || "Досье пользователя"}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-cyan-50/90 md:text-base">
                    Удобный обзор основной информации, собранных источников,
                    AI-досье и экспортов в одном месте.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/90">
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                      Групп источников: {groupedSources.length}
                    </span>
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                      Файлов: {sourceFiles.length}
                    </span>
                  </div>
                </div>

                <div className="flex w-full max-w-xl flex-col gap-3 rounded-[28px] border border-white/15 bg-white/10 p-4 backdrop-blur md:p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
                      className="inline-flex h-11 w-fit items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 text-sm font-medium text-white transition hover:bg-white/20"
                    >
                      <IoExitOutline className="h-5 w-5 rotate-180" />
                      Назад к поиску
                    </button>

                    <div className="text-xs uppercase tracking-[0.24em] text-cyan-100/80">
                      Экспорт досье
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 md:flex-row">
                    <select
                      value={exportFormat}
                      onChange={(e) =>
                        setExportFormat(
                          e.target.value as "pdf" | "txt" | "docx",
                        )
                      }
                      className="h-11 rounded-2xl border border-white/20 bg-white/90 px-4 text-sm font-medium text-slate-800 outline-none transition focus:ring-2 focus:ring-cyan-300"
                    >
                      <option value="pdf">PDF</option>
                      <option value="txt">TXT</option>
                      <option value="docx">DOCX</option>
                    </select>

                    <button
                      disabled={exportLoading}
                      onClick={() => handleExport(exportFormat)}
                      className={clsx(
                        "h-11 rounded-2xl px-5 text-sm font-semibold transition",
                        exportLoading
                          ? "cursor-not-allowed bg-white/40 text-white/80"
                          : "bg-slate-950 text-white hover:bg-slate-900",
                      )}
                    >
                      {exportLoading ? "Скачивание..." : "Скачать файл"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-[24px] border border-slate-200/80 bg-white/85 p-5 shadow-[0_12px_36px_rgba(15,23,42,0.06)] backdrop-blur"
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    {card.label}
                  </div>
                  <div className="mt-3 text-3xl font-semibold text-slate-900">
                    {card.value}
                  </div>
                </div>
              ))}
            </div>
            <div className="xl:hidden">
              <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/90 p-4 shadow-[0_16px_48px_rgba(15,23,42,0.08)] backdrop-blur">
                <div className="mb-3 text-sm font-semibold text-slate-800">
                  Навигация по досье
                </div>
                <div className="flex flex-wrap gap-2">
                  {navSections.map((section) => (
                    <button
                      key={section.key}
                      onClick={() => scrollToSection(section.key)}
                      className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50"
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <motion.div
              ref={(el) => {
                sectionRefs.current.main = el;
              }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="scroll-mt-24 overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/90 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur"
            >
              <div
                onClick={() => setOpenMain(!openMain)}
                className="flex cursor-pointer items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-5 transition hover:bg-slate-50"
              >
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
                    Профиль
                  </div>
                  <div className="mt-1 text-xl font-semibold text-slate-900">
                    Основная информация
                  </div>
                </div>
                <IoIosArrowDown
                  className={clsx(
                    "text-2xl text-slate-500 transition",
                    openMain && "rotate-180 text-slate-700",
                  )}
                />
              </div>

              {openMain && (
                <div className="grid gap-6 px-6 py-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {mainInfoRows.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                      >
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {item.label}
                        </div>
                        <div className="mt-2 text-[15px] font-medium text-slate-900">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {uniquePhones.length > 0 && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Телефоны
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {uniquePhones.map((phone, i) => (
                            <button
                              key={i}
                              type="button"
                              className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-800 transition hover:bg-cyan-100"
                              onClick={() => handleCopy(phone)}
                            >
                              {cleanValue(phone)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {uniqueEmails.length > 0 && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Email
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {uniqueEmails.map((email, i) => (
                            <button
                              key={i}
                              type="button"
                              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-800"
                              onClick={() => handleCopy(email)}
                            >
                              {email}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {uniqueAddress.length > 0 && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Адреса
                        </div>
                        <div className="mt-3 space-y-2">
                          {uniqueAddress.map((address, i) => (
                            <div
                              key={i}
                              className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
                            >
                              {address}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              ref={(el) => {
                sectionRefs.current.dossier = el;
              }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="scroll-mt-24 overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/90 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur"
            >
              <div
                onClick={() => setOpenDossier(!openDossier)}
                className="flex cursor-pointer items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-5 transition hover:bg-slate-50"
              >
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
                    Источники
                  </div>
                  <div className="mt-1 text-xl font-semibold text-slate-900">
                    Полное досье
                  </div>
                </div>
                <IoIosArrowDown
                  className={clsx(
                    "text-2xl text-slate-500 transition",
                    openDossier && "rotate-180 text-slate-700",
                  )}
                />
              </div>

              {openDossier && (
                <div className="space-y-8 px-6 py-6">
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
                          className="scroll-mt-24 space-y-4"
                        >
                          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                            <div className="text-lg font-semibold text-slate-900">
                              {group.group_name === "other"
                                ? "Другие источники"
                                : group.group_name}
                            </div>
                            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                              Записей: {group.sources.length}
                            </div>
                          </div>

                          <div className="grid gap-4">
                            {group.sources.map((source, index) => {
                              const sourceName =
                                source.display_name || source.raw_file_id;

                              return (
                                <div
                                  key={`${source.raw_file_id}-${index}`}
                                  className="overflow-hidden rounded-[26px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-[0_12px_36px_rgba(15,23,42,0.05)]"
                                >
                                  <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-start md:justify-between">
                                    <div>
                                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                        Источник
                                      </div>
                                      <div className="mt-2 text-base font-semibold text-slate-900">
                                        {sourceName}
                                      </div>
                                    </div>

                                    <button
                                      onClick={() =>
                                        setComplaintTarget({
                                          docId: source.doc_id,
                                          fields: Object.keys(source.fields),
                                        })
                                      }
                                      className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-medium text-rose-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-800"
                                    >
                                      Пожаловаться
                                    </button>
                                  </div>

                                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                                    {Object.entries(source.fields).map(
                                      ([fieldKey, fieldValue], fieldIndex) => {
                                        const label =
                                          fieldLabels[fieldKey.toLowerCase()] ??
                                          fieldKey;

                                        return (
                                          <div
                                            key={`${source.doc_id}-${fieldKey}-${fieldIndex}`}
                                            className="rounded-2xl border border-slate-200 bg-white p-4"
                                          >
                                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                              {label}
                                            </div>
                                            <div className="mt-2 break-words text-sm leading-6 text-slate-700">
                                              {cleanValue(fieldValue) || "-"}
                                            </div>
                                          </div>
                                        );
                                      },
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </motion.div>
            <motion.div
              ref={(el) => {
                sectionRefs.current.ai = el;
              }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="scroll-mt-24 overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/90 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur"
            >
              <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/70 px-6 py-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
                    AI
                  </div>
                  <div className="mt-1 text-xl font-semibold text-slate-900">
                    AI-досье
                  </div>
                  <div className="mt-2 text-sm text-slate-500">
                    Сгенерированное резюме по найденным данным пользователя
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3 md:items-end">
                  {generationTime && (
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      Сгенерировано за {generationTime.toFixed(2)} мс
                    </div>
                  )}

                  <button
                    disabled={dossierLoading}
                    onClick={() => handleAIDossier(personId)}
                    className={clsx(
                      "h-11 rounded-2xl px-5 text-sm font-semibold transition",
                      dossierLoading
                        ? "cursor-not-allowed bg-slate-200 text-slate-500"
                        : "bg-cyan-500 text-white hover:bg-cyan-600",
                    )}
                  >
                    {dossierLoading ? "Генерация..." : "Сгенерировать"}
                  </button>
                </div>
              </div>

              {aiDossier ? (
                <motion.div
                  className="px-6 py-6 text-[14px]"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="prose prose-slate max-w-none rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                    <ReactMarkdown>{aiDossier}</ReactMarkdown>
                  </div>
                </motion.div>
              ) : (
                <div className="px-6 py-8">
                  <div className="rounded-[26px] border border-dashed border-slate-300 bg-slate-50/70 p-6 text-sm text-slate-500">
                    Здесь появится AI-досье после генерации.
                  </div>
                </div>
              )}
            </motion.div>

            {sourceFiles.length > 0 && (
              <motion.div
                ref={(el) => {
                  sectionRefs.current.sources = el;
                }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="scroll-mt-24 overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/90 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur"
              >
                <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
                    Файлы
                  </div>
                  <div className="mt-1 text-xl font-semibold text-slate-900">
                    Источники данных
                  </div>
                </div>

                <div className="grid gap-3 px-6 py-6">
                  {sourceFiles.map((file, i) => {
                    const name =
                      file.display_name && file.display_name !== "unknown"
                        ? file.display_name
                        : file.file_name;

                    return (
                      <div
                        key={`${file.raw_file_id}-${i}`}
                        className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-slate-50/60 px-4 py-4 text-slate-700 md:flex-row md:items-center md:justify-between"
                      >
                        <span className="font-medium text-slate-800">
                          {name || "Неизвестный файл"}
                        </span>

                        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-500">
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
      </div>

      {complaintTarget && (
        <ComplaintModal
          docId={complaintTarget.docId}
          fields={complaintTarget.fields}
          fieldLabels={fieldLabels}
          onClose={() => setComplaintTarget(null)}
        />
      )}
    </section>
  );
};

export default SearchDetails;
