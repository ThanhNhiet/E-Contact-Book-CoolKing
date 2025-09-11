const formatDateTimeVN = (isoString) => {
  const date = new Date(isoString);
  date.setHours(date.getHours() + 7);

  const dd = String(date.getDate()).padStart(2, '0');
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();

  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return `${dd}/${MM}/${yyyy} ${hh}:${mm}:${ss}`;
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

  return `${dd}/${MM}/${yyyy}`;
};

module.exports = { formatDateTimeVN, formatDateVN };
