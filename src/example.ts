import { Duration } from "aws-cdk-lib";
import { Code, Runtime, SingletonFunction } from "aws-cdk-lib/aws-lambda";
import { Secret, SecretProps } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import path from "path";

export interface TailscaleRotatingAuthKeySecretProps extends SecretProps {
}

/**
 * Example of a AWS Secrets Manager secret that rotates Tailscale auth keys.
 * 
 * Possible options for allowing the function to generate an auth key could be 
 * 1) To have one secret shared securely across accounts that includes OAuth2 id/secret.
 *    This approach would allow you to only manage one set of oauth keys to generate and
 *    rotate auth keys across the org.
 *    The drawback is it kind of feels like we're back to square one.
 *  2) ????
 * 
 * Example usecase:
 * 
 * ```ts
 * const secret = new TailscaleRotatingAuthKeySecret(this, 'auth-key', {
 *  secretName: 'tailscale-authkey',
 * });
 * const userdata = ["tailscale up --accept-routes --authkey=$(aws secretsmanager get-secret-value --secret-id tailscale-authkey --query SecretString --output text)"]
 * ```
 */
export class TailscaleRotatingAuthKeySecret extends Secret {
    constructor(scope: Construct, id: string, props?: TailscaleRotatingAuthKeySecretProps) {
        super(scope, id, {
            ...props
        });

        const fn = new SingletonFunction(this, 'rotation-function', {
            code: Code.fromAsset(path.join(__dirname, 'resources/lambda')),
            handler: 'index.lambda_handler',
            runtime: Runtime.PYTHON_3_12,
            uuid: 'f7d4f730-474b-11ed-b878-0242ac120002',
            environment: {
                SECRETS_MANAGER_ENDPOINT: 'https://secretsmanager.us-east-1.amazonaws.com'
            },
            timeout: Duration.seconds(30),
        });
        this.addRotationSchedule('rotation-schedule', {
            rotationLambda: fn,
            automaticallyAfter: Duration.days(1), // Note: Should be rotated a few days before expiration
        });
    }
}