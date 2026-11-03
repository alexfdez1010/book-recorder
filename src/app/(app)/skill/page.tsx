import { OAuthConnections } from '@/components/oauth-connections';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/copy-button';
import { mcpResource } from '@/lib/auth/config';
import { buildMcpJson } from '@/lib/mcp/skill';

export const dynamic = 'force-dynamic';

/** Renders OAuth connection instructions and downloadable agent configuration. */
export default function SkillPage() {
  const serverUrl = mcpResource;
  const mcpJson = buildMcpJson(serverUrl);

  return (
    <section className="flex flex-col gap-10">
      <div className="lib-section-head">
        <div className="flex flex-col gap-2">
          <h1 className="lib-title">Skill</h1>
          <p className="lib-subtitle">
            Connect your library to an MCP-aware agent with the tools and
            conventions it needs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:gap-8 md:grid-cols-2">
        <OAuthConnections />

        <article className="lib-panel">
          <header className="lib-panel__head">
            <span className="lib-panel__eyebrow">Step 1</span>
            <h2 className="lib-panel__title">Download skill</h2>
          </header>
          <div className="lib-panel__body flex flex-col gap-4">
            <p className="text-sm">
              Drop <code>SKILL.md</code> into your agent&apos;s skills
              directory. The file declares the server&apos;s tools and a few
              conventions; the agent figures the rest out.
            </p>
            <Button asChild variant="primary" size="md">
              <a href="/api/skill?kind=skill" download>
                Download SKILL.md
              </a>
            </Button>
          </div>
        </article>

        <article className="lib-panel">
          <header className="lib-panel__head">
            <span className="lib-panel__eyebrow">Step 2</span>
            <h2 className="lib-panel__title">Register MCP server</h2>
          </header>
          <div className="lib-panel__body flex flex-col gap-4">
            <p className="text-sm">
              Add this URL to your MCP client, sign in and approve access to
              your library in the browser.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="primary" size="md">
                <a href="/api/skill?kind=config" download>
                  Download config
                </a>
              </Button>
              <CopyButton value={mcpJson} label="Copy JSON" />
            </div>
          </div>
        </article>
      </div>

      <article className="lib-panel">
        <header className="lib-panel__head">
          <span className="lib-panel__eyebrow">Endpoint</span>
          <h2 className="lib-panel__title">Connection details</h2>
        </header>
        <div className="lib-panel__body flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="lib-plate__label">Server URL</span>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <code className="break-all text-sm">{serverUrl}</code>
              <CopyButton value={serverUrl} label="Copy URL" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="lib-plate__label">mcp.json</span>
            <pre className="overflow-x-auto rounded border border-[color:var(--ink)] bg-[color:var(--paper-soft)] p-3 text-xs leading-relaxed">
              {mcpJson}
            </pre>
          </div>
        </div>
      </article>
    </section>
  );
}
