declare namespace Express {
  interface User {
    id: string;
    roles: string[];
  }

  interface Request<_ = any, _ = any, _ = any, ReqQuery = any> {
    user?: User;
    validQuery?: ReqQuery;
  }
}
