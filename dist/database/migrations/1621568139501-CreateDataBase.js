"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CreateDataBase1621568139501 = void 0;

class CreateDataBase1621568139501 {
  constructor() {
    this.name = 'CreateDataBase1621568139501';
  }

  async up(queryRunner) {
    await queryRunner.query(`CREATE TABLE "user_card" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "user_id" integer NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')))`);
    await queryRunner.query(`CREATE INDEX "user_cards_users_id_fk" ON "user_card" ("user_id") `);
    await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar NOT NULL, "room_id" integer NOT NULL, "avatar" varchar, "doubt" boolean NOT NULL DEFAULT (0), "pass" boolean NOT NULL DEFAULT (0), "coins" integer NOT NULL DEFAULT (0), "created_at" datetime NOT NULL DEFAULT (datetime('now')))`);
    await queryRunner.query(`CREATE INDEX "user_rooms_users_id_fk" ON "user" ("room_id") `);
    await queryRunner.query(`CREATE TABLE "room" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "waiting" boolean NOT NULL DEFAULT (0), "round" integer NOT NULL DEFAULT (0), "created_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_535c742a3606d2e3122f441b26c" UNIQUE ("name"))`);
    await queryRunner.query(`CREATE TABLE "card" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "room_id" integer NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')))`);
    await queryRunner.query(`CREATE INDEX "room_cards_room_id_fk" ON "card" ("room_id") `);
    await queryRunner.query(`DROP INDEX "user_cards_users_id_fk"`);
    await queryRunner.query(`CREATE TABLE "temporary_user_card" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "user_id" integer NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_d7fa5bc81ffc9708abd2d210c4a" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`);
    await queryRunner.query(`INSERT INTO "temporary_user_card"("id", "name", "user_id", "created_at", "updated_at") SELECT "id", "name", "user_id", "created_at", "updated_at" FROM "user_card"`);
    await queryRunner.query(`DROP TABLE "user_card"`);
    await queryRunner.query(`ALTER TABLE "temporary_user_card" RENAME TO "user_card"`);
    await queryRunner.query(`CREATE INDEX "user_cards_users_id_fk" ON "user_card" ("user_id") `);
    await queryRunner.query(`DROP INDEX "user_rooms_users_id_fk"`);
    await queryRunner.query(`CREATE TABLE "temporary_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar NOT NULL, "room_id" integer NOT NULL, "avatar" varchar, "doubt" boolean NOT NULL DEFAULT (0), "pass" boolean NOT NULL DEFAULT (0), "coins" integer NOT NULL DEFAULT (0), "created_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_9416d08fb276a62be271c9a3c21" FOREIGN KEY ("room_id") REFERENCES "room" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`);
    await queryRunner.query(`INSERT INTO "temporary_user"("id", "username", "room_id", "avatar", "doubt", "pass", "coins", "created_at") SELECT "id", "username", "room_id", "avatar", "doubt", "pass", "coins", "created_at" FROM "user"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`);
    await queryRunner.query(`CREATE INDEX "user_rooms_users_id_fk" ON "user" ("room_id") `);
    await queryRunner.query(`DROP INDEX "room_cards_room_id_fk"`);
    await queryRunner.query(`CREATE TABLE "temporary_card" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "room_id" integer NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_56773454942870c419a066115d3" FOREIGN KEY ("room_id") REFERENCES "room" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`);
    await queryRunner.query(`INSERT INTO "temporary_card"("id", "name", "room_id", "created_at", "updated_at") SELECT "id", "name", "room_id", "created_at", "updated_at" FROM "card"`);
    await queryRunner.query(`DROP TABLE "card"`);
    await queryRunner.query(`ALTER TABLE "temporary_card" RENAME TO "card"`);
    await queryRunner.query(`CREATE INDEX "room_cards_room_id_fk" ON "card" ("room_id") `);
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP INDEX "room_cards_room_id_fk"`);
    await queryRunner.query(`ALTER TABLE "card" RENAME TO "temporary_card"`);
    await queryRunner.query(`CREATE TABLE "card" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "room_id" integer NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')))`);
    await queryRunner.query(`INSERT INTO "card"("id", "name", "room_id", "created_at", "updated_at") SELECT "id", "name", "room_id", "created_at", "updated_at" FROM "temporary_card"`);
    await queryRunner.query(`DROP TABLE "temporary_card"`);
    await queryRunner.query(`CREATE INDEX "room_cards_room_id_fk" ON "card" ("room_id") `);
    await queryRunner.query(`DROP INDEX "user_rooms_users_id_fk"`);
    await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`);
    await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar NOT NULL, "room_id" integer NOT NULL, "avatar" varchar, "doubt" boolean NOT NULL DEFAULT (0), "pass" boolean NOT NULL DEFAULT (0), "coins" integer NOT NULL DEFAULT (0), "created_at" datetime NOT NULL DEFAULT (datetime('now')))`);
    await queryRunner.query(`INSERT INTO "user"("id", "username", "room_id", "avatar", "doubt", "pass", "coins", "created_at") SELECT "id", "username", "room_id", "avatar", "doubt", "pass", "coins", "created_at" FROM "temporary_user"`);
    await queryRunner.query(`DROP TABLE "temporary_user"`);
    await queryRunner.query(`CREATE INDEX "user_rooms_users_id_fk" ON "user" ("room_id") `);
    await queryRunner.query(`DROP INDEX "user_cards_users_id_fk"`);
    await queryRunner.query(`ALTER TABLE "user_card" RENAME TO "temporary_user_card"`);
    await queryRunner.query(`CREATE TABLE "user_card" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "user_id" integer NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')))`);
    await queryRunner.query(`INSERT INTO "user_card"("id", "name", "user_id", "created_at", "updated_at") SELECT "id", "name", "user_id", "created_at", "updated_at" FROM "temporary_user_card"`);
    await queryRunner.query(`DROP TABLE "temporary_user_card"`);
    await queryRunner.query(`CREATE INDEX "user_cards_users_id_fk" ON "user_card" ("user_id") `);
    await queryRunner.query(`DROP INDEX "room_cards_room_id_fk"`);
    await queryRunner.query(`DROP TABLE "card"`);
    await queryRunner.query(`DROP TABLE "room"`);
    await queryRunner.query(`DROP INDEX "user_rooms_users_id_fk"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP INDEX "user_cards_users_id_fk"`);
    await queryRunner.query(`DROP TABLE "user_card"`);
  }

}

exports.CreateDataBase1621568139501 = CreateDataBase1621568139501;