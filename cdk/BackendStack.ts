import {
	App,
	Stack,
	Duration,
	aws_events as Events,
	aws_events_targets as EventTargets,
	CfnOutput,
} from 'aws-cdk-lib'
import { STACK_NAME } from './stackConfig.js'
import type { BackendLambdas } from './lambdas.js'
import { PackedLambdaFn } from '@bifravst/aws-cdk-lambda-helpers/cdk'
import { ContinuousDeployment } from './resources/ContinuousDeployment.js'

export class BackendStack extends Stack {
	constructor(
		parent: App,
		{
			lambdaSources,
			repository,
			gitHubOICDProviderArn,
		}: {
			lambdaSources: BackendLambdas
			repository: {
				owner: string
				repo: string
			}
			gitHubOICDProviderArn: string
		},
	) {
		super(parent, STACK_NAME)

		const simulateGesture = new PackedLambdaFn(
			this,
			'simulateGesture',
			lambdaSources.simulateGesture,
			{
				timeout: Duration.seconds(60),
				memorySize: 1024,
			},
		)

		const rule = new Events.Rule(this, 'rule', {
			description: `Rule to schedule waterLevel lambda invocations`,
			schedule: Events.Schedule.rate(Duration.hours(1)),
		})
		rule.addTarget(new EventTargets.LambdaFunction(simulateGesture.fn))

		const cd = new ContinuousDeployment(this, {
			repository,
			gitHubOICDProviderArn,
		})
		new CfnOutput(this, 'cdRoleArn', {
			exportName: `${this.stackName}:cdRoleArn`,
			description: 'Role ARN to use in the deploy GitHub Actions Workflow',
			value: cd.role.roleArn,
		})
	}
}
