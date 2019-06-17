const content = {
	async onBackendRequestError(error) {
		console.log('this is the original error thrown by the backend', error);
		const {voucherCode, serviceAccount} = error.context;
		return {
			message: `${voucherCode} is not valid for this account ${serviceAccount}`,
			status: 400
		}
	}
};

module.exports = { content };
