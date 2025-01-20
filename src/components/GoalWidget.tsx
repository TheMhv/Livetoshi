"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Client,
  Event,
  EventSource,
  Filter,
  Kind,
  Timestamp,
} from "@rust-nostr/nostr-sdk";
import { loadConfig, Settings } from "@/lib/config";
import { clientConnect } from "@/lib/nostr/client";
import { ProgressBar } from "./ui/progressBar";
import { RemoveLogo } from "./utils/RemoveLogo";
import { getEvent } from "@/lib/nostr/events";

const config: Settings = loadConfig();

interface GoalWidgetProps {
  goalEventId: string;
}

export const GoalWidget: React.FC<GoalWidgetProps> = ({ goalEventId }) => {
  const [client, setClient] = useState<Client>();
  const [zapsSum, setZapsSum] = useState<number>(0);

  const [goalEvent, setGoalEvent] = useState<Event>();
  const [goalName, setGoalName] = useState<string>("");
  const [goalTotal, setGoalTotal] = useState<number>(0);

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
      return sum + amount / 1000;
    }, 0);

    setZapsSum(zapsSum);
  }, [client, goalEvent]);

  const setupGoalParams = useCallback(async () => {
    setGoalEvent(await getEvent(goalEventId));

    if (!goalEvent) {
      return;
    }

    setGoalName(goalEvent.content);
    setGoalTotal(parseInt(goalEvent.getTagContent("amount") || "0"));
  }, [goalEvent, goalEventId]);

  useEffect(() => {
    setupGoalParams().finally(() => {
      const intervalId = setInterval(fetchEvents, config.QUEUE_CHECK_INTERVAL);
      return () => clearInterval(intervalId);
    });
  }, [fetchEvents, setupGoalParams]);

  return goalEvent && zapsSum && goalTotal ? (
    <>
      <GoalBar
        name={goalName}
        currentAmount={zapsSum}
        totalAmount={goalTotal}
      />
      <RemoveLogo />
    </>
  ) : (
    <p className="text-black text-center font-bold max-w-max">Loading...</p>
  );
};

const GoalBar: React.FC<{
  name?: string;
  currentAmount: number;
  totalAmount: number;
}> = ({ name, currentAmount, totalAmount }) => {
  const progressPercentage = (currentAmount / totalAmount) * 100 * 1000;

  return (
    <div className="w-[250px] text-black">
      <p className="text-center font-bold">{name}</p>

      <div>
        <ProgressBar progress={progressPercentage} />
        <div className="flex items-center justify-between w-full">
          <span className="font-bold text-primary">
            {progressPercentage.toFixed(2)}%
          </span>

          <span>
            {currentAmount} /{" "}
            <span className="font-bold">{totalAmount / 1000}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
