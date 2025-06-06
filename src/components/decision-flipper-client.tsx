"use client";

import type { GenerateDecisionOptionsOutput } from "@/ai/flows/generate-decision-options";
import { generateDecisionOptions } from "@/ai/flows/generate-decision-options";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Coins, Loader2, Lightbulb, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Coin } from "./coin";

type Status = "idle" | "loadingAi" | "flipping" | "resultShown";

export function DecisionFlipperClient() {
  const [question, setQuestion] = useState<string>("");
  const [options, setOptions] = useState<GenerateDecisionOptionsOutput | null>(null);
  const [flipResult, setFlipResult] = useState<"heads" | "tails" | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const { toast } = useToast();

  const handleFlip = async () => {
    if (!question.trim()) {
      toast({
        title: "Uh oh!",
        description: "Please enter a question before flipping.",
        variant: "destructive",
      });
      return;
    }

    setStatus("loadingAi");
    setOptions(null);
    setFlipResult(null);

    try {
      const generatedOptions = await generateDecisionOptions({ question });
      setOptions(generatedOptions);
      setStatus("flipping");

      // Determine flip outcome immediately but show animation
      const outcome = Math.random() < 0.5 ? "heads" : "tails";
      
      // Simulate flip animation duration
      setTimeout(() => {
        setFlipResult(outcome);
        setStatus("resultShown");
      }, 2500); // 2.5 seconds for animation
    } catch (error) {
      console.error("Error generating decision options:", error);
      toast({
        title: "AI Error",
        description: "Failed to get suggestions. Please try again.",
        variant: "destructive",
      });
      setStatus("idle");
    }
  };

  const handleReset = () => {
    setQuestion("");
    setOptions(null);
    setFlipResult(null);
    setStatus("idle");
  };

  const getButtonText = () => {
    if (status === "loadingAi") return "Consulting the Fates...";
    if (status === "flipping") return "Flipping...";
    if (status === "resultShown") return "Flip Again?";
    return "Flip for it!";
  };

  const isButtonDisabled = status === "loadingAi" || status === "flipping";

  const coinStatus = status === 'flipping' ? 'flipping' : flipResult || 'idle';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-lg shadow-2xl rounded-xl">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <Coins className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-4xl font-bold font-headline">Decision Flipper</CardTitle>
          <CardDescription className="text-lg">Can't decide? Let fate choose for you!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="question" className="flex items-center text-md font-medium">
              <HelpCircle className="w-5 h-5 mr-2 text-primary" />
              What's on your mind?
            </Label>
            <Textarea
              id="question"
              placeholder="e.g., Should I order pizza tonight?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              className="text-base focus:ring-2 focus:ring-primary"
              disabled={status !== "idle" && status !== "resultShown"}
            />
          </div>

          <div className="flex justify-center my-8 h-48 md:h-56 items-center"> {/* Increased height for coin */}
            <Coin status={coinStatus} />
          </div>

          {status === "flipping" && options && (
            <div className="p-4 space-y-3 text-center bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">The AI suggests:</p>
              <p><strong className="text-primary">Heads:</strong> {options.heads}</p>
              <p><strong className="text-secondary-foreground">Tails:</strong> {options.tails}</p>
            </div>
          )}
          
          {status === "resultShown" && flipResult && options && (
            <div className="p-6 space-y-3 text-center bg-primary/10 border border-primary rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold text-primary font-headline">
                The coin landed on: <span className="uppercase">{flipResult}!</span>
              </h3>
              <p className="text-lg">
                {flipResult === "heads" ? options.heads : options.tails}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={status === "resultShown" ? handleReset : handleFlip}
            className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground rounded-md shadow-md transition-transform active:scale-95"
            disabled={isButtonDisabled}
            aria-live="polite"
          >
            {isButtonDisabled && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
            {getButtonText()}
          </Button>
        </CardFooter>
      </Card>
      <p className="mt-8 text-sm text-muted-foreground">
        Powered by Generative AI & a bit of luck.
      </p>
    </div>
  );
}
