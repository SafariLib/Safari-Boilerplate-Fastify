# Tests and Debug

## Debug

To use the debugger with VSCode, launch configuration must listen port **9229**.

There is a **debug** folder with an [**undici**](https://github.com/nodejs/undici) config. Use `mjs` scripts to use this with the following npm script:

```
npm run docker:debug
```

See [package.json](../package.json) scripts for further informations.

:warning: **Tap** tests wont trigger the debugger as server injection isn't for debugging purposes. Use the debug folder with scripts and thunderclient to achieve that.

-   [tap documentation](https://node-tap.org/basics/)
-   [Thunder-client documentation](https://github.com/rangav/thunder-client-support#thunder-client)
