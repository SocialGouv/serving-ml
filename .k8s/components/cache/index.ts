import fs from "fs";
import path from "path";
import { ok } from "assert";
import env from "@kosko/env";
import { create } from "@socialgouv/kosko-charts/components/app";
import { getDeployment } from "@socialgouv/kosko-charts/utils/getDeployment";
import { IIoK8sApiCoreV1HTTPGetAction } from "kubernetes-models/v1";
import { ConfigMap } from "kubernetes-models/v1/ConfigMap";

const httpGet: IIoK8sApiCoreV1HTTPGetAction = {
  path: "/v1/models/sentqam",
  port: "http",
};

// create a front nginx container that will handle cache
//
// users-->nginx ingress-->nginx cache-->api
//
const manifests = create("cache", {
  env,
  config: {
    image: "nginx:1.19.6",
    containerPort: 80,
    container: {
      env: [
        {
          name: "UPSTREAM",
          value: "http://api", // refers a kubernetes service name
        },
        {
          name: "MAX_SIZE",
          value: "1024m",
        },
      ],
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
          cpu: "100m",
          memory: "0.5Gi",
        },
        // cpu=1000, memory=3Gi offers 17req/s
        limits: {
          cpu: "1000m",
          memory: "1Gi",
        },
      },
      volumeMounts: [
        {
          mountPath: "/var/cache/nginx",
          name: "cache",
        },
        {
          mountPath: "/etc/nginx/nginx.conf",
          subPath: "nginx.conf",
          name: "config",
        },
      ],
    },
  },
});

// add the config map that holds nginx.conf
const configMap = new ConfigMap({
  metadata: {
    name: "nginx-config",
  },
  data: {
    "nginx.conf": fs
      .readFileSync(path.join(__dirname, "nginx.conf"))
      .toString(),
  },
});

manifests.push(configMap);

//@ts-expect-error
const deploy = getDeployment(manifests);
ok(deploy.spec);
ok(deploy.spec.template);
ok(deploy.spec.template.spec);
deploy.spec.template.spec.volumes = [
  {
    name: "cache",
    azureFile: {
      secretName: `cache-sealed-secret`,
      shareName: "http-cache",
      readOnly: false,
    },
  },
  {
    name: "config",
    configMap: {
      name: "nginx-config",
    },
  },
];

export default manifests;
