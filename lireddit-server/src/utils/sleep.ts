export const sleep = (timeout: number) => {
	return new Promise((res) => setTimeout(res, timeout));
};
