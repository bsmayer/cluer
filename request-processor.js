const axios = require('axios');

const { translate, resolvePath } = require('./json-path-translator');

async function processRequest(endpoint, params, body) {
	const handlers = endpoint.lifecycleHandlers ? require(endpoint.lifecycleHandlers) : null;

	// Lifecycle execution - beforeAnyBackendRequest
	endpoint = await callLifecycleMethod({
		module: handlers,
		method: 'beforeAnyBackendRequest',
		context: endpoint
	}) || endpoint;

	let backendResponses = {};
	const { backends, response } = endpoint;

	await Promise.all(backends.map(async backend => {
		try {
			// Lifecycle execution - beforeBackendRequest
			backend = await callLifecycleMethod({
				module: handlers,
				method: 'beforeBackendRequest',
				node: backend.key,
				context: backend
			}) || backend;

			// Handle path params
			if (backend.path.includes(':')) {
				const paths = backend.path.split('/');
				if (paths && paths.length) {
					for (const parameter of paths.filter(x => x.startsWith(':', 0))) {
						const paramName = parameter.substring(1);
						backend.path = backend.path.replace(new RegExp(parameter, 'g'), params[paramName]);
					}
				}
			}

			// Handle querystrings
			const querystring = {};
			if (backend.querystring && backend.querystring.length) {
				for (const query of backend.querystring) {
					if (params[query])
						querystring[query] = params[query];
				}
			}

			// Handle body
			let payload;
			if (backend.body) {
				if (typeof backend.body === 'string' && backend.body === '$body') {
					payload = body;
				}
				else if (typeof backend.body === 'string' && backend.body !== '$body') {
					payload = resolvePath({ $body: body }, backend.body);
				}
				else if (typeof backend.body === 'object' && Object.keys(backend.body).length > 0) {
					payload = {};
					for (const entry of Object.entries(backend.body)) {
						translate({
							backendResponses: { $body: body },
							dest: payload,
							entry
						});
					}
				}
			}

			// Create API request
			const request = await axios({
				method: backend.method,
				url: `${backend.host}${backend.path}`,
				query: querystring,
				data: payload
			});

			let backendResponse = request.data;

			// Lifecycle execution - afterBackendRequest
			backendResponse = await callLifecycleMethod({
				module: handlers,
				method: 'afterBackendRequest',
				node: backend.key,
				context: backendResponse
			}) || backendResponse;

			return backendResponses['$' + backend.key] = backendResponse;
		}
		catch(error) {
			let responseError = error.response && error.response.data ? error.response.data : error.message;

			// Lifecycle execution - onBackendRequestError
			responseError = await callLifecycleMethod({
				module: handlers,
				method: 'onBackendRequestError',
				node: backend.key,
				context: responseError
			}) || responseError;

			return Promise.reject(responseError);
		}
	})).catch(async error => {
		// Lifecycle execution - onAnyBackendRequestError
		error = await callLifecycleMethod({
			module: handlers,
			method: 'onAnyBackendRequestError',
			context: error
		}) || error;

		return Promise.reject(error);
	});

	// Lifecycle execution - afterAllBackendRequests
	backendResponses = await callLifecycleMethod({
		module: handlers,
		method: 'afterAllBackendRequests',
		context: backendResponses
	}) || backendResponses;

	let dest = {};

	// Place all objects into the root of destination object
	if (Array.isArray(response.root)) {
		for(const root of response.root) {
			const backendResponse = backendResponses[root];
			for(const [key, value] of Object.entries(backendResponse)) {
				dest[key] = value
			}
		}

		if (response.set) {
			for (const entry of Object.entries(response.set)) {
				translate({
					backendResponses,
					dest,
					entry
				});
			}
		}
	}
	else {
		for (const entry of Object.entries(response.root)) {
			translate({
				backendResponses,
				dest,
				entry
			});
		}
	}

	// lifecycle execution - onFinishMappingResponse
	dest = await callLifecycleMethod({
		module: handlers,
		method: 'onFinishMappingResponse',
		context: dest
	}) || dest;

	return Promise.resolve(dest);
}


async function callLifecycleMethod({ module, method, node, context }) {
	if (!module || !method)
		return;

	let fn;
	if (node && module[node])
		fn = module[node][method];
	else if (module[method])
		fn = module[method];

	if (!fn)
		return;

	return await fn(context);
}

module.exports = { processRequest };
