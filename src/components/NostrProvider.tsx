"use client";

import { createContext, useState, useEffect } from "react";
import {
  Client,
  loadWasmSync,
  Nip07Signer,
  NostrSigner,
} from "@rust-nostr/nostr-sdk";
import { Settings, loadConfig } from "@/lib/config";

interface NostrProviderProps {
  children: React.ReactNode;
}

interface NostrContextProps {
  client: Client | null;
  signer: Nip07Signer | null;
}

const NostrContext = createContext({
  client: null,
  signer: null,
} as NostrContextProps);

const config: Settings = loadConfig();

const NostrProvider: React.FC<NostrProviderProps> = ({ children }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [signer, setSigner] = useState<Nip07Signer | null>(null);

  loadWasmSync();

  useEffect(() => {
    const nip07Signer = new Nip07Signer();
    setSigner(nip07Signer);

    const newSigner = NostrSigner.nip07(nip07Signer);
    const newClient = new Client(newSigner);

    const relays = config.RELAYS;
    relays.map(async (relay) => {
      await newClient.addRelay(relay);
    });

    newClient.connect().then(() => {
      setClient(newClient);
    });
  }, []);

  return (
    <NostrContext.Provider value={{ client, signer } as NostrContextProps}>
      {children}
    </NostrContext.Provider>
  );
};

export { NostrProvider, NostrContext };
