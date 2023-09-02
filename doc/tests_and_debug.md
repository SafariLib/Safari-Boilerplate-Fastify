# Tests and Debug

## Debug

To use the debugger with VSCode, launch configuration must listen port **9229**.

There is a **debug** folder with an [**undici**](https://github.com/nodejs/undici) config wrapped in the [index.mjs](../debug/index.mjs) file. Update this file and launch the following script to debug the App:

```
npm run docker:debug
```

See [package.json](../package.json) scripts for further informations.

:warning: **Jest** tests wont trigger the debugger on _asynchronous tests_, create `.mjs` scripts or use **Postman** to debug the App.

## Tests
