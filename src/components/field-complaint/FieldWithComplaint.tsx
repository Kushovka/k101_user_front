type FieldWithComplaintProps = {
  label: string;
  value?: unknown;
  fieldName: string;
  docId: string;
  onComplaint: (docId: string, fieldName: string) => void;
};

export function FieldWithComplaint({
  label,
  value,
  fieldName,
  docId,
  onComplaint,
}: FieldWithComplaintProps) {
  if (value === null || value === undefined || value === "") return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-zinc-500">{label}:</span>
      <span className="break-all">{String(value)}</span>

      <button
        type="button"
        onClick={() => onComplaint(docId, fieldName)}
        className="ml-1 text-zinc-400 hover:text-red-500 transition"
        title="Пожаловаться на поле"
      >
        ⚠️
      </button>
    </div>
  );
}
