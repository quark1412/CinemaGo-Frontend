"use client";

import { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import {
  CalendarIcon,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Film,
  Theater,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import CustomCalendar from "@/components/custom-calendar";
import {
  useWeeklyReport,
  useMonthlyReport,
  useYearlyReport,
  WeeklyReport,
  MonthlyReport,
  YearlyReport,
} from "@/hooks/use-report";
import { Loader2 } from "lucide-react";
import { LineChart } from "@/components/line-chart";
import { BarChart } from "@/components/bar-chart";
import {
  useDashboardStatistics,
  useMonthlyRevenue,
} from "@/hooks/use-dashboard";
import {
  useRevenueByType,
  useRevenueByCinema,
  useRevenueByMovie,
  useAvailableCinemas,
  useAvailableMovies,
} from "@/hooks/use-report";
import { DashboardCard } from "@/components/dashboard-card";
import { useI18n } from "@/contexts/I18nContext";

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

// Helper function to get Monday of the week for any date
function getMondayOfWeek(date: dayjs.Dayjs): dayjs.Dayjs {
  const dayOfWeek = date.day();
  let daysToSubtract: number;
  if (dayOfWeek === 0) {
    daysToSubtract = 6;
  } else {
    daysToSubtract = dayOfWeek - 1;
  }

  const monday = date.subtract(daysToSubtract, "day").startOf("day");

  return monday;
}

export default function ReportPage() {
  const { t } = useI18n();
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(() => {
    const today = dayjs(new Date());
    return getMondayOfWeek(today);
  });
  const [selectedView, setSelectedView] = useState<ViewType>("week");
  const [currentPage, setCurrentPage] = useState(1);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>("all");
  const [selectedMovieId, setSelectedMovieId] = useState<string>("all");
  const [calendarMonth, setCalendarMonth] = useState<Date>(dayjs().toDate());
  const [showPicker, setShowPicker] = useState(false);
  const [inputValue, setInputValue] = useState<string>(() => {
    const today = dayjs(new Date());
    const mondayOfWeek = getMondayOfWeek(today);
    const endOfWeek = mondayOfWeek.add(6, "days");
    return `${mondayOfWeek.format("DD/MM/YYYY")} - ${endOfWeek.format(
      "DD/MM/YYYY"
    )}`;
  });

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

  // Fetch data for the 4 charts
  const { data: offlineRevenueData, isLoading: offlineLoading } =
    useRevenueByType(selectedView, selectedDate, "offline");
  const { data: onlineRevenueData, isLoading: onlineLoading } =
    useRevenueByType(selectedView, selectedDate, "online");
  const { data: cinemaRevenueData, isLoading: cinemaLoading } =
    useRevenueByCinema(
      selectedView,
      selectedDate,
      selectedCinemaId === "all" ? undefined : selectedCinemaId
    );
  const { data: movieRevenueData, isLoading: movieLoading } = useRevenueByMovie(
    selectedView,
    selectedDate,
    selectedMovieId === "all" ? undefined : selectedMovieId
  );

  const { data: availableCinemas } = useAvailableCinemas();
  const { data: availableMovies } = useAvailableMovies();

  const getCurrentDateRange = (date: dayjs.Dayjs, view?: ViewType): string => {
    const currentView = view ?? selectedView;
    if (currentView === "week") {
      const startOfWeek = getMondayOfWeek(date);
      const endOfWeek = startOfWeek.add(6, "days");
      return `${startOfWeek.format("DD/MM/YYYY")} - ${endOfWeek.format(
        "DD/MM/YYYY"
      )}`;
    } else if (currentView === "month") {
      return date.format("MM/YYYY");
    } else if (currentView === "year") {
      return date.format("YYYY");
    }
    return "";
  };

  const isLoading =
    (selectedView === "week" && weeklyLoading) ||
    (selectedView === "month" && monthlyLoading) ||
    (selectedView === "year" && yearlyLoading);

  const { data: statistics } = useDashboardStatistics();

  // Combine offline and online data
  const offlineOnlineChartData = useMemo(() => {
    if (!offlineRevenueData || !onlineRevenueData) {
      return [];
    }

    // Create a map to combine data by time
    const dataMap = new Map<
      string,
      {
        offlineTicket: number;
        offlineFoodDrink: number;
        onlineTicket: number;
        onlineFoodDrink: number;
      }
    >();

    // Add offline data
    offlineRevenueData.forEach((item) => {
      dataMap.set(item.time, {
        offlineTicket: item.ticketRevenue,
        offlineFoodDrink: item.foodDrinkRevenue,
        onlineTicket: 0,
        onlineFoodDrink: 0,
      });
    });

    // Add online data
    onlineRevenueData.forEach((item) => {
      const existing = dataMap.get(item.time);
      if (existing) {
        existing.onlineTicket = item.ticketRevenue;
        existing.onlineFoodDrink = item.foodDrinkRevenue;
      } else {
        dataMap.set(item.time, {
          offlineTicket: 0,
          offlineFoodDrink: 0,
          onlineTicket: item.ticketRevenue,
          onlineFoodDrink: item.foodDrinkRevenue,
        });
      }
    });

    // Convert map to array and sort by time
    return Array.from(dataMap.entries())
      .map(([time, values]) => ({
        time,
        offlineTicket: values.offlineTicket,
        offlineFoodDrink: values.offlineFoodDrink,
        onlineTicket: values.onlineTicket,
        onlineFoodDrink: values.onlineFoodDrink,
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [offlineRevenueData, onlineRevenueData]);

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      const normalizedDate =
        selectedView === "week" ? getMondayOfWeek(date) : date;
      setSelectedDate(normalizedDate);
      setInputValue(getCurrentDateRange(normalizedDate));
    }
    setShowPicker(false);
  };

  // Calculate week range for week view
  const weekRange = useMemo(() => {
    if (selectedView === "week") {
      const weekStart = getMondayOfWeek(selectedDate);
      const weekEnd = weekStart.add(6, "days");
      return {
        from: weekStart.toDate(),
        to: weekEnd.toDate(),
      };
    }
    return undefined;
  }, [selectedView, selectedDate]);

  const handleViewChange = (value: ViewType) => {
    const today = dayjs();
    let newDate: dayjs.Dayjs;

    if (value === "week") {
      newDate = getMondayOfWeek(today);
    } else if (value === "month") {
      newDate = today.startOf("month");
    } else {
      newDate = today.startOf("year");
    }

    setSelectedView(value);
    setSelectedDate(newDate);
    setInputValue(getCurrentDateRange(newDate, value));
    setCurrentPage(1);
    setCalendarOpen(false);
    setShowPicker(false);
    setCalendarMonth(newDate.toDate());
  };

  useEffect(() => {
    if (calendarOpen && selectedView === "week") {
      // Update calendar month to show the week's Monday
      const monday = getMondayOfWeek(selectedDate);
      setCalendarMonth(monday.toDate());
    }
  }, [calendarOpen, selectedView, selectedDate]);

  /* const handleExportReport = async () => {
    if (!statistics.length) return;

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
  }; */

  return (
    <>
      <div className="grid grid-cols-3 max-xl:grid-cols-1 max-sm:grid-cols-1 gap-4 mb-10">
        <DashboardCard
          title={t("dashboard.totalMovies")}
          value={statistics?.totalMovies || 0}
          description={t("dashboard.totalMoviesDesc")}
          icon={Film}
        />
        <DashboardCard
          title={t("dashboard.totalCinemas")}
          value={statistics?.totalCinemas || 0}
          description={t("dashboard.totalCinemasDesc")}
          icon={Theater}
        />
        <DashboardCard
          title={t("dashboard.totalUsers")}
          value={statistics?.totalUsers || 0}
          description={t("dashboard.totalUsersDesc")}
          icon={Users}
        />
      </div>

      <div className="flex flex-row gap-x-3 items-center flex-wrap">
        <div className="relative custom-calendar-container">
          <input
            onClick={() => setShowPicker(true)}
            value={inputValue}
            placeholder="Chọn ngày"
            className="w-full font-semibold font-manrope px-5 py-2 focus:outline-none border rounded-lg text-[#0a0a0a] text-sm cursor-pointer"
            readOnly
          />
          {showPicker && (
            <div className="absolute top-full left-0 mt-2 z-50 custom-calendar-container">
              <CustomCalendar
                key={`${selectedView}-${selectedDate.format("YYYY-MM-DD")}`}
                value={selectedDate}
                timeOption={selectedView}
                onDateChange={handleDateChange}
              />
            </div>
          )}
        </div>
        <Select value={selectedView} onValueChange={handleViewChange}>
          <SelectTrigger>
            <SelectValue placeholder={t("report.selectView")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="week"
              className="font-medium font-manrope text-sm"
            >
              {t("report.week")}
            </SelectItem>
            <SelectItem
              value="month"
              className="font-medium font-manrope text-sm"
            >
              {t("report.month")}
            </SelectItem>
            <SelectItem
              value="year"
              className="font-medium font-manrope text-sm"
            >
              {t("report.year")}
            </SelectItem>
          </SelectContent>
        </Select>

        {/* <Button onClick={handleExportReport}>
          <Download className="mr-2 h-4 w-4" />
          {t("report.exportReport")}
        </Button> */}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{t("report.revenueByType")}</CardTitle>
              </CardHeader>
              <CardContent>
                {offlineLoading || onlineLoading ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : offlineOnlineChartData.length === 0 ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <p className="text-muted-foreground">
                      {t("common.noData")}
                    </p>
                  </div>
                ) : (
                  <BarChart data={offlineOnlineChartData} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("report.revenueByCinema")}</CardTitle>
                  <Select
                    value={selectedCinemaId}
                    onValueChange={setSelectedCinemaId}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder={t("report.allCinema")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("report.allCinema")}
                      </SelectItem>
                      {availableCinemas?.map((cinema) => (
                        <SelectItem
                          key={cinema.cinemaId}
                          value={cinema.cinemaId}
                        >
                          {cinema.cinemaName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {cinemaLoading ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <LineChart
                    data={
                      cinemaRevenueData?.map((item) => ({
                        time: item.time,
                        revenue: item.revenue,
                      })) || []
                    }
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("report.revenueByMovie")}</CardTitle>
                  <Select
                    value={selectedMovieId}
                    onValueChange={setSelectedMovieId}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder={t("report.allMovie")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("report.allMovie")}
                      </SelectItem>
                      {availableMovies?.map((movie) => (
                        <SelectItem key={movie.movieId} value={movie.movieId}>
                          {movie.movieName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {movieLoading ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <LineChart
                    data={
                      movieRevenueData?.map((item) => ({
                        time: item.time,
                        revenue: item.revenue,
                      })) || []
                    }
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
