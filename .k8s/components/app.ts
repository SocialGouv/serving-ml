import { ok } from "assert";
import { create } from "@socialgouv/kosko-charts/components/app";
import { merge } from "@socialgouv/kosko-charts/utils/merge";
import { metadataFromParams } from "@socialgouv/kosko-charts/components/app/metadata";
import env from "@kosko/env";
import { HorizontalPodAutoscaler } from "kubernetes-models/autoscaling/v2beta2/HorizontalPodAutoscaler";
import { IIoK8sApiCoreV1Container } from "kubernetes-models/_definitions/IoK8sApiCoreV1Container";

const params = env.component("app");
const { deployment, ingress, service } = create(params);

const hpa = new HorizontalPodAutoscaler({
  metadata: metadataFromParams(params),
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

//

const container: Omit<IIoK8sApiCoreV1Container, "name"> = {
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
};

ok(deployment.spec);
ok(deployment.spec.template.spec);
deployment.spec.template.spec.containers[0] = merge(
  deployment.spec.template.spec.containers[0],
  container
);

//

export default [deployment, ingress, service, hpa];
