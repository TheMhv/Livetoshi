"use client";

import { useEffect } from "react";

export const RemoveLogo: React.FC = () => {
  useEffect(() => {
    const logoElement = document.getElementById("logo");
    if (logoElement) {
      logoElement.style.display = "none";
    }
  }, []);

  return <></>;
};
