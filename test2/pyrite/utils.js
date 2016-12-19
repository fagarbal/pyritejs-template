class Utils {
	toCamelCase(str) {
		return str.replace(/-([a-z])/g, (m, w) => w.toUpperCase());
	}

	toDash(str) {
		return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
	}

	getValue(column, path) {
		return path.split('.').reduce((object, x) => {
			if (object) return object[x];
			return null;
		}, column);
	}

	getWordsBetweenCurlies(str) {
		var results = [],
			re = /{{([^}}]+)}}/g,
			text;

		while (text = re.exec(str)) {
			results.push(text[1]);
		}

		return Array.from(new Set(results));
	}
}

export default new Utils();