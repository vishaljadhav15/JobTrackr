const statusStyles = {
  Saved: "bg-slate-100 text-slate-700",
  Applied: "bg-blue-100 text-blue-700",
  Screening: "bg-purple-100 text-purple-700",
  Interview: "bg-amber-100 text-amber-700",
  Offer: "bg-green-100 text-green-700",
  Accepted: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-700",
};

const StatusBadge = ({ status }) => {
  const badgeStyle =
    statusStyles[status] || "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${badgeStyle}`}
    >
      {status || "Unknown"}
    </span>
  );
};

export default StatusBadge;