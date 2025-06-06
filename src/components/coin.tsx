
import { Coins, CheckCircle, XCircle } from 'lucide-react';

interface CoinProps {
  status: 'idle' | 'flipping' | 'heads' | 'tails';
}

export function Coin({ status }: CoinProps) {
  const baseClasses = "w-36 h-36 md:w-48 md:h-48 rounded-full flex flex-col items-center justify-center text-3xl md:text-4xl font-bold shadow-xl border-[6px] transition-all duration-300 ease-in-out";
  
  // Idle: Muted gray, as before
  const idleClasses = "bg-muted text-muted-foreground border-muted-foreground/30";
  
  // Flipping: Accent color (orange), as before
  const flippingClasses = "bg-accent/10 border-accent text-accent"; 
  
  // Heads: Light metallic (slate)
  const headsClasses = "bg-slate-200 text-slate-700 border-slate-500 transform scale-105";
  
  // Tails: Darker metallic (slate)
  const tailsClasses = "bg-slate-400 text-slate-100 border-slate-600 transform scale-105";

  if (status === 'flipping') {
    return (
      <div className={`${baseClasses} ${flippingClasses}`}>
        <Coins className="w-16 h-16 md:w-20 md:h-20 animate-spin text-accent" />
        <span className="text-sm mt-2 font-medium">Flipping...</span>
      </div>
    );
  }

  if (status === 'heads') {
    return (
      <div className={`${baseClasses} ${headsClasses} ring-4 ring-slate-500/50 ring-offset-4 ring-offset-background`}>
        <CheckCircle className="w-12 h-12 md:w-16 md:h-16 mb-2" />
        HEADS
      </div>
    );
  }

  if (status === 'tails') {
    return (
      <div className={`${baseClasses} ${tailsClasses} ring-4 ring-slate-600/50 ring-offset-4 ring-offset-background`}>
        <XCircle className="w-12 h-12 md:w-16 md:h-16 mb-2" />
        TAILS
      </div>
    );
  }

  // Idle state
  return (
    <div className={`${baseClasses} ${idleClasses}`}>
      <Coins className="w-12 h-12 md:w-16 md:h-16 mb-1 opacity-70" />
      <span className="text-xl font-medium">Ready?</span>
    </div>
  );
}
