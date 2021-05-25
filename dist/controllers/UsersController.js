"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _UsersService = _interopRequireDefault(require("../services/UsersService"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class UsersController {
  async create(request, response) {
    const {
      email
    } = request.body;
    const usersService = new _UsersService.default();
    const user = await usersService.create(email);
    return response.json(user);
  }

}

exports.default = UsersController;