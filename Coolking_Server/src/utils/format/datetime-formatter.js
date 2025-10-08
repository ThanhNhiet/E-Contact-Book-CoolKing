const formatDateTimeVN = (isoString) => {
  if (!isoString) return null;
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return null;

  // Tùy chọn định dạng riêng cho ngày và giờ
  const dateOptions = { 
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric', month: '2-digit', day: '2-digit'
  };
  const timeOptions = { 
    timeZone: 'Asia/Ho_Chi_Minh',
    hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
  };

  const formattedDate = new Intl.DateTimeFormat('vi-VN', dateOptions).format(date);
  const formattedTime = new Intl.DateTimeFormat('vi-VN', timeOptions).format(date);

  return `${formattedDate} ${formattedTime}`;
};

const formatDateVN = (isoString) => {
  if (!isoString) return null;
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return null;

  const dd = String(date.getDate()).padStart(2, '0');
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();

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
  // chấp nhận cả "-" hoặc "/"
  const [dd, MM, yyyy] = datePart.includes('-')
    ? datePart.split('-')
    : datePart.split('/');
  const [hh, mm, ss] = timePart ? timePart.split(':') : [0, 0, 0];
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
