FROM tensorflow/serving:2.2.0

RUN set -x \
  #
  && apt-get update \
  && apt-get install -y --no-install-recommends \
    curl=7.64.0-4+deb10u1

ENV MODEL_NAME sentqam

WORKDIR /models

RUN set -x \
  #
  && curl -L https://tfhub.dev/google/universal-sentence-encoder-multilingual-qa/3?tf-hub-format=compressed --output sentqam.tar.gz \
  && kdir -p sentqam/3/ & tar -zxf sentqam.tar.gz --directory sentqam/3/
