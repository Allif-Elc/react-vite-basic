import { memo, useState, useCallback } from 'react';
import { clsx } from 'clsx';

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
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex border-b border-gray-200 bg-gray-50" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={clsx(
              'px-4 py-3 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-6 bg-white" role="tabpanel">
        {activeTabData?.content}
      </div>
    </div>
  );
});

APITabs.displayName = 'APITabs';
