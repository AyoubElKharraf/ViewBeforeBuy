import { Router } from "express";
import { getBanksHandler } from "../controllers/banks.js";
import { postChatHandler } from "../controllers/chat.js";
import {
  getConversationHandler,
  getConversationsHandler,
  postMessageHandler,
} from "../controllers/conversations.js";
import { getPropertiesHandler, getPropertyHandler } from "../controllers/properties.js";

export const apiRouter = Router();

apiRouter.get("/properties", getPropertiesHandler);
apiRouter.get("/properties/:id", getPropertyHandler);

apiRouter.get("/conversations", getConversationsHandler);
apiRouter.get("/conversations/:id", getConversationHandler);
apiRouter.post("/conversations/:id/messages", postMessageHandler);

apiRouter.get("/banks", getBanksHandler);
apiRouter.post("/chat", postChatHandler);
