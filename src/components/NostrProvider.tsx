"use client";

import { createContext, useEffect, useState } from "react";
import {
  Client,
  loadWasmSync,
  Nip07Signer,
  NostrSigner,
} from "@rust-nostr/nostr-sdk";

interface NostrProviderProps {
  withSigner?: boolean;
  relays: string[];
  children: React.ReactNode;
}

interface NostrContextProps {
  client: Client | null;
}

const NostrContext = createContext({
  client: null,
  pubKey: null,
} as NostrContextProps);

const NostrProvider: React.FC<NostrProviderProps> = ({
  withSigner = false,
  relays,
  children,
}) => {
  const [client, setClient] = useState<Client | null>(null);
  const [signer, setSigner] = useState<NostrSigner | null>(null);

  loadWasmSync();

  useEffect(() => {
    if (withSigner) {
      const nip07Signer = new Nip07Signer();

      const newSigner = NostrSigner.nip07(nip07Signer);
      setSigner(newSigner);
    }

    const newClient = new Client(signer || undefined);

    relays.map(async (relay) => {
      await newClient.addRelay(relay);
    });

    newClient.connect().then(() => {
      setClient(newClient);
    });
  }, [withSigner, relays]);

  const values: NostrContextProps = { client };

  return (
    <NostrContext.Provider value={values}>{children}</NostrContext.Provider>
  );
};

export { NostrProvider, NostrContext };
