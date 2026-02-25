import { Metric } from "web-vitals";

export interface WebVitalsConfig {
  logToConsole?: boolean;
  sendToAnalytics?: (metric: Metric) => void;
  thresholdOverrides?: Partial<Record<Metric["name"], number>>;
}

const DEFAULT_THRESHOLDS: Record<Metric["name"], number> = {
  CLS: 0.1,
  FCP: 1800,
  INP: 200,
  LCP: 2500,
  TTFB: 800,
} as const;

export function reportWebVitals(metric: Metric, config: WebVitalsConfig = {}) {
  const { logToConsole = true, sendToAnalytics } = config;
  const threshold = config.thresholdOverrides?.[metric.name] ?? DEFAULT_THRESHOLDS[metric.name];

  // Determine if metric is good, needs improvement, or poor
  let rating: "good" | "needs-improvement" | "poor";
  if (metric.value <= threshold) {
    rating = "good";
  } else if (metric.value <= threshold * 2) {
    rating = "needs-improvement";
  } else {
    rating = "poor";
  }

  const logEntry = {
    name: metric.name,
    value: metric.value,
    rating,
    threshold,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  };

  if (logToConsole) {
    const style =
      rating === "good"
        ? "color: green"
        : rating === "needs-improvement"
          ? "color: orange"
          : "color: red";
    console.log(`[Web Vitals] %c${metric.name}`, style, logEntry);
  }

  // Send to analytics service if configured
  if (sendToAnalytics) {
    sendToAnalytics(metric);
  }

  return logEntry;
}

export function initWebVitals(config: WebVitalsConfig = {}) {
  const init = async () => {
    const { onCLS, onFCP, onLCP, onTTFB, onINP } = await import("web-vitals");

    onCLS((metric: Metric) => reportWebVitals(metric, config));
    onFCP((metric: Metric) => reportWebVitals(metric, config));
    onLCP((metric: Metric) => reportWebVitals(metric, config));
    onTTFB((metric: Metric) => reportWebVitals(metric, config));
    onINP((metric: Metric) => reportWebVitals(metric, config));
  };

  // Initialize when page is visible and DOM is ready
  if (document.visibilityState === "visible") {
    init();
  } else {
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.visibilityState === "visible") {
          init();
        }
      },
      { once: true }
    );
  }
}

export function sendToAnalytics(metric: Metric) {
  // Example: Send to analytics service
  // Replace with your actual analytics endpoint
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", metric.name, {
      value: Math.round(metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
    });
  }

  // Example: Send to custom endpoint
  fetch("/api/v1/analytics/web-vitals", {
    method: "POST",
    body: JSON.stringify({
      name: metric.name,
      value: metric.value,
      id: metric.id,
      delta: metric.delta,
      navigationType: metric.navigationType,
    }),
    keepalive: true,
  }).catch(() => {
    // Silently fail - analytics shouldn't break the app
  });
}
