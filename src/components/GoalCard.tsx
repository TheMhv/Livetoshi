"use client";

import {
  Client,
  Event,
  EventId,
  EventSource,
  Filter,
  Kind,
  loadWasmAsync,
  Timestamp,
} from "@rust-nostr/nostr-sdk";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { ProgressBar } from "./ui/progressBar";
import Form, { FormProps } from "./Form";

export const GoalCard: React.FC<{
  id: string;
  relays: string[];
  checkInterval: number;
  formOptions: FormProps["options"];
}> = ({ id, relays, checkInterval, formOptions }) => {
  const [client, setClient] = useState<Client>();

  const [goalEvent, setGoalEvent] = useState<Event>();
  const [goalName, setGoalName] = useState<string>();
  const [goalTotal, setGoalTotal] = useState<number>(0);

  const [banner, setProfileBanner] = useState<string>();
  const [name, setProfileName] = useState<string>();
  const [picture, setProfilePicture] = useState<string>();

  const [zapsSum, setZapsSum] = useState<number>(0);
  const [goalPercentage, setGoalPercentage] = useState<number>(0);

  const [isConnecting, setIsConnecting] = useState<boolean>(true);
  const [isLoadingGoal, setIsLoadingGoal] = useState<boolean>(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const initializeClient = async () => {
      try {
        await loadWasmAsync();
        const clientInstance = new Client();

        await Promise.all(
          relays.map((relay) => clientInstance.addRelay(relay))
        );

        await clientInstance.connect();
        setClient(clientInstance);
      } catch (error) {
        console.error("Failed to initialize client:", error);
        setError("Falha ao conectar à rede Nostr. Tente novamente");
      } finally {
        setIsConnecting(false);
      }
    };

    initializeClient();

    return () => {
      if (client) {
        client.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const fetchGoal = async () => {
      if (!client) return;

      try {
        const eventId = EventId.parse(id);
        const filter = new Filter().id(eventId).until(Timestamp.now()).limit(1);

        const source = EventSource.relays();
        const events = await client.getEventsOf([filter], source);

        const goal = events[0];

        setGoalEvent(goal);
        setGoalName(goal.content);
        setGoalTotal(parseInt(goal.getTagContent("amount") || "0"));
      } catch (error) {
        console.error("Failed to fetch goal event:", error);
        setError("Falha ao carregar o evento de meta. Tente Novamente");
      }
    };

    fetchGoal();
  }, [client, id]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!client || !goalEvent) return;

      try {
        const profile = await client.fetchMetadata(goalEvent.author);

        setProfileBanner(profile.getBanner());
        setProfileName(profile.getDisplayName());
        setProfilePicture(profile.getPicture());
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setError("Falha ao carregar os dados do perfil. Tente Novamente");
      }
    };

    fetchProfile();
  }, [client, goalEvent]);

  useEffect(() => {
    const fetchZaps = async () => {
      if (!client || !goalEvent) return;

      try {
        const filter = new Filter()
          .kind(new Kind(9735))
          .event(goalEvent.id)
          .until(Timestamp.now());

        const zapsEvents = (
          await client.getEventsOf([filter], EventSource.relays())
        ).sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

        const zapsSum = zapsEvents.reduce((sum, zap) => {
          const amount = parseInt(
            Event.fromJson(
              zap.getTagContent("description") || ""
            ).getTagContent("amount") || "0"
          );
          return sum + amount / 1000;
        }, 0);

        setZapsSum(zapsSum);
        setGoalPercentage((zapsSum / goalTotal) * 100 * 1000);
      } catch (error) {
        console.error("Failed to fetch zaps events:", error);
        setError("Falha ao carregar os zaps da meta. Tente Novamente");
      } finally {
        setIsLoadingGoal(false);
      }
    };

    fetchZaps().finally(() => {
      const intervalId = setInterval(fetchZaps, checkInterval);
      return () => clearInterval(intervalId);
    });
  }, [checkInterval, client, goalEvent, goalTotal]);

  if (isConnecting) {
    return (
      <Card className="relative border border-primary min-w-[28rem] max-w-md mx-auto mt-12">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-center text-gray-600">
            Conectando à rede Nostr...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="relative border border-primary min-w-[28rem] max-w-md mx-auto mt-12">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-center text-red-600 font-medium">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingGoal) {
    return (
      <Card className="relative border border-primary min-w-[28rem] max-w-md mx-auto mt-12">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-center text-gray-600">Carregando Meta...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {banner && (
        <Image
          src={banner}
          fill
          alt="background image"
          className="absolute top-0 left-0 object-cover blur brightness-75 -z-10 w-full h-full"
        />
      )}

      <Card className="relative border border-primary min-w-[28rem] max-w-md mx-auto mt-12">
        <CardHeader className="mt-10">
          {picture && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-4 border-card rounded-full overflow-hidden w-28 h-28">
              <Image
                src={picture}
                fill={true}
                alt={`Picture of ${name}`}
                className="object-cover"
              />
            </div>
          )}

          <h2 className="text-2xl font-bold text-center mx-auto">{name}</h2>

          <p className="text-center text-gray-600">
            Envie uma mensagem e ajude nossa meta!
          </p>

          <div className="py-2 space-y-2">
            <p className="text-center font-bold">{goalName}</p>

            <div>
              <ProgressBar progress={goalPercentage} />
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-primary">
                  {goalPercentage.toFixed(2)}%
                </span>
                <span>
                  {zapsSum} /{" "}
                  <span className="font-bold">{goalTotal / 1000}</span>
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {!isLoadingGoal && goalEvent && (
            <Form
              npub={goalEvent.author.toBech32()}
              eventId={id}
              options={formOptions}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
};
