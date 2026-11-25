import { Injectable } from '@nestjs/common';
import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { AgentExecutionResult, AgentRuntimeId } from '@socratech/contracts';
import { RuntimeRegistryService } from './runtime-registry.service';

export interface ExecuteAgentParams {
  runtime: AgentRuntimeId;
  prompt: string;
  taskTitle: string;
  taskType: string;
  workspacePath: string;
  timeoutMs?: number;
  onOutputChunk?: (chunk: string) => void;
}

export interface AgentProcessOutcome {
  command: string;
  args: string[];
  exitCode: number | null;
  stdout: string;
  stderr: string;
  result: AgentExecutionResult;
}

@Injectable()
export class AgentExecutorService {
  constructor(private readonly registry: RuntimeRegistryService) {}

  buildStructuredPrompt(params: ExecuteAgentParams): string {
    return [
      `Sos un agente de Socratech Motion Lab ejecutando la tarea "${params.taskTitle}" (tipo: ${params.taskType}).`,
      `Workspace asignado (único directorio de lectura/escritura permitido): ${params.workspacePath}`,
      `Reglas:`,
      `- No realices operaciones destructivas ni externas sin autorización.`,
      `- No hagas commits de Git.`,
      `- No ejecutes comandos de shell/Bash innecesarios; para investigación, análisis o redacción respondé directamente o usá herramientas de lectura/escritura de archivos en el workspace.`,
      `- Al finalizar, respondé incluyendo un bloque JSON válido con esta estructura exacta:`,
      `{"status":"COMPLETED","summary":"...","filesCreatedOrModified":[],"validations":[{"name":"...","passed":true,"details":"..."}],"errors":[],"partialResults":null}`,
      ``,
      `Instrucción de la tarea:`,
      params.prompt,
    ].join('\n');
  }

  private extractAgentText(rawStdout: string): {
    text: string;
    deniedActions: Array<{ action?: string; display_name?: string }>;
    envelopeMeta?: Record<string, unknown>;
  } {
    const trimmed = rawStdout.trim();
    if (!trimmed) {
      return { text: '', deniedActions: [] };
    }

    // 1. Check for agy --output-format json envelope
    try {
      const parsed = JSON.parse(trimmed) as {
        conversation_id?: string;
        status?: string;
        response?: string;
        denied_actions?: Array<{ action?: string; display_name?: string }>;
        usage?: unknown;
      };
      if (typeof parsed.conversation_id === 'string' && 'response' in parsed) {
        return {
          text: parsed.response ?? '',
          deniedActions: Array.isArray(parsed.denied_actions) ? parsed.denied_actions : [],
          envelopeMeta: {
            conversationId: parsed.conversation_id,
            runtimeStatus: parsed.status,
            usage: parsed.usage,
            deniedActions: parsed.denied_actions,
          },
        };
      }
    } catch {
      // Not a single JSON object; continue
    }

    // 2. Check for codex exec --json JSONL events
    const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
    const messages: string[] = [];
    for (const line of lines) {
      try {
        const ev = JSON.parse(line) as {
          type?: string;
          item?: { type?: string; text?: string };
          message?: string;
        };
        if (ev.item?.type === 'agent_message' && typeof ev.item.text === 'string') {
          messages.push(ev.item.text);
        } else if (typeof ev.message === 'string') {
          messages.push(ev.message);
        }
      } catch {
        // Ignore non-JSON lines
      }
    }

    if (messages.length > 0) {
      return { text: messages[messages.length - 1], deniedActions: [] };
    }

    return { text: trimmed, deniedActions: [] };
  }

  parseExecutionResult(rawStdout: string, rawStderr: string, exitCode: number | null): AgentExecutionResult {
    const { text, deniedActions, envelopeMeta } = this.extractAgentText(rawStdout);
    const jsonMatch = text.match(/\{[\s\S]*"summary"[\s\S]*\}/);

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as Partial<AgentExecutionResult>;
        return {
          status: exitCode === 0 ? (parsed.status ?? 'COMPLETED') : 'FAILED',
          summary: parsed.summary ?? 'Ejecución finalizada.',
          filesCreatedOrModified: Array.isArray(parsed.filesCreatedOrModified) ? parsed.filesCreatedOrModified : [],
          validations: Array.isArray(parsed.validations) ? parsed.validations : [],
          errors: Array.isArray(parsed.errors) ? parsed.errors : rawStderr ? [rawStderr] : [],
          partialResults: parsed.partialResults ?? envelopeMeta ?? null,
          rawOutput: rawStdout.trim().slice(0, 8000),
        };
      } catch {
        // Fall through to structured wrapper
      }
    }

    if (deniedActions.length > 0 && !text.trim()) {
      const deniedNames = deniedActions.map((d) => d.display_name || d.action || 'unknown').join(', ');
      return {
        status: 'FAILED',
        summary: `El agente no pudo completar la tarea porque se denegaron acciones requeridas (${deniedNames}).`,
        filesCreatedOrModified: [],
        validations: [{ name: 'runtime-permissions', passed: false, details: `Denied: ${deniedNames}` }],
        errors: [`Acciones denegadas por el runtime: ${deniedNames}`],
        partialResults: envelopeMeta ?? null,
        rawOutput: rawStdout.trim().slice(0, 8000),
      };
    }

    if (exitCode === 0) {
      return {
        status: 'COMPLETED',
        summary: text ? text.slice(0, 500) : 'Tarea completada sin resumen JSON explícito.',
        filesCreatedOrModified: [],
        validations: [],
        errors: [],
        partialResults: envelopeMeta ?? null,
        rawOutput: rawStdout.trim().slice(0, 8000),
      };
    }

    return {
      status: 'FAILED',
      summary: `El proceso finalizó con código ${exitCode ?? 'desconocido'}.`,
      filesCreatedOrModified: [],
      validations: [],
      errors: [rawStderr || text || `Exit code ${exitCode}`],
      partialResults: text ? { partialStdout: text.slice(0, 4000), ...envelopeMeta } : (envelopeMeta ?? null),
      rawOutput: rawStdout.trim().slice(0, 8000),
    };
  }

  async execute(params: ExecuteAgentParams): Promise<AgentProcessOutcome> {
    const capability = await this.registry.inspectRuntime(params.runtime);
    if (!capability.available) {
      return {
        command: capability.binary,
        args: [],
        exitCode: 127,
        stdout: '',
        stderr: `Runtime ${params.runtime} (${capability.binary}) no está disponible en el entorno.`,
        result: {
          status: 'FAILED',
          summary: `Runtime ${params.runtime} no disponible. Se detiene sin cambiar de proveedor.`,
          filesCreatedOrModified: [],
          validations: [{ name: 'runtime-availability', passed: false, details: capability.authDetails }],
          errors: [`Binary '${capability.binary}' not found or not executable`],
          partialResults: null,
        },
      };
    }

    if (capability.authenticated === false) {
      return {
        command: capability.binary,
        args: [],
        exitCode: 1,
        stdout: '',
        stderr: `Runtime ${params.runtime} sin sesión autenticada: ${capability.authDetails}`,
        result: {
          status: 'FAILED',
          summary: `Runtime ${params.runtime} requiere autenticación previa. Se detiene esperando intervención humana.`,
          filesCreatedOrModified: [],
          validations: [{ name: 'runtime-auth', passed: false, details: capability.authDetails }],
          errors: [capability.authDetails],
          partialResults: null,
        },
      };
    }

    const resolvedWorkspace = path.resolve(params.workspacePath);
    fs.mkdirSync(resolvedWorkspace, { recursive: true });

    const fullPrompt = this.buildStructuredPrompt(params);
    const command = capability.binary;
    const args =
      params.runtime === 'codex-cli'
        ? ['exec', '--skip-git-repo-check', '--ephemeral', '--json', fullPrompt]
        : [
            '-p',
            fullPrompt,
            '--output-format',
            'json',
            '--dangerously-skip-permissions',
            '--add-dir',
            resolvedWorkspace,
          ];

    const envTimeout = Number(process.env.AGENT_TIMEOUT_MS ?? 0);
    const timeoutMs =
      params.timeoutMs && params.timeoutMs > 0
        ? params.timeoutMs
        : Number.isFinite(envTimeout) && envTimeout > 0
          ? envTimeout
          : null;

    return new Promise<AgentProcessOutcome>((resolve) => {
      const child = spawn(command, args, {
        cwd: resolvedWorkspace,
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const timer = timeoutMs
        ? setTimeout(() => {
            timedOut = true;
            child.kill('SIGTERM');
          }, timeoutMs)
        : null;

      child.stdout.on('data', (data: Buffer) => {
        const text = data.toString('utf-8');
        stdout += text;
        params.onOutputChunk?.(text);
      });

      child.stderr.on('data', (data: Buffer) => {
        stderr += data.toString('utf-8');
      });

      child.on('error', (err) => {
        if (timer) clearTimeout(timer);
        resolve({
          command,
          args,
          exitCode: 1,
          stdout,
          stderr: err.message,
          result: {
            status: 'FAILED',
            summary: `Error al iniciar ${command}: ${err.message}`,
            filesCreatedOrModified: [],
            validations: [],
            errors: [err.message],
            partialResults: stdout ? { partialStdout: stdout.slice(0, 4000) } : null,
          },
        });
      });

      child.on('close', (code) => {
        if (timer) clearTimeout(timer);
        if (timedOut) {
          resolve({
            command,
            args,
            exitCode: code,
            stdout,
            stderr: `${stderr}\nProcess timed out after ${timeoutMs}ms`.trim(),
            result: {
              status: 'FAILED',
              summary: `Tiempo límite excedido (${timeoutMs}ms). Resultados parciales conservados.`,
              filesCreatedOrModified: [],
              validations: [],
              errors: [`Timeout after ${timeoutMs}ms`],
              partialResults: stdout ? { partialStdout: stdout.slice(0, 4000) } : null,
              rawOutput: stdout.slice(0, 8000),
            },
          });
          return;
        }

        const result = this.parseExecutionResult(stdout, stderr, code);
        resolve({
          command,
          args,
          exitCode: code,
          stdout,
          stderr,
          result,
        });
      });
    });
  }
}
