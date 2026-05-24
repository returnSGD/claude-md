import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useChatStore, ChatContentBlock, ChatToolBlock } from '../../stores/useChatStore';

// ── Sub-components ──

function ToolCallCard({ block }: { block: ChatToolBlock }) {
  const [collapsed, setCollapsed] = useState(false);
  const isDone = block.status === 'done';
  const isError = block.status === 'error';
  const isRunning = block.status === 'running' || block.status === 'pending';

  let parsedInput = block.input;
  try {
    parsedInput = JSON.stringify(JSON.parse(block.input), null, 2);
  } catch {}

  return (
    <div
      className="my-2 rounded-md overflow-hidden text-xs"
      style={{
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)',
      }}
    >
      {/* Header */}
      <button
        className="w-full flex items-center gap-2 px-3 py-2 text-left cursor-pointer hover:opacity-80"
        style={{ borderBottom: collapsed ? 'none' : '1px solid var(--border-color)' }}
        onClick={() => setCollapsed(!collapsed)}
      >
        {/* Status icon */}
        <span className="flex-shrink-0">
          {isRunning && (
            <span className="inline-block w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#e5c07b' }} />
          )}
          {isDone && (
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#98c379' }} />
          )}
          {isError && (
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#e06c75' }} />
          )}
        </span>

        <span className="font-semibold" style={{ color: 'var(--text)' }}>
          {isRunning ? '🔄' : isDone ? '✅' : isError ? '❌' : '🔧'} {block.name}
        </span>

        <span className="flex-1" />

        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {collapsed ? '▶' : '▼'}
        </span>
      </button>

      {/* Body */}
      {!collapsed && (
        <div className="p-3 space-y-2">
          {parsedInput && parsedInput !== '{}' && (
            <div>
              <div className="font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Input</div>
              <pre
                className="p-2 rounded overflow-x-auto"
                style={{
                  backgroundColor: 'var(--code-bg)',
                  fontSize: '11px',
                  lineHeight: 1.4,
                  maxHeight: '200px',
                  overflow: 'auto',
                }}
              >
                <code>{parsedInput}</code>
              </pre>
            </div>
          )}

          {block.output && (
            <div>
              <div className="font-semibold mt-2 mb-1" style={{ color: 'var(--text-secondary)' }}>Output</div>
              <pre
                className="p-2 rounded overflow-x-auto"
                style={{
                  backgroundColor: 'var(--code-bg)',
                  fontSize: '11px',
                  lineHeight: 1.4,
                  maxHeight: '300px',
                  overflow: 'auto',
                  color: isError ? '#e06c75' : 'var(--text)',
                }}
              >
                <code>{block.output}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MarkdownText({ text }: { text: string }) {
  // Simple markdown rendering: convert **bold**, `code`, ``` blocks, etc.
  // For a full solution, use markdown-it in the renderer, but for inline
  // streaming text this lightweight approach is fast and avoids re-parsing
  // the entire message on each delta.
  const renderText = (input: string) => {
    const parts: React.ReactNode[] = [];
    let remaining = input;
    let key = 0;

    // Process code blocks before inline formatting
    while (remaining.length > 0) {
      // Inline code
      const codeMatch = remaining.match(/`([^`]+)`/);
      // Bold
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);

      let firstMatch: RegExpMatchArray | null = null;
      let matchType = '';
      let earliestIndex = Infinity;

      if (codeMatch && codeMatch.index !== undefined && codeMatch.index < earliestIndex) {
        firstMatch = codeMatch;
        matchType = 'code';
        earliestIndex = codeMatch.index;
      }
      if (boldMatch && boldMatch.index !== undefined && boldMatch.index < earliestIndex) {
        firstMatch = boldMatch;
        matchType = 'bold';
        earliestIndex = boldMatch.index;
      }

      if (!firstMatch || firstMatch.index === undefined) {
        // No more formatting — push the rest as plain text
        if (remaining) {
          parts.push(<span key={key++}>{remaining}</span>);
        }
        break;
      }

      // Text before the match
      if (firstMatch.index > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, firstMatch.index)}</span>);
      }

      // The matched content
      if (matchType === 'code') {
        parts.push(
          <code key={key++} style={{
            backgroundColor: 'var(--code-bg)',
            padding: '0.15em 0.4em',
            borderRadius: '3px',
            fontSize: '0.9em',
            fontFamily: 'Consolas, monospace',
          }}>
            {firstMatch[1]}
          </code>
        );
      } else if (matchType === 'bold') {
        parts.push(<strong key={key++}>{firstMatch[1]}</strong>);
      }

      remaining = remaining.slice(firstMatch.index + firstMatch[0].length);
    }

    return parts;
  };

  return <span>{renderText(text)}</span>;
}

function MessageBubble({ message }: { message: ReturnType<typeof useChatStore.getState>['messages'][0] }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <div
          className="px-3 py-1 rounded-full text-xs"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-muted)',
            maxWidth: '80%',
            textAlign: 'center',
          }}
        >
          {(message.blocks[0] as any)?.text || ''}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex my-3 ${isUser ? 'justify-end' : 'justify-start'}`}
      style={{ paddingLeft: isUser ? '3rem' : '0', paddingRight: isUser ? '0' : '3rem' }}
    >
      <div
        className="px-4 py-3 rounded-2xl max-w-full"
        style={{
          backgroundColor: isUser ? 'var(--accent-color)' : 'var(--bg-secondary)',
          color: isUser ? '#ffffff' : 'var(--text)',
          borderBottomRightRadius: isUser ? '4px' : '16px',
          borderBottomLeftRadius: isUser ? '16px' : '4px',
          wordBreak: 'break-word',
        }}
      >
        {message.blocks.map((block, i) => {
          if (block.type === 'text') {
            if (!block.text && message.isStreaming) {
              return (
                <span key={i} className="inline-flex items-center gap-1" style={{ opacity: 0.6 }}>
                  <span>Thinking</span>
                  <span className="inline-block w-5 text-left">
                    <span className="dot-pulse" />
                  </span>
                </span>
              );
            }
            return (
              <div key={i} className="text-sm leading-relaxed whitespace-pre-wrap">
                <MarkdownText text={block.text} />
                {message.isStreaming && (
                  <span
                    className="inline-block w-1.5 h-4 ml-0.5 align-text-bottom blinking-cursor"
                    style={{ backgroundColor: isUser ? '#fff' : 'var(--text)' }}
                  />
                )}
              </div>
            );
          }
          if (block.type === 'tool_use') {
            return <ToolCallCard key={i} block={block as ChatToolBlock} />;
          }
          return null;
        })}

        {/* Usage footer */}
        {message.usage && !message.isStreaming && (
          <div className="mt-2 pt-2 text-xs opacity-60" style={{ borderTop: '1px solid rgba(128,128,128,0.2)' }}>
            Tokens: {message.usage.inputTokens} in / {message.usage.outputTokens} out
            {message.cost != null && ` · $${message.cost.toFixed(4)}`}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ChatPanel ──

export default function ChatPanel() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const messages = useChatStore((s) => s.messages);
  const isConnected = useChatStore((s) => s.isConnected);
  const isGenerating = useChatStore((s) => s.isGenerating);
  const inputValue = useChatStore((s) => s.inputValue);
  const sessionId = useChatStore((s) => s.sessionId);

  const setInputValue = useChatStore((s) => s.setInputValue);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const interrupt = useChatStore((s) => s.interrupt);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ── IPC message listener ──
  useEffect(() => {
    if (!window.electronAPI) return;

    const cleanup = window.electronAPI.chat.onMessage((msg: any) => {
      const store = useChatStore.getState();

      switch (msg.type) {
        case 'text_delta':
          store._appendToLastBlock('assistant', msg.text);
          break;

        case 'block_start':
          if (msg.blockType === 'tool_use') {
            store._startToolBlock(msg.toolId, msg.toolName, msg.blockIndex);
          }
          break;

        case 'tool_input_delta':
          store._appendToolInput(msg.text);
          break;

        case 'block_stop':
          // Content block completed — no action needed
          break;

        case 'turn_complete':
          // Full message received — extract usage if available
          break;

        case 'tool_progress':
          store._handleToolProgress(msg.toolId, msg.status, msg.output);
          break;

        case 'result':
          store._finishStreaming(
            msg.usage ? { inputTokens: msg.usage.input_tokens || 0, outputTokens: msg.usage.output_tokens || 0 } : undefined,
            msg.totalCostUsd
          );
          break;

        case 'system_msg':
          if (msg.subtype === 'error' || msg.text) {
            store._addSystemMessage(msg.text || `System: ${msg.subtype}`);
          }
          break;

        default:
          break;
      }
    });

    return cleanup;
  }, []);

  // Handle Enter key
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!isGenerating) {
          sendMessage();
        }
      }
    },
    [sendMessage, isGenerating]
  );

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px';
    }
  }, [inputValue]);

  return (
    <div className="h-full w-full flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {!isConnected && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center" style={{ color: 'var(--text-muted)' }}>
              <p className="text-base mb-2">Claude Code Chat</p>
              <p className="text-sm">Open a folder to start chatting with Claude</p>
              <p className="text-xs mt-1 opacity-60">Claude will see your project files and help you code</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div
        className="flex-shrink-0 px-4 py-3"
        style={{ borderTop: '1px solid var(--border-color)' }}
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            className="flex-1 resize-none rounded-lg px-3 py-2 text-sm outline-none"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text)',
              border: '1px solid var(--border-color)',
              maxHeight: '200px',
              minHeight: '36px',
              lineHeight: '1.4',
            }}
            placeholder={isConnected ? 'Type a message... (Enter to send, Shift+Enter for newline)' : 'Connect a project to start...'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!isConnected}
            rows={1}
          />

          {isGenerating ? (
            <button
              className="flex-shrink-0 px-3 py-2 rounded-lg text-sm font-semibold"
              style={{
                backgroundColor: '#e06c75',
                color: '#fff',
              }}
              onClick={interrupt}
            >
              Stop
            </button>
          ) : (
            <button
              className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-85"
              style={{
                backgroundColor: 'var(--accent-color)',
                color: '#fff',
                opacity: !isConnected || !inputValue.trim() ? 0.4 : 1,
              }}
              onClick={sendMessage}
              disabled={!isConnected || !inputValue.trim()}
            >
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
