"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type OrderStatusRefreshProps = {
  status: string;
};

export function OrderStatusRefresh({ status }: OrderStatusRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    if (status !== "pending") {
      return;
    }

    const timer = window.setInterval(() => {
      router.refresh();
    }, 10_000);

    return () => window.clearInterval(timer);
  }, [router, status]);

  return null;
}