import { Router } from "express";
import { GetRandomData } from "../controllers/randomdata.controller.js";

const RandomDataRoute = Router();

RandomDataRoute.get("/", GetRandomData);

export default RandomDataRoute
