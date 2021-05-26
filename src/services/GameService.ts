import { getCustomRepository, Not, Repository } from "typeorm";
import AppError from "../errors/AppError";
import Room from "../entities/Room";
import User from "../entities/User";
import RoomsRepository from "../repositories/RoomsRepository";
import UsersRepository from "../repositories/UsersRepository";
import { cartas } from "../utils";
import UserCard from "../entities/UserCard";
import UserCardRepository from "../repositories/UserCardRepository";
import CardsRepository from "../repositories/CardsRepository";
import Card from "../entities/Card";
import { io } from "../http";

interface IRoomsCreate {
  nome_sala: string;
  nome_usuario: string;
  avatar: string;
}

export default class GameService {
  private usersRepository: Repository<User>;
  private roomsRepository: Repository<Room>;
  private userCardRepository: Repository<UserCard>;
  private cardsRepository: Repository<Card>;

  constructor() {
    this.usersRepository = getCustomRepository(UsersRepository);
    this.roomsRepository = getCustomRepository(RoomsRepository);
    this.userCardRepository = getCustomRepository(UserCardRepository);
    this.cardsRepository = getCustomRepository(CardsRepository);
  }

  embaralhar(cartasParaEmbaralhar: string[]) {
    for (
      var j, x, i = cartasParaEmbaralhar.length;
      i;
      j = Math.floor(Math.random() * i),
        x = cartasParaEmbaralhar[--i],
        cartasParaEmbaralhar[i] = cartasParaEmbaralhar[j],
        cartasParaEmbaralhar[j] = x
    );
    return cartasParaEmbaralhar;
  }

  async mountDeck(jogadores: number, room_id: string) {
    const existCards = await this.cardsRepository.find({
      where: {
        room_id,
      },
    });
    if (existCards) {
      existCards.map(async (card) => {
        return await this.cardsRepository.remove(card);
      });
    }
    let baralho = [];

    if (jogadores >= 3 && jogadores <= 6) {
      cartas.map(async (carta) => {
        let i = 0;
        while (i < 3) {
          baralho.push(carta);

          i++;
        }
      });
    } else if (jogadores === 7 || jogadores === 8) {
      cartas.map(async (carta) => {
        let i = 0;
        while (i < 4) {
          baralho.push(carta);

          i++;
        }
      });
    } else if (jogadores === 9 || jogadores === 10) {
      cartas.map(async (carta) => {
        let i = 0;
        while (i < 5) {
          baralho.push(carta);

          i++;
        }
      });
    } else {
      throw new AppError("Só pode iniciar um jogo com 3 até 10 jogadores.");
    }

    const mixedDeck = this.embaralhar(baralho);

    mixedDeck.map(async (carta) => {
      const card = this.cardsRepository.create({
        name: carta,
        room_id,
      });

      await this.cardsRepository.save(card);
    });

    const cards = await this.cardsRepository.find({
      where: {
        room_id,
      },
    });

    return cards;
  }

  async comprar(user_id, qtd, room_id) {
    const existCards = await this.cardsRepository.find({
      where: {
        room_id,
      },
    });

    let i = 0;
    while (i < qtd) {
      const currentCard = this.userCardRepository.create({
        name: existCards[i].name,
        user_id,
      });

      await this.userCardRepository.save(currentCard);

      await this.cardsRepository.remove(existCards[i]);
      i++;
    }
  }

  async killCard(victim_id) {
    const victim = await this.usersRepository.findOne({
      where: {
        id: victim_id,
      },
    });

    if (!victim) {
      throw new AppError("Usuário não está mais nesta sala.");
    }

    const cards = await this.userCardRepository.find({
      where: {
        user_id: victim_id,
      },
    });

    if (cards.length === 0) {
      throw new AppError("Usuário já está morto.");
    }

    cards.length;

    const card = cards[Math.floor(Math.random() * (cards.length - 0)) + 0];

    await this.userCardRepository.remove(card);

    const totalCards = await this.userCardRepository.count({
      user_id: victim_id,
    });

    if (totalCards === 0) {
      await this.usersRepository.remove(victim);

      // const room = await this.roomsRepository.findOne({
      //   relations: ["users"],
      //   where: { id: victim.room_id },
      // });

      // await this.nextRound(room.round, room.users.length);
    }
  }

  devolver(user_id, cartaParaDevolver) {
    // return baralhoAtual.push(cartaParaDevolver);
  }

  async turnDoubtsFalse(sala_id) {
    const room = await this.roomsRepository.findOne({
      relations: ["users", "users.cards"],
      where: {
        id: sala_id,
      },
    });

    if (!room) {
      throw new AppError("Sala não existe.");
    }

    let i = 0;
    while (i < room.users.length) {
      room.users[i].doubt = false;
      room.users[i].pass = false;
      await this.usersRepository.save(room.users[i]);

      i++;
    }
  }

  async create({ sala_id, user_id }) {
    const room = await this.roomsRepository.findOne({
      relations: ["users", "users.cards"],
      where: {
        id: sala_id,
      },
    });

    if (!room) {
      throw new AppError("Sala não existe.");
    }

    if (String(room.users[0].id) !== String(user_id)) {
      throw new AppError("Apenas o criador da sala pode iniciar a partida.");
    }

    await this.turnDoubtsFalse(sala_id);

    const deck = await this.mountDeck(room.users.length, sala_id);

    let i = 0;
    while (i < room.users.length) {
      room.users[i].coins = 0;
      await this.usersRepository.save(room.users[i]);

      if (room.users[i].cards.length > 0) {
        room.users[i].cards.map(
          async (card) => await this.userCardRepository.remove(card)
        );
      }

      await this.comprar(room.users[i].id, 2, sala_id);
      i++;
    }

    // room.users.map(async (usuario, index) => {
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

  async nextRound({ room_id, user_round_id }) {
    const room = await this.roomsRepository.findOne({
      relations: ["users", "users.cards"],
      where: {
        id: room_id,
      },
    });

    if (!room) {
      throw new AppError("Sala não existe.");
    }

    if (Number(room.users.length) < 2) {
      throw new AppError("O jogo já acabou.");
    }

    const userInRoundIndex = room.users.findIndex(
      (currentUser) => String(currentUser.id) === String(user_round_id)
    );

    let next_round;

    if (
      Number(Number(userInRoundIndex) + 1) < Number(room.users.length) &&
      Number(room.users.length) > 1 &&
      userInRoundIndex !== -1
    ) {
      //pega o index de quem esta jogando, soma +1 para pegar o round dele e soma mais um para ser o proximo jogador.
      next_round = userInRoundIndex + 2;
    } else if (userInRoundIndex === -1) {
      next_round = room.round;
    } else {
      next_round = 1;
    }

    return next_round;
  }

  async action({ sala_id, user_id, action, victim_id, doubtActionType }) {
    const room = await this.roomsRepository.findOne({
      relations: ["users", "users.cards"],
      where: {
        id: sala_id,
      },
    });

    if (!room) {
      throw new AppError("Sala não existe.");
    }

    const user = await this.usersRepository.findOne({
      relations: ["cards"],
      where: {
        id: user_id,
      },
    });

    if (!user) {
      throw new AppError("Usuário não existe.");
    }

    const playerRound = room.users.findIndex(
      (user) => String(user.id) === String(user_id)
    );

    if (String(room.round) !== String(Number(playerRound) + 1)) {
      throw new AppError("Não é sua vez.");
    }

    if (String(action) === "1") {
      user.coins = user.coins + 1;

      await this.usersRepository.save(user);

      room.round = await this.nextRound({
        room_id: sala_id,
        user_round_id: room.users[Number(room.round) - 1].id,
      });
      await this.roomsRepository.save(room);
    }

    if (String(action) === "2") {
      user.coins = user.coins + 2;

      await this.usersRepository.save(user);

      room.round = await this.nextRound({
        room_id: sala_id,
        user_round_id: room.users[Number(room.round) - 1].id,
      });
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
          id: victim_id,
        });

        if (!victim) {
          throw new AppError("Vítima não existe.");
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
          id: victim_id,
        });

        if (!victim) {
          throw new AppError("Vítima não existe.");
        }

        if (user.coins < 3) {
          throw new AppError(
            "Você não pode matar ninguém se não tiver 3 moedas."
          );
        }
        user.coins = Number(user.coins) - 3;

        await this.killCard(victim_id);

        await this.usersRepository.save(user);
      }
      if (String(doubtActionType) === "4") {
        if (Number(user.cards.length) < 1) {
          throw new AppError("Você não pode trocar cartas se não tem nenhuma.");
        }

        const cardToRemoveFromHand = await this.userCardRepository.find({
          user_id,
        });

        const deckCards = await this.cardsRepository.find({
          where: {
            room_id: sala_id,
          },
          take: Number(cardToRemoveFromHand.length),
        });

        let i = 0;
        const totalCardsToBuy = Number(cardToRemoveFromHand.length);
        while (i < totalCardsToBuy) {
          await this.userCardRepository.remove(cardToRemoveFromHand[i]);

          const backCardToDeck = this.cardsRepository.create({
            name: cardToRemoveFromHand[i].name,
            room_id: sala_id,
          });

          await this.cardsRepository.save(backCardToDeck);

          await this.cardsRepository.remove(deckCards[i]);

          const buyCardToHand = this.userCardRepository.create({
            name: deckCards[i].name,
            user_id,
          });

          await this.userCardRepository.save(buyCardToHand);

          i++;
        }
      }
    }

    if (String(action) === "4") {
      if (Number(user.coins) < 7) {
        throw new AppError("Você precisa de 7 moedas para esta ação.");
      }

      await this.killCard(victim_id);

      user.coins = user.coins - 7;

      await this.usersRepository.save(user);

      room.round = await this.nextRound({
        room_id: sala_id,
        user_round_id: room.users[Number(room.round) - 1].id,
      });

      await this.roomsRepository.save(room);
    }

    return room;
  }

  async actionDoubtBlock({ sala_id, user_id, action, doubtActionType }) {
    const room = await this.roomsRepository.findOne({
      relations: ["users", "users.cards"],
      where: {
        id: sala_id,
      },
    });

    if (!room) {
      throw new AppError("Sala não existe.");
    }

    const user = await this.usersRepository.findOne({
      id: user_id,
    });

    if (!user) {
      throw new AppError("Usuário não existe.");
    }

    const playerRound = room.users.findIndex(
      (user) => String(user.id) === String(user_id)
    );

    room.waiting = true;
    await this.roomsRepository.save(room);

    return user;
  }

  async actionDoubt({ sala_id, user_id, action, doubtActionType }) {
    const room = await this.roomsRepository.findOne({
      relations: ["users", "users.cards"],
      where: {
        id: sala_id,
      },
    });

    if (!room) {
      throw new AppError("Sala não existe.");
    }

    const user = await this.usersRepository.findOne({
      id: user_id,
    });

    if (!user) {
      throw new AppError("Usuário não existe.");
    }

    const playerRound = room.users.findIndex(
      (user) => String(user.id) === String(user_id)
    );

    if (String(room.round) !== String(Number(playerRound) + 1)) {
      throw new AppError("Não é sua vez.");
    }

    room.waiting = true;
    await this.roomsRepository.save(room);

    return room;
  }

  async anserdoubt({ sala_id, user_id, doubt }) {
    const room = await this.roomsRepository.findOne({
      relations: ["users", "users.cards"],
      where: {
        id: sala_id,
      },
    });

    if (!room) {
      throw new AppError("Sala não existe.");
    }

    const user = await this.usersRepository.findOne({
      id: user_id,
    });

    if (!user) {
      throw new AppError("Usuário não existe.");
    }

    if (doubt) {
      const userDoubt = await this.usersRepository.findOne({
        room_id: sala_id,
        doubt: true,
      });

      if (userDoubt) {
        user.pass = true;
        await this.usersRepository.save(user);
        await this.turnDoubtsFalse(sala_id);

        throw new AppError(
          `O ${userDoubt.username} duvidou primeiro. você apenas passará automaticamente.`
        );
      }

      user.doubt = true;
      await this.usersRepository.save(user);
      await this.turnDoubtsFalse(sala_id);

      io.emit("2DoubtDuque", {
        action: 7,
        victim_id: room.users[Number(room.round) - 1].id,
        user_id,
        type: "block",
        username: user.username,
      });

      return room;
    }
    user.pass = true;
    await this.usersRepository.save(user);

    const opponents = await this.usersRepository.find({
      where: {
        id: Not(room.users[Number(room.round) - 1].id),
        room_id: sala_id,
      },
    });

    const allAnswer = opponents.every((user) => {
      return user.pass === true || user.doubt === true;
    });

    if (allAnswer) {
      await this.action({
        sala_id,
        user_id: room.users[Number(room.round) - 1].id,
        action: 2,
        victim_id: null,
        doubtActionType: null,
      });

      io.emit("actionDid");
    }
    return io.emit("passOnly");

    return room;
  }

  async doubtDuque({ sala_id, user_id, victim_id, doubt }) {
    const room = await this.roomsRepository.findOne({
      relations: ["users", "users.cards"],
      where: {
        id: sala_id,
      },
    });

    if (!room) {
      throw new AppError("Sala não existe.");
    }

    const user = await this.usersRepository.findOne({
      id: user_id,
    });

    if (!user) {
      throw new AppError("Usuário não existe.");
    }

    const victim = await this.usersRepository.findOne({
      relations: ["cards"],
      where: {
        id: victim_id,
      },
    });

    if (!victim) {
      throw new AppError("Vítima não existe.");
    }

    if (doubt === false) {
      user.pass = true;
      await this.usersRepository.save(user);

      const opponents = await this.usersRepository.find({
        where: {
          id: Not(victim_id),
          room_id: sala_id,
        },
      });

      const allAnswer = opponents.every((user) => {
        return user.pass === true || user.doubt === true;
      });

      if (allAnswer) {
        room.round = await this.nextRound({
          room_id: sala_id,
          user_round_id: room.users[Number(room.round) - 1].id,
        });
        room.waiting = false;
        await this.roomsRepository.save(room);
        await this.turnDoubtsFalse(sala_id);
        io.emit("passRound");
      }
      return io.emit("passOnly");
    }
    if (doubt) {
      const hasDuque = victim.cards.some((card) => card.name === cartas[0]);

      if (!hasDuque) {
        await this.killCard(victim_id);
        await this.turnDoubtsFalse(sala_id);
        const currentRoom = await this.roomsRepository.findOne({
          relations: ["users", "users.cards"],
          where: {
            id: sala_id,
          },
        });

        currentRoom.waiting = false;
        currentRoom.round = await this.nextRound({
          room_id: sala_id,
          user_round_id: room.users[Number(room.round) - 1].id,
        });
        await this.roomsRepository.save(currentRoom);
        return io.emit("passRound");
      }

      const finishRoom = await this.roomsRepository.findOne({
        relations: ["users", "users.cards"],
        where: {
          id: sala_id,
        },
      });

      await this.killCard(user_id);
      await this.turnDoubtsFalse(sala_id);
      finishRoom.waiting = false;
      finishRoom.round = await this.nextRound({
        room_id: sala_id,
        user_round_id: room.users[Number(room.round) - 1].id,
      });

      await this.roomsRepository.save(finishRoom);

      return io.emit("passRound");
    }

    return room;
  }

  async doubtDuquePower({
    sala_id,
    user_id,
    victim_id,
    doubt,
    doubtActionType,
  }) {
    const room = await this.roomsRepository.findOne({
      relations: ["users", "users.cards"],
      where: {
        id: sala_id,
      },
    });

    if (!room) {
      throw new AppError("Sala não existe.");
    }

    const user = await this.usersRepository.findOne({
      id: user_id,
    });

    if (!user) {
      throw new AppError("Usuário não existe.");
    }

    const victim = await this.usersRepository.findOne({
      relations: ["cards"],
      where: {
        id: victim_id,
      },
    });

    if (!victim) {
      throw new AppError("Vítima não existe.");
    }

    if (doubt === false) {
      user.pass = true;
      await this.usersRepository.save(user);

      const opponents = await this.usersRepository.find({
        where: {
          id: Not(room.users[Number(room.round) - 1].id),
          room_id: sala_id,
        },
      });

      const allAnswer = opponents.every((user) => {
        return user.pass === true || user.doubt === true;
      });

      if (allAnswer) {
        await this.action({
          sala_id,
          user_id: room.users[Number(room.round) - 1].id,
          action: 3,
          victim_id: null,
          doubtActionType,
        });
        room.round = await this.nextRound({
          room_id: sala_id,
          user_round_id: room.users[Number(room.round) - 1].id,
        });
        room.waiting = false;

        await this.roomsRepository.save(room);
        await this.turnDoubtsFalse(sala_id);
        io.emit("passRound");
      }
      return io.emit("passOnly");
    }
    if (doubt) {
      const hasDuque = victim.cards.some((card) => card.name === cartas[0]);

      if (!hasDuque) {
        await this.killCard(victim_id);
        await this.turnDoubtsFalse(sala_id);
        const currentRoom = await this.roomsRepository.findOne({
          relations: ["users", "users.cards"],
          where: {
            id: sala_id,
          },
        });

        currentRoom.waiting = false;
        currentRoom.round = await this.nextRound({
          room_id: sala_id,
          user_round_id: room.users[Number(room.round) - 1].id,
        });
        await this.roomsRepository.save(currentRoom);
        return io.emit("passRound");
      }

      await this.action({
        sala_id,
        user_id: room.users[Number(room.round) - 1].id,
        action: 3,
        victim_id: null,
        doubtActionType,
      });
      await this.killCard(user_id);
      const finishRoom = await this.roomsRepository.findOne({
        relations: ["users", "users.cards"],
        where: {
          id: sala_id,
        },
      });
      await this.turnDoubtsFalse(sala_id);
      finishRoom.waiting = false;
      finishRoom.round = await this.nextRound({
        room_id: sala_id,
        user_round_id: room.users[Number(room.round) - 1].id,
      });

      await this.roomsRepository.save(finishRoom);

      return io.emit("passRound");
    }

    return room;
  }

  async doubtCapitaoPower({
    sala_id,
    user_id,
    victim_id,
    doubtType,
    doubtActionType,
  }) {
    const room = await this.roomsRepository.findOne({
      relations: ["users", "users.cards"],
      where: {
        id: sala_id,
      },
    });

    if (!room) {
      throw new AppError("Sala não existe.");
    }

    const user = await this.usersRepository.findOne({
      id: user_id,
    });

    if (!user) {
      throw new AppError("Usuário não existe.");
    }

    const victim = await this.usersRepository.findOne({
      relations: ["cards"],
      where: {
        id: victim_id,
      },
    });

    if (!victim) {
      throw new AppError("Vítima não existe.");
    }

    if (doubtType === "pass") {
      user.pass = true;
      await this.usersRepository.save(user);

      const opponents = await this.usersRepository.find({
        where: {
          id: Not(room.users[Number(room.round) - 1].id),
          room_id: sala_id,
        },
      });

      const allAnswer = opponents.every((user) => {
        return user.pass === true || user.doubt === true;
      });

      if (allAnswer) {
        await this.action({
          sala_id,
          user_id: room.users[Number(room.round) - 1].id,
          action: 3,
          victim_id,
          doubtActionType: 1,
        });
        room.round = await this.nextRound({
          room_id: sala_id,
          user_round_id: room.users[Number(room.round) - 1].id,
        });
        room.waiting = false;

        await this.roomsRepository.save(room);
        await this.turnDoubtsFalse(sala_id);
        return io.emit("passRound");
      }
      return io.emit("passOnly");
    }

    if (doubtType === "blockPass") {
      user.pass = true;
      await this.usersRepository.save(user);

      const opponents = await this.usersRepository.find({
        where: {
          id: Not(victim_id),
          room_id: sala_id,
        },
      });

      const allAnswer = opponents.every((user) => {
        return user.pass === true || user.doubt === true;
      });

      if (allAnswer) {
        room.round = await this.nextRound({
          room_id: sala_id,
          user_round_id: room.users[Number(room.round) - 1].id,
        });
        room.waiting = false;

        await this.roomsRepository.save(room);
        await this.turnDoubtsFalse(sala_id);
        return io.emit("passRound");
      }
      return io.emit("passOnly");
    }

    if (doubtType === "doubt") {
      const hasCapitao = room.users[Number(room.round) - 1].cards.some(
        (card) => card.name === cartas[1]
      );

      if (!hasCapitao) {
        await this.killCard(room.users[Number(room.round) - 1].id);
        await this.turnDoubtsFalse(sala_id);
        const currentRoom = await this.roomsRepository.findOne({
          relations: ["users", "users.cards"],
          where: {
            id: sala_id,
          },
        });

        currentRoom.waiting = false;
        currentRoom.round = await this.nextRound({
          room_id: sala_id,
          user_round_id: room.users[Number(room.round) - 1].id,
        });
        await this.roomsRepository.save(currentRoom);
        return io.emit("passRound");
      }

      await this.action({
        sala_id,
        user_id: room.users[Number(room.round) - 1].id,
        action: 3,
        victim_id,
        doubtActionType: 1,
      });
      await this.killCard(user_id);
      const finishRoom = await this.roomsRepository.findOne({
        relations: ["users", "users.cards"],
        where: {
          id: sala_id,
        },
      });
      await this.turnDoubtsFalse(sala_id);
      finishRoom.waiting = false;
      finishRoom.round = await this.nextRound({
        room_id: sala_id,
        user_round_id: room.users[Number(room.round) - 1].id,
      });

      await this.roomsRepository.save(finishRoom);

      return io.emit("passRound");
    }
    if (doubtType === "block") {
      const hasCapitaoOuEmbaixador = victim.cards.some(
        (card) => card.name === cartas[1] || card.name === cartas[4]
      );

      if (!hasCapitaoOuEmbaixador) {
        await this.killCard(victim_id);
        await this.turnDoubtsFalse(sala_id);
        const currentRoom = await this.roomsRepository.findOne({
          relations: ["users", "users.cards"],
          where: {
            id: sala_id,
          },
        });

        currentRoom.waiting = false;
        currentRoom.round = await this.nextRound({
          room_id: sala_id,
          user_round_id: room.users[Number(room.round) - 1].id,
        });
        await this.roomsRepository.save(currentRoom);
        return io.emit("passRound");
      }

      await this.killCard(user_id);
      const finishRoom = await this.roomsRepository.findOne({
        relations: ["users", "users.cards"],
        where: {
          id: sala_id,
        },
      });
      await this.turnDoubtsFalse(sala_id);
      finishRoom.waiting = false;
      finishRoom.round = await this.nextRound({
        room_id: sala_id,
        user_round_id: room.users[Number(room.round) - 1].id,
      });

      await this.roomsRepository.save(finishRoom);

      return io.emit("passRound");
    }

    return room;
  }

  async doubtEmbaixadorPower({
    sala_id,
    user_id,
    victim_id,
    doubtType,
    doubtActionType,
  }) {
    const room = await this.roomsRepository.findOne({
      relations: ["users", "users.cards"],
      where: {
        id: sala_id,
      },
    });

    if (!room) {
      throw new AppError("Sala não existe.");
    }

    const user = await this.usersRepository.findOne({
      relations: ["cards"],
      where: {
        id: user_id,
      },
    });

    if (!user) {
      throw new AppError("Usuário não existe.");
    }

    if (doubtType === "pass") {
      user.pass = true;
      await this.usersRepository.save(user);

      const opponents = await this.usersRepository.find({
        where: {
          id: Not(room.users[Number(room.round) - 1].id),
          room_id: sala_id,
        },
      });

      const allAnswer = opponents.every((user) => {
        return user.pass === true || user.doubt === true;
      });

      if (allAnswer) {
        await this.action({
          sala_id,
          user_id: room.users[Number(room.round) - 1].id,
          action: 3,
          victim_id: null,
          doubtActionType: 4,
        });
        room.round = await this.nextRound({
          room_id: sala_id,
          user_round_id: room.users[Number(room.round) - 1].id,
        });
        room.waiting = false;

        await this.roomsRepository.save(room);
        await this.turnDoubtsFalse(sala_id);

        return io.emit("passRound");
      }
      return io.emit("passOnly");
    }

    if (doubtType === "doubt") {
      const hasEmbaixador = room.users[Number(room.round) - 1].cards.some(
        (card) => {
          return card.name === cartas[4];
        }
      );

      if (!hasEmbaixador) {
        await this.killCard(room.users[Number(room.round) - 1].id);
        await this.turnDoubtsFalse(sala_id);
        const currentRoom = await this.roomsRepository.findOne({
          relations: ["users", "users.cards"],
          where: {
            id: sala_id,
          },
        });

        currentRoom.waiting = false;
        currentRoom.round = await this.nextRound({
          room_id: sala_id,
          user_round_id: room.users[Number(room.round) - 1].id,
        });
        await this.roomsRepository.save(currentRoom);
        return io.emit("passRound");
      }

      await this.action({
        sala_id,
        user_id: room.users[Number(room.round) - 1].id,
        action: 3,
        victim_id: null,
        doubtActionType: 4,
      });

      await this.killCard(user_id);
      const finishRoom = await this.roomsRepository.findOne({
        relations: ["users", "users.cards"],
        where: {
          id: sala_id,
        },
      });
      await this.turnDoubtsFalse(sala_id);
      finishRoom.waiting = false;
      finishRoom.round = await this.nextRound({
        room_id: sala_id,
        user_round_id: room.users[Number(room.round) - 1].id,
      });

      await this.roomsRepository.save(finishRoom);

      return io.emit("passRound");
    }

    return room;
  }

  async doubtAssassinoPower({
    sala_id,
    user_id,
    victim_id,
    doubtType,
    doubtActionType,
  }) {
    const room = await this.roomsRepository.findOne({
      relations: ["users", "users.cards"],
      where: {
        id: sala_id,
      },
    });

    if (!room) {
      throw new AppError("Sala não existe.");
    }

    const user = await this.usersRepository.findOne({
      id: user_id,
    });

    if (!user) {
      throw new AppError("Usuário não existe.");
    }

    const victim = await this.usersRepository.findOne({
      relations: ["cards"],
      where: {
        id: victim_id,
      },
    });

    if (!victim) {
      throw new AppError("Vítima não existe.");
    }

    if (doubtType === "pass") {
      user.pass = true;
      await this.usersRepository.save(user);

      const opponents = await this.usersRepository.find({
        where: {
          id: Not(room.users[Number(room.round) - 1].id),
          room_id: sala_id,
        },
      });

      const allAnswer = opponents.every((user) => {
        return user.pass === true || user.doubt === true;
      });

      if (allAnswer) {
        await this.action({
          sala_id,
          user_id: room.users[Number(room.round) - 1].id,
          action: 3,
          victim_id,
          doubtActionType: 2,
        });

        room.round = await this.nextRound({
          room_id: sala_id,
          user_round_id: room.users[Number(room.round) - 1].id,
        });
        room.waiting = false;

        await this.roomsRepository.save(room);
        await this.turnDoubtsFalse(sala_id);

        return io.emit("passRound");
      }
      return io.emit("passOnly");
    }
    if (doubtType === "blockPass") {
      const userRound = await this.usersRepository.findOne({
        relations: ["cards"],
        where: {
          id: room.users[Number(room.round) - 1].id,
        },
      });

      if (Number(userRound.coins) < 3) {
        throw new AppError(
          "Você não pode matar ninguém se não tiver 3 moedas."
        );
      }
      userRound.coins = Number(userRound.coins) - 3;

      userRound.pass = true;

      await this.usersRepository.save(userRound);

      room.round = await this.nextRound({
        room_id: sala_id,
        user_round_id: room.users[Number(room.round) - 1].id,
      });
      room.waiting = false;

      await this.roomsRepository.save(room);
      await this.turnDoubtsFalse(sala_id);

      return io.emit("passRound");
    }
    if (doubtType === "doubt") {
      const userRound = await this.usersRepository.findOne({
        relations: ["cards"],
        where: {
          id: room.users[Number(room.round) - 1].id,
        },
      });

      const hasAssassin = userRound.cards.some(
        (card) => card.name === cartas[2]
      );

      if (!hasAssassin) {
        if (Number(userRound.coins) < 3) {
          throw new AppError(
            "Você não pode matar ninguém se não tiver 3 moedas."
          );
        }
        userRound.coins = Number(userRound.coins) - 3;

        await this.usersRepository.save(userRound);

        await this.killCard(room.users[Number(room.round) - 1].id);
        await this.turnDoubtsFalse(sala_id);
        const currentRoom = await this.roomsRepository.findOne({
          relations: ["users", "users.cards"],
          where: {
            id: sala_id,
          },
        });

        currentRoom.waiting = false;

        room.round = await this.nextRound({
          room_id: sala_id,
          user_round_id: room.users[Number(room.round) - 1].id,
        });

        await this.roomsRepository.save(currentRoom);
        return io.emit("passRound");
      }

      await this.action({
        sala_id,
        user_id: room.users[Number(room.round) - 1].id,
        action: 3,
        victim_id,
        doubtActionType: 2,
      });

      const doubtUser = await this.usersRepository.findOne({
        relations: ["cards"],
        where: {
          id: user_id,
        },
      });

      if (!doubtUser) {
        throw new AppError("Jogador" + doubtUser?.username + " morreu.");
      }

      if (Number(doubtUser.cards.length) > 0) {
        await this.killCard(user_id);
      }

      const finishRoom = await this.roomsRepository.findOne({
        relations: ["users", "users.cards"],
        where: {
          id: sala_id,
        },
      });

      await this.turnDoubtsFalse(sala_id);
      finishRoom.waiting = false;
      finishRoom.round = await this.nextRound({
        room_id: sala_id,
        user_round_id: room.users[Number(room.round) - 1].id,
      });

      await this.roomsRepository.save(finishRoom);

      return io.emit("passRound");
    }
    if (doubtType === "block") {
      const hasCondessa = victim.cards.some((card) => card.name === cartas[3]);

      if (!hasCondessa) {
        await this.action({
          sala_id,
          user_id: room.users[Number(room.round) - 1].id,
          action: 3,
          victim_id,
          doubtActionType: 2,
        });

        const doubtUser = await this.usersRepository.findOne({
          relations: ["cards"],
          where: {
            id: victim_id,
          },
        });

        if (!doubtUser) {
          throw new AppError("Jogador" + doubtUser?.username + " morreu.");
        }

        if (Number(doubtUser?.cards) > 0) {
          await this.killCard(victim_id);
        }

        await this.turnDoubtsFalse(sala_id);
        const currentRoom = await this.roomsRepository.findOne({
          relations: ["users", "users.cards"],
          where: {
            id: sala_id,
          },
        });

        currentRoom.waiting = false;
        currentRoom.round = await this.nextRound({
          room_id: sala_id,
          user_round_id: room.users[Number(room.round) - 1].id,
        });
        await this.roomsRepository.save(currentRoom);
        return io.emit("passRound");
      }

      const userRound = await this.usersRepository.findOne({
        relations: ["cards"],
        where: {
          id: room.users[Number(room.round) - 1].id,
        },
      });

      if (Number(userRound.coins) < 3) {
        throw new AppError(
          "Você não pode matar ninguém se não tiver 3 moedas."
        );
      }
      userRound.coins = Number(userRound.coins) - 3;

      await this.usersRepository.save(userRound);

      await this.killCard(user_id);
      const finishRoom = await this.roomsRepository.findOne({
        relations: ["users", "users.cards"],
        where: {
          id: sala_id,
        },
      });
      await this.turnDoubtsFalse(sala_id);
      finishRoom.waiting = false;
      finishRoom.round = await this.nextRound({
        room_id: sala_id,
        user_round_id: room.users[Number(room.round) - 1].id,
      });

      await this.roomsRepository.save(finishRoom);

      return io.emit("passRound");
    }

    return room;
  }
}
