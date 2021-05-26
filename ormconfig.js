module.exports = {
  type: "sqlite",
  database: "./src/database/database.sqlite",
  migrations: ["./src/database/migrations/**.ts"],
  entities: ["./src/entities/**.ts"],
  cli: {
    migrationsDir: "./src/database/migrations",
  },
  // type: "sqlite",
  // database: "./dist/database/database.sqlite",
  // migrations: ["./dist/database/migrations/**.js"],
  // entities: ["./dist/entities/**.js"],
  // cli: {
  //   migrationsDir: "./dist/database/migrations",
  // },
};
