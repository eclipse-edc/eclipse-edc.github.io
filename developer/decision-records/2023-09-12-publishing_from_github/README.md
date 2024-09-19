# Publishing Maven Artefacts directly from GitHub

## Decision

The Eclipse Dataspace Components projects will move away from Jenkins and toward GitHub actions for publishing its Maven
artefacts. This migration is to be done in increments, our snapshot builds will be the first iteration.

## Rationale

Publishing directly from GitHub has several significant benefits:

- tighter integration with the other GH workflows
- no need to store Jenkins credentials in GH anymore
- better control over the execution than a webhook would provide
- not limited by Jenkins executors
- better transparency - developers can see failure messages directly in the workflow log and don't have to go to Jenkins
  anymore

## Approach

This [pull-request](https://github.com/eclipse-edc/.eclipsefdn/pull/1) against the `.eclipsefdn` repo adds the OSSR
credentials and GPG key/passphrase to our orgs secrets. With that, we can easily set up publishing by adding the
following GitHub action and workflow:

```yaml
## Reusable action to import the GPG key

name: "Import GPG Key"
description: "Imports a GPG key given in the input"
inputs:
  gpg-private-key:
    required: true
    description: "The GPG Private Key in plain text. Can be a sub-key."
runs:
  using: "composite"
  steps:
    # this is necessary because it creates gpg.conf, etc.
    - name: List Keys
      shell: bash
      run: |
        gpg -K --keyid-format=long

    - name: Import GPG Private Key
      shell: bash
      run: |
        echo "use-agent" >> ~/.gnupg/gpg.conf
        echo "pinentry-mode loopback" >> ~/.gnupg/gpg.conf
        echo -e "${{ inputs.gpg-private-key }}" | gpg --import --batch
        for fpr in $(gpg --list-keys --with-colons | awk -F: '/fpr:/ {print $10}' | sort -u);
        do
          echo -e "5\\ny\\n" |  gpg --batch --command-fd 0 --expert --edit-key $fpr trust;
        done
```

and then, to actually publish the snapshot, we can add a workflow like this, that calls the above
action (`import-gpg-key`). Note that we would put this in place of the current `trigger-snapshot.yaml` workflow:

```yaml
  maven-release:
    name: 'Publish all artefacts to Sonatype/MavenCentral'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      # Set-Up
      - uses: actions/checkout@v3.5.2
      - uses: ./.github/actions/setup-java

      # Import GPG Key
      - uses: ./.github/actions/import-gpg-key
        name: "Import GPG Key"
        with:
          gpg-private-key: ${{ secrets.ORG_GPG_PRIVATE_KEY }}

      # publish releases
      - name: Publish version
        env:
          OSSRH_PASSWORD: ${{ secrets.ORG_OSSRH_PASSWORD }}
          OSSRH_USER: ${{ secrets.ORG_OSSRH_USERNAME }}
        run: |-
          if [ -z ${{ inputs.version }} ]; 
          then 
            VERSION=$(./gradlew properties -q | grep "version:" | awk '{print $2}')
            echo "Publishing using version from gradle.properties: $VERSION"
            ./gradlew publishToSonatype closeAndReleaseSonatypeStagingRepository --no-parallel -Pversion=$VERSION -Psigning.gnupg.executable=gpg -Psigning.gnupg.passphrase="${{ secrets.ORG_GPG_PASSPHRASE }}"
          else 
            echo "Publishing using version from parameter: ${{ inputs.version }}"
            ./gradlew publishToSonatype closeAndReleaseSonatypeStagingRepository --no-parallel -Pversion=${{ inputs.version }} -Psigning.gnupg.executable=gpg -Psigning.gnupg.passphrase="${{ secrets.ORG_GPG_PASSPHRASE }}"
          fi
```

That action/workflow should be hosted in the `.github` repository and be invoked from every component's build pipeline.
That way, changes can be centralized and be done only once.