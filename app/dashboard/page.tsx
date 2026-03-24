"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Project, CreditLog } from "@/lib/supabase/types";
import { PLAN_CONFIG } from "@/lib/supabase/types";
import UserMenu from "@/app/components/UserMenu";
import { useI18n } from "@/lib/i18n";
import LanguageSelector from "@/app/components/LanguageSelector";

type Render = {
  id: string;
  status: string;
  output_url: string | null;
  lambda_id: string | null;
  created_at: string;
  completed_at: string | null;
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const { t } = useI18n();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [renders, setRenders] = useState<Render[]>([]);
  const [creditLogs, setCreditLogs] = useState<CreditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }

      const [profileRes, projectsRes, rendersRes, logsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("projects")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("renders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("credit_logs")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(30),
      ]);

      if (profileRes.data) setProfile(profileRes.data as Profile);
      if (projectsRes.data) setProjects(projectsRes.data as Project[]);
      if (rendersRes.data) setRenders(rendersRes.data as Render[]);
      if (logsRes.data) setCreditLogs(logsRes.data as CreditLog[]);
      setLoading(false);
    }
    load();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">{t("dashboard.loadingDashboard")}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">{t("dashboard.unableToLoad")}</p>
          <Link
            href="/login"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            {t("common.signIn")}
          </Link>
        </div>
      </div>
    );
  }

  const planConfig = PLAN_CONFIG[profile.plan as keyof typeof PLAN_CONFIG];
  const creditPercent = Math.min(
    100,
    (profile.credits / planConfig.monthlyCredits) * 100
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.svg" alt={t("common.vidcraft")} width={36} height={36} className="rounded-lg" />
              <span className="text-xl font-bold tracking-tight">
                {t("common.vidcraft")}
              </span>
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/create"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {t("common.video")}
            </Link>
            <Link
              href="/poster"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {t("common.poster")}
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-white font-medium px-3 py-2 rounded-lg bg-zinc-800"
            >
              {t("common.dashboard")}
            </Link>
            <LanguageSelector />
            <UserMenu />
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("dashboard.title")}</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {t("dashboard.subtitle")}
          </p>
        </div>

        {/* Plan & Credits Card */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {t("dashboard.currentPlan")}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300 font-medium">
                  {planConfig.name}
                  {planConfig.price > 0 && ` — $${planConfig.price}/mo`}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold">{profile.credits}</span>
                <span className="text-sm text-zinc-500">
                  / {planConfig.monthlyCredits} credits
                </span>
              </div>
              <div className="w-full max-w-md h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    creditPercent > 50
                      ? "bg-gradient-to-r from-blue-500 to-purple-500"
                      : creditPercent > 20
                        ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                        : "bg-gradient-to-r from-red-500 to-rose-500"
                  }`}
                  style={{ width: `${creditPercent}%` }}
                />
              </div>
              <p className="text-xs text-zinc-500 mt-1.5">
                {creditPercent.toFixed(1)}% {t("dashboard.remaining")}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href="/pricing"
                className="text-sm px-5 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 hover:bg-zinc-800 transition-all text-center"
              >
                {profile.plan === "free" ? t("dashboard.upgradePlan") : t("dashboard.managePlan")}
              </Link>
              <Link
                href="/create"
                className="text-sm px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all text-center"
              >
                {t("dashboard.newVideo")}
              </Link>
            </div>
          </div>
        </div>

        {/* Two-column grid: Projects + Renders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
                {t("dashboard.recentProjects")}
              </h2>
              <span className="text-xs text-zinc-600">
                {t("dashboard.shown", { count: projects.length })}
              </span>
            </div>
            {projects.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-zinc-500 mb-3">{t("dashboard.noProjects")}</p>
                <Link
                  href="/create"
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  {t("dashboard.createFirst")}
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/50">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="px-5 py-3.5 hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="mt-0.5 text-base">
                          {project.mode === "creative" ? "\u{1F3A8}" : "\u{1F4C4}"}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm text-white font-medium truncate">
                            {project.title || "Untitled"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wide ${
                                project.mode === "creative"
                                  ? "bg-purple-500/15 text-purple-400 border border-purple-500/20"
                                  : "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                              }`}
                            >
                              {project.mode}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                project.status === "completed"
                                  ? "bg-green-500/15 text-green-400"
                                  : project.status === "failed"
                                    ? "bg-red-500/15 text-red-400"
                                    : project.status === "rendering"
                                      ? "bg-yellow-500/15 text-yellow-400"
                                      : "bg-zinc-500/15 text-zinc-400"
                              }`}
                            >
                              {project.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-zinc-600 whitespace-nowrap mt-0.5">
                        {formatDate(project.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Renders */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
                {t("dashboard.recentRenders")}
              </h2>
              <span className="text-xs text-zinc-600">
                {t("dashboard.shown", { count: renders.length })}
              </span>
            </div>
            {renders.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-zinc-500 mb-3">{t("dashboard.noRenders")}</p>
                <Link
                  href="/create"
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  {t("dashboard.createAndRender")}
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/50">
                {renders.map((render) => (
                  <div
                    key={render.id}
                    className="px-5 py-3.5 hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-base">
                          {render.status === "completed"
                            ? "\u2705"
                            : render.status === "failed"
                              ? "\u274C"
                              : render.status === "rendering"
                                ? "\u23F3"
                                : "\u2022"}
                        </span>
                        <div className="min-w-0">
                          <span
                            className={`text-sm font-medium ${
                              render.status === "completed"
                                ? "text-green-400"
                                : render.status === "failed"
                                  ? "text-red-400"
                                  : render.status === "rendering"
                                    ? "text-yellow-400"
                                    : "text-zinc-400"
                            }`}
                          >
                            {render.status}
                          </span>
                          <p className="text-xs text-zinc-600 mt-0.5">
                            {render.completed_at
                              ? formatDateTime(render.completed_at)
                              : formatDateTime(render.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {render.lambda_id && (
                          <span
                            className="text-[10px] text-zinc-600 font-mono"
                            title={render.lambda_id}
                          >
                            {render.lambda_id.slice(0, 8)}...
                          </span>
                        )}
                        {render.status === "completed" && render.output_url && (
                          <a
                            href={render.output_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-3 py-1.5 rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/25 hover:bg-blue-500/25 transition-colors font-medium"
                          >
                            {t("common.download")}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Credit History */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
              {t("dashboard.creditHistory")}
            </h2>
            <span className="text-xs text-zinc-600">
              {t("dashboard.entries", { count: creditLogs.length })}
            </span>
          </div>
          {creditLogs.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-zinc-500">{t("dashboard.noCreditActivity")}</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/50">
              {creditLogs.map((log) => (
                <div
                  key={log.id}
                  className="px-5 py-3 hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <span
                        className={`text-sm font-bold w-12 text-right font-mono ${
                          log.credits > 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {log.credits > 0 ? "+" : ""}
                        {log.credits}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                          {log.action}
                        </span>
                        {log.description && (
                          <p className="text-xs text-zinc-600 mt-0.5 truncate max-w-xs">
                            {log.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-xs text-zinc-600 font-mono">
                        {t("dashboard.balance", { balance: log.balance })}
                      </span>
                      <span className="text-xs text-zinc-600 whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
