import { memo, useState, useCallback } from "react";
import { clsx } from "clsx";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface APITabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export const APITabs = memo<APITabsProps>(({ tabs, defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  const activeTabData = tabs.find((t) => t.id === activeTab);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex border-b border-border bg-muted" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={clsx(
              "px-4 py-3 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-card text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-6 bg-card" role="tabpanel">
        {activeTabData?.content}
      </div>
    </div>
  );
});

APITabs.displayName = "APITabs";
