import { prisma, type MessageRole } from "@viewbeforebuy/database";

export async function listConversations() {
  return prisma.conversation.findMany({
    include: { messages: { orderBy: { createdAt: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getConversation(id: string) {
  return prisma.conversation.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}

export async function appendMessage(
  conversationId: string,
  message: { role: MessageRole; content: string; timestamp: string },
) {
  const [, conversation] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp,
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: message.content,
        timestamp: "À l'instant",
        unread: message.role === "user",
      },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    }),
  ]);

  return conversation;
}
