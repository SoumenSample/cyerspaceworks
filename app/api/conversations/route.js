import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectToDatabase } from "@/lib/mongodb";
import Conversation from "@/lib/models/Conversation";
import Message from "@/lib/models/Message";
import mongoose from "mongoose";

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return Response.json({ messages: [] });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return Response.json({ messages: [] });
  }

  await connectToDatabase();

  const convo = await Conversation.findOne({
    participants: { $all: [session.user.id, userId] },
  });

  if (!convo) return Response.json({ messages: [] });

  await Message.updateMany(
    {
      conversationId: convo._id,
      receiver: session.user.id,
      seen: false,
    },
    { $set: { seen: true } }
  );

  const messages = await Message.find({
    conversationId: convo._id,
  }).sort({ createdAt: 1 });

  return Response.json({ messages });
}