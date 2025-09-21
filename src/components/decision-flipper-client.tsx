
"use client";

import type { GenerateDecisionOptionsOutput } from "@/ai/flows/generate-decision-options";
import { generateDecisionOptions } from "@/ai/flows/generate-decision-options";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Coins, Loader2, HelpCircle, Info, Mic, MicOff, Settings, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Coin } from "./coin";

type Status = "idle" | "loadingAi" | "flipping" | "resultShown";
const API_KEY_STORAGE_KEY = 'gemini-api-key';

export function DecisionFlipperClient() {
  const [question, setQuestion] = useState<string>("");
  const [options, setOptions] = useState<GenerateDecisionOptionsOutput | null>(null);
  const [flipResult, setFlipResult] = useState<"heads" | "tails" | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [isListening, setIsListening] = useState(false);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    // Ensure this runs only on the client
    const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setTempApiKey(storedApiKey);
    }

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
  
  const handleSaveApiKey = () => {
    if (tempApiKey.trim()) {
      setApiKey(tempApiKey);
      localStorage.setItem(API_KEY_STORAGE_KEY, tempApiKey);
      setIsSettingsOpen(false);
      toast({
        title: "API Key Saved",
        description: "Your Gemini API Key has been saved locally.",
      });
    } else {
        toast({
            title: "Invalid Key",
            description: "Please enter a valid API key.",
            variant: "destructive",
        });
    }
  };


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
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your Gemini API key in the settings.",
        variant: "destructive",
      });
      setIsSettingsOpen(true);
      return;
    }
    
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
      const generatedOptions = await generateDecisionOptions({ question, apiKey });
      setOptions(generatedOptions);
      setStatus("flipping");

      const outcome = Math.random() < 0.5 ? "heads" : "tails";
      
      setTimeout(() => {
        setFlipResult(outcome);
        setStatus("resultShown");
      }, 2500);
    } catch (error: any) {
      console.error("Error generating decision options:", error);
      let description = "Failed to get suggestions. Please try again.";
      if (error.message?.includes('API key not valid')) {
        description = "Your API key is invalid. Please check it in the settings.";
      }
      toast({
        title: "AI Error",
        description,
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
      <Card className="w-full max-w-lg shadow-2xl rounded-xl relative">
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-muted-foreground hover:text-primary">
                  <Settings className="w-6 h-6" />
                  <span className="sr-only">Settings</span>
              </Button>
          </DialogTrigger>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Settings</DialogTitle>
                  <DialogDescription>
                      Provide your own Gemini API key to use the generative features of this app. Your key is stored securely in your browser's local storage and is never sent to our servers.
                  </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                  <Label htmlFor="api-key">Gemini API Key</Label>
                  <Input 
                      id="api-key" 
                      type="password"
                      value={tempApiKey}
                      onChange={(e) => setTempApiKey(e.target.value)}
                      placeholder="Enter your Gemini API key"
                  />
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    Get a Gemini API Key from Google AI Studio
                  </a>
              </div>
              <DialogFooter>
                  <Button onClick={handleSaveApiKey}>Save Key</Button>
              </DialogFooter>
          </DialogContent>
        </Dialog>

        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <Coins className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-4xl font-bold font-headline">Decision Flipper</CardTitle>
          <CardDescription className="text-lg">Can't decide? Let fate choose for you!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
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
             {!apiKey && (
              <div className="flex items-center p-2 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
                <span>Please set your Gemini API key in settings.</span>
              </div>
            )}
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
