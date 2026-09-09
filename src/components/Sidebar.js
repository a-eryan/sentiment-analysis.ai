import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ExpandMenu from '../../public/expand-menu.svg';
import Spreadsheet from '../../public/spreadsheet-icon-new.svg';
import User from '../../public/person-circle.svg';
import Create from '../../public/plus-circle-fill.svg';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [sentiSheetLinks, setSentiSheetLinks] = useState([]);

  useEffect(() => {
    let mounted = true;

    const syncSidebar = async (sessionOverride) => {
      const session =
        sessionOverride ??
        (await supabase.auth.getSession()).data.session;

      const user = session?.user;

      if (!mounted) return;

      setIsAnonymous(!(user && !user.is_anonymous));

      if (!user) {
        setSentiSheetLinks([]);
        return;
      }

      const { data } = await supabase
        .from('sentisheets')
        .select('id, file_name, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (mounted) {
        setSentiSheetLinks(data || []);
      }
    };

    syncSidebar();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncSidebar(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      {/* On mobile the sidebar is fixed, so this spacer keeps the collapsed rail's width in the page flow */}
      <div className="w-16 shrink-0 md:hidden" aria-hidden="true" />
      <div
        className={`fixed inset-0 z-30 bg-black/50 md:hidden transition-opacity duration-300 ease-in-out ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        aria-hidden="true"
        onClick={() => setIsCollapsed(true)}
      />
      <aside className={`fixed inset-y-0 left-0 z-40 md:static md:z-auto overflow-y-auto overflow-x-hidden bg-background border-r-3 border-foreground min-h-screen self-stretch p-4 flex flex-col shrink-0 transition-[width] duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-80'}`}>
      <nav className="flex flex-col flex-1">
        <ul className="flex flex-col gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="!p-0 !m-0 mb-4 rounded-full w-8 h-8 flex items-center justify-center hover:bg-foreground/10"
          >
            <ExpandMenu className={`transition-transform duration-300 ease-in-out [&_path]:fill-foreground hover:cursor-pointer ${isCollapsed ? 'rotate-180' : 'rotate-0'}`} />
          </button>

          <Link
            href="/create"
            className={`p-2 rounded-2xl hover:bg-foreground/10 transition-colors flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}
            title="Create New SentiSheet"
          >
            <div className={`grid transition-[grid-template-columns] duration-300 ease-in-out ${isCollapsed ? 'grid-cols-[0fr]' : 'grid-cols-[1fr]'}`}>
              <span className={`overflow-hidden whitespace-nowrap transition-opacity duration-300 ease-in-out ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>New SentiSheet</span>
            </div>
            <Create className="shrink-0 [&_path]:from-blue-700 to-violet-600 rainbow-transition" />
          </Link>

          {sentiSheetLinks.map((sheet) => (
            <li key={sheet.id}>
              <Link
                href={`/sentisheet/${sheet.id}`}
                className={`flex items-center gap-2 p-2 rounded-2xl hover:bg-foreground/10 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                title={sheet.file_name || 'Untitled'}
              >
                <div className={`grid transition-[grid-template-columns] duration-300 ease-in-out ${isCollapsed ? 'grid-cols-[0fr]' : 'grid-cols-[1fr]'}`}>
                  <div className={`overflow-hidden transition-opacity duration-300 ease-in-out ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                    <span className="text-sm font-medium truncate block">
                      {sheet.file_name?.replace(/^SentiSheet-\s*/i, '') || 'Untitled'}
                    </span>
                    {sheet.created_at && (
                      <span className="text-xs text-foreground/60 whitespace-nowrap">
                        {new Date(sheet.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <Spreadsheet width={22} height={22} viewBox="0 0 512 512" className="shrink-0 [&_path]:fill-foreground" />
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href={`/${isAnonymous ? 'login' : 'account'}`}
          className={`p-2 rounded-2xl hover:bg-foreground/10 transition-colors flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}
          title={isAnonymous ? 'You are a guest. Please log in for further access.' : 'My Account'}
        >
          <div className={`grid transition-[grid-template-columns] duration-300 ease-in-out ${isCollapsed ? 'grid-cols-[0fr]' : 'grid-cols-[1fr]'}`}>
            <span className={`overflow-hidden whitespace-nowrap transition-opacity duration-300 ease-in-out ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>{isAnonymous ? 'Log In' : 'My Account'}</span>
          </div>
          <User className="shrink-0 [&_path]:fill-foreground" />
        </Link>
      </nav>
      </aside>
    </>
  );
}
