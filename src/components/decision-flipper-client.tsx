
"use client";

import type { GenerateDecisionOptionsOutput } from "@/ai/flows/generate-decision-options";
import { generateDecisionOptions } from "@/ai/flows/generate-decision-options";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Coins, Loader2, HelpCircle, Info, Mic, MicOff } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Coin } from "./coin";

type Status = "idle" | "loadingAi" | "flipping" | "resultShown";

export function DecisionFlipperClient() {
  const [question, setQuestion] = useState<string>("");
  const [options, setOptions] = useState<GenerateDecisionOptionsOutput | null>(null);
  const [flipResult, setFlipResult] = useState<"heads" | "tails" | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [isListening, setIsListening] = useState(false);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechRecognitionSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        // Use the final transcript to update the state, adding a space if needed
        setQuestion(prev => (prev ? prev + ' ' : '') + finalTranscript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        toast({
          title: "Dictation Error",
          description: `An error occurred: ${event.error}`,
          variant: "destructive",
        });
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [toast]);

  const handleDictation = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
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

    try {
      const generatedOptions = await generateDecisionOptions({ question });
      setOptions(generatedOptions);
      setStatus("flipping");

      // Simulating coin flip delay and result
      const outcome = Math.random() < 0.5 ? "heads" : "tails";
      
      setTimeout(() => {
        setFlipResult(outcome);
        setStatus("resultShown");
      }, 2500); // Adjust delay as needed
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
  const isTextareaDisabled = status !== "idle" && status !== "resultShown";
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
        <CardContent className="space-y-8"> {/* Increased spacing */}
          <div className="space-y-2">
            <Label htmlFor="question" className="flex items-center text-md font-medium">
              <HelpCircle className="w-5 h-5 mr-2 text-primary" />
              What's on your mind?
            </Label>
            <div className="relative">
              <Textarea
                id="question"
                placeholder="e.g., Should I order pizza tonight?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                className="text-base focus:ring-2 focus:ring-primary pr-12"
                disabled={isTextareaDisabled || isListening}
              />
              {isSpeechRecognitionSupported && (
                 <Button
                    size="icon"
                    variant={isListening ? "destructive" : "outline"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={handleDictation}
                    disabled={isTextareaDisabled}
                    title={isListening ? "Stop dictation" : "Start dictation"}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    <span className="sr-only">{isListening ? "Stop dictation" : "Start dictation"}</span>
                 </Button>
              )}
            </div>
          </div>

          <div className="flex justify-center my-8 h-48 md:h-56 items-center">
            <Coin status={coinStatus} />
          </div>

          {status === "flipping" && options && (
            <div className="p-4 space-y-3 text-center bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">The AI suggests:</p>
              <p><strong className="text-primary">Heads:</strong> {options.heads}</p>
              <p><strong className="text-slate-600">Tails:</strong> {options.tails}</p>
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
      <div className="mt-8 text-xs text-muted-foreground max-w-lg text-center p-4 border border-border rounded-md bg-muted">
        <Info className="w-4 h-4 inline mr-1 mb-0.5" />
        This app is designed to help you make decisions for things that are insignificant, but ultimately the choice is always yours.
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Powered by Generative AI & a bit of luck.
      </p>
    </div>
  );
}
