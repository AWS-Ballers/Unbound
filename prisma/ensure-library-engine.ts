/** Must load before `@prisma/client` so CLI scripts use the Node engine, not the edge/WASM bundle. */
process.env.PRISMA_CLIENT_ENGINE_TYPE ??= "library";
