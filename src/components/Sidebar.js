import Link from 'next/link';
import { useState } from 'react';
import ExpandMenu from '../../public/expand-menu.svg';
import Spreadsheet from '../../public/spreadsheet-icon-new.svg';
import User from '../../public/person-circle.svg';

export default function Sidebar({ sentiSheetLinks = [] }) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <aside className={`bg-background border-r-2 border-foreground/10 min-h-screen p-4 flex flex-col ${isCollapsed ? "w-16" : "w-64"}`}>
      <nav className="flex flex-col flex-1">
        <ul className="flex flex-col gap-2">
          <button onClick={() => setIsCollapsed(!isCollapsed)} className={`!p-0 !m-0 mb-4 rounded-full w-8 h-8 flex items-center justify-center hover:bg-foreground/10 ${!isCollapsed ? 'self-end' : ''}`}>
            {isCollapsed ? <ExpandMenu className="rotate-180 [&_path]:fill-foreground hover:cursor-pointer" /> : <ExpandMenu className="[&_path]:fill-foreground hover:cursor-pointer" />}
          </button>
          {sentiSheetLinks.map((sheet) => (
            <li key={sheet.id}>
              <Link
                href={`/sentisheet/${sheet.id}`}
                className={`flex items-center gap-2 p-2 rounded-2xl hover:bg-foreground/10 transition-colors ${isCollapsed ? 'justify-center' : ''} `}
                title ={sheet.file_name || 'Untitled'}
              >
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate block">
                      {sheet.file_name?.replace(/^SentiSheet-\s*/i, '') || 'Untitled'}
                    </span>
                    {sheet.created_at && (
                      <span className="text-xs text-foreground/60">
                        {new Date(sheet.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}
                <Spreadsheet width={22} height={22} viewBox="0 0 512 512" className="shrink-0 [&_path]:fill-foreground" />
              </Link>
            </li>
          ))}
          {sentiSheetLinks.length === 0 && (
            <li>
              <p className="text-sm text-foreground/60">No SentiSheets yet. Create one to get started.</p>
            </li>
          )}
        </ul>
        <Link href="/account" className="mt-auto p-2 rounded-2xl hover:bg-foreground/10 transition-colors flex items-center justify-center gap-2">
          {isCollapsed ? '' : 'My Account'}
          <User className="shrink-0 [&_path]:fill-foreground" />
        </Link>
      </nav>
    </aside>
  );
}
