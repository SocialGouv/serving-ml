//

import { getEnvManifests } from "@socialgouv/kosko-charts/testing";
import { project } from "@socialgouv/kosko-charts/testing/fake/github-actions.env";

jest.setTimeout(1000 * 60);
test("kosko generate --dev", async () => {
  // process.env.HARBOR_PROJECT = "cdtn";
  expect(
    await getEnvManifests("dev", "", {
      ...project("serving-ml").dev,
      RANCHER_PROJECT_ID: "c-bd7z2:p-wcxt4",
      KUBE_NAMESPACE: "serving-ml-144-master-dev2",
    })
  ).toMatchSnapshot();
});
