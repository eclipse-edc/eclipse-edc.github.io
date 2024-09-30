---
title: Autodoc Gradle plugin
weight: 20
---

<!-- TOC -->
  * [1. Introduction](#1-introduction)
  * [2. Module structure](#2-module-structure)
  * [3. Usage](#3-usage)
    * [3.1 Add the plugin to the `buildscript` block of your `build.gradle.kts`:](#31-add-the-plugin-to-the-buildscript-block-of-your-buildgradlekts)
    * [3.2 Apply the plugin to the project:](#32-apply-the-plugin-to-the-project)
    * [3.3 Configure the plugin [optional]](#33-configure-the-plugin-optional)
  * [4. Merging the manifests](#4-merging-the-manifests)
  * [5. Rendering manifest files as Markdown or HTML](#5-rendering-manifest-files-as-markdown-or-html)
  * [6. Using published manifest files (MavenCentral)](#6-using-published-manifest-files-mavencentral)
<!-- TOC -->

## 1. Introduction

In EDC, the autodoc plugin is intended to be used to generate metamodel manifests for every Gradle module, which can
then transformed into Markdown or HTML files, and subsequently be rendered for publication in static web content.

The plugin code can be found in the [GradlePlugins GitHub Repository](https://github.com/eclipse-edc/GradlePlugins).

The `autodoc` plugin hooks into the Java compiler task (`compileJava`) and generates a module manifest file that
contains meta information about each module. For example, it exposes all required and provided dependencies of an EDC
`ServiceExtension`.

## 2. Module structure

The `autodoc` plugin is located at `plugins/autodoc` and consists of four separate modules:

- `autodoc-plugin`: contains the actual Gradle `Plugin` and an `Extension` to configure the plugin. This module is
  published to MavenCentral.
- `autodoc-processor`: contains an `AnnotationProcessor` that hooks into the compilation process and builds the manifest
  file. Published to MavenCentral.
- `autodoc-converters`: used to convert JSON manifests to Markdown or HTML

## 3. Usage

In order to use the `autodoc` plugin we must follow a few simple steps. All examples use the Kotlin DSL.

### 3.1 Add the plugin to the `buildscript` block of your `build.gradle.kts`:

   ```kotlin
   buildscript {
    repositories {
        maven {
            url = uri("https://oss.sonatype.org/content/repositories/snapshots/")
        }
    }
    dependencies {
        classpath("org.eclipse.edc.autodoc:org.eclipse.edc.autodoc.gradle.plugin:<VERSION>>")
    }
}
   ```

Please note that the `repositories` configuration can be omitted, if the release version of the plugin is used.

### 3.2 Apply the plugin to the project:

There are two options to apply a plugin. For multi-module builds this should be done at the root level.

1. via `plugin` block:
   ```kotlin
   plugins {
       id("org.eclipse.edc.autodoc")
   }
   ```
2. using the iterative approach, useful when applying to `allprojects` or `subprojects`:
   ```kotlin
   subprojects{
      apply(plugin = "org.eclipse.edc.autodoc")
   }
   ```

### 3.3 Configure the plugin [optional]

The `autodoc` plugin exposes the following configuration values:

1. the `processorVersion`: tells the plugin, which version of the annotation processor module to use. Set this value if
   the version of the plugin and of the annotation processor diverge. If this is omitted, the plugin will use its own
   version. Please enter _just_ the SemVer-compliant version string, no `groupId` or `artifactName` are needed.
   ```kotlin
   configure<org.eclipse.edc.plugins.autodoc.AutodocExtension> {
       processorVersion.set("<VERSION>")
   }
   ```
   **Typically, you do not need to configure this and can safely omit it.**

_The plugin will then generate an `edc.json` file for every module/gradle project._

## 4. Merging the manifests

There is a Gradle task readily available to merge all the manifests into one large `manifest.json` file. This comes in
handy when the JSON manifest is to be converted into other formats, such as Markdown, HTML, etc.

To do that, execute the following command on a shell:

```bash
./gradlew mergeManifest
```

By default, the merged manifests are saved to `<rootProject>/build/manifest.json`. This destination file can be
configured using a task property:

```kotlin
    // delete the merged manifest before the first merge task runs
tasks.withType<MergeManifestsTask> {
    destinationFile = YOUR_MANIFEST_FILE
}
```

Be aware that due to the multithreaded nature of the merger task, every subproject's `edc.json` gets appended to the
destination file, so it is a good idea to delete that file before running the `mergeManifest` task. Gradle can take care
of that for you though:

```kotlin
// delete the merged manifest before the first merge task runs
rootProject.tasks.withType<MergeManifestsTask> {
    doFirst { YOUR_MANIFEST_FILE.delete() }
}
```

## 5. Rendering manifest files as Markdown or HTML

Manifests get created as JSON, which may not be ideal for end-user consumption. To convert them to HTML or Markdown,
execute the following Gradle task:

```shell
./gradlew doc2md # or doc2html
```

this looks for manifest files and convert them all to either Markdown (`doc2md`) or static HTML (`doc2html`). Note that
if merged the manifests before (`mergeManifests`), then the merged manifest file gets converted too.

The resulting `*.md` or `*.html` files are located next to the `edc.json` file in `<module-path>/build/`.

## 6. Using published manifest files (MavenCentral)

Manifest files (`edc.json`) are published alongside the binary jar files, sources jar and javadoc jar to MavenCentral
for easy consumption by client projects. The manifest is published using `type=json` and `classifier=manifest`
properties.

Client projects that want to download manifest files (e.g. for rendering static web content), simply define a Gradle
dependency like this (kotlin DSL):

```kotlin
implementation("org.eclipse.edc:<ARTIFACT>:<VERSION>:manifest@json")
```

For example, for the `:core:control-plane:control-plane-core` module in version `0.4.2-SNAPSHOT`, this would be:

```kotlin
implementation("org.eclipse.edc:control-plane-core:0.4.2-SNAPSHOT:manifest@json")
```

When the dependency gets resolved, the manifest file will get downloaded to the local gradle cache, typically located at
`.gradle/caches/modules-2/files-2.1`. So in the example the manifest would get downloaded at
`~/.gradle/caches/modules-2/files-2.1/org.eclipse.edc/control-plane-core/0.4.2-SNAPSHOT/<HASH>/control-plane-core-0.4.2-SNAPSHOT-manifest.json`
