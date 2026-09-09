import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';

export default function Footer() {
  const year = new Date().getFullYear();
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const isSignedIn = session && !session.user.is_anonymous;

  return (
    <footer aria-label="Site footer" className="mt-auto border-t-3 border-foreground bg-background">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-8 py-6 text-sm text-foreground">
        <div className="flex items-center gap-2">
          <Image width={24} height={24} src="/sentiment-analysis.ai-logo-v2-light.svg" alt="Sentiment Analysis Logo" className="dark:hidden" />
          <Image width={24} height={24} src="/sentiment-analysis.ai-logo-v2.svg" alt="Sentiment Analysis Logo" className="hidden dark:block" />
          <span>&copy; {year} sentiment-analysis.ai</span>
        </div>
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {!isSignedIn && (
            <>
              <li><Link href="/" className="hover:underline hover:text-foreground">Home</Link></li>
              <li><Link href="/login" className="hover:underline hover:text-foreground">Log in</Link></li>
              <li><Link href="/signup" className="hover:underline hover:text-foreground">Sign up</Link></li>
            </>
          )}
          <li><Link href="/create" className="hover:underline hover:text-foreground">Try for free</Link></li>
          {isSignedIn && (
            <li className="hover:underline hover:text-foreground cursor-pointer" onClick={async () => await supabase.auth.signOut()}>Sign out</li>
          )}
          <li><a href="https://github.com/a-eryan/sentiment-analysis.ai" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-foreground">GitHub</a></li>
        </ul>
      </div>
    </footer>
  );
}
