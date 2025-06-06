
"use client";

import type { GenerateDecisionOptionsOutput } from "@/ai/flows/generate-decision-options";
import { generateDecisionOptions } from "@/ai/flows/generate-decision-options";
import type { GenerateAdOutput } from "@/ai/flows/generate-ad-flow";
import { generateAd } from "@/ai/flows/generate-ad-flow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Coins, Loader2, HelpCircle, ShoppingCart, Info } from "lucide-react";
import Image from 'next/image';
import { useState, useEffect } from "react";
import { Coin } from "./coin";

type Status = "idle" | "loadingAi" | "flipping" | "resultShown" | "loadingAd";

export function DecisionFlipperClient() {
  const [question, setQuestion] = useState<string>("");
  const [options, setOptions] = useState<GenerateDecisionOptionsOutput | null>(null);
  const [flipResult, setFlipResult] = useState<"heads" | "tails" | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [adContent, setAdContent] = useState<GenerateAdOutput | null>(null);
  const { toast } = useToast();

  const fetchAd = async (decisionText: string) => {
    setStatus("loadingAd");
    setAdContent(null);
    try {
      const generatedAd = await generateAd({ decisionText });
      setAdContent(generatedAd);
    } catch (error) {
      console.error("Error generating ad:", error);
      toast({
        title: "Ad Error",
        description: "Could not load a relevant ad this time.",
        variant: "destructive",
      });
    } finally {
      setStatus("resultShown"); // Revert status to resultShown after ad attempt
    }
  };

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
    setAdContent(null);

    try {
      const generatedOptions = await generateDecisionOptions({ question });
      setOptions(generatedOptions);
      setStatus("flipping");

      const outcome = Math.random() < 0.5 ? "heads" : "tails";
      
      setTimeout(() => {
        setFlipResult(outcome);
        setStatus("resultShown"); // Initial status update
        const chosenDecision = outcome === "heads" ? generatedOptions.heads : generatedOptions.tails;
        fetchAd(chosenDecision); // Fetch ad after result is known
      }, 2500); 
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
    setAdContent(null);
    setStatus("idle");
  };

  const getButtonText = () => {
    if (status === "loadingAi") return "Consulting the Fates...";
    if (status === "loadingAd") return "Finding an Ad...";
    if (status === "flipping") return "Flipping...";
    if (status === "resultShown") return "Flip Again?";
    return "Flip for it!";
  };

  const isButtonDisabled = status === "loadingAi" || status === "flipping" || status === "loadingAd";
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

          <div className="flex justify-center my-8 h-48 md:h-56 items-center">
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

          {status === "loadingAd" && (
            <div className="flex flex-col items-center justify-center p-4 space-y-2 text-center bg-muted rounded-lg">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Fetching a relevant ad...</p>
            </div>
          )}

          {status === "resultShown" && adContent && adContent.adImageUrl && (
            <div className="mt-6 p-4 border border-accent/50 rounded-lg shadow-md bg-accent/10">
              <div className="flex items-center mb-2 text-sm font-medium text-accent">
                <ShoppingCart className="w-5 h-5 mr-2" />
                <span>Sponsored Ad</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-1/3 h-40 sm:h-auto relative rounded-md overflow-hidden shadow-sm">
                  <Image 
                    src={adContent.adImageUrl} 
                    alt="Generated Ad Image" 
                    layout="fill" 
                    objectFit="cover"
                    data-ai-hint="advertisement product"
                  />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-md font-semibold text-accent-foreground">{adContent.adText}</p>
                  <p className="text-xs text-muted-foreground mt-1">Prompt: "{adContent.adImagePrompt}"</p>
                </div>
              </div>
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
            {(isButtonDisabled && status !== "resultShown") && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
            {getButtonText()}
          </Button>
        </CardFooter>
      </Card>
      <div className="mt-8 text-xs text-muted-foreground max-w-lg text-center p-4 border border-dashed border-muted-foreground/30 rounded-md bg-muted/50">
        <Info className="w-4 h-4 inline mr-1 mb-0.5" />
        This app is designed to help you make decisions for things that are insignificant, but ultimately the choice is always yours. Ad content is AI-generated and may not be real.
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Powered by Generative AI & a bit of luck.
      </p>
    </div>
  );
}
