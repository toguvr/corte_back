declare namespace Express {
  export interface Request {
    user: {
      id: string;
    };
    connectedUsers: {
      [key: string]: string;
    };
    io: {
      to: any;
      emit: any;
    };
  }
}
