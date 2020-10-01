const fetch = require("node-fetch");
const stopwords = require("stopwords-fr");
const { Client } = require("@elastic/elasticsearch");
const pAll = require("p-all");
const selectAll = require("unist-util-select").selectAll;
const ora = require("ora");

const INDEX_NAME = `vectors1`;

// need write permissions
const client = new Client({
  cloud: { id: process.env.ES_ID },
  auth: {
    username: process.env.ES_USERNAME,
    password: process.env.ES_PASSWORD,
  },
});

const NLP_URL = process.env.NLP_URL || "https://preprod-serving-ml.dev2.fabrique.social.gouv.fr";
const tfServeURL = NLP_URL + "/v1/models/sentqam:predict";

function stripAccents(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const stopWords = new Set(
  stopwords.map(stripAccents).map((s) => s.toLowerCase())
);

// cleanup input string
function preprocess(text) {
  const stripped = stripAccents(text);

  return stripped
    .split(" ")
    .filter((t) => !stopWords.has(t.toLowerCase()))
    .join(" ");
}

// call serving-ml API
async function callTFServe(body) {
  const response = await fetch(tfServeURL, { body, method: "POST" });
  if (response.ok) {
    const json = await response.json();
    return json["outputs"];
  } else {
    throw new Error(response.statusText);
  }
}

// vectoriser un document
async function vectorizeDocument(title, content) {
  if (title == undefined || title == "") {
    throw new Error("Cannot vectorize document with empty title.");
  }

  const input = [preprocess(title)];
  const context = content ? [preprocess(content)] : "";

  const body = JSON.stringify({
    inputs: { context, input },
    signature_name: "response_encoder",
  });
  const vectors = await callTFServe(body);
  return vectors[0];
}

// vectoriser un texte
async function vectorizeQuery(query) {
  if (!query) {
    throw new Error("Cannot vectorize empty query.");
  }

  const inputs = [preprocess(query)];
  const body = JSON.stringify({
    inputs,
    signature_name: "question_encoder",
  });
  const vectors = await callTFServe(body);
  return vectors[0];
}

// basic elastic index mapping
const indexMapping = {
  properties: {
    vector: {
      dims: 512,
      type: "dense_vector",
    },
    id: { type: "text" },
    type: { type: "text" },
    title: { type: "text" },
    subject: { type: "text" },
    content: { type: "text" },
  },
};

// delete/create index for Elastic
async function createIndex({ client, indexName, mappings }) {
  const { body } = await client.indices.exists({ index: indexName });
  if (body) {
    try {
      await client.indices.delete({ index: indexName });
      console.log(`Index ${indexName} deleted.`);
    } catch (error) {
      console.log("index delete", error);
    }
  }
  try {
    await client.indices.create({
      index: indexName,
      body: {
        settings: {
          number_of_shards: 1,
          number_of_replicas: 1,
          index: {
            analysis: {},
          },
        },
        mappings: indexMapping,
      },
    });
    console.log(`Index ${indexName} created.`);
  } catch (error) {
    console.log("index create", error);
    console.log(error.meta.body.error);
  }
}

// elastic indexation process
const startIndexing = async (documents) => {
  // create index
  console.log("Creating index", INDEX_NAME);
  await createIndex({
    client,
    indexName: INDEX_NAME,
  });

  // inject data
  console.log(
    "Injecting data, number of documents to index:",
    documents.length
  );
  const body = documents.flatMap((doc) => [
    { index: { _index: INDEX_NAME } },
    doc,
  ]);

  try {
    const res = await client.bulk({ refresh: true, body });
  } catch (e) {
    console.log("e", e.meta.body.error);
  }
};

// basic function to extract text context for our documents
const extractFicheText = (indexData, ficheData) => {
  const text =
    indexData.title +
    " " +
    indexData.subject +
    " " +
    preprocess(
      selectAll("[type=text]", ficheData)
        .map((node) => node.text)
        .join(" ")
    );
  return text;
};

// decide if some fiche will be indexes
const INCLUDE_THEMES = [
  "Famille, Travail, Loisirs, Social - Santé",
  "Travail",
  "Social - Santé",
];

const isIncluded = (fiche) => INCLUDE_THEMES.includes(fiche.subject);

// index some data from @socialgouv/fiches-vdd into elastic search
const indexData = async () => {
  const spinner = ora("Loading documents").start();

  const documents = require("@socialgouv/fiches-vdd/data/index.json");

  // extract title and text content from dataset
  const documentsData = documents.filter(isIncluded).map((doc) => ({
    id: doc.id,
    type: doc.type,
    title: doc.title,
    subject: doc.subject,
    content: extractFicheText(
      doc,
      require(`@socialgouv/fiches-vdd/data/${doc.type}/${doc.id}.json`)
    ),
  }));

  spinner.succeed(`Loaded ${documentsData.length} documents`);

  const spinner2 = ora("Loading vectors").start();

  // add vector data from API to documents
  const withVectors = await pAll(
    documentsData.map((doc, i, all) => async () => {
      spinner2.text = `Vectorizing ${i + 1}/${all.length}`;
      return {
        ...doc,
        vector: await vectorizeDocument(doc.title, doc.content),
      };
    }),
    { concurrency: 2 }
  );

  spinner2.text = `Indexing in elasticsearch`;
  await startIndexing(withVectors);
  spinner2.succeed(
    `Indexed: ${withVectors.length} documents in index ${INDEX_NAME}`
  );
};

// build the elasticQuery
const getSemanticQuery = (inputVector) => ({
  query: {
    script_score: {
      query: {
        match_all: {},
      },
      script: {
        params: {
          inputVector,
        },
        source: "cosineSimilarity(params.inputVector, 'vector') + 1.0",
      },
    },
  },
});

// make the elastic query
const query = async (inputText) => {
  // the input query is vectorized by serving-ml before being sent to elastic
  const inputVector = await vectorizeQuery(inputText);
  try {
    const result = await client.search(
      {
        index: INDEX_NAME,
        size: 50,
        body: getSemanticQuery(inputVector),
      },
      {
        // options
      }
    );
    const hits =
      result && result.body && result.body.hits && result.body.hits.hits;
    return hits;
  } catch (e) {
    console.log("error", e);
    throw e;
  }
};

const getFicheUrl = ({ type, id } = {}) =>
  `https://www.service-public.fr/${type}/vosdroits/${id}`;

const input = process.argv.length > 2 && process.argv[process.argv.length - 1];

if (input) {
  // make a search is some input text is given
  query(input)
    .then((results) =>
      results.map(
        (res) =>
          `${res._score} | [${res._source.title}](${getFicheUrl(res._source)})`
      )
    )
    .then((rows) => console.log(rows.join("\n")));
} else {
  // index in elastic
  indexData();
}
