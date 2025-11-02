"use client";

import { useState, useMemo } from "react";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import {
  CalendarIcon,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  useWeeklyReport,
  useMonthlyReport,
  useYearlyReport,
  WeeklyReport,
  MonthlyReport,
  YearlyReport,
} from "@/hooks/use-report";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import ReportChart from "@/components/report-chart";

// Dynamically import ExcelJS and file-saver to reduce initial bundle size
const loadExcelExport = async () => {
  const [ExcelJS, { default: saveAs }] = await Promise.all([
    import("exceljs"),
    import("file-saver"),
  ]);
  return { ExcelJS: ExcelJS.default || ExcelJS, saveAs };
};

function hasDayProperty(
  stat: WeeklyReport | MonthlyReport | YearlyReport
): stat is WeeklyReport | MonthlyReport {
  return "day" in stat;
}

dayjs.extend(weekOfYear);

const ITEMS_PER_PAGE = 10;

type ViewType = "week" | "month" | "year";

export default function ReportPage() {
  const { t } = useI18n();
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
  const [selectedView, setSelectedView] = useState<ViewType>("week");
  const [currentPage, setCurrentPage] = useState(1);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const year = selectedDate.year();
  const month = selectedDate.month() + 1;
  const day = selectedDate.date();

  const { data: weeklyData, isLoading: weeklyLoading } = useWeeklyReport(
    selectedView === "week" ? selectedDate : dayjs()
  );
  const { data: monthlyData, isLoading: monthlyLoading } = useMonthlyReport(
    selectedView === "month" ? month : 1,
    selectedView === "month" ? year : dayjs().year()
  );
  const { data: yearlyData, isLoading: yearlyLoading } = useYearlyReport(
    selectedView === "year" ? year : dayjs().year()
  );

  const getCurrentDateRange = (date: dayjs.Dayjs): string => {
    if (selectedView === "week") {
      const startOfWeek = date.startOf("week").add(1, "day");
      const endOfWeek = startOfWeek.add(6, "days");
      return `${startOfWeek.format("DD/MM/YYYY")} - ${endOfWeek.format(
        "DD/MM/YYYY"
      )}`;
    } else if (selectedView === "month") {
      return date.format("MM/YYYY");
    } else if (selectedView === "year") {
      return date.format("YYYY");
    }
    return "";
  };

  const isLoading =
    (selectedView === "week" && weeklyLoading) ||
    (selectedView === "month" && monthlyLoading) ||
    (selectedView === "year" && yearlyLoading);

  const statistics = useMemo(() => {
    if (selectedView === "week") {
      return weeklyData || [];
    } else if (selectedView === "month") {
      return monthlyData || [];
    } else {
      return yearlyData || [];
    }
  }, [selectedView, weeklyData, monthlyData, yearlyData]);

  const totalRevenue = useMemo(() => {
    return statistics.reduce((sum, stat) => sum + stat.totalRevenue, 0);
  }, [statistics]);

  const totalTicketRevenue = useMemo(() => {
    return statistics.reduce((sum, stat) => sum + stat.ticketRevenue, 0);
  }, [statistics]);

  const totalFoodDrinkRevenue = useMemo(() => {
    return statistics.reduce((sum, stat) => sum + stat.foodDrinkRevenue, 0);
  }, [statistics]);

  const chartData = useMemo(() => {
    if (selectedView === "year") {
      return statistics.map((stat) => ({
        date: `${stat.month}/${stat.year}`,
        revenue: stat.totalRevenue,
      }));
    } else {
      // For week and month views, both have day property
      return statistics.map((stat) => {
        if (hasDayProperty(stat)) {
          return {
            date: `${stat.day}/${stat.month}/${stat.year}`,
            revenue: stat.totalRevenue,
          };
        }
        return {
          date: `${stat.month}/${stat.year}`,
          revenue: stat.totalRevenue,
        };
      });
    }
  }, [statistics, selectedView]);

  const currentStatistics = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return statistics.slice(start, start + ITEMS_PER_PAGE);
  }, [statistics, currentPage]);

  const totalPages = Math.ceil(statistics.length / ITEMS_PER_PAGE);

  const handleViewChange = (value: ViewType) => {
    setSelectedView(value);
    setCurrentPage(1);
    setCalendarOpen(false);
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(dayjs(date));
      setCurrentPage(1);
    }
    setCalendarOpen(false);
  };

  const handleExportReport = async () => {
    if (!statistics.length) return;

    // Dynamically load ExcelJS and file-saver
    const { ExcelJS, saveAs } = await loadExcelExport();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(t("report.excel.worksheetName"));

    // Merge cells for title
    worksheet.mergeCells("A2:D2");
    const reportCell = worksheet.getCell("A2");
    if (selectedView === "month") {
      reportCell.value = `${t("report.excel.month")}: ${month}/${year}`;
    } else if (selectedView === "year") {
      reportCell.value = `${t("report.excel.year")}: ${year}`;
    } else {
      reportCell.value = `${t("report.excel.week")}: ${getCurrentDateRange(
        selectedDate
      )}`;
    }
    reportCell.font = { bold: true, size: 14 };
    reportCell.alignment = { vertical: "middle", horizontal: "center" };

    // Headers
    worksheet.getRow(3).values = [
      t("report.no"),
      t("report.date"),
      t("report.ticketRevenue"),
      t("report.foodDrinkRevenue"),
      t("report.totalRevenue"),
    ];
    const headerRow = worksheet.getRow(3);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFCCEEFF" },
      };
      cell.alignment = { horizontal: "left" };
      cell.border = {
        top: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
      };
    });

    // Data rows
    statistics.forEach((stat, index) => {
      let timeLabel: string;
      if (selectedView === "year") {
        timeLabel = `${stat.month}/${stat.year}`;
      } else if (hasDayProperty(stat)) {
        timeLabel = `${stat.day}/${stat.month}/${stat.year}`;
      } else {
        timeLabel = `${stat.month}/${stat.year}`;
      }
      worksheet.addRow([
        index + 1,
        timeLabel,
        stat.ticketRevenue,
        stat.foodDrinkRevenue,
        stat.totalRevenue,
      ]);
    });

    // Total row
    const totalRowIndex = statistics.length + 4;
    worksheet.mergeCells(`A${totalRowIndex}:B${totalRowIndex}`);
    worksheet.getCell(`A${totalRowIndex}`).value = t("report.excel.total");
    worksheet.getCell(`A${totalRowIndex}`).font = { bold: true };
    worksheet.getCell(`C${totalRowIndex}`).value = totalTicketRevenue;
    worksheet.getCell(`D${totalRowIndex}`).value = totalFoodDrinkRevenue;
    worksheet.getCell(`E${totalRowIndex}`).value = totalRevenue;
    worksheet.getRow(totalRowIndex).eachCell((cell) => {
      cell.font = { bold: true };
      cell.border = {
        top: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
      };
    });

    // Column widths
    worksheet.columns = [
      { key: "no", width: 5 },
      { key: "date", width: 20 },
      { key: "ticketRevenue", width: 20 },
      { key: "foodDrinkRevenue", width: 20 },
      { key: "totalRevenue", width: 25 },
    ];

    const fileName = `${t("report.excel.fileName")}${dayjs().format(
      "YYYYMMDD"
    )}.xlsx`;
    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(new Blob([buffer]), fileName);
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row gap-x-3 items-center flex-wrap">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "font-semibold justify-start text-left",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {getCurrentDateRange(selectedDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate.toDate()}
                onSelect={handleDateChange}
                autoFocus
              />
            </PopoverContent>
          </Popover>

          <Select value={selectedView} onValueChange={handleViewChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("report.selectView")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">{t("report.week")}</SelectItem>
              <SelectItem value="month">{t("report.month")}</SelectItem>
              <SelectItem value="year">{t("report.year")}</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            {t("report.exportReport")}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex justify-between gap-6 mb-6">
              <div className="flex flex-col gap-y-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">{t("report.no")}</TableHead>
                      <TableHead className="w-40">{t("report.date")}</TableHead>
                      <TableHead className="w-40">
                        {t("report.ticketRevenue")}
                      </TableHead>
                      <TableHead className="w-40">
                        {t("report.foodDrinkRevenue")}
                      </TableHead>
                      <TableHead className="w-40">
                        {t("report.totalRevenue")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentStatistics.map((stat, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </TableCell>
                        <TableCell>
                          {hasDayProperty(stat)
                            ? `${stat.day}/${stat.month}/${stat.year}`
                            : `${stat.month}/${stat.year}`}
                        </TableCell>
                        <TableCell>{formatPrice(stat.ticketRevenue)}</TableCell>
                        <TableCell>
                          {formatPrice(stat.foodDrinkRevenue)}
                        </TableCell>
                        <TableCell>{formatPrice(stat.totalRevenue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-end space-x-6 lg:space-x-8 mb-6">
                  <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      <span className="sr-only">Go to first page</span>
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <span className="sr-only">Go to previous page</span>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <span className="sr-only">Go to next page</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <span className="sr-only">Go to last page</span>
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("report.information")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="w-[400px] flex justify-between font-semibold">
                        <p>{t("report.totalTicketRevenue")}</p>
                        <p>{formatPrice(totalTicketRevenue)}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="w-[400px] flex justify-between font-semibold">
                        <p>{t("report.totalFoodDrinkRevenue")}</p>
                        <p>{formatPrice(totalFoodDrinkRevenue)}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="w-[400px] flex justify-between font-semibold">
                        <p>{t("report.totalRevenue")}</p>
                        <p>{formatPrice(totalRevenue)}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t("report.revenue")}</CardTitle>
                <p className="text-2xl font-bold">
                  {formatPrice(totalRevenue)}
                </p>
              </CardHeader>
              <CardContent>
                <ReportChart data={chartData} />
              </CardContent>
            </Card>
          </>
        )}
      </CardContent>
    </Card>
  );
}
