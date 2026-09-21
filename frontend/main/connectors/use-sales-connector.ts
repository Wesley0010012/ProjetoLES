"use client";
import { useEffect, useMemo, useState } from "react";
import type { Exchange, Sale } from "@/domain/models/sales";
import { makeSalesGateway } from "@/main/factories/make-sales-gateway";

export function useSalesConnector() {
  const gateway = useMemo(() => makeSalesGateway(), []);
  const [salesPage, setSalesPage] = useState(1);
  const [exchangesPage, setExchangesPage] = useState(1);
  const [salesPagination, setSalesPagination] = useState({
    totalEntities: 0,
    totalPages: 0,
  });
  const [exchangesPagination, setExchangesPagination] = useState({
    totalEntities: 0,
    totalPages: 0,
  });
  const pageSize = 20;
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
    let cancelled = false;
    Promise.all([
      gateway.listPage(salesPage, pageSize),
      gateway.exchangesPage(exchangesPage, pageSize),
    ])
      .then(([nextSales, nextExchanges]) => {
        if (cancelled) return;
        setSales(nextSales.entities);
        setExchanges(nextExchanges.entities);
        setSalesPagination({
          totalEntities: nextSales.totalEntities,
          totalPages: nextSales.totalPages,
        });
        setExchangesPagination({
          totalEntities: nextExchanges.totalEntities,
          totalPages: nextExchanges.totalPages,
        });
      })
      .catch((cause) => {
        if (!cancelled) setError(errorMessage(cause));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [gateway, salesPage, exchangesPage]);
  async function refresh() {
    const [nextSales, nextExchanges] = await Promise.all([
      gateway.listPage(salesPage, pageSize),
      gateway.exchangesPage(exchangesPage, pageSize),
    ]);
    setSales(nextSales.entities);
    setExchanges(nextExchanges.entities);
    setSalesPagination({
      totalEntities: nextSales.totalEntities,
      totalPages: nextSales.totalPages,
    });
    setExchangesPagination({
      totalEntities: nextExchanges.totalEntities,
      totalPages: nextExchanges.totalPages,
    });
  }
  async function advanceSale(id: number, status: string) {
    setUpdating(`sale-${id}`);
    setError(null);
    try {
      if (status === "EM PROCESSAMENTO") await gateway.process(id);
      else if (status === "PAGAMENTO REALIZADO") await gateway.confirmPayment(id);
      else if (status === "EM TRANSITO") await gateway.dispatch(id);
      else if (status === "ENTREGUE") await gateway.deliver(id);
      await refresh();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setUpdating(null);
    }
  }
  async function advanceExchange(id: number) {
    setUpdating(`exchange-${id}`);
    setError(null);
    try {
      await gateway.markExchangeReceived(id);
      await refresh();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setUpdating(null);
    }
  }
  async function finishExchange(id: number) {
    setUpdating(`exchange-${id}`);
    setError(null);
    try {
      await gateway.receiveExchange(id, true, new Date().toISOString());
      await refresh();
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
      await refresh();
      setReview(null);
      setReviewObservation("");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setUpdating(null);
    }
  }
  function changeSalesPage(page: number) {
    setLoading(true);
    setError(null);
    setSalesPage(page);
  }
  function changeExchangesPage(page: number) {
    setLoading(true);
    setError(null);
    setExchangesPage(page);
  }
  return {
    salesPage,
    setSalesPage: changeSalesPage,
    exchangesPage,
    setExchangesPage: changeExchangesPage,
    salesPagination,
    exchangesPagination,
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
