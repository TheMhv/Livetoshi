"use client";

import React, { useCallback, useContext, useEffect, useState } from "react";
import { Metadata, PublicKey } from "@rust-nostr/nostr-sdk";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LuLoader2, LuLogOut, LuUser } from "react-icons/lu";
import { NostrContext } from "@/components/NostrProvider";

interface ProfileDropdownProps {
  user: Metadata;
  onSignOut: () => void;
  isLoading?: boolean;
}

const DefaultAvatar: React.FC = () => (
  <div className="h-full w-full bg-gray-600 rounded-full flex items-center justify-center">
    <LuUser className="h-6 w-6 text-gray-300" />
  </div>
);

const ProfileImage: React.FC<{ user: Metadata }> = ({ user }) => {
  const [imageError, setImageError] = useState(false);
  const picture = user.getPicture();

  if (!picture || imageError) {
    return <DefaultAvatar />;
  }

  return (
    <Image
      src={picture}
      fill
      alt={`${user.getDisplayName() || "User"}'s avatar`}
      className="absolute top-0 left-0 object-cover rounded-full"
      onError={() => setImageError(true)}
      priority
    />
  );
};

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  user,
  onSignOut,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-profile-dropdown]")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    onSignOut();
    setIsOpen(false);
  };

  return (
    <div className="relative" data-profile-dropdown>
      <Button
        type="button"
        variant="ghost"
        size="lg"
        className={`
          relative flex items-center gap-2 rounded-full w-full p-1
          ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-700"}
          transition-all duration-200 ease-in-out
        `}
        onClick={() => !isLoading && setIsOpen(!isOpen)}
        disabled={isLoading}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Profile menu"
      >
        <div className="relative w-10 h-10 flex-shrink-0">
          {isLoading ? (
            <LuLoader2 className="h-full w-full animate-spin text-gray-300" />
          ) : (
            <ProfileImage user={user} />
          )}
        </div>
        <span className="truncate max-w-[150px] mr-2 font-medium">
          {user.getDisplayName() || "Anonymous User"}
        </span>
      </Button>

      {isOpen && (
        <Card className="absolute right-0 mt-2 w-full z-50 transform opacity-100 scale-100 transition-all duration-200 ease-in-out">
          <nav className="py-1" role="menu" aria-orientation="vertical">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 rounded-none hover:bg-gray-100"
              onClick={handleSignOut}
              role="menuitem"
            >
              <LuLogOut className="h-4 w-4" />
              Sair
            </Button>
          </nav>
        </Card>
      )}
    </div>
  );
};

export default function ProfileBadge() {
  const [pubkey, setPubkey] = useState<PublicKey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<Metadata | null>(null);

  const { signer, client } = useContext(NostrContext);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("nostr_user");
      if (savedUser) {
        setUser(Metadata.fromJson(savedUser));
      }
    } catch (error) {
      console.error("Error loading user from localStorage:", error);
    }
  }, []);

  const getPubkey = useCallback(async () => {
    if (!signer) return;

    try {
      const signerPubKey = await signer.getPublicKey();
      setPubkey(signerPubKey);
    } catch (error) {
      console.error("Error getting public key:", error);
      setError("Failed to get public key");
    }
  }, [signer]);

  const getProfile = useCallback(async () => {
    if (!client || !pubkey) return;

    try {
      const metadata = await client.fetchMetadata(pubkey);
      setUser(metadata);
      localStorage.setItem("nostr_user", metadata.asJson());
    } catch (error) {
      console.error("Error fetching user metadata:", error);
      setError("Failed to fetch user profile");
    } finally {
      setIsLoading(false);
    }
  }, [client, pubkey]);

  useEffect(() => {
    getPubkey();
  }, [getPubkey]);

  useEffect(() => {
    if (pubkey) {
      getProfile();
    }
  }, [getProfile, pubkey]);

  const handleSignOut = useCallback(() => {
    setUser(null);
    setPubkey(null);
    setError(null);
    localStorage.removeItem("nostr_user");
  }, []);

  const LoadingSkeleton = () => (
    <div className="w-40 h-12 rounded-full bg-gray-700 animate-pulse flex items-center justify-center">
      <LuLoader2 className="h-6 w-6 animate-spin text-gray-400" />
    </div>
  );

  if (error) {
    return (
      <Button
        variant="ghost"
        className="text-red-500"
        onClick={() => {
          setError(null);
          setIsLoading(true);
          getPubkey();
        }}
      >
        Tentar novamente
      </Button>
    );
  }

  if (!user) {
    if (isLoading) {
      return <LoadingSkeleton />;
    }
    return null;
  }

  return (
    <ProfileDropdown
      user={user}
      onSignOut={handleSignOut}
      isLoading={isLoading}
    />
  );
}
