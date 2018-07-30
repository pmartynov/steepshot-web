import Utils from './Utils';

export function insertCategory(point, category) {
	if (category === undefined) return point;
	category = Utils.detransliterate(category, true);
	let path = point.split('/');
	return `${path[0]}/${category}/${path[1]}`;
}
