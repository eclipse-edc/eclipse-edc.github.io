FROM floryn90/hugo:ext-alpine

# Ensure we are root while installing system packages so apk can lock/update its DB
USER root
RUN apk add --no-cache git && \
  git config --global --add safe.directory /src

# (Optional) drop back to a non-root user if the base image expects one.
# You can uncomment and adjust the USER line below if you know the non-root username.
# USER hugo
