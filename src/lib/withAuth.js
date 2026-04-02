import { createServerClient } from '@supabase/ssr';

/**
 * Higher-order function to protect API routes with authentication
 * Usage:
 *   export default withAuth(async (req, res, user) => {
 *     // Your protected logic here
 *     // 'user' is the verified user object
 *   });
 */
export function withAuth(handler) {
  return async (req, res) => {
    try {
      // Create server client for this request
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          cookies: {
            getAll() {
              // Return all cookies from the request
              return Object.keys(req.cookies).map(name => ({
                name,
                value: req.cookies[name],
              }));
            },
            setAll(cookiesToSet) {
              // Grab any existing cookies already set on the response
              const currentCookies = res.getHeader('Set-Cookie') ?? [];
              const cookieArray = Array.isArray(currentCookies) ? currentCookies : [currentCookies];

              // Map the new Supabase cookies into fully formatted strings
              const newCookies = cookiesToSet.map(({ name, value, options }) => {
                let cookieStr = `${name}=${encodeURIComponent(value)}`;
                if (options.domain) cookieStr += `; Domain=${options.domain}`;
                if (options.maxAge) cookieStr += `; Max-Age=${options.maxAge}`;
                if (options.path) cookieStr += `; Path=${options.path}`;
                if (options.httpOnly) cookieStr += `; HttpOnly`;
                if (options.secure) cookieStr += `; Secure`;
                if (options.sameSite) cookieStr += `; SameSite=${options.sameSite}`;
                return cookieStr;
              });

              // Set them all at once
              res.setHeader('Set-Cookie', [...cookieArray, ...newCookies]);
            },
          },
        }
      );

      // Get the user from the request
      const { data: { user }, error } = await supabase.auth.getUser();

      // If no user or error, return 401 Unauthorized
      if (error || !user || user.is_anonymous) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Pass user to the handler
      return handler(req, res, user);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}
