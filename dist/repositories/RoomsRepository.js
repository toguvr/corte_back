"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _typeorm = require("typeorm");

var _Room = _interopRequireDefault(require("../entities/Room"));

var _dec, _class;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let RoomsRepository = (_dec = (0, _typeorm.EntityRepository)(_Room.default), _dec(_class = class RoomsRepository extends _typeorm.Repository {}) || _class);
exports.default = RoomsRepository;