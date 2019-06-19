/*
* THIS IS DANGEROUS AND SHOULD BE REMOVED ON A REAL APPLICATION
* PLEASE, DON'T USE IT IN PRODUCTION
* */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const bodyParser = require('body-parser');
const { processRequest } = require('./request-processor');

function init(routes, options) {
	const { port } = options;
	const { endpoints, name } = routes;
	const app = express();

	app.use(bodyParser.json());

	endpoints.forEach(endpoint => {
		const { method, path } = endpoint;
		const httpMethod = method.toString().toLowerCase().trim();

		app[httpMethod](path, (request, response) => {
			const params = { ...request.params, ...request.query };
			const body = request.body;
			processRequest(endpoint, params, body)
				.then(success => response.status(200).send(success))
				.catch(error => response.status(error.status || 500).send(error.message || error));
		});
	});

	app.listen(port || 3000, () => console.log(`${name} - Running on port ${port || 3000}`));
}

module.exports = { init };

