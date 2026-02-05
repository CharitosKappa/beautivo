"use client";

import { useState } from "react";
import { Button } from "../ui/button";

export default function CookieConsent() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 mx-auto max-w-3xl rounded-lg border border-border bg-background p-4 shadow-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          We use cookies to improve your experience. You can update your
          preferences anytime.
        </p>
        <Button onClick={() => setVisible(false)}>Accept</Button>
      </div>
    </div>
  );
}
