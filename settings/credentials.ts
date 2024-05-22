import type { SSMClient } from '@aws-sdk/client-ssm'
import { get } from '@bifravst/aws-ssm-settings-helpers'

export type Credentials = {
	arduino: string
	deviceId: string
	certificate: string
	privateKey: string
}

const CREDENTIALS_SCOPE = 'credentials'

export const getDeviceCredentials = async ({
	ssm,
	stackName,
}: {
	ssm: SSMClient
	stackName: string
}): Promise<Array<Credentials>> => {
	const settings = await get(ssm)({ stackName, scope: CREDENTIALS_SCOPE })()

	const credentialData: Record<string, Record<string, string>> = {}

	for (const [name, value] of Object.entries(settings)) {
		const [arduino, property] = name.split('/', 2)
		if (arduino === undefined) continue
		if (property === undefined) continue
		if (credentialData[arduino] === undefined) credentialData[arduino] = {}
		credentialData[arduino]![property] = value
	}

	return Object.entries(credentialData)
		.map(([arduino, { deviceId, certificate, privateKey }]) => {
			if (certificate === undefined) return undefined
			if (privateKey === undefined) return undefined
			if (deviceId === undefined) return undefined
			return {
				arduino,
				deviceId,
				privateKey,
				certificate,
			}
		})
		.filter((d) => d !== undefined) as Array<Credentials>
}
