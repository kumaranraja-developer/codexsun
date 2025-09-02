// // somewhere in setup/tests
// import { User } from "../apps/user/User.model.js";
// import { userTableDef } from "../apps/user/User.schema.js";
// import Builder from "../cortex/migration/Builder.js";
//
// // Pick a driver: "sqlite" | "postgres" | "mariadb"
// const sqlite = new Builder("sqlite");
// const postgres = new Builder("postgres");
// const mariadb = new Builder("mariadb");
//
// // Generate SQL & attach JSON schema for each dialect if needed
// const sqliteSQL = initSchemaFromDSL(User, sqlite, userTableDef);
// const pgSQL = initSchemaFromDSL(User, postgres, userTableDef);
// const mariaSQL = initSchemaFromDSL(User, mariadb, userTableDef);
//
// console.log(sqliteSQL);
// console.log(User._schema); // { name, columns, constraints }
