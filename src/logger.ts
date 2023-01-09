export type LogFunc = (msg: string) => void
export type Logger = {
	success: LogFunc
	warn: LogFunc
	error: LogFunc
}

const CMD_COLOR_RESET = '\x1B[0m'
const CMD_COLOR_GREEN = '\x1B[32m'
const CMD_COLOR_YELLOW = '\x1B[33m'
const CMD_COLOR_RED = '\x1B[31m'

export const getLogger = (pkgName: string): Logger => {
	const log = (msg: string, color = ''): void => {
		console.log(`${color}${pkgName}${color !== '' ? CMD_COLOR_RESET : ''}: ${msg}`)
	}

	return {
		success (msg: string): void {
			log(msg, CMD_COLOR_GREEN)
		},
		warn (msg: string): void {
			log(msg, CMD_COLOR_YELLOW)
		},
		error (msg: string): void {
			log(msg, CMD_COLOR_RED)
		},
	}
}
