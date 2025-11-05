# About
In this article we explore concepts related to container technology. We start from the basic by understanding what are containers and virtual machines. Then we explore the open container initiative (image-spec and runtime-spec) and later explore Docker and Podman specific concepts.

# Introduction
## What are Virtual Machines?

- Applications are generally deployed in a virtual machine.
- A Virtual Machine (VM) is a compute resource that uses software instead of a physical computer to run programs and deploy apps.
- Each virtual machine runs its own operating system and functions separately from the other VMs, even when they are all running on the same host.

## What are Containers?

Containers are a technology that allows applications to be packaged and isolated with their entire runtime environment.

## Why use Containers?

- The computational overhead spent virtualizing hardware for a guest OS to use is substantial.
- They make it easier to maintain consistent behavior and functionality while moving the contained application between environments.
- Containers share the machine’s OS system kernel and therefore do not require an OS per application, driving higher server efficiencies.

# What is the Open Container Initiative (OCI)?

The Open Container Initiative (OCI) is a lightweight, open governance structure (project) for the express purpose of creating open industry standards around container formats and runtimes.

The OCI currently contains three specifications: 

- The Runtime Specification (runtime-spec).
- The Image Specification (image-spec).
- The Distribution Specification (distribution-spec).

# Runtime Specification

The Open Container Initiative Runtime Specification aims to specify the configuration, execution environment, and lifecycle of a container. The Runtime Specification outlines how to run a "filesystem bundle" that is unpacked on disk.

**A container's configuration is specified in the `config.json` for the supported platforms and details the fields that enable the creation of a container.** The execution environment is specified to ensure that applications running inside a container have a consistent environment between runtimes, along with common actions defined for the container's lifecycle.

Application bundle builders can create a **bundle directory** that includes all the files required to launch an application as a container. The bundle contains an OCI configuration file (`config.json`) where the builder can specify host-independent details such as which executable to launch (`process` object defined in the `config.json` file) and host-specific settings such as mount locations, hook paths, Linux namespaces and cgroups.

## What is a file system bundle?

A set of files organized in a certain way and containing all the necessary data and metadata for any compliant runtime to perform all standard operations against it.

> A container is encoding as a filesystem bundle on disk. The definition of a bundle is concerned only with how a container and its configuration data are stored on a local filesystem so that they can be consumed by a compliant runtime.
> 

A Standard Container bundle contains all the information needed to load and run a container. This includes the following artifacts:

1. `config.json` containing all configuration data. (File is mandatory)
2. The container's root filesystem, referred to by `root.path` in the `config.json` file. (Optional but mandatory in Windows)

## Scope of a Container

The entity using a runtime to create a container MUST be able to use the operations defined in this specification against that same container. Whether other entities using the same, or other, instance of the runtime can see that container is out of scope of this specification.

## State of a Container

The state of a container includes the following properties:

- ociVersion
- id
- status (Additional values MAY be defined by the runtime, however, they MUST be used to represent new runtime states not defined below.)
    - creating: The container is being created.
    - created: The runtime has finished the create operation, and the container process has neither exited nor executed the user-specified program.
    - running: The container process has executed the user-specified program but has not exited
    - stopped: The container process has exited
- pid
- bundle
- annotations

```json
//Example of state
{
    "ociVersion": "0.2.0",
    "id": "oci-container1",
    "status": "running",
    "pid": 4422,
    "bundle": "/containers/redis",
    "annotations": {
        "myKey": "myValue"
    }
}
```

## Runtime Lifecycle

The lifecycle describes the timeline of events that happen from when a container is created to when it ceases to exist.

1. OCI `create` operation command is invoked.
2. The container's runtime environment MUST be created according to the configuration in `config.json`. While the resources requested in the `config.json` MUST be created, the user-specified program MUST NOT be run at this time. Any updates to `config.json` after this step MUST NOT affect the container.
3. `prestart hook` 
4. `createRuntime hook` 
5. `createContainer hook` 
6. Runtime's `start` command is invoked with the unique identifier of the container.
7. `startContainer hook` 
8. The runtime MUST run the user-specified program, as specified by `process` . (`process` object is defined in the `config.json`)
9. `postStart hook`
10. The container process exits. **This MAY happen due to erroring out, exiting, crashing or the runtime's `kill` operation being invoked.**
11. Runtime's `delete` command is invoked with the unique identifier of the container.
12. The container MUST be destroyed by undoing the steps performed during create phase (step 2).
13. `postStop hook` 

## Operations

Unless otherwise stated, runtimes MUST support the following operations. (These operations are not specifying any command-line APIs, and the parameters are inputs for general operations.)

> Container tools provide CLI tools which may have a different name but the underlying operation should support these, that are consistent with OCI runtime-spec.
> 
- `query state`: This operation MUST return the state of a container as specified in [state](#state-of-a-container)
- `create`: This operation MUST create a new container. Any changes made to the `config.json` file after this operation will not have an effect on the container.
- `start`: This operation MUST run the user-specified program as specified by `process` .
- `kill`: This operation MUST send the specified signal to the container process.
- `delete`: Attempting to delete a container that is not stopped MUST have no effect on the container and MUST generate an error. Deleting a container MUST delete the resources that were created during the `create` step. *Note that resources associated with the container, but not created by this container, MUST NOT be deleted.*
    - Volumes or mounts etc, are not deleted.

## Configuration

This configuration file contains metadata necessary to implement standard operations against the container. This includes the process to run, environment variables to inject, sandboxing features to use, etc.

- Refer https://github.com/opencontainers/runtime-spec/blob/main/config.md#platform-specific-configuration to the full configuration details.


# Image Specification

This specification defines an OCI Image, consisting of an **image manifest**, an i**mage index** (optional), **a set of filesystem layers**, and a **configuration**. 

## Image Manifest

At a high level, the image manifest contains metadata about the contents and dependencies of the image, including the content-addressable identity of one or more filesystem layer changeset archives that will be unpacked to make up the final runnable filesystem. 

## Image Configuration

The image configuration includes information such as application arguments, environments, etc.

## Image Index

The image index is a higher-level manifest that points to a **list of manifests and descriptors**. Typically, these manifests may provide different implementations of the image, possibly varying by platform or other attributes.

## Content Descriptors

- An OCI image consists of several **different** **components** arranged in a Merkle Directed Acyclic Graph (DAG).
- References between components in the graph are expressed through Content Descriptors.
- A Content Descriptor, or simply Descriptor, describes the disposition (the way in which something is placed or arranged, especially in relation to other things) of the targeted content.
- The content identifier is the [**digest**]().
- The media type defining the descriptor is: `application/vnd.oci.descriptor.v1+json`

> A canonical form is a representation such that every object has a unique representation. Thus, the equality of two objects can easily be tested by testing the equality of their canonical forms. Canonicalization being the process through which a representation is put into its canonical form.
For example, the content {’a’:1, ‘b’:2} and {’b’:2,’a’:1} although being same can show different digests. Therefore, canonicalization is used when saving content in OCI.
> 
> 
> echo -n {'a':1,'b':2} | sha256sum
> d8766531781e268ee6fe73b2333041ca231ac61f059874afe0d10c395421b388
> 
> echo -n {'b':2,'a':1} | sha256sum
> d644ddd8c7d5668b270da1e1d8a51a3c8b0a4c7458513a85cbf056b4414f4b65
>

## Image Layout Specification

- The OCI Image Layout is the directory structure for OCI content-addressable blobs and location-addressable references (refs).

Given an image layout and a ref, a tool can create an OCI Runtime Specification bundle by:

- Following the ref to find a manifest, possibly via an image index
- Applying the filesystem layers in the specified order
- Converting the image configuration into an OCI Runtime Specification `config.json`

### Structure

The image layout is as follows:

- `blobs` **directory:**
    - Contains content-addressable blobs
    - A blob has no schema and SHOULD be considered opaque
    - Directory MUST exist and MAY be empty
- `oci-layout` **file**:
    - It MUST exist and be a JSON object.
    - It MUST contain an `imageLayoutVersion` field
- `index.json` file
    - It MUST exist and be an image index JSON object.

### Blobs

- Object names in the `blobs` subdirectories are composed of a directory for each hash algorithm, the children of which will contain the actual content.
- The content of `blobs/<alg>/<encoded>` MUST match the digest `<alg>:<encoded>` (referenced per [descriptor](https://github.com/opencontainers/image-spec/blob/main/descriptor.md#digests)). For example, the content of `blobs/sha256/da39a3ee5e6b4b0d3255bfef95601890afd80709` MUST match the digest `sha256:da39a3ee5e6b4b0d3255bfef95601890afd80709`.

### **oci-layout file**

- This JSON object serves as a marker for the base of an Open Container Image Layout and to provide the version of the image-layout in use.
- The media type defining the image layout specification is: `application/vnd.oci.layout.header.v1+json`

### **index.json file**

- It is the entry point for references and descriptors of the image layout.
- The image index is a multi-descriptor entry point.
- This index provides an established path (`/index.json`) to have an entry point for an image-layout and to discover auxiliary descriptors.
- In general the `mediaType` of each descriptor object in the **manifests field** will be either `application/vnd.oci.image.index.v1+json` or `application/vnd.oci.image.manifest.v1+json`.
- An encountered `mediaType` that is unknown MUST NOT generate an error.

## **Image Index Specification**

- The image index is a higher-level manifest that points to specific image manifests, ideal for one or more platforms. While the use of an image index is OPTIONAL for image providers, image consumers SHOULD be prepared to process them.
- This section defines the `application/vnd.oci.image.index.v1+json` media type.

## **Image Manifest Specification**

There are three main goals of the Image Manifest Specification. The media type defined by this section is `application/vnd.oci.image.manifest.v1+json`

- content-addressable images: by supporting an image model where the image's configuration can be hashed to generate a unique ID for the image and its components.
- To allow multi-architecture images, through a "fat manifest" which references image manifests for platform-specific versions of an image. 
In OCI, this is codified in an **image index**.
- To be translatable to the OCI Runtime Specification.

**An image manifest provides a configuration and set of layers for a single container image for a specific architecture and operating system.**

## **Image Configuration**

- An OCI Image is an ordered collection of root filesystem changes and the corresponding execution parameters for use within a container runtime.
- This specification outlines the JSON format describing images for use with a container runtime and execution tool and its relationship to filesystem changesets.
- The media type `application/vnd.oci.image.config.v1+json` defines the image configuration.

### Terminology

#### Layer

- Image filesystems are composed of **layers**.
- Each layer represents a set of **filesystem** changes in a **tar-based** layer format, recording files to be added, changed, or deleted relative to its parent layer.
- Layers do not have configuration metadata such as environment variables or default arguments, these are properties of the image as a whole rather than any particular layer.
- Using a layer-based or union filesystem such as AUFS, or by computing the diff from filesystem snapshots, the filesystem changeset can be used to present a series of image layers as if they were one cohesive filesystem.
- One or more layers are applied on top of each other to create a complete filesystem.
    - The media type `application/vnd.oci.image.layer.v1.tar+gzip` represents an `application/vnd.oci.image.layer.v1.tar` payload which has been compressed with gzip.
    - The media type `application/vnd.oci.image.layer.v1.tar+zstd` represents an `application/vnd.oci.image.layer.v1.tar` payload which has been compressed with zstd.
    - Layer Changesets for the media type `application/vnd.oci.image.layer.v1.tar` MUST be packaged in tar archive.

#### Change Types

Types of changes that can occur in a changeset are:

- Additions
- Modifications
- Removals

#### JSON

- Each image has an associated JSON structure that describes some basic information about the image, such as date created, author, as well as execution/runtime configuration like its entrypoint, default arguments, networking, and volumes..
- The JSON structure also references a cryptographic hash of each layer used by the image, and provides history information for those layers.
- This JSON is considered to be immutable because changing it would change the computed ImageID.
- Changing it means creating a new derived image, instead of changing the existing image.

#### Layer DiffID

- A layer DiffID is the digest over the layer's uncompressed tar archive and serialized in the descriptor digest format.

#### Chain ID

- It is sometimes useful to refer to a stack of layers with a single identifier.
While a layer's `DiffID` identifies a single changeset, the `ChainID` identifies the subsequent application of those changesets.

#### Image ID

- Each image's ID is given by the SHA256 hash of its [configuration JSON](https://github.com/opencontainers/image-spec/blob/main/config.md#image-json).

### Properties

- `created` A combined date and time at which the image was created
- `author` Gives the name and/or email address of the person or entity that created and is responsible for maintaining the image.
- `architecture` The CPU architecture on which the binaries in this image are built to run.
- `os` The name of the operating system on which the image is built to run.
- `os.version` This property specifies the version of the operating system targeted by the referenced blob.
- `os.features` This property specifies an array of strings, each specifying a mandatory OS feature.
- `variant` The variant of the specified CPU architecture.
- `config` The execution parameters that SHOULD be used as a base when running a container using the image.
    - `User` The username or UID which is a platform-specific structure that allows specific control over which user the process runs as.
    - `ExposedPorts` A set of ports to expose from a container running this image. Its keys can be in the format of:`port/tcp`, `port/udp`, `port` With the default protocol being `tcp` if not specified.
    - `Env` Entries are in the format of `VARNAME=VARVALUE`. These values act as defaults and are merged with any specified when creating a container.
    - `Entrypoint` A list of arguments to use as the command to execute when the container starts. These values act as defaults and may be replaced by an entrypoint specified when creating a container.
    - `Cmd` Default arguments to the entrypoint of the container. If an `Entrypoint` value is not specified, then the first entry of the `Cmd` array SHOULD be interpreted as the executable to run.
    - `Volumes` A set of directories describing where the process is likely to write data specific to a container instance.
    - `WorkingDir` Sets the current working directory of the entrypoint process in the container. This value acts as a default and may be replaced by a working directory specified when creating a container.
    - `Labels` This field contains arbitrary metadata for the container.
    - `StopSignal` This field contains the system call signal that will be sent to the container to exit.
- `rootfs` The rootfs key references the layer content addresses used by the image. This makes the image config hash depend on the filesystem hash.
    - `type` MUST be set to `layers`.
    - `diff_ids` An array of layer content hashes (`DiffIDs`), in order from first to last.
- `history` Describes the history of each layer. The array is ordered from first to last.
    - `created` A combined date and time at which the layer was created.
    - `author` The author of the build point.
    - `created_by` The command that created the layer.
    - `comment` A custom message set when creating the layer.
    - `empty_layer` This field is used to mark if the history item created a filesystem diff. It is set to true if this history item doesn't correspond to an actual layer in the rootfs section

# **Conversion to OCI Runtime Configuration**

When extracting an OCI Image into an OCI Runtime bundle, two orthogonal components of the extraction are relevant:

1. Extraction of the root filesystem from the set of filesystem layers.
2. Conversion of the image configuration blob to an OCI Runtime configuration blob.

- All the necessary system libraries and dependencies of the application are referenced as **layers**.

> *image manifest*, specifies the CPU architecture for which the previous two elements are suitable.
*image index*, which contains information about a set of images that can span a variety of architectures and operating systems
> 

> A file system is a structure used by an operating system to organise and manage files on a storage device such as a hard drive, solid state drive (SSD), or USB flash drive. It defines how data is stored, accessed, and organised on the storage device. 
Common File Systems:
- FAT (File Allocation Table), FAT16, FAT32
- exFAT (Extended File Allocation Table)
- NTFS (New Technology File System)
- APFS (Apple File System)
- HFS, HFS+ (Hierarchical File System)
- Ext4 (Fourth Extended File System)
> 

> BLOB stands for a “Binary Large Object,” a data type that stores binary data. Binary Large Objects (BLOBs) can be complex files like images or videos, unlike other data strings that only store letters and numbers. A BLOB will hold **multimedia objects** to add to a database.
> 

> An archive file stores the content of one or more computer files, possibly compressed and/or encrypted, with associated metadata such as file name, directory structure, error detection and correction information, and commentary. 
In computing, **tar**  is a shell command for combining multiple computer files into a single archive file. A tarball contains metadata for the contained files including the name, ownership, timestamps, permissions and directory organization. 

**A changeset describes the exact differences between two successive versions in the version control system's repository of changes.**
>

# Dockerfile Commands

## ARG

- Use build-time variables.
- The `ARG` instruction defines a variable that users can pass at build-time to the builder with the `docker build` command using the `--build-arg <varname>=<value>`flag.
- `ARG` variables are not persisted into the built image
- An `ARG` variable comes into effect from the line on which it is declared in the Dockerfile.

Predefined ARG variables that you can use without a corresponding `ARG` instruction in the Dockerfile:

- `HTTP_PROXY`
- `http_proxy`
- `HTTPS_PROXY`
- `https_proxy`
- `FTP_PROXY`
- `ftp_proxy`
- `NO_PROXY`
- `no_proxy`
- `ALL_PROXY`
- `all_proxy`

> BuildKit also provides some global and inbuild arguments, refer: https://docs.docker.com/reference/dockerfile/#automatic-platform-args-in-the-global-scope
> 

## **ENV**

- Set environment variable
- The `ENV` instruction sets the environment variable `<key>` to the value`<value>`.
- Unlike an `ARG` instruction, `ENV` values are always persisted in the built image.
- The environment variables set using `ENV` will persist when a container is run from the resulting image.

```docker
#ENV Key Value
ENV NAME World
```

## **FROM**

- Create a new build stage from a base image.
- The FROM instruction initializes a new build stage and sets the base image for subsequent instructions.
- Specifies the base image to build upon.

```docker
FROM [--platform=<platform>] <image> [AS <name>]

FROM [--platform=<platform>] <image>[:<tag>] [AS <name>]

FROM [--platform=<platform>] <image>[@<digest>] [AS <name>]
```

## HEALTHCHECK

- Check a container's health on startup.
- The `HEALTHCHECK` instruction tells Docker how to test a container to check that it's still working.
- Example for health check: A web server stuck in an infinite loop and unable to handle new connections should show unhealthy.
- There can only be one `HEALTHCHECK` instruction in a Dockerfile.
- The `HEALTHCHECK` instruction has two forms:
    - `HEALTHCHECK [OPTIONS] CMD command` (check container health by running a command inside the container)
    - `HEALTHCHECK NONE` (disable any healthcheck inherited from the base image)

```docker
#check every five minutes or so that a web-server is able to serve the site's main page within three seconds

HEALTHCHECK --interval=5m --timeout=3s CMD curl -f http://localhost/ || exit 1
```

## LABEL

- Add metadata to an image.
- The `LABEL` instruction adds metadata to an image.
- A `LABEL` is a key-value pair.

```docker
LABEL <key>=<value> [<key>=<value>...]
```

## ONBUILD

- Specify instructions for when the image is used in a build.
- The `ONBUILD` instruction adds to the image a trigger instruction to be executed at a later time, when the image is used as the base for another build.
- The trigger will be executed in the context of the downstream build, as if it had been inserted immediately after the `FROM` instruction in the downstream Dockerfile.
- Use case: An application build environment or a daemon which may be customized with user-specific configuration.

```docker
ONBUILD <INSTRUCTION>
```

## **WORKDIR**

- Change working directory.
- The `WORKDIR` instruction sets the working directory for any `RUN`, `CMD`, `ENTRYPOINT`, `COPY` and `ADD` instructions that follow it in the Dockerfile.
- If the `WORKDIR` doesn't exist, it will be created even if it's not used in any subsequent Dockerfile instruction.
- Sets the working directory inside the container.

```docker
WORKDIR /path/to/workdir
```

Example of WORKDIR

```docker
WORKDIR /a
WORKDIR b
WORKDIR c
RUN pwd
#will result in a/b/c
```

## **COPY**

- Copy files and directories.
- The `COPY` instruction copies new files or directories from `<src>` and adds them to the filesystem of the image at the path `<dest>`.
- **All files and directories copied from the build context are created with a UID and GID of `0`**

```docker
COPY [OPTIONS] <src> ... <dest>
COPY [OPTIONS] ["<src>", ... "<dest>"]
```

- The `COPY --from` flag lets you copy files from an image, a build stage, or a named context instead.
- The `--chown` and `--chmod` features are only supported on Dockerfiles used to build Linux containers.
- Use `--link` to reuse already built layers in subsequent builds with `--cache-from` even if the previous layers have changed.
- The `--exclude` flag lets you specify a path expression for files to be excluded.

## ADD

- Add local or remote files and directories.
- The `ADD` instruction copies new files or directories from `<src>` and adds them to the filesystem of the image at the path `<dest>`.
- Files and directories can be copied from the build context, a remote URL, or a Git repository.
- If the source is a directory, the contents of the directory are copied, including filesystem metadata. The directory itself isn't copied, only its contents.
    - If it contains subdirectories, these are also copied and merged with any existing directories at the destination.
- **If the destination path begins with a forward slash, it's interpreted as an absolute path**

```docker
ADD [OPTIONS] <src> ... <dest>
ADD [OPTIONS] ["<src>", ... "<dest>"]
```

- `--checksum` flag lets you verify the checksum of a remote resource.
- The `--chown` and `--chmod` features are only supported on Dockerfiles used to build Linux containers.`--chown=myuser:mygroup --chmod=644 files* /somedir/`
- `--link` files remain independent on their own layer and don't get invalidated when commands on previous layers are changed.
- `--exclude` flag lets you specify a path expression for files to be excluded.

> `COPY` supports basic copying of files into the container, from the build context or from a stage in a multi-stage build.
`ADD` supports features for fetching files from remote HTTPS and Git URLs, and extracting tar files automatically when adding files from the build context.
> 

## **RUN**

- Execute build commands.
- The `RUN` instruction will execute any commands to create a new layer on top of the current image.
- The cache for `RUN` instructions isn't invalidated automatically during the next build.
- The cache for `RUN` instructions can be invalidated by using the `--no-cache`flag, for example `docker build --no-cache`
    - The cache for `RUN` instructions can be invalidated by `ADD` and `COPY` instructions.

```docker
# Shell form:
RUN [OPTIONS] <command> ...

# Exec form:
RUN [OPTIONS] [ "<command>", ... ]
```

- `RUN --mount` allows you to create filesystem mounts that the build can access. This can be used to:
    - **Create a bind mount** to the host filesystem or other build stages
    - Access build secrets or ssh-agent sockets
    - Use a **persistent package management cache** to speed up your build
    - Different mount type:
        - `bind` This mount type allows binding files or directories to the build container. A bind mount is read-only by default.
        - `cache` This mount type allows the build container to cache directories for compilers and package managers.
        - `tmpfs` This mount type allows mounting `tmpfs` in the build container
        - `secret` This mount type allows the build container to access secret values, such as tokens or private keys, without baking them into the image.
        - `ssh` This mount type allows the build container to access SSH keys via SSH agents, with support for passphrases.
        - Refer to other optional parameters https://docs.docker.com/reference/dockerfile/#run---mount
    - `RUN --network` allows control over which networking environment the command is run in.
    - The supported network types are:
        - `default` Equivalent to not supplying a flag at all, the command is run in the default network for the build.
        - `none` The command is run with no network access (`lo` is still available, but is isolated to this process)
        - `host` The command is run in the host's network environment (similar to `docker build --network=host`, but on a per-instruction basis)

## SHELL

- Set the default shell of an image.
- The `SHELL` instruction allows the default shell used for the shell form of commands to be overridden.

```docker
SHELL ["executable", "parameters"]
```

## STOPSIGNAL

- Specify the system call signal for exiting a container.
- The `STOPSIGNAL` instruction sets the system call signal that will be sent to the container to exit.

```docker
STOPSIGNAL signal
```

## USER

- Set user and group ID.
- The `USER` instruction sets the user name (or UID) and optionally the user group (or GID) to use as the default user and group for the remainder of the current stage.
- The specified user is used for `RUN` instructions and at runtime, runs the relevant `ENTRYPOINT` and `CMD` commands.
- When the user doesn't have a primary group then the image (or the next instructions) will be run with the `root` group.

```docker
USER <user>[:<group>]

USER <UID>[:<GID>]
```

## VOLUME

- Create volume mounts.
- Volumes are persistent data stores for containers, created and managed by Docker.
- The `VOLUME` instruction creates a mount point with the specified name and marks it as holding externally mounted volumes from native host or other containers.
- They retain data even after the containers using them are removed.
- This is similar to the way that **bind mounts work**, except that volumes are managed by Docker and are isolated from the core functionality of the host machine.
- Volumes are the preferred mechanism for persisting data generated by and used by Docker containers.

```docker
VOLUME ["/data"]
```

## **CMD**

- Specify default commands.
- The CMD instruction sets the command to be executed when running a container from an image.
- There can only be one `CMD` instruction in a Dockerfile.
- The purpose of a `CMD` is to provide defaults for an executing container. These defaults can include an executable, or they can omit the executable, in which case you must specify an `ENTRYPOINT` instruction as well.
- If the user specifies arguments to `docker run`then they will override the default specified in `CMD`, but still use the default `ENTRYPOINT`.

```docker
#exec form
CMD ["executable","param1","param2"]

#exec form with default parameters to ENTRYPOINT
CMD ["param1","param2"]

#shell form; avoid this
CMD command param1 param2
```

## ENTRYPOINT

- Specify default executable.
- An ENTRYPOINT allows you to configure a container that will run as an executable
- ENTRYPOINT should be used when you want to define a container’s main application or command, ensuring it always runs regardless of additional CMD parameters
- `ENTRYPOINT` should be defined when using the container as an executable.
- `CMD` should be used as a way of defining default arguments for an `ENTRYPOINT` command or for executing an ad-hoc command in a container.

```docker
#exec form
ENTRYPOINT ["executable", "param1", "param2"]

#shell form
ENTRYPOINT command param1 param2
```

> - Dockerfile should specify **at least** one of `CMD` or `ENTRYPOINT` commands.
-`ENTRYPOINT` should be defined when using the container as an executable.
> 

## **EXPOSE**

- Describe which ports your application is listening on.
- The EXPOSE instruction informs Docker that the container listens on the specified network ports at runtime.
- When creating a container image, the `EXPOSE` Instruction is used to indicate that the packaged application will use the specified port.
- **These ports aren't published by default.**
- It functions as a type of documentation between the person who builds the image and the person who runs the container, about which ports are intended to be published.
- The following flags can be used with `docker run`
    - With the `-P` or `--publish-all` flag, you can automatically publish all exposed ports to ephemeral ports.
    - `-p` or `--expose` Publish port.
    - `-P` or `--publish-all` Publish all exposed ports.
- Without `EXPOSE` command in Dockerfile and running `docker run` without specifying `-p HOST_PORT:CONTAINER_PORT`
    - The Docker container is not accessible. The `docker container ps -a` does not show any port mapping.
- With `EXPOSE` command in Dockerfile and running `docker run` without specifying `-p HOST_PORT:CONTAINER_PORT`
    - The Docker container is not accessible. The `docker container ps -a` shows the port specified on `EXPOSE` It should be accessible internally.
- Without `EXPOSE` command in Dockerfile and running `docker run` with specifying `-p HOST_PORT:CONTAINER_PORT`
    - The Docker container is accessible on the host port `HOST_PORT`
    - Specifying `-p port` Docker assigns a randomly generated host port. The mapping is `random host post -> port` found in the `docker container ps -a` . The `-p port` should be the port the underlying service is listening on. The Docker container is accessible.
    - Specifying `-P` the `docker container ps -a` does not specify any port since `EXPOSE` command is not used in the Dockerfile. The Docker container is not accessible.
- With `EXPOSE` command in Dockerfile and running `docker run` with specifying `-p HOST_PORT:CONTAINER_PORT`
    - Specifying the same port on `EXPOSE HOST_PORT`  and a host port in `docker run -p HOST_PORT:CONTAINER_PORT` . The container is accessible on the host port `HOST_PORT`
    - Specifying a different port on `EXPOSE **SOME_PORT**`  and a host port in `docker run -p HOST_PORT:CONTAINER_PORT` . The container is accessible on the host port `HOST_PORT`
    - Specifying `-P` the docker service is accessible on a random port which can be gotten from `docker container ps -a`

> When mapping with `-p HOST_PORT:CONTAINER_PORT` it is important to note that the underlying service is running on the `CONTAINER_PORT` . If the underlying service is listening on port `90` but the `docker run` command specifies `-p 8080:80` you cannot access the service the mapping should be `-p 8080:90` .
> 

```docker
EXPOSE <port> [<port>/<protocol>...]
```

# References

- https://spacelift.io/blog/docker-entrypoint-vs-cmd
- https://docs.docker.com/reference/dockerfile/
- https://docs.docker.com/reference/api/engine/version/v1.51/
- https://spacelift.io/blog/docker-commands-cheat-sheet
- https://spacelift.io/blog/docker-entrypoint-vs-cmd
- https://docs.docker.com/reference/dockerfile/
- https://docs.docker.com/reference/api/engine/version/v1.51/
- https://docs.docker.com/reference/cli/dockerd#description
- https://docs.docker.com/build/concepts/context/#what-is-a-build-context
- https://spacelift.io/blog/docker-commands-cheat-sheet
- https://docs.docker.com/engine/storage/
- https://docs.docker.com/engine/storage/volumes/
- https://pythonspeed.com/articles/multi-stage-docker-python/
- https://www.vmware.com/topics/virtual-machine
- https://www.redhat.com/en/topics/containers
- https://www.docker.com/resources/what-container/
- https://opencontainers.org/about/overview/
- https://github.com/opencontainers/runtime-spec
- https://github.com/opencontainers/runtime-spec/blob/main/schema/config-schema.json