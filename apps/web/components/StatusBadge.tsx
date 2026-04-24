const STATUS_STYLES: Record<string, string> = {
  uploaded: "bg-blue-500/20 text-blue-400",
  analyzing: "bg-yellow-500/20 text-yellow-400",
  analyzed: "bg-[#14B8A6]/20 text-[#14B8A6]",
  processing: "bg-yellow-500/20 text-yellow-400",
  completed: "bg-green-500/20 text-green-400",
  review: "bg-purple-500/20 text-purple-400",
  failed: "bg-red-500/20 text-red-400",
};
export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[status] || "bg-[#1F2937] text-[#6B7280]"}`}>
      {status.replace("_", " ")}
    </span>
  );
}
