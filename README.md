
# Using a tensorflow model with tensorflow/serving

In the [CDTN](https://github.com/SocialGouv/code-du-travail-numerique) project, we're making use of a Tensorflow model to generate embeddings for queries and documents.

We used to provide a flask based Python API to encapsulate the model and serve it. Our Javascript core component would then trigger calls to the Python API when required.

In order to reduce the amount of code to maintain, and given the recent updates of Tensorflow, we no longer need our Python component : the model can be directly served with TF serve.

### Get the model 
We're using the _Universal Sentence Encoder Multilingual QA_ from Google, [a great documentation is available](https://tfhub.dev/google/universal-sentence-encoder-multilingual-qa/3](https://tfhub.dev/google/universal-sentence-encoder-multilingual-qa/3)).
The first step is to download the model itself :
```
$ curl https://tfhub.dev/google/universal-sentence-encoder-multilingual-qa/3?tf-hub-format=compressed --output sentqam.tar.gz
```

We need to decompress it and use a specific path in order to explicitly set the model version (for TF serve).
```
$ mkdir -p sentqam/3/ & tar -zxf sentqam.tar.gz --directory sentqam/3/
```

> only the `/3` is important, sentqam is just a shorter name for sentence query answer multilingual

### Run TF serve

[TF serve](https://www.tensorflow.org/tfx/guide/serving) is available as a docker image. At the time of writing (May 15th 2020), the `latest` version of TF serve is not compatible with the model we need (due to an issue with the tensorflow-text version). However, the TF serve 2.2 version fixes the problem, and is currently available as a release candidate. Using the `nightly` image, we can get it working :

```
docker run -p 8501:8501 --mount type=bind,source=/absolute/path/to/sentqam/,target=/models/sentqam -e MODEL_NAME=sentqam -t tensorflow/serving:nightly
```

At that point, our sentqam model is deployed with TF serve and can be accessed from the outside.

### Call the endpoint

Now we can call the endpoint to embed queries and documents.

- Embed query : 
```
$ curl --request POST \
  --url http://localhost:8501/v1/models/sentqam:predict \
  --header 'content-type: application/json' \
  --data '{"signature_name":"question_encoder","inputs":["poireau"]}'
  ```

- Embed document :
```
$ curl --request POST \
  --url http://localhost:8501/v1/models/sentqam:predict \
  --header 'content-type: application/json' \
  --data '{"signature_name":"response_encoder","inputs":{"input":["Recettes de plats au poireau"], "context": ["La tarte au poireau. Fondue de poireaux. Poireaux vinaigrette."]}}'
```
