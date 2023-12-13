FROM tensorflow/serving:2.8.0

RUN set -x \
  #
  && apt-get update \
  #
  && apt-get install -y --no-install-recommends \
  curl \
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

RUN mkdir -p /models/sentqam/3
RUN addgroup --system --gid 1000 docker && adduser --system --uid 1000 docker
RUN chown -R 1000:1000 /models/sentqam/3

USER 1000

WORKDIR /models/sentqam/3

RUN curl -L https://tfhub.dev/google/universal-sentence-encoder-multilingual-qa/3?tf-hub-format=compressed --output sentqam.tar.gz
RUN tar -zxf sentqam.tar.gz --directory ./


