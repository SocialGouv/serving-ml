import { ok } from "assert";
import { create } from "@socialgouv/kosko-charts/components/app";
import { metadataFromParams } from "@socialgouv/kosko-charts/components/app/metadata";
import env from "@kosko/env";
import { HorizontalPodAutoscaler } from "kubernetes-models/autoscaling/v2beta2/HorizontalPodAutoscaler";

const params = env.component("app");
const { deployment, ingress, service } = create(params);

const hpa = new HorizontalPodAutoscaler({
  metadata: metadataFromParams(params),
  spec: {
    minReplicas: 1,
    maxReplicas: 5,

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

//

deployment.spec!.template.spec!.containers[0].livenessProbe = {
  httpGet: {
    path: "/v1/models/sentqam",
    port: "http",
  },
  initialDelaySeconds: 15,
  timeoutSeconds: 15,
};
deployment.spec!.template.spec!.containers[0].readinessProbe = {
  httpGet: {
    path: "/v1/models/sentqam",
    port: "http",
  },
  initialDelaySeconds: 5,
  timeoutSeconds: 3,
};

//

export default [deployment, ingress, service, hpa];
