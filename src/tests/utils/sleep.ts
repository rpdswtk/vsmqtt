const sleep = (timeout: number): Promise<void> => new Promise((r) => setTimeout(r, timeout))

export default sleep
