import { Injectable } from '@nestjs/common';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { AgentRuntimeId, RuntimeCapability } from '@socratech/contracts';

const execFileAsync = promisify(execFile);

@Injectable()
export class RuntimeRegistryService {
  private async probeCommand(
    binary: string,
    args: string[],
    timeoutMs = 4000,
  ): Promise<{ ok: boolean; stdout: string; stderr: string }> {
    try {
      const { stdout, stderr } = await execFileAsync(binary, args, {
        timeout: timeoutMs,
        env: process.env,
      });
      return { ok: true, stdout: stdout.trim(), stderr: stderr.trim() };
    } catch (err: unknown) {
      const e = err as { stdout?: string; stderr?: string; message?: string };
      return {
        ok: false,
        stdout: (e.stdout ?? '').trim(),
        stderr: (e.stderr ?? e.message ?? '').trim(),
      };
    }
  }

  async inspectRuntime(id: AgentRuntimeId): Promise<RuntimeCapability> {
    if (id === 'codex-cli') {
      const ver = await this.probeCommand('codex', ['--version']);
      const auth = ver.ok ? await this.probeCommand('codex', ['login', 'status']) : null;
      const authText = auth ? `${auth.stdout} ${auth.stderr}`.trim() : 'Binary not available';
      const authenticated = auth ? auth.ok && !/not logged in/i.test(authText) : false;

      return {
        id: 'codex-cli',
        name: 'OpenAI Codex CLI',
        binary: 'codex',
        available: ver.ok,
        version: ver.ok ? ver.stdout : null,
        authenticated: ver.ok ? authenticated : null,
        authDetails: authText || (ver.ok ? 'Unknown auth state' : ver.stderr),
        headlessSupported: true,
        headlessCommandExample: 'codex exec --skip-git-repo-check --ephemeral --json "<prompt>"',
        notes: [
          'Usa suscripción/sesión local de Codex CLI; no asume acceso ilimitado a API.',
          'Requiere intervención humana si falla autenticación o cuota.',
        ],
      };
    }

    const ver = await this.probeCommand('agy', ['--version']);
    return {
      id: 'agy-cli',
      name: 'Antigravity CLI (agy)',
      binary: 'agy',
      available: ver.ok,
      version: ver.ok ? ver.stdout.split('\n')[0] ?? ver.stdout : null,
      authenticated: ver.ok ? true : null,
      authDetails: ver.ok ? 'CLI local detectada (sesión verificada en runtime)' : ver.stderr,
      headlessSupported: true,
      headlessCommandExample: 'agy -p "<prompt>" --output-format json --add-dir <workspace>',
      notes: [
        'Ejecución headless vía -p/--print con salida JSON estructurada.',
        'Operaciones destructivas o externas requieren autorización explícita.',
      ],
    };
  }

  async listRuntimes(): Promise<RuntimeCapability[]> {
    return Promise.all([this.inspectRuntime('codex-cli'), this.inspectRuntime('agy-cli')]);
  }
}
