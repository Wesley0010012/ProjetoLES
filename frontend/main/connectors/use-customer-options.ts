"use client";

import { useEffect, useState } from "react";
import {
  getCustomerOptions,
  type CustomerOptions,
} from "@/data/usecases/get-customer-options";
import { apiUrl } from "./runtime-environment";

export function useCustomerOptions() {
  const [options, setOptions] = useState<CustomerOptions>({
    genders: [],
    phoneTypes: [],
    residenceTypes: [],
    streetTypes: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    getCustomerOptions(apiUrl())
      .then((value) => {
        if (active) setOptions(value);
      })
      .catch(() => {
        if (active) setError("Não foi possível carregar as opções de cadastro.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  return {
    ...options,
    error,
    loading,
    retry: () => {
      setError(null);
      setLoading(true);
      setAttempt((value) => value + 1);
    },
  };
}
