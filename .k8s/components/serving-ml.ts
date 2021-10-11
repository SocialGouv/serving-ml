import { ok } from "assert";
import env from "@kosko/env";
import { create } from "@socialgouv/kosko-charts/components/app";
import { createAutoscale } from "@socialgouv/kosko-charts/components/autoscale";
import { updateMetadata } from "@socialgouv/kosko-charts/utils/updateMetadata";
import type { Deployment } from "kubernetes-models/apps/v1";
import { IIoK8sApiCoreV1HTTPGetAction } from "kubernetes-models/v1";
import environments from '@socialgouv/kosko-charts/environments';

const httpGet: IIoK8sApiCoreV1HTTPGetAction = {
  path: "/v1/models/sentqam",
  port: "http",
};

const ciEnv = environments(process.env);
const version = ciEnv.tag || `sha-${ciEnv.sha}`;

const asyncManifests = create("serving-ml", {
  env,
  config: {
    image: `ghcr.io/socialgouv/cdtn/serving-ml:${version}`,
    containerPort: 8501,
    container: {
      livenessProbe: {
        httpGet,
        initialDelaySeconds: 15,
        timeoutSeconds: 15,
      },
      readinessProbe: {
        httpGet,
        initialDelaySeconds: 5,
        timeoutSeconds: 3,
      },
      startupProbe: {
        httpGet,
        initialDelaySeconds: 0,
        timeoutSeconds: 15,
      },
      resources: {
        requests: {
          cpu: "500m",
          memory: "1.5Gi",
        },
        // cpu=1000, memory=3Gi offers 17req/s
        limits: {
          cpu: "1000m",
          memory: "2Gi",
        },
      },
    },
  },
});

export default async () => {
  const manifests = await asyncManifests;
  const deployment = manifests.find(
    (manifest): manifest is Deployment => manifest.kind === "Deployment"
  );
  ok(deployment);
  const hpa = createAutoscale(deployment);
  ok(hpa.spec);
  hpa.spec.minReplicas = ciEnv.isProduction ? 2 : 1;
  ok(deployment.metadata);
  ok(deployment.metadata.namespace);
  updateMetadata(hpa, {
    annotations: deployment.metadata.annotations || {},
    labels: deployment.metadata.labels || {},
    namespace: { name: deployment.metadata.namespace },
    name: deployment.metadata.name,
  });
  return [...manifests, hpa];
};
