import { App, CfnOutput, Duration, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import * as path from 'path';

const app = new App();
const stack = new Stack(app, 'my-stack', {});
const fn = new Function(stack, 'my-function', {
  code: Code.fromAsset(path.join(__dirname, 'resources/lambda')),
  runtime: Runtime.PYTHON_3_12,
  handler: 'index.lambda_handler',
  timeout: Duration.seconds(30),
  environment: {
    SECRETS_MANAGER_ENDPOINT: 'https://secretsmanager.us-east-1.amazonaws.com'
  },
});

const secret = new Secret(stack, 'my-secret', {
  removalPolicy: RemovalPolicy.DESTROY
});

secret.addRotationSchedule('rotation-schedule', {
  rotationLambda: fn,
  automaticallyAfter: Duration.days(1), // Note: Should be rotated a few days before expiration
});

new CfnOutput(stack, 'secret-name', {
  value: secret.secretName,
});

app.synth();