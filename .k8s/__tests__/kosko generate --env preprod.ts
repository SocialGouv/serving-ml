//

import { getEnvManifests } from "@socialgouv/kosko-charts/testing";
import { project } from "@socialgouv/kosko-charts/testing/fake/gitlab-ci.env";

jest.setTimeout(1000 * 60);
test("kosko generate --preprod", async () => {
  process.env.HARBOR_PROJECT = "cdtn";
  expect(
    await getEnvManifests("preprod", "", {
      ...project("serving-ml").preprod,
      RANCHER_PROJECT_ID: "c-bd7z2:p-wcxt4",
      KUBE_NAMESPACE: "serving-ml-144-preprod-dev2",
    })
  ).toMatchSnapshot();
});
