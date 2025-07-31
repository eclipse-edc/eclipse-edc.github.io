---
title: Developer Tools
weight: 20
---

<!-- TOC -->
  * [1. Introduction](#1-introduction)
  * [2. `edc-build`](#2-edc-build)
    * [2.1. Usage](#21-usage)
  * [3. `autodoc`](#3-autodoc)
    * [3.1. Usage](#31-usage)
      * [3.1.1. Add the plugin to the `buildscript` block of your `build.gradle.kts`:](#311-add-the-plugin-to-the-buildscript-block-of-your-buildgradlekts)
      * [3.1.2. Apply the plugin to the project:](#312-apply-the-plugin-to-the-project)
      * [3.1.3. Configure the plugin [optional]](#313-configure-the-plugin-optional)
  * [3.2. Merging the manifests](#32-merging-the-manifests)
    * [3.3. Rendering manifest files as Markdown or HTML](#33-rendering-manifest-files-as-markdown-or-html)
  * [3.4. Using published manifest files (MavenCentral)](#34-using-published-manifest-files-mavencentral)
<!-- TOC -->

## 1. Introduction

We provide two Gradle plugins that could be used to simplify your build/documentation efforts.

The plugins are available on the [GradlePlugins GitHub Repository](https://github.com/eclipse-edc/GradlePlugins):
- `edc-build`
- `autodoc`

## 2. `edc-build`

The plugin consists essentially of these things:

- _a plugin class_: extends `Plugin<Project>` from the Gradle API to hook into the Gradle task infrastructure
- _extensions_: they are POJOs that are model classes for configuration.
- _conventions_: individual mutations that are applied to the project. For example, we use conventions to add some
  standard repositories to all projects, or to implement publishing to Snapshot Repository and MavenCentral in a generic way.
- _tasks_: executable Gradle tasks that perform a certain action like merging OpenAPI Specification documents.

It is important to note that a Gradle build is separated in _phases_, namely _Initialization_, _Configuration_ and
_Execution_ (see [documentation](https://docs.gradle.org/current/userguide/build_lifecycle.html)). Some of our
_conventions_ as well as other plugins have to be applied in the _Configuration_ phase.

### 2.1. Usage

The plugin is published on the [Gradle Plugin Portal](https://plugins.gradle.org/plugin/org.eclipse.edc.edc-build), so
it can be added to your project in the standard way suggested in the [Gradle documentation](https://docs.gradle.org/current/userguide/plugins.html.

## 3. `autodoc`

This plugin provides an automated way to generate basic documentation about extensions, plug points, SPI modules and
configuration settings for every EDC extension module, which can then transformed into Markdown or HTML files, and
subsequently be rendered for publication in static web content.

To achieve this, simply annotate respective elements directly in Java code:

```java
@Extension(value = "Some supercool extension", categories = {"category1", "category2"})
public class SomeSupercoolExtension implements ServiceExtension {

  // default value -> not required
  @Setting(value = "Some string config property", type = "string", defaultValue = "foobar", required = false)
  public static final String SOME_STRING_CONFIG_PROPERTY = "edc.some.supercool.string";

  //no default value -> required
  @Setting(value = "Some numeric config", type = "integer", required = true)
  public static final String SOME_INT_CONFIG_PROPERTY = "edc.some.supercool.int";

  // ...
}
```

The `autodoc` plugin hooks into the Java compiler task (`compileJava`) and generates a module manifest file that
contains meta information about each module. For example, it exposes all required and provided dependencies of an EDC
`ServiceExtension`.

### 3.1. Usage

In order to use the `autodoc` plugin we must follow a few simple steps. All examples use the Kotlin DSL.

#### 3.1.1. Add the plugin to the `buildscript` block of your `build.gradle.kts`:

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

Please note that the `repositories` configuration can be omitted, if the release version of the plugin is used or if used
in conjunction with the `edc-build` plugin.

#### 3.1.2. Apply the plugin to the project:

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

#### 3.1.3. Configure the plugin [optional]

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

## 3.2. Merging the manifests

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

### 3.3. Rendering manifest files as Markdown or HTML

Manifests get created as JSON, which may not be ideal for end-user consumption. To convert them to HTML or Markdown,
execute the following Gradle task:

```shell
./gradlew doc2md # or doc2html
```

this looks for manifest files and convert them all to either Markdown (`doc2md`) or static HTML (`doc2html`). Note that
if merged the manifests before (`mergeManifests`), then the merged manifest file gets converted too.

The resulting `*.md` or `*.html` files are located next to the `edc.json` file in `<module-path>/build/`.

## 3.4. Using published manifest files (MavenCentral)

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
