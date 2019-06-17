const cluer = require('../../index');
const routes = require('./endpoints');

cluer.init(routes, {
	port: 3000
});
