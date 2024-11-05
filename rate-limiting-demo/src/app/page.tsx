"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LogsIcon, RefreshCwIcon, AlertTriangleIcon } from "lucide-react";

export default function Home() {
  const [remainingTokens, setRemainingTokens] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [requestLog, setRequestLog] = useState<string[]>([]);
  const [refillCountdown, setRefillCountdown] = useState<number>(0);

  // Function to make the API request and update the UI
  const handleRequest = async () => {
    try {
      const response = await fetch("/api/rate-limited");
      const data = await response.json();

      if (response.status === 200) {
        setRemainingTokens(data.remainingTokens);
        setMessage(data.message);
        setRequestLog((prev) => [
          ...prev,
          `Request successful! Tokens left: ${data.remainingTokens}`,
        ]);
      } else {
        setMessage(data.message);
        setRequestLog((prev) => [
          ...prev,
          `Rate limit hit! Please wait to refill tokens.`,
        ]);
      }
    } catch (error) {
      setMessage("An error occurred");
      setRequestLog((prev) => [...prev, "An error occurred"]);
    }
  };

  // Refill countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRefillCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      if (refillCountdown === 0) {
        setRemainingTokens((tokens) =>
          tokens !== null && tokens < 10 ? tokens + 1 : tokens
        );
        setRefillCountdown(5); // Reset countdown after refill
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [refillCountdown]);

  return (
    <div className="flex flex-col items-center gap-8 p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-2xl">
            Token Bucket Rate Limiting Demo
          </CardTitle>
          <RefreshCwIcon className="text-blue-500 animate-spin" size={20} />
        </CardHeader>
        <CardContent className="flex flex-col gap-4 items-center">
          <div className="text-center">
            <p className="font-semibold">
              Refill Countdown: {refillCountdown} seconds
            </p>
          </div>
          <Button onClick={handleRequest} className="w-full">
            Make API Request
          </Button>

          {message && (
            <Alert className="mt-4" variant="default">
              <AlertDescription className="text-center">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {remainingTokens !== null && (
            <div className="w-full mt-4">
              <p className="text-center font-semibold">
                Remaining Tokens: {remainingTokens}
              </p>
              <Progress value={(remainingTokens / 10) * 100} className="mt-2" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <LogsIcon size={20} /> Request Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {requestLog.length > 0 ? (
              requestLog.map((log, index) => (
                <li key={index} className="flex items-center gap-2">
                  <AlertTriangleIcon className="text-yellow-500" />
                  <p>{log}</p>
                </li>
              ))
            ) : (
              <li className="text-center text-gray-500">
                No requests made yet.
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
