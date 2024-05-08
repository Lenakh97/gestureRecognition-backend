import { MqttClient, connect } from 'mqtt'

const amazonRootCA1 = ''

export const publishPayload = async ({
	credentials: { deviceId, certificate, privateKey },
	payload,
	accountId,
}: {
	credentials: any
	payload: any
	accountId: string
}): Promise<void> => {
	const conn = await new Promise<MqttClient>((resolve, reject) => {
		const client = connect({
			host: 'mqtt.nrfcloud.com',
			port: 8883,
			rejectUnauthorized: true,
			clientId: deviceId,
			protocol: 'mqtts',
			protocolVersion: 4,
			key: privateKey,
			cert: certificate,
			ca: amazonRootCA1,
		})

		client.on('disconnect', () => {
			console.debug('disconnected')
		})
		client.on('error', () => {
			console.debug('error')
			reject(new Error('Error'))
		})
		client.on('connect', () => {
			console.log(`Connected`, deviceId)
			resolve(client)
		})
	})
	const topic = `prod/${accountId}/m/senml/${deviceId}`
	const publish = (payload: any) => {
		conn.publish(topic, JSON.stringify(payload))
	}
	publish(payload)

	conn.end()
}
