import env from "@kosko/env";
import { create } from "@socialgouv/kosko-charts/components/app";
import { IIoK8sApiCoreV1HTTPGetAction } from "kubernetes-models/v1";

const httpGet: IIoK8sApiCoreV1HTTPGetAction = {
  path: "/v1/models/sentqam",
  port: "http",
};

const IMAGE_TAG = process.env.CI_COMMIT_TAG
  ? process.env.CI_COMMIT_TAG.replace(/^v/, "")
  : process.env.CI_COMMIT_SHA;

const manifests = create("serving-ml", {
  env,
  config: {
    image: `harbor.fabrique.social.gouv.fr/cdtn/serving-ml:${IMAGE_TAG}`,
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

export default [...manifests];
