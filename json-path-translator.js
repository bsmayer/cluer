const JSONPath = require('JSONPath');

function translate({ backendResponses, dest, entry }) {
	const [key, value] = entry;

	if (typeof value === 'string') {
		const path = `$.${value}`;
		const result = JSONPath({
			json: backendResponses,
			path
		})[0];

		dest[key] = result;
	}
	else if (typeof value === 'object') {
		dest[key] = {};
		for (const innerEntry of Object.entries(value)) {
			translate({
				backendResponses,
				dest: dest[key],
				entry: innerEntry
			});
		}
	}
}

function resolvePath(source, expression) {
	const path = `$.${expression}`;
	return JSONPath({ json: source, path })[0];
}

module.exports = { translate, resolvePath };
