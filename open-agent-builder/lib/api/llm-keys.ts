/**
 * LLM API Key Management — env vars only (Convex removed).
 */

export async function getLLMApiKey(
  provider: 'anthropic' | 'openai' | 'groq',
  _userId?: string
): Promise<string | null> {
  const envKeyMap: Record<string, string> = {
    anthropic: 'ANTHROPIC_API_KEY',
    openai: 'OPENAI_API_KEY',
    groq: 'GROQ_API_KEY',
  };
  return process.env[envKeyMap[provider]] || null;
}

export async function isProviderConfigured(
  provider: 'anthropic' | 'openai' | 'groq',
  userId?: string
): Promise<boolean> {
  const apiKey = await getLLMApiKey(provider, userId);
  return !!apiKey;
}

export async function getConfiguredProviders(userId?: string): Promise<string[]> {
  const providers: ('anthropic' | 'openai' | 'groq')[] = ['anthropic', 'openai', 'groq'];
  const configured: string[] = [];

  for (const provider of providers) {
    if (await isProviderConfigured(provider, userId)) {
      configured.push(provider);
    }
  }

  return configured;
}

export async function initializeLLMClient(
  provider: 'anthropic' | 'openai' | 'groq',
  userId?: string
): Promise<{ apiKey: string; provider: string }> {
  const apiKey = await getLLMApiKey(provider, userId);

  if (!apiKey) {
    throw new Error(
      `No API key found for ${provider}. Please configure your API key in Settings or set the ${
        provider === 'anthropic' ? 'ANTHROPIC_API_KEY' :
        provider === 'openai' ? 'OPENAI_API_KEY' :
        'GROQ_API_KEY'
      } environment variable.`
    );
  }

  return { apiKey, provider };
}

export async function getProvidersStatus(userId?: string) {
  const status: any = {};
  for (const provider of ['anthropic', 'openai', 'groq'] as const) {
    const key = await getLLMApiKey(provider, userId);
    status[provider] = key
      ? { configured: true, source: 'env' as const }
      : { configured: false, source: null };
  }
  return status;
}
