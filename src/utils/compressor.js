import ImageCompressor from 'image-compressor.js';
import Constants from '../common/constants';

export function compressJPEG(blob, quality = 1) {
	return new Promise((resolve, reject) => {
		if (blob.size > Constants.IMAGE.MAX_SIZE) {
			new ImageCompressor(blob, {
				quality: quality,
				convertSize: Constants.IMAGE.MAX_SIZE,
				mimeType: 'jpeg',
				maxWidth: Constants.IMAGE.MAX_WIDTH,
				maxHeight: Constants.IMAGE.MAX_HEIGHT,
				checkOrientation: true,
				success(result) {
					if (result.size > Constants.IMAGE.MAX_SIZE && quality.toFixed(1) > 0.1) {
						quality -= 0.1;
						compressJPEG(blob, quality).then(newResult => {
							resolve(newResult);
						});
					} else {
						console.log("compressed1. Old size: " + blob.size + ". New size: " + result.size + ". Quality: " + quality);
						resolve(result);
					}
				},
				error(e) {
					reject(e);
				},
			});
		} else {
			resolve(blob)
		}
	});
}