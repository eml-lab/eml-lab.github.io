const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatDateRange(start: Date, end?: Date): string {
  const startYear = start.getUTCFullYear();
  const startMonth = start.getUTCMonth();
  const startDay = start.getUTCDate();

  if (!end) {
    return `${monthNames[startMonth]} ${startDay}, ${startYear}`;
  }

  const endYear = end.getUTCFullYear();
  const endMonth = end.getUTCMonth();
  const endDay = end.getUTCDate();

  // Same day
  if (
    startYear === endYear &&
    startMonth === endMonth &&
    startDay === endDay
  ) {
    return `${monthNames[startMonth]} ${startDay}, ${startYear}`;
  }

  // Same month and year
  if (startYear === endYear && startMonth === endMonth) {
    return `${monthNames[startMonth]} ${startDay}–${endDay}, ${startYear}`;
  }

  // Different months, same year
  if (startYear === endYear) {
    return `${monthNames[startMonth]} ${startDay} – ${monthNames[endMonth]} ${endDay}, ${startYear}`;
  }

  // Different years
  return `${monthNames[startMonth]} ${startDay}, ${startYear} – ${monthNames[endMonth]} ${endDay}, ${endYear}`;
}