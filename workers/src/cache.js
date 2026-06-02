export async function getRegistryCache(env, key) {
  if (!env.GAGA_KV) return null;
  return env.GAGA_KV.get(key, { type: 'json' });
}

export async function setRegistryCache(env, key, value, ttl = 300) {
  if (!env.GAGA_KV) return null;
  return env.GAGA_KV.put(key, JSON.stringify(value), { expirationTtl: ttl });
}
