import { BackendApp } from './BackendApp.js'
import { IAMClient } from '@aws-sdk/client-iam'
import { packBackendLambdas } from './lambdas.js'
import { ensureGitHubOIDCProvider } from '@bifravst/ci'
import pJSON from '../package.json'

const repoUrl = new URL(pJSON.repository.url)
const repository = {
	owner: repoUrl.pathname.split('/')[1] ?? 'Lenakh97',
	repo:
		repoUrl.pathname.split('/')[2]?.replace(/\.git$/, '') ??
		'gestureRecognitionSimulator',
}

const iam = new IAMClient({})

new BackendApp({
	lambdaSources: await packBackendLambdas(),
	repository,
	gitHubOICDProviderArn: await ensureGitHubOIDCProvider({
		iam,
	}),
	isTest: process.env.IS_TEST === '1',
	version: (() => {
		const v = process.env.VERSION
		const defaultVersion = '0.0.0-development'
		if (v === undefined)
			console.warn(`VERSION is not defined, using ${defaultVersion}!`)
		return v ?? defaultVersion
	})(),
})
