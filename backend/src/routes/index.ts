import { Router } from "express";
import { getBanksHandler } from "../controllers/banks.js";
import { postChatHandler } from "../controllers/chat.js";
import {
  getConversationHandler,
  getConversationsHandler,
  postMessageHandler,
} from "../controllers/conversations.js";
import { createCheckoutHandler } from "../controllers/payments.js";
import {
  comparePropertiesHandler,
  getPropertiesHandler,
  getPropertyHandler,
  mapPropertiesHandler,
  searchPropertiesHandler,
} from "../controllers/properties.js";
import { uploadPropertyImageHandler } from "../controllers/storage.js";
import { protect } from "../shared/middlewares/auth.js";
import { upload } from "../shared/middlewares/upload.js";
import { aiRouter } from "./ai.js";
import { authRouter } from "./auth.js";
import { favoritesRouter } from "./favorites.js";
import { notificationsRouter } from "./notifications.js";
import { reviewsRouter } from "./reviews.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/ai", aiRouter);
apiRouter.use("/notifications", notificationsRouter);
apiRouter.use("/favorites", favoritesRouter);
apiRouter.use("/reviews", reviewsRouter);

// Routes propriétés spécifiques AVANT /:id
apiRouter.get("/properties/search", searchPropertiesHandler);
apiRouter.get("/properties/map", mapPropertiesHandler);
apiRouter.post("/properties/compare", comparePropertiesHandler);
apiRouter.get("/properties", getPropertiesHandler);
apiRouter.get("/properties/:id", getPropertyHandler);
apiRouter.post("/properties/:id/image", protect, upload.single("image"), uploadPropertyImageHandler);

apiRouter.get("/conversations", getConversationsHandler);
apiRouter.get("/conversations/:id", getConversationHandler);
apiRouter.post("/conversations/:id/messages", postMessageHandler);

apiRouter.get("/banks", getBanksHandler);
apiRouter.post("/chat", postChatHandler);

apiRouter.post("/payments/checkout", protect, createCheckoutHandler);
