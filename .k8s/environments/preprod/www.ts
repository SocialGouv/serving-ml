import { AppConfig } from "@socialgouv/kosko-charts/components/app";
import { ok } from "assert";
ok(process.env.CI_PROJECT_NAME);
export default {
  subdomain: `preprod-${process.env.CI_PROJECT_NAME}`,
} as Partial<AppConfig>;
