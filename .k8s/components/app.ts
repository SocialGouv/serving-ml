import { ok } from "assert";
import { create } from "@socialgouv/kosko-charts/components/app";
import { metadataFromParams } from "@socialgouv/kosko-charts/components/app/metadata";
import env from "@kosko/env";
import { ConfigMap } from "kubernetes-models/v1/ConfigMap";

const params = env.component("app");
const { deployment, ingress, service } = create(params);

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

export default [deployment, ingress, service];
