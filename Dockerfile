FROM tensorflow/serving:2.2.0

RUN set -x \
  #
  && apt-get update \
  #
  && apt-get install -y --no-install-recommends \
    curl=7.58.0-2ubuntu3.10\
  #
  && apt-get purge -y --auto-remove \
  && apt-get -y clean \
  && apt-get -y autoclean \
  && apt-get -y autoremove \
  && rm -rf \
    /var/lib/apt/lists/* \
    /var/cache/debconf/*-old \
  ;

ENV MODEL_NAME sentqam

WORKDIR /models

RUN set -x \
  #
  && curl -L \
    https://tfhub.dev/google/universal-sentence-encoder-multilingual-qa/3?tf-hub-format=compressed \
    --output sentqam.tar.gz \
  && mkdir -p sentqam/3/ \
  && tar -zxf sentqam.tar.gz --directory sentqam/3/ \
  ;
