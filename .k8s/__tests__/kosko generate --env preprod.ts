//

import { getEnvManifests } from "@socialgouv/kosko-charts/testing";
import { project } from "@socialgouv/kosko-charts/testing/fake/github-actions.env";

jest.setTimeout(1000 * 60);
test("kosko generate --preprod", async () => {
  // process.env.HARBOR_PROJECT = "cdtn";
  expect(
    await getEnvManifests("preprod", "", {
      ...project("serving-ml").preprod,
      PREPRODUCTION: "true",
      RANCHER_PROJECT_ID: "c-bd7z2:p-wcxt4",
      SOCIALGOUV_BASE_DOMAIN: "dev.fabrique.social.gouv.fr"
    })
  ).toMatchSnapshot();
});
