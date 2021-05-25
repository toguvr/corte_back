"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _typeorm = require("typeorm");

var _AppError = _interopRequireDefault(require("../errors/AppError"));

var _RoomsRepository = _interopRequireDefault(require("../repositories/RoomsRepository"));

var _UsersRepository = _interopRequireDefault(require("../repositories/UsersRepository"));

var _utils = require("../utils");

var _UserCardRepository = _interopRequireDefault(require("../repositories/UserCardRepository"));

var _CardsRepository = _interopRequireDefault(require("../repositories/CardsRepository"));

var _http = require("../http");

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

  async killCard(victim_id) {
    const victim = await this.usersRepository.findOne({
      where: {
        id: victim_id
      }
    });

    if (!victim) {
      throw new _AppError.default("Usuário não está mais nesta sala.");
    }

    const cards = await this.userCardRepository.find({
      where: {
        user_id: victim_id
      }
    });

    if (cards.length === 0) {
      throw new _AppError.default("Usuário já está morto.");
    }

    cards.length;
    const card = cards[Math.floor(Math.random() * (cards.length - 0)) + 0];
    await this.userCardRepository.remove(card);
    const totalCards = await this.userCardRepository.count({
      user_id: victim_id
    });

    if (totalCards === 0) {
      await this.usersRepository.remove(victim); // const room = await this.roomsRepository.findOne({
      //   relations: ["users"],
      //   where: { id: victim.room_id },
      // });
      // await this.nextRound(room.round, room.users.length);
    }
  }

  devolver(user_id, cartaParaDevolver) {// return baralhoAtual.push(cartaParaDevolver);
  }

  async turnDoubtsFalse(sala_id) {
    const room = await this.roomsRepository.findOne({
      relations: ["users", "users.cards"],
      where: {
        id: sala_id
      }
    });

    if (!room) {
      throw new _AppError.default("Sala não existe.");
    }

    let i = 0;

    while (i < room.users.length) {
      room.users[i].doubt = false;
      room.users[i].pass = false;
      await this.usersRepository.save(room.users[i]);
      i++;
    }
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

    await this.turnDoubtsFalse(sala_id);
    const deck = await this.mountDeck(room.users.length, sala_id);
    let i = 0;

    while (i < room.users.length) {
      room.users[i].coins = 0;
      await this.usersRepository.save(room.users[i]);

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

  nextRound(curentRound, userLength) {
    if (String(curentRound) === String(userLength)) {
      return 1;
    } else {
      return Number(curentRound) + 1;
    }
  }

  async action({
    sala_id,
    user_id,
    action,
    victim_id,
    doubtActionType
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

    const user = await this.usersRepository.findOne({
      relations: ["cards"],
      where: {
        id: user_id
      }
    });

    if (!user) {
      throw new _AppError.default("Usuário não existe.");
    }

    const playerRound = room.users.findIndex(user => String(user.id) === String(user_id));

    if (String(room.round) !== String(Number(playerRound) + 1)) {
      throw new _AppError.default("Não é sua vez.");
    }

    if (String(action) === "1") {
      user.coins = user.coins + 1;
      await this.usersRepository.save(user);
      room.round = this.nextRound(room.round, room.users.length);
      await this.roomsRepository.save(room);
    }

    if (String(action) === "2") {
      user.coins = user.coins + 2;
      await this.usersRepository.save(user);
      room.round = this.nextRound(room.round, room.users.length);
      room.waiting = false;
      await this.roomsRepository.save(room);
      await this.turnDoubtsFalse(sala_id);
    }

    if (String(action) === "3") {
      if (String(doubtActionType) === "0") {
        user.coins = user.coins + 3;
        await this.usersRepository.save(user);
      }

      if (String(doubtActionType) === "1") {
        const victim = await this.usersRepository.findOne({
          id: victim_id
        });

        if (!victim) {
          throw new _AppError.default("Vítima não existe.");
        }

        if (victim.coins < 2) {
          user.coins = user.coins + victim.coins;
          victim.coins = 0;
        } else {
          victim.coins = Number(victim.coins) - 2;
          user.coins = Number(user.coins) + 2;
        }

        await this.usersRepository.save(victim);
        await this.usersRepository.save(user);
      }

      if (String(doubtActionType) === "2") {
        const victim = await this.usersRepository.findOne({
          id: victim_id
        });

        if (!victim) {
          throw new _AppError.default("Vítima não existe.");
        }

        if (user.coins < 3) {
          throw new _AppError.default("Você não pode matar ninguém se não tiver 3 moedas.");
        }

        user.coins = Number(user.coins) - 3;
        await this.killCard(victim_id);
        await this.usersRepository.save(user);
      }

      if (String(doubtActionType) === "4") {
        if (Number(user.cards.length) < 1) {
          throw new _AppError.default("Você não pode trocar cartas se não tem nenhuma.");
        }

        const cardToRemoveFromHand = await this.userCardRepository.find({
          user_id
        });
        const deckCards = await this.cardsRepository.find({
          where: {
            room_id: sala_id
          },
          take: Number(cardToRemoveFromHand.length)
        });
        let i = 0;
        const totalCardsToBuy = Number(cardToRemoveFromHand.length);

        while (i < totalCardsToBuy) {
          await this.userCardRepository.remove(cardToRemoveFromHand[i]);
          const backCardToDeck = this.cardsRepository.create({
            name: cardToRemoveFromHand[i].name,
            room_id: sala_id
          });
          await this.cardsRepository.save(backCardToDeck);
          await this.cardsRepository.remove(deckCards[i]);
          const buyCardToHand = this.userCardRepository.create({
            name: deckCards[i].name,
            user_id
          });
          await this.userCardRepository.save(buyCardToHand);
          i++;
        }
      }
    }

    if (String(action) === "4") {
      if (Number(user.coins) < 7) {
        throw new _AppError.default("Você precisa de 7 moedas para esta ação.");
      }

      await this.killCard(victim_id);
      user.coins = user.coins - 7;
      await this.usersRepository.save(user);
      room.round = this.nextRound(room.round, room.users.length);
      await this.roomsRepository.save(room);
    }

    return room;
  }

  async actionDoubtBlock({
    sala_id,
    user_id,
    action,
    doubtActionType
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

    const user = await this.usersRepository.findOne({
      id: user_id
    });

    if (!user) {
      throw new _AppError.default("Usuário não existe.");
    }

    const playerRound = room.users.findIndex(user => String(user.id) === String(user_id));
    room.waiting = true;
    await this.roomsRepository.save(room);
    return user;
  }

  async actionDoubt({
    sala_id,
    user_id,
    action,
    doubtActionType
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

    const user = await this.usersRepository.findOne({
      id: user_id
    });

    if (!user) {
      throw new _AppError.default("Usuário não existe.");
    }

    const playerRound = room.users.findIndex(user => String(user.id) === String(user_id));

    if (String(room.round) !== String(Number(playerRound) + 1)) {
      throw new _AppError.default("Não é sua vez.");
    }

    room.waiting = true;
    await this.roomsRepository.save(room);
    return room;
  }

  async anserdoubt({
    sala_id,
    user_id,
    doubt
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

    const user = await this.usersRepository.findOne({
      id: user_id
    });

    if (!user) {
      throw new _AppError.default("Usuário não existe.");
    }

    if (doubt) {
      const userDoubt = await this.usersRepository.findOne({
        room_id: sala_id,
        doubt: true
      });

      if (userDoubt) {
        user.pass = true;
        await this.usersRepository.save(user);
        await this.turnDoubtsFalse(sala_id);
        throw new _AppError.default(`O ${userDoubt.username} duvidou primeiro. você apenas passará automaticamente.`);
      }

      user.doubt = true;
      await this.usersRepository.save(user);
      await this.turnDoubtsFalse(sala_id);

      _http.io.emit("2DoubtDuque", {
        action: 7,
        victim_id: room.users[Number(room.round) - 1].id,
        user_id,
        type: "block",
        username: user.username
      });

      return room;
    }

    user.pass = true;
    await this.usersRepository.save(user);
    const opponents = await this.usersRepository.find({
      where: {
        id: (0, _typeorm.Not)(room.users[Number(room.round) - 1].id),
        room_id: sala_id
      }
    });
    const allAnswer = opponents.every(user => {
      return user.pass === true || user.doubt === true;
    });

    if (allAnswer) {
      await this.action({
        sala_id,
        user_id: room.users[Number(room.round) - 1].id,
        action: 2,
        victim_id: null,
        doubtActionType: null
      });

      _http.io.emit("actionDid");
    }

    return room;
  }

  async doubtDuque({
    sala_id,
    user_id,
    victim_id,
    doubt
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

    const user = await this.usersRepository.findOne({
      id: user_id
    });

    if (!user) {
      throw new _AppError.default("Usuário não existe.");
    }

    const victim = await this.usersRepository.findOne({
      relations: ["cards"],
      where: {
        id: victim_id
      }
    });

    if (!victim) {
      throw new _AppError.default("Vítima não existe.");
    }

    if (doubt === false) {
      user.pass = true;
      await this.usersRepository.save(user);
      const opponents = await this.usersRepository.find({
        where: {
          id: (0, _typeorm.Not)(victim_id),
          room_id: sala_id
        }
      });
      const allAnswer = opponents.every(user => {
        return user.pass === true || user.doubt === true;
      });

      if (allAnswer) {
        room.round = this.nextRound(room.round, room.users.length);
        room.waiting = false;
        await this.roomsRepository.save(room);
        await this.turnDoubtsFalse(sala_id);

        _http.io.emit("passRound");
      }
    }

    if (doubt) {
      const hasDuque = victim.cards.some(card => card.name === _utils.cartas[0]);

      if (!hasDuque) {
        await this.killCard(victim_id);
        await this.turnDoubtsFalse(sala_id);
        const currentRoom = await this.roomsRepository.findOne({
          relations: ["users", "users.cards"],
          where: {
            id: sala_id
          }
        });
        currentRoom.waiting = false;
        currentRoom.round = this.nextRound(currentRoom.round, currentRoom.users.length);
        await this.roomsRepository.save(currentRoom);
        return _http.io.emit("passRound");
      }

      const finishRoom = await this.roomsRepository.findOne({
        relations: ["users", "users.cards"],
        where: {
          id: sala_id
        }
      });
      await this.killCard(user_id);
      await this.turnDoubtsFalse(sala_id);
      finishRoom.waiting = false;
      finishRoom.round = this.nextRound(finishRoom.round, finishRoom.users.length);
      await this.roomsRepository.save(finishRoom);
      return _http.io.emit("passRound");
    }

    return room;
  }

  async doubtDuquePower({
    sala_id,
    user_id,
    victim_id,
    doubt,
    doubtActionType
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

    const user = await this.usersRepository.findOne({
      id: user_id
    });

    if (!user) {
      throw new _AppError.default("Usuário não existe.");
    }

    const victim = await this.usersRepository.findOne({
      relations: ["cards"],
      where: {
        id: victim_id
      }
    });

    if (!victim) {
      throw new _AppError.default("Vítima não existe.");
    }

    if (doubt === false) {
      user.pass = true;
      await this.usersRepository.save(user);
      const opponents = await this.usersRepository.find({
        where: {
          id: (0, _typeorm.Not)(victim_id),
          room_id: sala_id
        }
      });
      const allAnswer = opponents.every(user => {
        return user.pass === true || user.doubt === true;
      });

      if (allAnswer) {
        await this.action({
          sala_id,
          user_id: room.users[Number(room.round) - 1].id,
          action: 3,
          victim_id: null,
          doubtActionType
        });
        room.round = this.nextRound(room.round, room.users.length);
        room.waiting = false;
        await this.roomsRepository.save(room);
        await this.turnDoubtsFalse(sala_id);

        _http.io.emit("passRound");
      }
    }

    if (doubt) {
      const hasDuque = victim.cards.some(card => card.name === _utils.cartas[0]);

      if (!hasDuque) {
        await this.killCard(victim_id);
        await this.turnDoubtsFalse(sala_id);
        const currentRoom = await this.roomsRepository.findOne({
          relations: ["users", "users.cards"],
          where: {
            id: sala_id
          }
        });
        currentRoom.waiting = false;
        currentRoom.round = this.nextRound(currentRoom.round, currentRoom.users.length);
        await this.roomsRepository.save(currentRoom);
        return _http.io.emit("passRound");
      }

      await this.action({
        sala_id,
        user_id: room.users[Number(room.round) - 1].id,
        action: 3,
        victim_id: null,
        doubtActionType
      });
      await this.killCard(user_id);
      const finishRoom = await this.roomsRepository.findOne({
        relations: ["users", "users.cards"],
        where: {
          id: sala_id
        }
      });
      await this.turnDoubtsFalse(sala_id);
      finishRoom.waiting = false;
      finishRoom.round = this.nextRound(finishRoom.round, finishRoom.users.length);
      await this.roomsRepository.save(finishRoom);
      return _http.io.emit("passRound");
    }

    return room;
  }

  async doubtCapitaoPower({
    sala_id,
    user_id,
    victim_id,
    doubtType,
    doubtActionType
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

    const user = await this.usersRepository.findOne({
      id: user_id
    });

    if (!user) {
      throw new _AppError.default("Usuário não existe.");
    }

    const victim = await this.usersRepository.findOne({
      relations: ["cards"],
      where: {
        id: victim_id
      }
    });

    if (!victim) {
      throw new _AppError.default("Vítima não existe.");
    }

    if (doubtType === "pass") {
      user.pass = true;
      await this.usersRepository.save(user);
      const opponents = await this.usersRepository.find({
        where: {
          id: (0, _typeorm.Not)(room.users[Number(room.round) - 1].id),
          room_id: sala_id
        }
      });
      const allAnswer = opponents.every(user => {
        return user.pass === true || user.doubt === true;
      });

      if (allAnswer) {
        await this.action({
          sala_id,
          user_id: room.users[Number(room.round) - 1].id,
          action: 3,
          victim_id,
          doubtActionType: 1
        });
        room.round = this.nextRound(room.round, room.users.length);
        room.waiting = false;
        await this.roomsRepository.save(room);
        await this.turnDoubtsFalse(sala_id);
        return _http.io.emit("passRound");
      }
    }

    if (doubtType === "blockPass") {
      user.pass = true;
      await this.usersRepository.save(user);
      const opponents = await this.usersRepository.find({
        where: {
          id: (0, _typeorm.Not)(victim_id),
          room_id: sala_id
        }
      });
      const allAnswer = opponents.every(user => {
        return user.pass === true || user.doubt === true;
      });

      if (allAnswer) {
        room.round = this.nextRound(room.round, room.users.length);
        room.waiting = false;
        await this.roomsRepository.save(room);
        await this.turnDoubtsFalse(sala_id);
        return _http.io.emit("passRound");
      }
    }

    if (doubtType === "doubt") {
      const hasCapitao = victim.cards.some(card => card.name === _utils.cartas[1]);

      if (!hasCapitao) {
        await this.killCard(room.users[Number(room.round) - 1].id);
        await this.turnDoubtsFalse(sala_id);
        const currentRoom = await this.roomsRepository.findOne({
          relations: ["users", "users.cards"],
          where: {
            id: sala_id
          }
        });
        currentRoom.waiting = false;
        currentRoom.round = this.nextRound(currentRoom.round, currentRoom.users.length);
        await this.roomsRepository.save(currentRoom);
        return _http.io.emit("passRound");
      }

      await this.action({
        sala_id,
        user_id: room.users[Number(room.round) - 1].id,
        action: 3,
        victim_id,
        doubtActionType: 1
      });
      await this.killCard(user_id);
      const finishRoom = await this.roomsRepository.findOne({
        relations: ["users", "users.cards"],
        where: {
          id: sala_id
        }
      });
      await this.turnDoubtsFalse(sala_id);
      finishRoom.waiting = false;
      finishRoom.round = this.nextRound(finishRoom.round, finishRoom.users.length);
      await this.roomsRepository.save(finishRoom);
      return _http.io.emit("passRound");
    }

    if (doubtType === "block") {
      const hasCapitaoOuEmbaixador = victim.cards.some(card => card.name === _utils.cartas[1] || card.name === _utils.cartas[4]);

      if (!hasCapitaoOuEmbaixador) {
        await this.killCard(victim_id);
        await this.turnDoubtsFalse(sala_id);
        const currentRoom = await this.roomsRepository.findOne({
          relations: ["users", "users.cards"],
          where: {
            id: sala_id
          }
        });
        currentRoom.waiting = false;
        currentRoom.round = this.nextRound(currentRoom.round, currentRoom.users.length);
        await this.roomsRepository.save(currentRoom);
        return _http.io.emit("passRound");
      }

      await this.killCard(user_id);
      const finishRoom = await this.roomsRepository.findOne({
        relations: ["users", "users.cards"],
        where: {
          id: sala_id
        }
      });
      await this.turnDoubtsFalse(sala_id);
      finishRoom.waiting = false;
      finishRoom.round = this.nextRound(finishRoom.round, finishRoom.users.length);
      await this.roomsRepository.save(finishRoom);
      return _http.io.emit("passRound");
    }

    return room;
  }

  async doubtEmbaixadorPower({
    sala_id,
    user_id,
    victim_id,
    doubtType,
    doubtActionType
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

    const user = await this.usersRepository.findOne({
      relations: ["cards"],
      where: {
        id: user_id
      }
    });

    if (!user) {
      throw new _AppError.default("Usuário não existe.");
    }

    if (doubtType === "pass") {
      user.pass = true;
      await this.usersRepository.save(user);
      const opponents = await this.usersRepository.find({
        where: {
          id: (0, _typeorm.Not)(room.users[Number(room.round) - 1].id),
          room_id: sala_id
        }
      });
      const allAnswer = opponents.every(user => {
        return user.pass === true || user.doubt === true;
      });

      if (allAnswer) {
        await this.action({
          sala_id,
          user_id: room.users[Number(room.round) - 1].id,
          action: 3,
          victim_id: null,
          doubtActionType: 4
        });
        room.round = this.nextRound(room.round, room.users.length);
        room.waiting = false;
        await this.roomsRepository.save(room);
        await this.turnDoubtsFalse(sala_id);
        return _http.io.emit("passRound");
      }
    }

    if (doubtType === "doubt") {
      const hasEmbaixador = room.users[Number(room.round) - 1].cards.some(card => {
        return card.name === _utils.cartas[4];
      });

      if (!hasEmbaixador) {
        await this.killCard(room.users[Number(room.round) - 1].id);
        await this.turnDoubtsFalse(sala_id);
        const currentRoom = await this.roomsRepository.findOne({
          relations: ["users", "users.cards"],
          where: {
            id: sala_id
          }
        });
        currentRoom.waiting = false;
        currentRoom.round = this.nextRound(currentRoom.round, currentRoom.users.length);
        await this.roomsRepository.save(currentRoom);
        return _http.io.emit("passRound");
      }

      await this.action({
        sala_id,
        user_id: room.users[Number(room.round) - 1].id,
        action: 3,
        victim_id: null,
        doubtActionType: 4
      });
      await this.killCard(user_id);
      const finishRoom = await this.roomsRepository.findOne({
        relations: ["users", "users.cards"],
        where: {
          id: sala_id
        }
      });
      await this.turnDoubtsFalse(sala_id);
      finishRoom.waiting = false;
      finishRoom.round = this.nextRound(finishRoom.round, finishRoom.users.length);
      await this.roomsRepository.save(finishRoom);
      return _http.io.emit("passRound");
    }

    return room;
  }

  async doubtAssassinoPower({
    sala_id,
    user_id,
    victim_id,
    doubtType,
    doubtActionType
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

    const user = await this.usersRepository.findOne({
      id: user_id
    });

    if (!user) {
      throw new _AppError.default("Usuário não existe.");
    }

    const victim = await this.usersRepository.findOne({
      relations: ["cards"],
      where: {
        id: victim_id
      }
    });

    if (!victim) {
      throw new _AppError.default("Vítima não existe.");
    }

    if (doubtType === "pass") {
      user.pass = true;
      await this.usersRepository.save(user);
      const opponents = await this.usersRepository.find({
        where: {
          id: (0, _typeorm.Not)(room.users[Number(room.round) - 1].id),
          room_id: sala_id
        }
      });
      const allAnswer = opponents.every(user => {
        return user.pass === true || user.doubt === true;
      });

      if (allAnswer) {
        await this.action({
          sala_id,
          user_id: room.users[Number(room.round) - 1].id,
          action: 3,
          victim_id,
          doubtActionType: 2
        });
        room.round = this.nextRound(room.round, room.users.length);
        room.waiting = false;
        await this.roomsRepository.save(room);
        await this.turnDoubtsFalse(sala_id);
        return _http.io.emit("passRound");
      }
    }

    if (doubtType === "blockPass") {
      user.pass = true;
      await this.usersRepository.save(user);
      room.round = this.nextRound(room.round, room.users.length);
      room.waiting = false;
      await this.roomsRepository.save(room);
      await this.turnDoubtsFalse(sala_id);
      return _http.io.emit("passRound");
    }

    if (doubtType === "doubt") {
      const userRound = await this.usersRepository.findOne({
        relations: ["cards"],
        where: {
          id: room.users[Number(room.round) - 1].id
        }
      });
      const hasAssassin = userRound.cards.some(card => card.name === _utils.cartas[2]);

      if (!hasAssassin) {
        await this.killCard(room.users[Number(room.round) - 1].id);
        await this.turnDoubtsFalse(sala_id);
        const currentRoom = await this.roomsRepository.findOne({
          relations: ["users", "users.cards"],
          where: {
            id: sala_id
          }
        });
        currentRoom.waiting = false;
        currentRoom.round = this.nextRound(currentRoom.round, currentRoom.users.length);
        await this.roomsRepository.save(currentRoom);
        return _http.io.emit("passRound");
      }

      await this.action({
        sala_id,
        user_id: room.users[Number(room.round) - 1].id,
        action: 3,
        victim_id,
        doubtActionType: 2
      });
      const doubtUser = await this.usersRepository.findOne({
        relations: ["cards"],
        where: {
          id: user_id
        }
      });

      if (!doubtUser) {
        throw new _AppError.default("Jogador" + doubtUser.username + " morreu.");
      }

      if (Number(doubtUser.cards) > 0) {
        await this.killCard(user_id);
      }

      const finishRoom = await this.roomsRepository.findOne({
        relations: ["users", "users.cards"],
        where: {
          id: sala_id
        }
      });
      await this.turnDoubtsFalse(sala_id);
      finishRoom.waiting = false;
      finishRoom.round = this.nextRound(finishRoom.round, finishRoom.users.length);
      await this.roomsRepository.save(finishRoom);
      return _http.io.emit("passRound");
    }

    if (doubtType === "block") {
      const hasCondessa = victim.cards.some(card => card.name === _utils.cartas[3]);

      if (!hasCondessa) {
        await this.action({
          sala_id,
          user_id: room.users[Number(room.round) - 1].id,
          action: 3,
          victim_id,
          doubtActionType: 2
        });
        const doubtUser = await this.usersRepository.findOne({
          relations: ["cards"],
          where: {
            id: victim_id
          }
        });

        if (!doubtUser) {
          throw new _AppError.default("Jogador" + doubtUser.username + " morreu.");
        }

        if (Number(doubtUser.cards) > 0) {
          await this.killCard(victim_id);
        }

        await this.turnDoubtsFalse(sala_id);
        const currentRoom = await this.roomsRepository.findOne({
          relations: ["users", "users.cards"],
          where: {
            id: sala_id
          }
        });
        currentRoom.waiting = false;
        currentRoom.round = this.nextRound(currentRoom.round, currentRoom.users.length);
        await this.roomsRepository.save(currentRoom);
        return _http.io.emit("passRound");
      }

      await this.killCard(user_id);
      const finishRoom = await this.roomsRepository.findOne({
        relations: ["users", "users.cards"],
        where: {
          id: sala_id
        }
      });
      await this.turnDoubtsFalse(sala_id);
      finishRoom.waiting = false;
      finishRoom.round = this.nextRound(finishRoom.round, finishRoom.users.length);
      await this.roomsRepository.save(finishRoom);
      return _http.io.emit("passRound");
    }

    return room;
  }

}

exports.default = GameService;