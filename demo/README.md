# serving-ml demo

Cet exemple utilise l'[API serving-ml](https://github.com/SocialGouv/serving-ml) pour indexer des documents dans un ElasticSearch et leur ajouter [un champ de type `dense_vector`](https://www.elastic.co/fr/blog/text-similarity-search-with-vectors-in-elasticsearch) qui permet de faire des rapprochements sémantiques.

Les ~1100 documents indexés sont une partie des [fiches "Vos droits et démarches"](https://www.data.gouv.fr/fr/datasets/service-public-fr-guide-vos-droits-et-demarches-particuliers/) du site [service-public.fr](https://service-public.fr).

## Usage

### Indexer dans Elastic

```sh
export ES_ID="id-elasticearch"
export ES_USERNAME="elastic"
export ES_PASSWORD="some-password"
node index-es.js
```

### Faire une recherche

```sh
export ES_ID="id-elasticearch"
export ES_USERNAME="elastic"
export ES_PASSWORD="some-password"
node index-es.js "faire un break"
```

| Score     | Fiche                                                                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.0852782 | [Travail](https://www.service-public.fr/particuliers/vosdroits/N19806)                                                                           |
| 1.0768304 | [Congé ou temps partiel pour création ou reprise d'entreprise](https://www.service-public.fr/particuliers/vosdroits/F2382)                       |
| 1.0714536 | [Quelles sont les obligations du salarié dont le contrat de travail est suspendu ?](https://www.service-public.fr/particuliers/vosdroits/F32768) |
| 1.0707272 | [Comment faire pour passer à temps partiel dans le secteur privé ?](https://www.service-public.fr/particuliers/vosdroits/F878)                   |
| 1.0699471 | [Pause déjeuner du salarié : quelles sont les règles ?](https://www.service-public.fr/particuliers/vosdroits/F34555)                             |
| 1.068656  | [Prise d'acte de la rupture du contrat de travail](https://www.service-public.fr/particuliers/vosdroits/F24409)                                  |
| 1.0682069 | [Rupture du contrat de travail à durée indéterminée (CDI)](https://www.service-public.fr/particuliers/vosdroits/F10033)                          |
| 1.0676748 | [Rupture du contrat de travail dans le secteur privé](https://www.service-public.fr/particuliers/vosdroits/N19611)                               |
| 1.0665354 | [Temps de pause du salarié dans l'entreprise : quelles sont les règles ?](https://www.service-public.fr/particuliers/vosdroits/F18205)           |
| 1.0626682 | [Le contrat de travail peut-il être rompu pendant un congé sabbatique ?](https://www.service-public.fr/particuliers/vosdroits/F12750)            |
| 1.0612103 | [À partir de quel âge peut-on travailler ?](https://www.service-public.fr/particuliers/vosdroits/F1649)                                          |
| 1.0604894 | [Formulaire 10170\*06 : Avis d'arrêt de travail](https://www.service-public.fr/particuliers/vosdroits/R1458)                                     |
| 1.0604478 | [Arrêt maladie : démarches à effectuer](https://www.service-public.fr/particuliers/vosdroits/F303)                                               |
| 1.0600984 | [Congé sabbatique dans le secteur privé](https://www.service-public.fr/particuliers/vosdroits/F2381)                                             |
| 1.0599282 | [Modification du contrat de travail d'un salarié](https://www.service-public.fr/particuliers/vosdroits/F2339)                                    |
| 1.0595963 | [Un arrêt de travail prolonge-t-il un CDD ?](https://www.service-public.fr/particuliers/vosdroits/F1326)                                         |
| 1.0580591 | [Dans quels cas recourir à l'inspecteur du travail ?](https://www.service-public.fr/particuliers/vosdroits/F107)                                 |
