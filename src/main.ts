import { App, CfnOutput, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { TailscaleRotatingAuthKeySecret } from './example';

const app = new App();
const stack = new Stack(app, 'my-stack', {});

const secret = new TailscaleRotatingAuthKeySecret(stack, 'secret', {
  removalPolicy: RemovalPolicy.DESTROY,
  secretName: 'tailscale-authkey'
});

new CfnOutput(stack, 'secret-name', {
  value: secret.secretName,
});

app.synth();