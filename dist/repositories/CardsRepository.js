"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _typeorm = require("typeorm");

var _Card = _interopRequireDefault(require("../../src/entities/Card"));

var _dec, _class;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let CardsRepository = (_dec = (0, _typeorm.EntityRepository)(_Card.default), _dec(_class = class CardsRepository extends _typeorm.Repository {}) || _class);
exports.default = CardsRepository;