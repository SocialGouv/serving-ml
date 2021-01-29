FROM tensorflow/serving:2.3.0

RUN set -x
RUN apt-get update
RUN apt-get install -y --no-install-recommends curl=7.58.0-2ubuntu3.12
RUN apt-get purge -y --auto-remove
RUN apt-get -y clean
RUN apt-get -y autoclean
RUN apt-get -y autoremove
RUN rm -rf /var/lib/apt/lists/* /var/cache/debconf/*-old

ENV MODEL_NAME sentqam

WORKDIR /models

RUN set -x
RUN curl -L https://tfhub.dev/google/universal-sentence-encoder-multilingual-qa/3?tf-hub-format=compressed --output sentqam.tar.gz
RUN mkdir -p sentqam/3/
RUN tar -zxf sentqam.tar.gz --directory sentqam/3/

