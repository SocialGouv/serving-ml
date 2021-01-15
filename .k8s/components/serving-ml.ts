import { ok } from "assert";
import env from "@kosko/env";
import { create } from "@socialgouv/kosko-charts/components/app";
import type{ Deployment } from "kubernetes-models/apps/v1";
import { HorizontalPodAutoscaler } from "kubernetes-models/autoscaling/v2beta2";
import { IIoK8sApiCoreV1HTTPGetAction } from "kubernetes-models/v1";
import { getHarborImagePath } from "@socialgouv/kosko-charts/utils/getHarborImagePath";

const httpGet: IIoK8sApiCoreV1HTTPGetAction = {
  path: "/v1/models/sentqam",
  port: "http",
};

const manifests = create("serving-ml", {
  env,
  config: {
    image: getHarborImagePath({ name: "serving-ml" }),
    ingress: false,
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

export default manifests;
