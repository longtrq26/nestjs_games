import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";

const Line98ControlButtons = ({
  hasGame,
  isGameFinished,
  isCreatingGame,
  isGettingHint,
  canUseHint,
  onStart,
  onHint,
  onReset,
}: {
  hasGame: boolean;
  isGameFinished: boolean;
  isCreatingGame: boolean;
  isGettingHint: boolean;
  canUseHint: boolean;
  onStart: () => void;
  onHint: () => void;
  onReset: () => void;
}) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      {!hasGame ? (
        <Button
          onClick={onStart}
          className="w-full bg-black text-white hover:bg-gray-800 transition-colors py-3 text-lg font-semibold"
          disabled={isCreatingGame}
        >
          {isCreatingGame ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Game...
            </>
          ) : (
            "Start New Game"
          )}
        </Button>
      ) : (
        <>
          <Button
            onClick={onHint}
            className="w-full bg-gray-800 text-white hover:bg-black transition-colors py-3 text-lg font-semibold"
            disabled={!canUseHint || isGettingHint}
          >
            {isGettingHint ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Getting Hint...
              </>
            ) : (
              "Get Hint"
            )}
          </Button>

          <Button
            onClick={onReset}
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors py-3 text-lg font-semibold"
            variant="outline"
          >
            Reset Game
          </Button>

          {isGameFinished && (
            <div className="text-center text-red-700 font-extrabold text-lg mt-3">
              Game Over!
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Line98ControlButtons;
