const formatDateTimeVN = (isoString) => {
  const date = new Date(isoString);

  const dd = String(date.getDate()).padStart(2, '0');
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();

  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return `${dd}-${MM}-${yyyy} ${hh}:${mm}:${ss}`;
};

const formatDateVN = (isoString) => {
  const date = new Date(isoString);
  date.setHours(date.getHours() + 7);

  const dd = String(date.getDate()).padStart(2, '0');
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();

  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return `${dd}-${MM}-${yyyy}`;
};

// Chuyển từ định dạng dd-MM-yyyy sang yyyy-MM-dd
const convertddMMyyyy2yyyyMMdd = (dateString) => {
  const [dd, MM, yyyy] = dateString.split('-');
  return `${yyyy}-${MM}-${dd}`;
};

// Hàm convert dd-MM-yyyy hh:mm:ss -> Date (UTC+0)
const parseDDMMYYYY2UTC = (dateString) => {
  const [datePart, timePart] = dateString.split(' ');
  const [dd, MM, yyyy] = datePart.split('-');
  const [hh, mm, ss] = timePart.split(':');
  return new Date(Date.UTC(yyyy, MM - 1, dd, hh, mm, ss));
};

function getDateOfWeek(dayOfWeek, currentDate) {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
  const date = new Date(startOfWeek);
  date.setDate(startOfWeek.getDate() + (dayOfWeek - 1));
  return date;
};

module.exports = { formatDateTimeVN, formatDateVN, convertddMMyyyy2yyyyMMdd, parseDDMMYYYY2UTC, getDateOfWeek };
