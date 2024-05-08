import { publishPayload } from './publishPayload.js'
const payload = ''
export const handler = async (): Promise<void> => {
	//random generator ?? up, down, right, left, 'flex', 'punch'
	const gesture = 'wave'

	await publishPayload({
		credentials: 'cred',
		payload,
		accountId: 'id',
	})
}
