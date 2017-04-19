
const EMPTY = {};

export function assign(obj, props) {
	// eslint-disable-next-line guard-for-in
	for (let i in props) {
		obj[i] = props[i];
	}
	return obj;
}

export function exec(url, route, opts=EMPTY) {
	let reg = /(?:\?([^#]*))?(#.*)?$/,
		c = url.match(reg),
		matches = {},
		ret;
	if (c && c[1]) {
		let p = c[1].split('&');
		for (let i=0; i<p.length; i++) {
			let r = p[i].split('=');
			matches[decodeURIComponent(r[0])] = decodeURIComponent(r.slice(1).join('='));
		}
	}
	url = segmentize(url.replace(reg, ''));
	route = segmentize(route || '');
	let max = Math.max(url.length, route.length);
	for (let i=0; i<max; i++) {
		if (route[i] && route[i].charAt(0)===':') {
			let param = route[i].replace(/(^\:|[+*?]+$)/g, ''),
				flags = (route[i].match(/[+*?]+$/) || EMPTY)[0] || '',
				plus = ~flags.indexOf('+'),
				star = ~flags.indexOf('*'),
				val = url[i] || '';
			if (!val && !star && (flags.indexOf('?')<0 || plus)) {
				ret = false;
				break;
			}
			matches[param] = decodeURIComponent(val);
			if (plus || star) {
				matches[param] = url.slice(i).map(decodeURIComponent).join('/');
				break;
			}
		}
		else if (route[i]!==url[i]) {
			ret = false;
			break;
		}
	}
	if (opts.default!==true && ret===false) return false;
	return matches;
}

export function rankSort(a, b) {
	let aRank = rankVNode(a),
		bRank = rankVNode(b);
	return (aRank < bRank) ? 1 :
		(aRank == bRank) ? 0 :
		-1;
}

export function segmentize(url) {
	return strip(url).split('/');
}

const segmentReg = /(:)?([^\/]*?)([*+?]?)(?:\/+|$)/g;
const segmentRank = (match, isParam, segment, flag) => (
	isParam ? ('0*+?'.indexOf(flag) || 4) : (segment ? 5 : '')
);

export function rank(path) {
	return strip(path).replace(segmentReg, segmentRank) || '5';
}

export function rankVNode({ attributes=EMPTY }) {
	return attributes.default ? '0' : rank(attributes.path);
}

export function strip(url) {
	return url.replace(/(^\/+|\/+$)/g, '');
}
