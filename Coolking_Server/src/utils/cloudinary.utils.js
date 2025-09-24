const getPublicIdFromUrl = (url, folder) => {
  const urlParts = url.split('/');
  const filename = urlParts[urlParts.length - 1];
  return `${folder}/${filename.substring(0, filename.lastIndexOf('.'))}`;
}
// console.log(getPublicIdFromUrl('https://res.cloudinary.com/dplg9r6z1/image/upload/v1758691821/awful_1_kt9jjh.png', 'account_avatar'));

module.exports = { getPublicIdFromUrl };