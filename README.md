# eclipse-edc.github.io website

This repository contains project-wide documentation.

## GitHub Pages

The documentation files of all EDC repositories are provided with [GitHub Pages](https://docs.github.com/en/pages).

The pages are deployed from the `/docs` subdirectory to <https://eclipse-edc.github.io/docs>.

### Local Deployment

If you want to add content or change configurations, please refer to the [official Docsify documentation](https://docsify.js.org/).

For a local deployment, install [Node.js](https://nodejs.org/), check out this repository, and run Docsify:
```commandline
$ git clone https://github.com/eclipse-edc/docs.git
$ cd docs
$ npm i docsify-cli -g
$ docsify serve docs
```

## Contributing

See [how to contribute](CONTRIBUTING.md).

## Running the website locally

Building and running the site locally requires a recent `extended` version of [Hugo](https://gohugo.io).
You can find out more about how to install Hugo for your environment in our
[Getting started](https://www.docsy.dev/docs/getting-started/#prerequisites-and-installation) guide.

```bash
hugo server
```

## Running a container locally

You can run the website inside a [Docker](https://docs.docker.com/)
container, the container runs with a volume bound to the root folder.

1. Build the docker image

   ```bash
   docker compose up --build`
   ```

2. Verify that the service is working.

   Open your web browser and type `http://localhost:1313` in your navigation bar,
   This opens a local instance of the homepage. You can now make
   changes to the docs and those changes will immediately show up in your browser after you save.

### Cleanup

To stop Docker Compose, on your terminal window, press **Ctrl + C**.

To remove the produced images run:

```bash
docker compose rm
```
For more information see the [Docker Compose documentation][].
