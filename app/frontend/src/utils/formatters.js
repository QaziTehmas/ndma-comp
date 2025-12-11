const formatNumber = (
  value,
  billionDecimals,
  millionDecimals,
  thousandDecimals
) => {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(billionDecimals) + "B";
  } else if (value >= 1000000) {
    return (value / 1000000).toFixed(millionDecimals) + "M";
  } else if (value >= 1000) {
    return (value / 1000).toFixed(thousandDecimals) + "K";
  }
  return value.toString();
};

export const formatPopulation = (value) => {
  if (!value) return "N/A";
  return formatNumber(value, 2, 2, 2);
};

export const formatAxisLabel = (value) => {
  return formatNumber(value, 1, 0, 0);
};

// TODO: Update these for flood data fields
export const getYearFieldName = (year) => {
  return `F${year}_Population`;
};

export const AVAILABLE_YEARS = [1970, 1980, 1990, 2000, 2010, 2015, 2020, 2022];
