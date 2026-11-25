import { AgentExecutorService } from '../src/providers/agent-executor.service';
import type { RuntimeRegistryService } from '../src/providers/runtime-registry.service';

describe('AgentExecutorService', () => {
  it('parses valid structured JSON from agent stdout', () => {
    const registry = {} as RuntimeRegistryService;
    const executor = new AgentExecutorService(registry);

    const parsed = executor.parseExecutionResult(
      'log line\n{"status":"COMPLETED","summary":"Guion generado","filesCreatedOrModified":["script.md"],"validations":[{"name":"format","passed":true}],"errors":[],"partialResults":null}',
      '',
      0,
    );

    expect(parsed.status).toBe('COMPLETED');
    expect(parsed.summary).toBe('Guion generado');
    expect(parsed.filesCreatedOrModified).toEqual(['script.md']);
  });

  it('unwraps agy JSON envelope and flags denied_actions with empty response as FAILED', () => {
    const registry = {} as RuntimeRegistryService;
    const executor = new AgentExecutorService(registry);

    const denied = executor.parseExecutionResult(
      JSON.stringify({
        conversation_id: 'bf474b11',
        status: 'SUCCESS',
        response: '',
        denied_actions: [{ action: 'command', display_name: 'Bash' }],
      }),
      '',
      0,
    );

    expect(denied.status).toBe('FAILED');
    expect(denied.errors[0]).toContain('Bash');

    const ok = executor.parseExecutionResult(
      JSON.stringify({
        conversation_id: 'bf474b12',
        status: 'SUCCESS',
        response: '```json\n{"status":"COMPLETED","summary":"Investigación lista","filesCreatedOrModified":["notes.md"],"validations":[],"errors":[]}\n```',
        denied_actions: [],
      }),
      '',
      0,
    );

    expect(ok.status).toBe('COMPLETED');
    expect(ok.summary).toBe('Investigación lista');
    expect(ok.filesCreatedOrModified).toEqual(['notes.md']);
  });

  it('stops and returns FAILED without switching provider when runtime is unavailable', async () => {
    const registry = {
      inspectRuntime: jest.fn().mockResolvedValue({
        id: 'codex-cli',
        name: 'OpenAI Codex CLI',
        binary: 'codex',
        available: false,
        version: null,
        authenticated: null,
        authDetails: 'not found',
        headlessSupported: true,
        headlessCommandExample: '',
        notes: [],
      }),
    } as unknown as RuntimeRegistryService;

    const executor = new AgentExecutorService(registry);
    const outcome = await executor.execute({
      runtime: 'codex-cli',
      prompt: 'test',
      taskTitle: 'Test task',
      taskType: 'CUSTOM_AGENT_TASK',
      workspacePath: '/tmp/test-ws',
    });

    expect(outcome.result.status).toBe('FAILED');
    expect(outcome.result.errors.length).toBeGreaterThan(0);
    expect(registry.inspectRuntime).toHaveBeenCalledTimes(1);
    expect(registry.inspectRuntime).toHaveBeenCalledWith('codex-cli');
  });
});
