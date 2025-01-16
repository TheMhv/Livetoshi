"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Client,
  Event,
  EventSource,
  Filter,
  Kind,
  loadWasmSync,
  Timestamp,
} from "@rust-nostr/nostr-sdk";
import { loadConfig, Settings } from "@/lib/config";
import { clientConnect } from "@/lib/nostr/client";
import { ProgressBar } from "./ui/progressBar";

const config: Settings = loadConfig();

interface GoalWidgetProps {
  goalEventJson: string;
}

export const GoalWidget: React.FC<GoalWidgetProps> = ({ goalEventJson }) => {
  const [client, setClient] = useState<Client>();
  const [zapsSum, setZapsSum] = useState<number>(0);

  loadWasmSync();
  const goalEvent = Event.fromJson(goalEventJson);

  const goalName = goalEvent.content;
  const goalTotal = parseInt(goalEvent.getTagContent("amount") || "0");

  const fetchEvents = useCallback(async () => {
    if (!client) {
      setClient(await clientConnect());
    }

    if (!client || !goalEvent) return;

    const filter = new Filter()
      .kind(new Kind(9735))
      .event(goalEvent.id)
      .until(Timestamp.now());

    const zapsEvents = (
      await client.getEventsOf([filter], EventSource.relays())
    ).sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

    const zapsSum = zapsEvents.reduce((sum, zap) => {
      const amount = parseInt(
        Event.fromJson(zap.getTagContent("description") || "").getTagContent(
          "amount"
        ) || "0"
      );
      return sum + amount;
    }, 0);

    setZapsSum(zapsSum);
  }, [client, goalEvent]);

  useEffect(() => {
    const intervalId = setInterval(fetchEvents, config.QUEUE_CHECK_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchEvents]);

  return (
    <GoalBar name={goalName} currentAmount={zapsSum} totalAmount={goalTotal} />
  );
};

const GoalBar: React.FC<{
  name?: string;
  currentAmount: number;
  totalAmount: number;
}> = ({ name, currentAmount, totalAmount }) => {
  const progressPercentage = (currentAmount / totalAmount) * 100;

  return (
    <div className="max-w-max text-white">
      <p className="text-center font-bold">{name}</p>

      <div>
        <ProgressBar progress={progressPercentage} />
        <div className="flex items-center justify-between w-full">
          <span className="font-bold text-primary">
            {progressPercentage.toFixed(2)}%
          </span>

          <span>
            {currentAmount} / <span className="font-bold">{totalAmount}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
