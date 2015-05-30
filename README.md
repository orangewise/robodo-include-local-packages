# robodo:include-local-packages
Include private packages in your meteor app `packages` in order to deploy easily to scalingo.

This is a debugOnly package, it does not compile to production code.


# Installation

```
meteor add robodo:include-local-packages
```

Point your PACKAGES_DIRS environment variable to your private packages folder on your computer.


# Usage

After adding the package and starting your app, a new file is added: include-local-packages

List your private packages in this file (make sure to add an extra line at the bottom). 

Example include-local-packages file:

```
robodo:meteor-debug
robodo:masonrify

```

The packages syncs and watches your local private packages that you maintain in your $PACKAGES_DIRS folder to your app/packages folder.

# License

The code is licensed under the [MIT License](LICENSE).