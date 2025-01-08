import { Suspense } from "react";
import MemeChatroom from "../../../../../components/MemeChatroom";
import { Loader2 } from "lucide-react";

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-black text-neon-blue">
    <div className="text-center">
      <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin" />
      <p className="text-2xl font-bold animate-pulse">
        Initializing Meme Chatroom...
      </p>
    </div>
  </div>
);

export default function MemeChatroomPage({
  params,
}: {
  params: { battleId: string; memeIndex: string };
}) {
  return (
    <div className="min-h-screen bg-black text-neon-blue p-4">
      <Suspense fallback={<LoadingScreen />}>
        <MemeChatroom
          battleId={params.battleId}
          memeIndex={parseInt(params.memeIndex)}
        />
      </Suspense>
    </div>
  );
}
