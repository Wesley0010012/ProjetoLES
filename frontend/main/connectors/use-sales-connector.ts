"use client";
import { useEffect, useMemo, useState } from "react";
import type { Exchange, Sale } from "@/domain/models/sales";
import { makeSalesGateway } from "@/main/factories/make-sales-gateway";

export function useSalesConnector() {
  const gateway = useMemo(() => makeSalesGateway(), []);
  const [sales, setSales] = useState<Sale[]>([]);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [review, setReview] = useState<{
    exchange: Exchange;
    decision: "ACCEPT" | "REJECT";
  } | null>(null);
  const [reviewObservation, setReviewObservation] = useState("");
  useEffect(() => {
    Promise.all([gateway.list(), gateway.exchanges()])
      .then(([nextSales, nextExchanges]) => {
        setSales(nextSales);
        setExchanges(nextExchanges);
      })
      .catch((cause) => setError(errorMessage(cause)))
      .finally(() => setLoading(false));
  }, [gateway]);
  const advanceSale = (id: number, status: string) =>
    setSales((items) =>
      items.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  const advanceExchange = (id: number, status: string) =>
    setExchanges((items) =>
      items.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  async function finishExchange(id: number) {
    setUpdating(`exchange-${id}`);
    setError(null);
    try {
      const coupon = await gateway.receiveExchange(id, true, new Date().toISOString());
      setExchanges((items) =>
        items.map((item) =>
          item.id === id
            ? { ...item, status: "TROCA PROCESSADA", coupon, returnToStock: true }
            : item,
        ),
      );
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setUpdating(null);
    }
  }
  function openReview(exchange: Exchange, decision: "ACCEPT" | "REJECT") {
    setReview({ exchange, decision });
    setReviewObservation("");
  }
  async function submitReview() {
    if (!review || reviewObservation.trim().length < 5) {
      setError("Informe uma observação com pelo menos 5 caracteres.");
      return;
    }
    setUpdating(`exchange-${review.exchange.id}`);
    setError(null);
    try {
      const observation = reviewObservation.trim();
      if (review.decision === "ACCEPT")
        await gateway.authorizeExchange(review.exchange.id, observation);
      else await gateway.rejectExchange(review.exchange.id, observation);
      setExchanges((items) =>
        items.map((item) =>
          item.id === review.exchange.id
            ? {
                ...item,
                status:
                  review.decision === "ACCEPT" ? "TROCA AUTORIZADA" : "TROCA NEGADA",
                reviewObservation: observation,
              }
            : item,
        ),
      );
      setReview(null);
      setReviewObservation("");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setUpdating(null);
    }
  }
  return {
    sales,
    exchanges,
    loading,
    error,
    updating,
    selectedSale,
    setSelectedSale,
    review,
    setReview,
    reviewObservation,
    setReviewObservation,
    advanceSale,
    advanceExchange,
    finishExchange,
    openReview,
    submitReview,
  };
}
function errorMessage(cause: unknown) {
  return cause instanceof Error ? cause.message : "Não foi possível concluir a operação.";
}
