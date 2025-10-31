FROM floryn90/hugo:ext-alpine

USER root
RUN git config --global --add safe.directory /src

WORKDIR /src
CMD ["server", "--bind", "0.0.0.0", "-D", "--ignoreCache"]