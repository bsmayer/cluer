const account = {
	async afterBackendRequest(response) {
		console.log('this is the original response', response);
		return {
			...response,
			accountPrincipal: 'This property was changed by a handler'
		}
	}
};

const videos = {
	async afterBackendRequest(response) {
		return { ...response, name: 'Changing video name as well :)' };
	},
};

module.exports = {
	account,
	videos
};
