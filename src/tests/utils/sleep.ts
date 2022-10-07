const sleep = (timeout: number) => new Promise((r) => setTimeout(r, timeout));

export default sleep;