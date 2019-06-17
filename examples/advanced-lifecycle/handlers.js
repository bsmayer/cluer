async function beforeAnyBackendRequest(context) {
	console.log('1 - fired before any backend request', context);
	return context;
}

async function afterAllBackendRequests(context) {
	console.log('2 - fired after all backends returned', context);
	return context;
}

async function onAnyBackendRequestError(error) {
	console.log('3 - fired on any backend error', error);
	return error;
}

async function onFinishMappingResponse(context) {
	console.log('4 - fired after our custom response was mounted', context);
	return context;
}

const account = {
	async beforeBackendRequest(context) {
		console.log('5 - fired before ACCOUNT backend request', context);
		return context;
	},
	async afterBackendRequest(context) {
		console.log('6 - fired after ACCOUNT backend returned', context);
		return context;
	},
	async onBackendRequestError(error) {
		console.log('7 - fired if ACCOUNT backend request throws an error', error);
		return error;
	}
};

const videos = {
	async beforeBackendRequest(context) {
		console.log('5 - fired before VIDEOS backend request', context);
		return context;
	},
	async afterBackendRequest(context) {
		console.log('6 - fired after VIDEOS backend returned', context);
		return context;
	},
	async onBackendRequestError(error) {
		console.log('7 - fired if VIDEOS backend request throws an error', error);
		return error;
	}
};

module.exports = {
	beforeAnyBackendRequest,
	afterAllBackendRequests,
	onAnyBackendRequestError,
	onFinishMappingResponse,
	account,
	videos
};
