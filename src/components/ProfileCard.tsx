"use client";

import { Client, loadWasmAsync, PublicKey } from "@rust-nostr/nostr-sdk";
import React, { ReactNode, useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export const ProfileCard: React.FC<{
  npub: string;
  relays: string[];
  children: ReactNode;
}> = ({ npub, relays, children }) => {
  const [client, setClient] = useState<Client>();
  const [banner, setProfileBanner] = useState<string>();
  const [name, setProfileName] = useState<string>();
  const [picture, setProfilePicture] = useState<string>();

  const [isConnecting, setIsConnecting] = useState<boolean>(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
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
    const fetchProfile = async () => {
      if (!client) return;

      try {
        const pubKey = PublicKey.parse(npub);
        const profile = await client.fetchMetadata(pubKey);

        setProfileBanner(profile.getBanner());
        setProfileName(profile.getDisplayName());
        setProfilePicture(profile.getPicture());
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setError("Falha ao carregar os dados do perfil. Tente Novamente");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [client, npub]);

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
          {isLoadingProfile ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-center text-gray-600">Carregando perfil...</p>
            </div>
          ) : (
            <>
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
                Envie uma mensagem para{" "}
                <span className="font-bold">{name}</span> usando satoshis
              </p>
            </>
          )}
        </CardHeader>

        <CardContent>{!isLoadingProfile && children}</CardContent>
      </Card>
    </>
  );
};
