"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _typeorm = require("typeorm");

var _UserCard = _interopRequireDefault(require("./UserCard"));

var _Room = _interopRequireDefault(require("./Room"));

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }

let User = (_dec = (0, _typeorm.Index)("user_rooms_users_id_fk", ["room_id"], {}), _dec2 = (0, _typeorm.Entity)("user"), _dec3 = (0, _typeorm.PrimaryGeneratedColumn)(), _dec4 = Reflect.metadata("design:type", String), _dec5 = (0, _typeorm.Column)(), _dec6 = Reflect.metadata("design:type", String), _dec7 = (0, _typeorm.Column)(), _dec8 = Reflect.metadata("design:type", String), _dec9 = (0, _typeorm.Column)({
  nullable: true
}), _dec10 = Reflect.metadata("design:type", String), _dec11 = (0, _typeorm.Column)({
  default: false
}), _dec12 = Reflect.metadata("design:type", Boolean), _dec13 = (0, _typeorm.Column)({
  default: false
}), _dec14 = Reflect.metadata("design:type", Boolean), _dec15 = (0, _typeorm.Column)({
  default: 0
}), _dec16 = Reflect.metadata("design:type", Number), _dec17 = (0, _typeorm.OneToMany)(() => _UserCard.default, card => card.user), _dec18 = Reflect.metadata("design:type", Array), _dec19 = (0, _typeorm.CreateDateColumn)(), _dec20 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec21 = (0, _typeorm.ManyToOne)(() => _Room.default, user => user.users, {
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
}), _dec22 = (0, _typeorm.JoinColumn)([{
  name: "room_id",
  referencedColumnName: "id"
}]), _dec23 = Reflect.metadata("design:type", typeof _Room.default === "undefined" ? Object : _Room.default), _dec(_class = _dec2(_class = (_class2 = class User {
  constructor() {
    _initializerDefineProperty(this, "id", _descriptor, this);

    _initializerDefineProperty(this, "username", _descriptor2, this);

    _initializerDefineProperty(this, "room_id", _descriptor3, this);

    _initializerDefineProperty(this, "avatar", _descriptor4, this);

    _initializerDefineProperty(this, "doubt", _descriptor5, this);

    _initializerDefineProperty(this, "pass", _descriptor6, this);

    _initializerDefineProperty(this, "coins", _descriptor7, this);

    _initializerDefineProperty(this, "cards", _descriptor8, this);

    _initializerDefineProperty(this, "created_at", _descriptor9, this);

    _initializerDefineProperty(this, "room", _descriptor10, this);
  }

}, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec3, _dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "username", [_dec5, _dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "room_id", [_dec7, _dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "avatar", [_dec9, _dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "doubt", [_dec11, _dec12], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "pass", [_dec13, _dec14], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "coins", [_dec15, _dec16], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "cards", [_dec17, _dec18], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "created_at", [_dec19, _dec20], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "room", [_dec21, _dec22, _dec23], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
})), _class2)) || _class) || _class);
exports.default = User;