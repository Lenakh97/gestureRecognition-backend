import { getDeviceCredentials } from '../settings/credentials.js'
import { publishPayload } from './publishPayload.js'
import { SSMClient } from '@aws-sdk/client-ssm'
import { STACK_NAME } from '../cdk/stackConfig.js'

const ssm = new SSMClient({})
const creds = await getDeviceCredentials({ ssm, stackName: STACK_NAME })
export const handler = async (): Promise<void> => {
	const gestures = ['punch', 'flex']

	for (const device of creds) {
		const payload = {
			gesture: gestures[Math.floor(Math.random() * gestures.length)] ?? '',
			ts: Date.now(),
		}
		await publishPayload({
			credentials: device,
			payload,
		})
	}
}
