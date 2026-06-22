"use client";

import { useEffect, useState } from "react";
import {
  getClientId,
  hasVotedLocally,
  markVotedLocally,
} from "@/lib/client-id";

interface VoteButtonProps {
  signalementId: string;
  initialVotes: number;
}

export default function VoteButton({ signalementId, initialVotes }: VoteButtonProps) {
  const [votes, setVotes] = useState(initialVotes);
  const [voted, setVoted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setVoted(hasVotedLocally(signalementId));
  }, [signalementId]);

  async function vote() {
    if (voted || busy) return;
    setBusy(true);
    // Optimiste
    setVotes((v) => v + 1);
    setVoted(true);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: signalementId, clientId: getClientId() }),
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.votes === "number") setVotes(data.votes);
        markVotedLocally(signalementId);
      } else if (res.status === 409) {
        // Déjà voté (détecté côté serveur) : on garde l'état "voté".
        markVotedLocally(signalementId);
      } else {
        // Échec : on annule l'optimisme.
        setVotes((v) => v - 1);
        setVoted(false);
      }
    } catch {
      setVotes((v) => v - 1);
      setVoted(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={vote}
      disabled={voted || busy}
      aria-label={`Soutenir cette proposition (${votes} votes)`}
      className={[
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition active:scale-95",
        voted
          ? "bg-primary text-white"
          : "bg-primary-50 text-primary hover:bg-primary-100",
      ].join(" ")}
    >
      <span aria-hidden>👍</span>
      <span>{votes}</span>
    </button>
  );
}
