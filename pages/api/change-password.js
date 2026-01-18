import { createServerClient } from '@supabase/ssr'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  const { newPassword } = req.body
  
  if (!newPassword) {
    return res.status(400).json({ error: 'New password is required' })
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
  
  // Update password for the authenticated user (no need for userId check)
  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) {
    return res.status(400).json({ error: error.message })
  }
  
  return res.status(200).json({ message: 'Password updated successfully' })
}