FROM floryn90/hugo:ext-alpine

USER root
RUN git config --global --add safe.directory /src

WORKDIR /src
# Docsy >= 0.18 pulls Bootstrap/Font Awesome from npm and needs Dart Sass
# (sass-embedded); install the dependencies on start and expose the sass binary.
ENV PATH="/src/node_modules/.bin:${PATH}"
ENTRYPOINT []
CMD ["sh", "-c", "npm install && hugo server --bind 0.0.0.0 -D --ignoreCache"]
