export async function handleAuth(request, env) {
  const { email, pin } = await request.json();

  if (!email || !pin) {
    return json({ error: 'Email and PIN are required.' }, 400);
  }

  // TODO:
  // 1. Load USERS registry from Sheet 2 or KV.
  // 2. Compare PIN hash.
  // 3. Issue secure session cookie.
  // 4. Return user profile and initial tasks.

  return json({
    ok: true,
    user: {
      email,
      role: 'demo'
    }
  });
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}
