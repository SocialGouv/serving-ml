import { AppConfig } from "@socialgouv/kosko-charts/components/app";
import { ok } from "assert";
ok(process.env.CI_PROJECT_NAME);
ok(process.env.KUBE_NAMESPACE);
export default {
  subdomain: `preprod-${process.env.CI_PROJECT_NAME}`,
  namespace: { name: process.env.KUBE_NAMESPACE },
} as Partial<AppConfig>;
