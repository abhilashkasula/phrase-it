const cloudinary = require('cloudinary').v2;

const uploadImage = (path, {CLOUD_NAME, API_KEY, API_SECRET}) => {
  return new Promise((resolve, reject) => {
    cloudinary.config({
      cloud_name: CLOUD_NAME,
      api_key: API_KEY,
      api_secret: API_SECRET,
    });
    cloudinary.uploader.upload(path, (err, res) => {
      if (err) {
        reject(err);
      }
      resolve(res);
    });
  });
};

module.exports = {uploadImage};
