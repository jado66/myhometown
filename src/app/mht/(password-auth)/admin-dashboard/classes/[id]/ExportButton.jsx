import { Download } from "@mui/icons-material";
import { Button } from "@mui/material";

export const ExportButton = ({
  classData,
  dates,
  nameFields,
  localAttendance,
  theme,
  isMobile,
}) => {
  const handleExport = () => {
    // Generate CSV headers
    const headers = [
      ...nameFields.map((field) => field.label),
      ...dates.map((date) => {
        const [year, month, day] = date.split("-");
        return `${month}/${day}/${year.slice(-2)}`;
      }),
    ];

    // Generate CSV rows
    const rows = classData.signups.map((signup) => {
      const nameValues = nameFields.map((field) => signup[field.key] || "");
      const attendanceValues = dates.map((date) =>
        localAttendance[signup.id]?.[date] ? "X" : ""
      );
      return [...nameValues, ...attendanceValues];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${classData.title}_attendance.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      onClick={handleExport}
      variant="outlined"
      size={isMobile ? "small" : "medium"}
      sx={{
        position: "absolute",
        top: -8,
        right: 8,
        fontSize: isMobile ? "0.75rem" : undefined,
      }}
    >
      <Download className={isMobile ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2"} />
      <span>{isMobile ? "Export" : "Export to CSV"}</span>
    </Button>
  );
};
