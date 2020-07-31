import env from "@kosko/env";

import { create } from "@socialgouv/kosko-charts/components/app";
import { Deployment } from "kubernetes-models/apps/v1/Deployment";
import { ok } from "assert";
import { HorizontalPodAutoscaler } from "kubernetes-models/autoscaling/v2beta2/HorizontalPodAutoscaler";

const manifests = create("www", {
  env,
  config: {
    containerPort: 8501,
    container: {
      livenessProbe: {
        httpGet: {
          path: "/v1/models/sentqam",
          port: "http",
        },
        initialDelaySeconds: 15,
        timeoutSeconds: 15,
      },
      readinessProbe: {
        httpGet: {
          path: "/v1/models/sentqam",
          port: "http",
        },
        initialDelaySeconds: 5,
        timeoutSeconds: 3,
      },
      startupProbe: {
        httpGet: {
          path: "/v1/models/sentqam",
          port: "http",
        },
        initialDelaySeconds: 0,
        timeoutSeconds: 15,
      },
      resources: {
        requests: {
          cpu: "1000m",
          memory: "4Gi",
        },
        // cpu=1000, memory=3Gi offers 17req/s
        limits: {
          cpu: "4000m",
          memory: "5Gi",
        },
      },
    },
  },
});
const deployment = manifests.find(
  (manifest): manifest is Deployment => manifest.kind === "Deployment"
);
ok(deployment);

const hpa = new HorizontalPodAutoscaler({
  metadata: deployment.metadata,
  spec: {
    minReplicas: 1,
    maxReplicas: 10,

    metrics: [
      {
        resource: {
          name: "cpu",
          target: {
            averageUtilization: 80,
            type: "Utilization",
          },
        },
        type: "Resource",
      },
      {
        resource: {
          name: "memory",
          target: {
            averageUtilization: 80,
            type: "Utilization",
          },
        },
        type: "Resource",
      },
    ],

    scaleTargetRef: {
      apiVersion: deployment.apiVersion,
      kind: deployment.kind,
      name: deployment.metadata!.name!,
    },
  },
});

export default [...manifests, hpa];
