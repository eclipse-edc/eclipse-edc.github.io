---
title: Data Plane
weight: 70
---

The EDC Data Plane is the component responsible for transmitting data using a wire protocol and can be easily extended
using the [Data Plane Framework (DPF)](#2-the-data-plane-framework) for supporting different protocols and transfer types.


<!-- TOC -->
  * [1. The DataPlaneManager](#1-the-dataplanemanager)
    * [1.1 Consumer PULL Flow](#11-consumer-pull-flow)
    * [1.2 Provider PUSH Flow](#12-provider-push-flow)
  * [2. The Data Plane Framework](#2-the-data-plane-framework)
    * [2.1 TransferService](#21-transferservice)
    * [2.2 PipelineService](#22-pipelineservice)
  * [3. Writing custom Source/Sink](#3-writing-custom-sourcesink)
    * [3.1 Custom DataSource](#31-custom-datasource)
    * [3.2 Custom DataSink](#32-custom-datasink)
    * [3.3 Executing the transfer](#33-executing-the-transfer)
<!-- TOC -->

The main component of an EDC data plane is the [DataPlaneManager](#1-the-dataplanemanager).

## 1. The DataPlaneManager

The `DataPlaneManager` manages execution of data plane requests, using the EDC [State Machine](../control-plane/programming-primitives.md#1-state-machines) pattern for tracking the state of data transmissions.

It receives `DataFlowStartMessage` from the [Control Plane](../contributor-handbook.md#2-the-control-plane) through the [data plane signaling](./data-plane-signaling/data-plane-signaling.md) protocol if it's deployed as standalone process, or directly via method call when it's embedded in the same process.

The `DataPlaneManager` supports two flow [types](../control-plane/entities.md#71-transfer-and-data-flows-types):

- [Consumer PULL](#11-consumer-pull-flow)
- [Provider PUSH](#12-provider-push-flow)

### 1.1 Consumer PULL Flow

When the flow type of the `DataFlowStartMessage` is `PULL` the `DataPlaneManager` delegates the creation of the `DataAddress`
to the [`DataPlaneAuthorizationService`](./data-plane-signaling/_index.md#323-access-token-generation), and then returns
it to the [ControlPlane](../_index.md#2-the-control-plane) as part of the response to a `DataFlowStartMessage`.

### 1.2 Provider PUSH Flow

When the flow type is `PUSH`, the data transmission is handled by the [DPF](#2-the-data-plane-framework) using the information contained in the `DataFlowStartMessage` such as `sourceDataAddress` and `destinationDataAddress`.

## 2. The Data Plane Framework

The `DPF` consists on a set of SPIs and default implementations for transferring data from a `sourceDataAddress` to a `destinationDataAddress`. It has a built-in support for end-to-end streaming transfers using the [PipelineService](#22-pipelineservice) and it comes with a more generic [TransferService](#21-transferservice) that can be extended to satisfy more specialized or optimized transfer case.

Each `TransferService` is registered in the `TransferServiceRegistry`, that the `DataPlaneManager` uses for validating and initiating a data transfer from a `DataFlowStartMessage`.

### 2.1 TransferService

Given a `DataFlowStartMessage`, an implementation of a `TransferService` can transfer data from a `sourceDataAddress` to a `destinationDataAddress`.

The `TransferService` does not specify how the transfer should happen. It can be processed internally in the data plane or it could delegate out to external (and more specialized) systems.

Relevant methods of the `TransferService` are:

```java
public interface TransferService {

    boolean canHandle(DataFlowStartMessage request);

    Result<Boolean> validate(DataFlowStartMessage request);

    CompletableFuture<StreamResult<Object>> transfer(DataFlowStartMessage request);
}
```

- The `canHandle` expresses if the `TransferService` implementation is able to fulfill the transfer request expressed in the `DataFlowStartMessage`.

- The `validate` performs a validation on the content of a `DataFlowStartMessage`.

- The `transfer` triggers a data transfer from a `sourceDataAddress` to a `destinationDataAddress`.

An implementation of a `TransferService` bundled with the [DPF](#2-the-data-plane-framework) is the [PipelineService](#pipelineservice).

### 2.2 PipelineService

The `PipelineService` is an extension of [TransferService](#transferservice) that leverages on an internal Data-Plane transfer mechanism.
It supports end-to-end streaming by connecting a `DataSink`(output) and a `DataSource` (input).

`DataSink` and `DataSource` are created for each data transfer using `DataSinkFactory` and `DataSourceFactory` from the `DataFlowStartMessage`. Custom source and sink factories should be registered in the  `PipelineService` for adding support different data source and sink types (e.g. S3, HTTP, Kafka).

```java
public interface PipelineService extends TransferService {

    void registerFactory(DataSourceFactory factory);

    void registerFactory(DataSinkFactory factory);

}
```

When the `PipelineService` receives a transfer request, it identifies which `DataSourceFactory` and `DataSinkFactory` can satisfy a `DataFlowStartMessage`, then it creates their respective `DataSource` and `DataSink` and ultimately initiate the transfer by calling `DataSink#transfer(DataSource)`.

EDC supports out of the box (with specialized extensions) a variety of data source and sink types like S3, HTTP, Kafka, AzureStorage, but it can be easily [extended](#writing-custom-sourcesink) with new types.

## 3. Writing custom Source/Sink

The `PipelineService` is the entry point for adding new source and sink types to a data plane runtime.

We will see how to write a [custom data source](#31-custom-datasource), a [custom data sink](#32-custom-datasink) and how we can trigger a transfer leveraging those new types.

Just as example we will write a custom source type that is based on filesystem and a sink type that is based on [SMTP](https://it.wikipedia.org/wiki/Simple_Mail_Transfer_Protocol)

> Note: those custom extensions are just example for didactic purpose.

As always when extending the EDC, the starting point is to create an extension:

```java
public class MyDataPlaneExtension implements ServiceExtension {

    @Inject
    PipelineService pipelineService;

    @Override
    public void initialize(ServiceExtensionContext context) {

    }
}
```

where we inject the `PipelineService`.

> the extension module should include `data-plane-spi` as dependency.

### 3.1 Custom DataSource

Just for simplicity the filesystem based `DataSource` will just support transferring a single file and not folders.

Here's how an implementation of `FileDataSource` might look like:

```java
public class FileDataSource implements DataSource {

    private final File sourceFile;

    public FileDataSource(File sourceFile) {
        this.sourceFile = sourceFile;
    }

    @Override
    public StreamResult<Stream<Part>> openPartStream() {
        return StreamResult.success(Stream.of(new FileStreamPart(sourceFile)));
    }

    @Override
    public void close() {
    }

    private record FileStreamPart(File file) implements Part {

        @Override
        public String name() {
            return file.getName();
        }

        @Override
        public InputStream openStream() {
            try {
                return new FileInputStream(file);
            } catch (FileNotFoundException e) {
                throw new RuntimeException(e);
            }
        }
    }
}
```

The relevant method is the `openPartStream`, which will be called for connecting the source and sink. The `openPartStream` returns a `Stream` of `Part` objects, as the `DataSource` can be composed by more that one part (e.g. folders, files, etc.). The `openPartStream` does not actually open a Java `InputStream`, but returns a stream of `Part`s.

Transforming a `Part` into an `InputStream` is the main task of the `DataSource` implementation. In our case the `FileStreamPart#openStream` just returns a `FileInputStream` from the input `File`.

Now we have a `DataSource` that can be used for transferring the content of a file. The only missing bit is how to create a `DataSource` for a transfer request.

This can be achieved by implementing a `DataSourceFactory` that creates the `FileDataSource` from a `DataFlowStartMessage`:


```java
public class FileDataSourceFactory implements DataSourceFactory {

    @Override
    public String supportedType() {
        return "File";
    }

    @Override
    public DataSource createSource(DataFlowStartMessage request) {
        return new FileDataSource(getFile(request).orElseThrow(RuntimeException::new));
    }

    @Override
    public @NotNull Result<Void> validateRequest(DataFlowStartMessage request) {
        return getFile(request)
                .map(it -> Result.success())
                .orElseGet(() -> Result.failure("sourceFile is not found or it does not exist"));
    }

    private Optional<File> getFile(DataFlowStartMessage request) {
        return Optional.ofNullable(request.getSourceDataAddress().getStringProperty("sourceFile"))
                .map(File::new)
                .filter(File::exists)
                .filter(File::isFile);
    }
}
```

For our implementation we express in the `supportedType` method that the
the `sourceDataAddress` should be of type `File` and in the `validateRequest` method
that it should contains a property `sourceFile` containing the path of the file to be transferred.

The `FileDataSourceFactory` then should be registered in the `PipelineService`:

```java
public class MyDataPlaneExtension implements ServiceExtension {

    @Inject
    PipelineService pipelineService;

    @Override
    public void initialize(ServiceExtensionContext context) {
        pipelineService.registerFactory(new FileDataSourceFactory());
    }
}
```

### 3.2 Custom DataSink

For the `DataSink` we will sketch an implementation of an SMTP based one using the [javamail](https://javaee.github.io/javamail/) API.
The implementation should send the `Part`s of the input `DataSource` as email attachments to a `recipient`.

The `MailDataSink` may look like this:

```java
public class MailDataSink implements DataSink {

    private final Session session;
    private final String recipient;
    private final String sender;
    private final String subject;

    public MailDataSink(Session session, String recipient, String sender, String subject) {
        this.session = session;
        this.recipient = recipient;
        this.sender = sender;
        this.subject = subject;
    }

    @Override
    public CompletableFuture<StreamResult<Object>> transfer(DataSource source) {
        var msg = new MimeMessage(session);
        try {
            msg.setSentDate(new Date());
            msg.setRecipients(Message.RecipientType.TO, recipient);
            msg.setSubject(subject, "UTF-8");
            msg.setFrom(sender);

            var streamResult = source.openPartStream();
            if (streamResult.failed()) {
                return CompletableFuture.failedFuture(new EdcException(streamResult.getFailureDetail()));
            }

            var multipart = new MimeMultipart();
            streamResult.getContent()
                    .map(this::createBodyPart)
                    .forEach(part -> {
                        try {
                            multipart.addBodyPart(part);
                        } catch (MessagingException e) {
                            throw new EdcException(e);
                        }
                    });

            msg.setContent(multipart);
            Transport.send(msg);
            return CompletableFuture.completedFuture(StreamResult.success());
        } catch (Exception e) {
            return CompletableFuture.failedFuture(e);
        }
    }

    private BodyPart createBodyPart(DataSource.Part part) {
        try {
            var messageBodyPart = new MimeBodyPart();
            messageBodyPart.setFileName(part.name());
            var source = new ByteArrayDataSource(part.openStream(), part.mediaType());
            messageBodyPart.setDataHandler(new DataHandler(source));
            return messageBodyPart;
        } catch (Exception e) {
            throw new EdcException(e);
        }
    }
}

```

The `MailDataSink` receives in input a `DataSource` in the `transfer` method. After setting up the `MimeMessage` with `recipient`, `sender` and the `subject`, the code maps each `DataSource.Part` into a `BodyPart`(attachments), with `Part#name` as the name of each attachment.

The message is finally delivered using the `Transport` API.

> In this case is not a proper streaming, since the `javamail` buffers the `InputStream` when using the `ByteArrayDataSource`.

To use the `MailDataSink` as available sink type, an implementation of the `DataSinkFactory` is required:

```java
public class MailDataSinkFactory implements DataSinkFactory {

    private final Session session;
    private final String sender;

    public MailDataSinkFactory(Session session, String sender) {
        this.session = session;
        this.sender = sender;
    }

    @Override
    public String supportedType() {
        return "Mail";
    }

    @Override
    public DataSink createSink(DataFlowStartMessage request) {
        var recipient = getRecipient(request);
        var subject = "File transfer %s".formatted(request.getProcessId());
        return new MailDataSink(session, recipient, sender, subject);
    }

    @Override
    public @NotNull Result<Void> validateRequest(DataFlowStartMessage request) {
        return Optional.ofNullable(getRecipient(request))
                .map(it -> Result.success())
                .orElseGet(() -> Result.failure("Missing recipient"));
    }

    private String getRecipient(DataFlowStartMessage request) {
        var destination = request.getDestinationDataAddress();
        return destination.getStringProperty("recipient");
    }
}

```

The `MailDataSinkFactory` declares the supported type (`Mail`) and implements  validation and creation of the `DataSource` based on the `destinationAddress` in the `DataFlowStartMessage`.

In the validation phase only expects the `recipient` as additional property in the `DataAddress` of the destination.

Ultimately the `MailDataSinkFactory` should be registered in the `PipelineService`:

```java
public class MyDataPlaneExtension implements ServiceExtension {

    @Inject
    PipelineService pipelineService;

    @Override
    public void initialize(ServiceExtensionContext context) {
        pipelineService.registerFactory(new FileDataSourceFactory());

        var sender = // fetch the sender from config
        pipelineService.registerFactory(new MailDataSinkFactory(getSession(context),sender));
    }

    private Session getSession(ServiceExtensionContext context) {
        // configure the java mail Session
    }
}
```

### 3.3 Executing the transfer

With the `MyDataPlaneExtension` loaded in the provider data plane, that adds
a new `source` type based on filesystem and a `sink` in the runtime we can now complete a `File` -> `Mail` transfer.

On the provider side we can create an [Asset](../control-plane/entities.md#1-assets) like this:

```json
{
  "@context": { "@vocab": "https://w3id.org/edc/v0.0.1/ns/" },
  "@id": "file-asset",
  "properties": {
  },
  "dataAddress": {
    "type": "File",
    "sourceFile": "{{filePath}}"
  }
}
```

The `Asset` then should then be [advertised](../control-plane/entities.md#3-contract-definitions) in the [catalog](../control-plane/entities.md#6-catalog).

When a consumer fetches the provider's [catalog](../control-plane/entities.md#6-catalog),
if the access policy conditions are met, it should see the [Dataset](../control-plane/entities.md#6-catalog) with a new distribution available.

```json
{
    "@type": "dcat:Distribution",
    "dct:format": {
        "@id": "Mail-PUSH"
    },
    "dcat:accessService": {
        "@id": "ef9494bb-7000-4bae-9770-6567f451dba5",
        "@type": "dcat:DataService",
        "dcat:endpointDescription": "dspace:connector",
        "dcat:endpointUrl": "http://localhost:18182/protocol",
        "dct:terms": "dspace:connector",
        "dct:endpointUrl": "http://localhost:18182/protocol"
    }
}
```

which indicates that the `Dataset` is also available with the format `Mail-PUSH`.

Once a contract [agreement](../control-plane/entities.md#5-contract-agreements) is reached between the parties, a consumer may send a transfer request:

```json
{
  "@context": {
    "@vocab": "https://w3id.org/edc/v0.0.1/ns/"
  },
  "@type": "TransferRequest",
  "dataDestination": {
    "type": "Mail",
    "recipient": "{{recipientEmail}}"
  },
  "protocol": "dataspace-protocol-http",
  "contractId": "{{agreementId}}",
  "connectorId": "provider",
  "counterPartyAddress": "http://localhost:18182/protocol",
  "transferType": "Mail-PUSH"
}
```

that will deliver the `Dataset` as attachments in the `recipient` email address.
