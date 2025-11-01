export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
}

export interface ToolResult {
  toolCallId: string;
  toolName: string;
  result: string;
}

export interface MessageEntry {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: ToolCall[];
  toolCallId?: string;
  name?: string;
}

export interface AgenticResultDto {
  success: boolean;
  result: string;
  metadata: {
    iterations: number;
    totalToolCalls: number;
    durationMs: number;
    provider: string;
    model: string;
  };
  conversationHistory: MessageEntry[];
  toolExecutions?: ToolResult[];
  error?: string;
}

export enum StreamEventType {
  START = 'start',
  THINKING = 'thinking',
  TOOL_CALL = 'tool_call',
  TOOL_RESULT = 'tool_result',
  COMPLETE = 'complete',
  ERROR = 'error',
}

export interface StreamEvent {
  type: StreamEventType;
  data: any;
  timestamp: string;
}
