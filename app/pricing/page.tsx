"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";
import { PLAN_CONFIG } from "@/lib/supabase/types";
import { useI18n } from "@/lib/i18n";
import LanguageSelector from "@/app/components/LanguageSelector";

export default function PricingPage() {
  const { t } = useI18n();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) setProfile(data as Profile);
    }
    load();
  }, [supabase]);

  const handleSubscribe = async (plan: "t1" | "t2") => {
    // Check if user is logged in first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/login";
      return;
    }

    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        throw new Error(data.error || "Failed to create checkout session");
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  const handleManage = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/login";
      return;
    }

    setLoading("manage");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        throw new Error(data.error || "Failed to open portal");
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  const currentPlan = profile?.plan || "free";

  const FEATURES = {
    free: [
      t("pricing_page.creditsMonth", { count: 30 }),
      t("pricing_page.resolution720"),
      t("pricing_page.watermark"),
      t("pricing_page.gensPerDay3"),
      t("pricing_page.templateMode"),
    ],
    t1: [
      t("pricing_page.creditsMonth", { count: 200 }),
      t("pricing_page.resolution1080"),
      t("pricing_page.noWatermark"),
      t("pricing_page.gensPerDay50"),
      t("pricing_page.templateQuick"),
      t("pricing_page.edgeTts"),
    ],
    t2: [
      t("pricing_page.creditsMonth", { count: "1,000" }),
      t("pricing_page.resolution1080"),
      t("pricing_page.noWatermark"),
      t("pricing_page.unlimitedGens"),
      t("pricing_page.allModes"),
      t("pricing_page.priorityRendering"),
      t("pricing_page.allTts"),
    ],
  };

  // Each plan card
  const plans = [
    { key: "free" as const, name: "Free", price: 0, popular: false },
    { key: "t1" as const, name: "T1", price: 5, popular: true },
    { key: "t2" as const, name: "T2", price: 20, popular: false },
  ];

  return (
    // Full page with header link back to home
    <div className="min-h-screen bg-[#09090b]">
      {/* Simple header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 text-white hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt={t("common.vidcraft")} width={36} height={36} className="rounded-lg" />
            <span className="text-xl font-bold tracking-tight">{t("common.vidcraft")}</span>
          </a>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <a href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">{t("common.back")}</a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-3">{t("pricing_page.chooseYourPlan")}</h1>
          <p className="text-zinc-400">{t("pricing_page.unlockMore")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(({ key, name, price, popular }) => {
            const isCurrentPlan = currentPlan === key;
            const features = FEATURES[key];
            const isUpgrade = key !== "free" && currentPlan === "free";
            const isDowngrade = key === "free" && currentPlan !== "free";

            return (
              <div
                key={key}
                className={`relative border rounded-2xl p-6 flex flex-col ${
                  popular
                    ? "border-blue-500/50 bg-blue-500/5"
                    : "border-zinc-800 bg-zinc-900/50"
                }`}
              >
                {/* Popular badge */}
                {popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {t("pricing_page.popular")}
                    </span>
                  </div>
                )}

                {/* Plan name */}
                <h3 className="text-lg font-bold text-white mb-1">{name}</h3>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">${price}</span>
                  <span className="text-zinc-500 text-sm"> / {t("pricing_page.perMonth")}</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-green-400 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      <span className="text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action button */}
                {isCurrentPlan ? (
                  <div>
                    <button
                      disabled
                      className="w-full py-2.5 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    >
                      {t("pricing_page.currentPlan")}
                    </button>
                    {currentPlan !== "free" && (
                      <button
                        onClick={handleManage}
                        disabled={loading === "manage"}
                        className="w-full mt-2 py-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                      >
                        {loading === "manage" ? t("common.loading") : t("pricing_page.manageSubscription")}
                      </button>
                    )}
                  </div>
                ) : isUpgrade ? (
                  <button
                    onClick={() => handleSubscribe(key as "t1" | "t2")}
                    disabled={loading === key}
                    className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                      popular
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
                        : "bg-white hover:bg-zinc-100 text-zinc-900"
                    } disabled:opacity-50`}
                  >
                    {loading === key ? t("common.loading") : t("pricing_page.upgradeTo", { name: name })}
                  </button>
                ) : isDowngrade ? (
                  <button
                    onClick={handleManage}
                    disabled={loading === "manage"}
                    className="w-full py-2.5 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    {t("pricing_page.manageSubscription")}
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(key as "t1" | "t2")}
                    disabled={loading === key}
                    className="w-full py-2.5 rounded-lg text-sm font-semibold bg-white hover:bg-zinc-100 text-zinc-900 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading === key ? t("common.loading") : t("pricing_page.switchTo", { name: name })}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
