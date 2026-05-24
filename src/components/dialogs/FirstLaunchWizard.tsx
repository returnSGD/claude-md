import React, { useState } from 'react';

interface Props {
  onComplete: (apiKey?: string, apiBaseUrl?: string) => void;
}

type Step = 'welcome' | 'api-key' | 'done';

export default function FirstLaunchWizard({ onComplete }: Props) {
  const [step, setStep] = useState<Step>('welcome');
  const [apiKey, setApiKey] = useState('');
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleComplete = () => {
    onComplete(apiKey || undefined, apiBaseUrl || undefined);
  };

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Welcome to Claude MD Editor
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              An AI-powered Markdown editor with PyCharm-style layout.
              <br />
              Write, preview, and chat with Claude Code — all in one place.
            </p>
            <button
              className="px-6 py-2 rounded text-sm font-medium"
              style={{
                backgroundColor: 'var(--accent-color)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={() => setStep('api-key')}
            >
              Get Started
            </button>
          </div>
        );

      case 'api-key':
        return (
          <div>
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Configure API Key
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Enter your Anthropic API Key to enable AI chat with Claude Code.
              Get one at{' '}
              <a href="https://console.anthropic.com" target="_blank" style={{ color: 'var(--accent-color)' }}>
                console.anthropic.com
              </a>
            </p>

            <div className="mb-3">
              <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                API Key
              </label>
              <div className="flex gap-2">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="flex-1 px-3 py-2 rounded text-sm"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
                <button
                  className="px-2 py-1 rounded text-xs"
                  style={{ border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                API Base URL (optional)
              </label>
              <input
                type="text"
                value={apiBaseUrl}
                onChange={(e) => setApiBaseUrl(e.target.value)}
                placeholder="https://api.anthropic.com"
                className="w-full px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
            </div>

            <div className="flex gap-2">
              <button
                className="px-6 py-2 rounded text-sm font-medium"
                style={{ backgroundColor: 'var(--accent-color)', color: '#fff', border: 'none', cursor: 'pointer' }}
                onClick={() => setStep('done')}
              >
                {apiKey ? 'Save & Continue' : 'Skip for Now'}
              </button>
            </div>
          </div>
        );

      case 'done':
        return (
          <div className="text-center">
            <h2 className="text-lg font-bold mb-4" style={{ color: '#98c379' }}>
              All Set!
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              {apiKey
                ? "Your API key has been saved. You're ready to chat with Claude Code."
                : 'You can configure your API key later from Settings.'}
            </p>
            <button
              className="px-6 py-2 rounded text-sm font-medium"
              style={{ backgroundColor: 'var(--accent-color)', color: '#fff', border: 'none', cursor: 'pointer' }}
              onClick={handleComplete}
            >
              Start Writing
            </button>
          </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div
        className="fade-in rounded-xl shadow-2xl p-8"
        style={{
          width: 480,
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {(['welcome', 'api-key', 'done'] as Step[]).map((s, i) => (
            <div
              key={s}
              className="w-2 h-2 rounded-full transition-colors"
              style={{
                backgroundColor:
                  step === s
                    ? 'var(--accent-color)'
                    : ['welcome', 'api-key', 'done'].indexOf(step) > i
                      ? '#98c379'
                      : 'var(--border-color)',
              }}
            />
          ))}
        </div>

        {renderStep()}
      </div>
    </div>
  );
}
