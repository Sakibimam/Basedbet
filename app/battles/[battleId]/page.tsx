import { Suspense } from "react";
import BattleDetails from "../../../components/BattleDetails";
import { Loader2 } from "lucide-react";

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-black text-neon-blue">
    <div className="text-center">
      <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin" />
      <p className="text-2xl font-bold animate-pulse">
        Initializing Cyber Battle...
      </p>
    </div>
  </div>
);

export default function BattleDetailsPage({
  params,
}: {
  params: { battleId: string };
}) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <BattleDetails battleId={params.battleId} />
    </Suspense>
  );
}
