"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs";
import { Workflow } from "@/lib/workflow/types";
// Convex removed

interface TestEndpointPanelProps {
  workflowId: string;
  workflow: Workflow | null;
  environment: 'draft' | 'production';
  onClose: () => void;
}

export default function TestEndpointPanel({ workflowId, workflow, environment, onClose }: TestEndpointPanelProps) {
  // No external API keys in local mode — endpoint is open
  const apiKeys: any[] = [];
  const firstKey = null;

  // Try to get the full API key from localStorage (only available if just generated)
  const [fullApiKey, setFullApiKey] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedKey = sessionStorage.getItem('latest_api_key');
      if (storedKey) {
        setFullApiKey(storedKey);
      }
    }
  }, [apiKeys]);

  // Get input variables from the workflow's start node
  const startNode = workflow?.nodes.find(n => (n.data as any)?.nodeType === 'start');
  const inputVariables = (startNode?.data as any)?.inputVariables || [];

  // Generate default payload from input variables
  const defaultPayload = useMemo(() => {
    if (inputVariables.length === 0) {
      return { input: "https://firecrawl.dev" };
    }
    return inputVariables.reduce((acc: any, v: any) => {
      acc[v.name] = v.defaultValue || '';
      return acc;
    }, {});
  }, [inputVariables, workflow?.id]);

  const [input, setInput] = useState(JSON.stringify(defaultPayload, null, 2));
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Update input when workflow changes
  useEffect(() => {
    setInput(JSON.stringify(defaultPayload, null, 2));
  }, [defaultPayload, workflowId]);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const endpointUrl = `${baseUrl}/api/workflows/${workflowId}/execute`;
  const streamUrl = `${baseUrl}/api/workflows/${workflowId}/execute-stream`;

  const parsedInput = useMemo(() => {
    try {
      return input && input.trim().length > 0 ? JSON.parse(input) : defaultPayload;
    } catch {
      return defaultPayload;
    }
  }, [input, defaultPayload]);

  const requestBodyMinified = useMemo(
    () => JSON.stringify({ input: parsedInput }),
    [parsedInput],
  );

  const requestBodyPretty = useMemo(
    () => JSON.stringify({ input: parsedInput }, null, 2),
    [parsedInput],
  );

  const handleCopy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((current) => (current === key ? null : current));
      }, 1500);
    } catch (copyError) {
      console.error("Failed to copy code block", copyError);
    }
  };

  // Use full API key if available (from recent generation), otherwise show placeholder
  const apiKeyToUse = fullApiKey || 'YOUR_API_KEY_HERE';
  const hasRealKey = !!fullApiKey;

  const apiKeyHeader = `  -H "Authorization: Bearer ${apiKeyToUse}" \\`;

  const curlStandard = `curl -X POST ${endpointUrl} \\
${apiKeyHeader}
  -H "Content-Type: application/json" \\
  -d '${requestBodyMinified.replace(/'/g, "'\\''")}' `;

  const curlStreaming = `curl -N -X POST ${streamUrl} \\
${apiKeyHeader}
  -H "Content-Type: application/json" \\
  -H "Accept: text/event-stream" \\
  -d '${requestBodyMinified.replace(/'/g, "'\\''")}' `;

  const apiKeyForCode = apiKeyToUse;

  const tsExample = `import fetch from 'node-fetch';

const payload = ${requestBodyPretty};

const response = await fetch('${endpointUrl}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${apiKeyForCode}'
  },
  body: JSON.stringify(payload),
});

const result = await response.json();
console.log(result);`;

  const pythonExample = `import requests
import json

payload = ${requestBodyPretty}

response = requests.post(
    "${endpointUrl}",
    headers={"Content-Type": "application/json"},
    data=json.dumps(payload),
)
print(response.json())`;

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      let parsedInput;
      try {
        parsedInput = JSON.parse(input);
      } catch (e) {
        setError('Invalid JSON in request body');
        setLoading(false);
        return;
      }

      const requestBody = { input: parsedInput };

      const res = await fetch(endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.aside
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed right-20 top-80 h-[calc(100vh-100px)] w-[calc(100vw-240px)] max-w-520 bg-accent-white border border-border-faint shadow-lg overflow-y-auto z-50 rounded-16 flex flex-col"
    >
      {/* Header */}
      <div className="p-20 border-b border-border-faint flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-label-large text-accent-black font-medium">Endpoint</h2>
          <button
            onClick={onClose}
            className="w-32 h-32 rounded-6 hover:bg-black-alpha-4 transition-colors flex items-center justify-center"
          >
            <svg className="w-16 h-16 text-black-alpha-48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-body-small text-black-alpha-48 mt-8">
          Test your workflow API endpoint
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-20 space-y-20">
        <div>
          <label className="block text-label-small text-black-alpha-48 mb-8">Endpoint URL</label>
          <div className="px-12 py-10 bg-background-base border border-border-faint rounded-8 text-body-small text-accent-black font-mono overflow-x-auto">
            {endpointUrl}
          </div>
        </div>

        <div>
          <label className="block text-label-small text-black-alpha-48 mb-8">Input Payload</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
            className="w-full px-12 py-10 bg-gray-900 text-white border border-border-faint rounded-8 text-body-small font-mono focus:outline-none focus:border-accent-black transition-colors resize-none"
          />
        </div>

        <div>
          {!hasRealKey && (
            <div className="mb-12 p-12 bg-heat-4 border border-heat-100 rounded-8">
              <p className="text-body-small text-accent-black">
                <strong>Note:</strong> Replace <code className="px-4 py-2 bg-white rounded text-xs font-mono">YOUR_API_KEY_HERE</code> with your actual API key from Settings.
              </p>
            </div>
          )}

          <Tabs defaultValue="curl" className="w-full">
            <TabsList className="grid grid-cols-4 mb-8 bg-background-base border border-border-faint rounded-8">
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="curl-stream">Streaming</TabsTrigger>
              <TabsTrigger value="ts">TypeScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>
            <TabsContent value="curl">
              <div className="relative">
                <button onClick={() => handleCopy('curl', curlStandard)} className="absolute top-12 right-12 flex items-center gap-6 px-12 py-6 bg-accent-white hover:bg-[#f4f4f5] border border-border-faint rounded-8 text-xs text-accent-black transition-colors shadow-sm">
                  {copiedKey === 'curl' ? 'Copied' : 'Copy'}
                </button>
                <pre className="px-12 py-10 bg-background-base text-accent-black rounded-8 text-body-small font-mono whitespace-pre-wrap break-words overflow-y-auto overflow-x-hidden max-h-200 border border-border-faint">{curlStandard}</pre>
              </div>
            </TabsContent>
            <TabsContent value="curl-stream">
              <div className="relative">
                <button onClick={() => handleCopy('curl-stream', curlStreaming)} className="absolute top-12 right-12 flex items-center gap-6 px-12 py-6 bg-accent-white hover:bg-[#f4f4f5] border border-border-faint rounded-8 text-xs text-accent-black transition-colors shadow-sm">
                  {copiedKey === 'curl-stream' ? 'Copied' : 'Copy'}
                </button>
                <pre className="px-12 py-10 bg-background-base text-accent-black rounded-8 text-body-small font-mono whitespace-pre-wrap break-words overflow-y-auto overflow-x-hidden max-h-200 border border-border-faint">{curlStreaming}</pre>
              </div>
            </TabsContent>
            <TabsContent value="ts">
              <div className="relative">
                <button onClick={() => handleCopy('ts', tsExample)} className="absolute top-12 right-12 flex items-center gap-6 px-12 py-6 bg-accent-white hover:bg-[#f4f4f5] border border-border-faint rounded-8 text-xs text-accent-black transition-colors shadow-sm">
                  {copiedKey === 'ts' ? 'Copied' : 'Copy'}
                </button>
                <pre className="px-12 py-10 bg-background-base text-accent-black rounded-8 text-body-small font-mono whitespace-pre-wrap break-words overflow-y-auto overflow-x-hidden max-h-200 border border-border-faint">{tsExample}</pre>
              </div>
            </TabsContent>
            <TabsContent value="python">
              <div className="relative">
                <button onClick={() => handleCopy('python', pythonExample)} className="absolute top-12 right-12 flex items-center gap-6 px-12 py-6 bg-accent-white hover:bg-[#f4f4f5] border border-border-faint rounded-8 text-xs text-accent-black transition-colors shadow-sm">
                  {copiedKey === 'python' ? 'Copied' : 'Copy'}
                </button>
                <pre className="px-12 py-10 bg-background-base text-accent-black rounded-8 text-body-small font-mono whitespace-pre-wrap break-words overflow-y-auto overflow-x-hidden max-h-200 border border-border-faint">{pythonExample}</pre>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {error && (
          <div className="p-16 bg-black-alpha-4 rounded-12 border border-border-faint">
            <h3 className="text-label-small text-accent-black mb-8">Error</h3>
            <pre className="text-body-small text-accent-black whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {response && (
          <div>
            <label className="block text-label-small text-black-alpha-48 mb-8">Response</label>
            <div className="p-12 bg-gray-900 rounded-8 border border-border-faint">
              <pre className="text-body-small text-white font-mono whitespace-pre-wrap overflow-auto max-h-300">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
