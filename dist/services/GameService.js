"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _typeorm = require("typeorm");

var _AppError = _interopRequireDefault(require("../errors/AppError"));

var _RoomsRepository = _interopRequireDefault(require("../repositories/RoomsRepository"));

var _UsersRepository = _interopRequireDefault(require("../repositories/UsersRepository"));

var _utils = require("../../src/utils");

var _UserCardRepository = _interopRequireDefault(require("../../src/repositories/UserCardRepository"));

var _CardsRepository = _interopRequireDefault(require("../../src/repositories/CardsRepository"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class GameService {
  constructor() {
    this.usersRepository = void 0;
    this.roomsRepository = void 0;
    this.userCardRepository = void 0;
    this.cardsRepository = void 0;
    this.usersRepository = (0, _typeorm.getCustomRepository)(_UsersRepository.default);
    this.roomsRepository = (0, _typeorm.getCustomRepository)(_RoomsRepository.default);
    this.userCardRepository = (0, _typeorm.getCustomRepository)(_UserCardRepository.default);
    this.cardsRepository = (0, _typeorm.getCustomRepository)(_CardsRepository.default);
  }

  embaralhar(cartasParaEmbaralhar) {
    for (var j, x, i = cartasParaEmbaralhar.length; i; j = Math.floor(Math.random() * i), x = cartasParaEmbaralhar[--i], cartasParaEmbaralhar[i] = cartasParaEmbaralhar[j], cartasParaEmbaralhar[j] = x);

    return cartasParaEmbaralhar;
  }

  async mountDeck(jogadores, room_id) {
    const existCards = await this.cardsRepository.find({
      where: {
        room_id
      }
    });

    if (existCards) {
      existCards.map(async card => {
        return await this.cardsRepository.remove(card);
      });
    }

    let baralho = [];

    if (jogadores >= 3 && jogadores <= 6) {
      _utils.cartas.map(async carta => {
        let i = 0;

        while (i < 3) {
          baralho.push(carta);
          i++;
        }
      });
    } else if (jogadores === 7 || jogadores === 8) {
      _utils.cartas.map(async carta => {
        let i = 0;

        while (i < 4) {
          baralho.push(carta);
          i++;
        }
      });
    } else if (jogadores === 9 || jogadores === 10) {
      _utils.cartas.map(async carta => {
        let i = 0;

        while (i < 5) {
          baralho.push(carta);
          i++;
        }
      });
    } else {
      throw new _AppError.default("Só pode iniciar um jogo com 3 até 10 jogadores.");
    }

    const mixedDeck = this.embaralhar(baralho);
    mixedDeck.map(async carta => {
      const card = this.cardsRepository.create({
        name: carta,
        room_id
      });
      await this.cardsRepository.save(card);
    });
    const cards = await this.cardsRepository.find({
      where: {
        room_id
      }
    });
    return cards;
  }

  async comprar(user_id, qtd, room_id) {
    const existCards = await this.cardsRepository.find({
      where: {
        room_id
      }
    });
    let i = 0;

    while (i < qtd) {
      const currentCard = this.userCardRepository.create({
        name: existCards[i].name,
        user_id
      });
      await this.userCardRepository.save(currentCard);
      await this.cardsRepository.remove(existCards[i]);
      i++;
    }
  }

  devolver(user_id, cartaParaDevolver) {// return baralhoAtual.push(cartaParaDevolver);
  }

  async create({
    sala_id,
    user_id
  }) {
    const room = await this.roomsRepository.findOne({
      relations: ["users", "users.cards"],
      where: {
        id: sala_id
      }
    });

    if (!room) {
      throw new _AppError.default("Sala não existe.");
    }

    if (String(room.users[0].id) !== String(user_id)) {
      throw new _AppError.default("Apenas o criador da sala pode iniciar a partida.");
    }

    const deck = await this.mountDeck(room.users.length, sala_id);
    let i = 0;

    while (i < room.users.length) {
      if (room.users[i].cards.length > 0) {
        room.users[i].cards.map(async card => await this.userCardRepository.remove(card));
      }

      await this.comprar(room.users[i].id, 2, sala_id);
      i++;
    } // room.users.map(async (usuario, index) => {
    //   if (usuario.cards.length > 0) {
    //     usuario.cards.map(
    //       async (card) => await this.userCardRepository.remove(card)
    //     );
    //   }
    //   await this.comprar(usuario.id, 2, sala_id);
    // });


    room.round = 1;
    await this.roomsRepository.save(room);
    return room;
  }

  async action({
    sala_id,
    user_id
  }) {}

}

exports.default = GameService;