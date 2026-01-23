import Link from 'next/link';
import { useState } from 'react';

export default function Sidebar({ sentiSheetLinks = [] }) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <aside className={isCollapsed ? "w-16 bg-gray-50 border-r min-h-screen p-4" : "w-64 bg-gray-50 border-r min-h-screen p-4"}>
      <nav className="flex flex-col h-full">
        <ul className="space-y-2">
          <button onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? 'Show' : 'Hide'} SentiSheets
          </button>
          {}
          {sentiSheetLinks.map((sheet) => (
            <li key={sheet.id}>
              <Link
                href={`/sentisheet/${sheet.id}`}
                className="block p-2 rounded hover:bg-gray-200 transition-colors"
              >
              {!isCollapsed && (
              <>
                <span className="text-sm font-medium truncate block">
                  {sheet.file_name || 'Untitled'}
                </span>
                  {sheet.created_at && (
                      <span className="text-xs text-gray-500">
                        {new Date(sheet.created_at).toLocaleDateString()}
                      </span>
                  )}
              </>              
              )}

              </Link>
            </li>
          ))}
          {sentiSheetLinks.length === 0 && (
            <li>
              <p className="text-sm text-gray-500">No SentiSheets yet. Create one to get started.</p>
            </li>
          )}
        </ul>
        <Link href="/account" className="mt-auto block text-blue-600 hover:underline ">
          Back to Account
        </Link>
      </nav>
    </aside>
  );
}
