import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  const { password } = req.body
  
  if (!password) {
    return res.status(400).json({ error: 'Password is required' })
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return Object.keys(req.cookies).map(name => ({
            name,
            value: req.cookies[name]
          }))
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.setHeader(
              'Set-Cookie',
              `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax${
                options?.maxAge ? `; Max-Age=${options.maxAge}` : ''
              }`
            )
          })
        },
      },
    }
  )
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: password
  })

  if (signInError) {
    return res.status(403).json({ error: 'Password does not match.' })
  }

  //Password verified - proceed with account deletion: use admin client with service role key for deletion
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY, 
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
  
  try {
    // Delete the auth user - CASCADE will handle related tables
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Auth deletion error:', deleteError)
      return res.status(400).json({ error: deleteError.message })
    }
    
    // Clear auth cookies - get all cookie names from the request
    const cookieHeader = req.headers.cookie || ''
    const authCookies = cookieHeader
      .split(';')
      .map(c => c.trim())
      .filter(c => c.startsWith('sb-'))
      .map(c => {
        const [name] = c.split('=')
        return `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax` //set to manually expire (Jan 1, 1970) 
      })
    
    if (authCookies.length > 0) {
      res.setHeader('Set-Cookie', authCookies)
    }
    
    // User deleted - session is now invalid, client will handle redirect/cleanup
    return res.status(200).json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Deletion failed:', error)
    return res.status(500).json({ error: 'Failed to delete account' })
  }
}