"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _typeorm = require("typeorm");

var _UserCard = _interopRequireDefault(require("../entities/UserCard"));

var _dec, _class;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let UserCardRepository = (_dec = (0, _typeorm.EntityRepository)(_UserCard.default), _dec(_class = class UserCardRepository extends _typeorm.Repository {}) || _class);
exports.default = UserCardRepository;