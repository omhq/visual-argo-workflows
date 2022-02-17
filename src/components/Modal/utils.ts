import { INodeItemManifestContainersEnv } from "../../objects/designer";


export const initialValues = () => {
  const metadata : Record<string, string> = {};
  const envs : INodeItemManifestContainersEnv[] = [];
  const command : string[] = [];
  const args : string[] = [];

  return {
    configuration: {
      prettyName: "Unnamed",
      name: "unnamed",
      description: "",
      action: "create",
      successCondition: "status.succeeded > 0",
      failureCondition: "status.failed > 1",
      manifest: {
        apiVersion: "batch/v1",
        kind: "Job",
        metadata: metadata,
        spec: {
          ttlSecondsAfterFinished: 100,
          template: {
            metadata: {},
            spec: {
              containers: [{
                name: "whalesay",
                image: "docker/whalesay",
                imagePullPolicy: "Always",
                env: envs,
                command: command,
                args: args
              }],
              restartPolicy: "Never"
            }
          }
        }
      }
    }
  }
}
