import { Request, Response, NextFunction } from "express";
import jwt , { JwtPayload } from "jsonwebtoken";
import authConfig from "../../config/auth.json";

interface IDecoded {
  id: string;
  iat: number;
  exp: number;
}

export default (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ error: "No token provided"});
  }

  // Analizando o formato do token (Bearer asd89ahsndh789d1jkn1mk2n3klzx8)
  const parts = authHeader.split(" ");

  // Verifica se existem duas partes no token enviado
  if (parts.length !== 2) {
    return res.status(401).send({ error: "Invalid format token" })
  }

  const [scheme, token] = parts;

  // Verifica se o scheme contem a palavra Bearer
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).send({ error: "Invalid format token" });
  }

  // Verifica se o token é compativel com nossa chave secreta
  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: "Token invalid" });
    }

    req.userId = (decoded as IDecoded).id;
    return next();
  });
}