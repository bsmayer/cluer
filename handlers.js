async function beforeAnyBackendRequest(context) {
	return context;
}

async function afterAllBackendRequests(context) {
	return context;
}

async function onAnyBackendRequestError(error) {
	return error;
}

async function onFinishMappingResponse(context) {
	return context;
}

const account = {
	async beforeBackendRequest(context) {
		return context;
	},
	async afterBackendRequest(context) {
		return context;
	},
	async onBackendRequestError(error) {
		return error;
	}
};

const videos = {
	async beforeBackendRequest(context) {
		return context;
	},
	async afterBackendRequest(context) {
		return context;
	},
	async onBackendRequestError(error) {
		return error;
	}
};

const permissions = {
	async beforeBackendRequest(context) {
		return context;
	},
	async afterBackendRequest(context) {
		return context;
	},
	async onBackendRequestError(error) {
		return error;
	}
};

const content = {
	async beforeBackendRequest(context) {
		return context;
	},
	async afterBackendRequest(context) {
		return context;
	},
	async onBackendRequestError(error) {
		const {voucherCode, serviceAccount} = error.context;
		return {
			message: `${voucherCode} is not valid for this account ${serviceAccount}`,
			status: 400
		}
	}
};

module.exports = {
	beforeAnyBackendRequest,
	afterAllBackendRequests,
	onAnyBackendRequestError,
	onFinishMappingResponse,
	account,
	videos,
	permissions,
	content
};
