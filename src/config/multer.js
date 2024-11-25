const multer = require("multer");

const uploadImage = multer({
	fileFilter: (req, file, cb) => {
		// console.log(file);
		const allowedType = ["image/jpeg", "image/png"];

		if (allowedType.includes(file.mimetype)) {
			cb(null, true);
		} else {
			const err = new Error("Only .JPG and .PNG are Allowed Here!");
			cb(err, false);
		}
	},
	onError: (err, next) => {
		next(err);
	},
});

module.exports = uploadImage;
