import { COLORS } from "./constants";

export const getBaseChartOptions = (theme, customOptions = {}) => {
  const textColor = theme === "dark" ? COLORS.textLight : COLORS.textDark;
  const gridColor = theme === "dark" ? COLORS.gridDark : COLORS.gridLight;

  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        right: 10,
        bottom: 20,
        left: 10,
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: textColor,
          font: {
            size: 13,
            weight: "600",
          },
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: textColor,
        },
        grid: {
          color: gridColor,
        },
      },
      y: {
        ticks: {
          color: textColor,
        },
        grid: {
          color: gridColor,
        },
      },
    },
    ...customOptions,
  };
};

export const getDatasetStyle = () => ({
  borderColor: COLORS.primary,
  backgroundColor: COLORS.primaryRgba,
  pointBackgroundColor: COLORS.primary,
  pointBorderColor: "#fff",
  pointBorderWidth: 2,
  hoverBackgroundColor: COLORS.primaryDark,
});
