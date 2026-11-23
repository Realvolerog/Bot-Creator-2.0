import React, { useState, useEffect, useMemo } from 'react';
import { payloadLogger, NetworkPayloadLog } from '../services/payloadLoggerService';
import { routerService, RouterApiMode } from '../services/ProTalkRouterService';

interface PayloadInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PayloadInspectorModal: React.FC<PayloadInspectorModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<NetworkPayloadLog[]>(() => payloadLogger.getLogs());
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());
  const [filterMode, setFilterMode] = useState<'all' | 'errors'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'split' | 'payload' | 'response'>('split');
  const [copiedState, setCopiedState] = useState<string | null>(null);
  const [routerMode, setRouterMode] = useState<RouterApiMode>(() => routerService.getApiMode());

  // Subscribe to logs update
  useEffect(() => {
    const unsubscribe = payloadLogger.subscribe(() => {
      setLogs(payloadLogger.getLogs());
    });
    return unsubscribe;
  }, []);

  // Update logs when modal opens
  useEffect(() => {
    if (isOpen) {
      setLogs(payloadLogger.getLogs());
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(label);
    setTimeout(() => {
      setCopiedState(null);
    }, 2000);
  };

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filterMode === 'errors' && log.status !== 'error') {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inLabel = log.label.toLowerCase().includes(query);
        const inUrl = log.endpoint.toLowerCase().includes(query);
        const inError = (log.errorMessage || '').toLowerCase().includes(query);
        const inPayload = JSON.stringify(log.payload || {}).toLowerCase().includes(query);
        const inResponse = JSON.stringify(log.response || {}).toLowerCase().includes(query);
        return inLabel || inUrl || inError || inPayload || inResponse;
      }
      return true;
    });
  }, [logs, filterMode, searchQuery]);

  // Selected log (defaults to the freshest log if not manually selected)
  const activeLog = useMemo(() => {
    if (selectedLogId) {
      const found = logs.find((l) => l.id === selectedLogId);
      if (found) return found;
    }
    return logs[0] || null;
  }, [logs, selectedLogId]);

  const toggleRowExpanded = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (!isOpen) return null;

  const totalErrors = logs.filter((l) => l.status === 'error').length;
  const isViewingLatest = !selectedLogId || (logs[0] && selectedLogId === logs[0].id);

  const formatJson = (data: any): string => {
    if (data === undefined || data === null) return 'null';
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return data;
      }
    }
    return JSON.stringify(data, null, 2);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-[#1f242c] text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl border border-gray-200 dark:border-[#38414e] w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between p-3.5 sm:p-4 border-b border-gray-200 dark:border-[#38414e] bg-gray-50/80 dark:bg-[#252b35] gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">Инспектор запросов и Payload</h2>
                <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono bg-gray-200 dark:bg-[#343d4b] text-gray-700 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600">
                  Ctrl + [
                </kbd>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Свежий отправленный Payload, ответ сервера и история предыдущих запросов
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Router Mode Selector */}
            <div className="flex items-center gap-1 px-1.5 py-1 bg-gray-100 dark:bg-[#28303c] rounded-lg border border-gray-200 dark:border-gray-700 text-xs">
              <span className="text-gray-500 dark:text-gray-400 font-medium hidden sm:inline px-1">Роутер:</span>
              <button
                type="button"
                onClick={() => {
                  routerService.setApiMode('async');
                  setRouterMode('async');
                }}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  routerMode === 'async'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Новый асинхронный роутер v2 (https://ai.pro-talk.ru/api/async/router) - активен по умолчанию"
              >
                v2 Async (по умолч.)
              </button>
              <button
                type="button"
                onClick={() => {
                  routerService.setApiMode('sync');
                  setRouterMode('sync');
                }}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  routerMode === 'sync'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Классический синхронный роутер (https://ai.pro-talk.ru/api/router)"
              >
                v1 Sync
              </button>
            </div>

            <button
              onClick={() => {
                if (confirm('Очистить историю сетевых запросов?')) {
                  payloadLogger.clearLogs();
                  setSelectedLogId(null);
                }
              }}
              title="Очистить историю"
              className="px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-200/70 dark:bg-[#313945] hover:bg-gray-300 dark:hover:bg-[#3d4757] rounded-lg transition-colors"
            >
              Очистить
            </button>
            <button
              onClick={onClose}
              title="Закрыть окно (Esc)"
              className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-200/60 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          {/* SECTION 1: Fresh / Selected Request & Response */}
          <div className="p-4 border-b border-gray-200 dark:border-[#38414e] bg-white dark:bg-[#1a1f26]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">
                  {isViewingLatest ? 'Свежий запрос (Последний)' : 'Выбранный запрос из истории'}
                </span>
                {!isViewingLatest && (
                  <button
                    onClick={() => setSelectedLogId(null)}
                    className="text-xs text-[#2a62ff] hover:underline font-medium"
                  >
                    Вернуться к свежему
                  </button>
                )}
              </div>

              {/* View mode toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-[#28303c] p-0.5 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    viewMode === 'split'
                      ? 'bg-white dark:bg-[#36404e] text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Рядом (Split)
                </button>
                <button
                  onClick={() => setViewMode('payload')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    viewMode === 'payload'
                      ? 'bg-white dark:bg-[#36404e] text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Только Payload
                </button>
                <button
                  onClick={() => setViewMode('response')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    viewMode === 'response'
                      ? 'bg-white dark:bg-[#36404e] text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Только Ответ
                </button>
              </div>
            </div>

            {activeLog ? (
              <div>
                {/* Meta badges row */}
                <div className="flex flex-wrap items-center gap-2 mb-3 bg-gray-50 dark:bg-[#252b35] p-2.5 rounded-xl border border-gray-200 dark:border-[#38414e]">
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold ${
                      activeLog.method === 'POST'
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                        : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                    }`}
                  >
                    {activeLog.method}
                  </span>

                  <span className="font-semibold text-xs text-gray-900 dark:text-white">
                    {activeLog.label}
                  </span>

                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate max-w-xs sm:max-w-md">
                    {activeLog.endpoint}
                  </span>

                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {activeLog.timestamp}
                    </span>
                    {activeLog.durationMs !== undefined && (
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                        {activeLog.durationMs} мс
                      </span>
                    )}

                    {activeLog.status === 'success' && (
                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-semibold rounded-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        {activeLog.statusCode ? `${activeLog.statusCode} OK` : 'Успех'}
                      </span>
                    )}

                    {activeLog.status === 'pending' && (
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-md flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        Отправка...
                      </span>
                    )}

                    {activeLog.status === 'error' && (
                      <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-semibold rounded-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        {activeLog.statusCode ? `Ошибка ${activeLog.statusCode}` : 'Ошибка'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Error Banner if request failed */}
                {activeLog.errorMessage && (
                  <div className="mb-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <span className="font-bold">Что случилось: </span>
                      <span>{activeLog.errorMessage}</span>
                    </div>
                  </div>
                )}

                {/* Split or single display */}
                <div
                  className={`grid gap-3 ${
                    viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
                  }`}
                >
                  {/* Left: Request Payload */}
                  {(viewMode === 'split' || viewMode === 'payload') && (
                    <div className="flex flex-col bg-gray-50 dark:bg-[#15191f] rounded-xl border border-gray-200 dark:border-[#38414e] overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-[#202732] border-b border-gray-200 dark:border-[#38414e]">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <span>📦</span> Отправленный Payload (Запрос)
                        </span>
                        <button
                          onClick={() => handleCopy(formatJson(activeLog.payload), 'payload')}
                          className="px-2 py-1 text-[11px] font-medium bg-white dark:bg-[#2a3341] hover:bg-gray-100 dark:hover:bg-[#343e4f] text-gray-700 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600 transition-colors"
                        >
                          {copiedState === 'payload' ? 'Скопировано!' : 'Копировать'}
                        </button>
                      </div>
                      <pre className="p-3 text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-[340px] whitespace-pre-wrap break-all select-all">
                        {formatJson(activeLog.payload)}
                      </pre>
                    </div>
                  )}

                  {/* Right: Server Response / Error */}
                  {(viewMode === 'split' || viewMode === 'response') && (
                    <div className="flex flex-col bg-gray-50 dark:bg-[#15191f] rounded-xl border border-gray-200 dark:border-[#38414e] overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-[#202732] border-b border-gray-200 dark:border-[#38414e]">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <span>📨</span> Ответ сервера (Response)
                        </span>
                        <button
                          onClick={() => handleCopy(formatJson(activeLog.response || activeLog.errorMessage), 'response')}
                          className="px-2 py-1 text-[11px] font-medium bg-white dark:bg-[#2a3341] hover:bg-gray-100 dark:hover:bg-[#343e4f] text-gray-700 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600 transition-colors"
                        >
                          {copiedState === 'response' ? 'Скопировано!' : 'Копировать'}
                        </button>
                      </div>
                      <pre className="p-3 text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-[340px] whitespace-pre-wrap break-all select-all">
                        {activeLog.response
                          ? formatJson(activeLog.response)
                          : activeLog.errorMessage
                          ? `Ошибка: ${activeLog.errorMessage}`
                          : activeLog.status === 'pending'
                          ? 'Запрос отправлен, ожидание ответа...'
                          : 'Нет данных ответа'}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-xs">
                Запросов пока не зафиксировано. Отправьте сообщение или выберите действие, чтобы увидеть Payload.
              </div>
            )}
          </div>

          {/* SECTION 2: List of Previous Requests with Accordion Details */}
          <div className="p-4 flex-1 bg-gray-50/50 dark:bg-[#1a1f26]/50">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">
                  Список предыдущих запросов ({filteredLogs.length})
                </h3>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-gray-200 dark:bg-[#28303c] p-0.5 rounded-lg text-xs font-medium">
                  <button
                    onClick={() => setFilterMode('all')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      filterMode === 'all'
                        ? 'bg-white dark:bg-[#36404e] text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Все ({logs.length})
                  </button>
                  <button
                    onClick={() => setFilterMode('errors')}
                    className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                      filterMode === 'errors'
                        ? 'bg-red-500 text-white shadow-sm'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    <span>Ошибки</span>
                    {totalErrors > 0 && (
                      <span className="px-1.5 py-0.2 bg-red-700/80 text-white rounded-full text-[10px]">
                        {totalErrors}
                      </span>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск по запросам..."
                    className="pl-7 pr-3 py-1 bg-white dark:bg-[#252b35] border border-gray-300 dark:border-gray-600 rounded-lg text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44 sm:w-56"
                  />
                  <svg className="w-3.5 h-3.5 absolute left-2 top-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {filteredLogs.length === 0 ? (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-xs">
                {filterMode === 'errors' ? 'Ошибок в сетевых запросах не обнаружено.' : 'Список пуст.'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLogs.map((log, index) => {
                  const isExpanded = expandedRowIds.has(log.id);
                  const isSelected = activeLog?.id === log.id;

                  return (
                    <div
                      key={log.id}
                      className={`border rounded-xl transition-all overflow-hidden ${
                        isSelected
                          ? 'border-blue-400 dark:border-blue-500 bg-blue-50/20 dark:bg-blue-950/20'
                          : 'border-gray-200 dark:border-[#38414e] bg-white dark:bg-[#222832] hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {/* Summary Row */}
                      <div
                        onClick={() => setSelectedLogId(log.id)}
                        className="p-3 flex flex-wrap items-center justify-between gap-2 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[11px] font-mono text-gray-400 w-5">
                            #{filteredLogs.length - index}
                          </span>

                          <span
                            className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold ${
                              log.method === 'POST'
                                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                                : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                            }`}
                          >
                            {log.method}
                          </span>

                          <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                            {log.label}
                          </span>

                          {log.status === 'error' && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded font-semibold">
                              Ошибка {log.statusCode || ''}
                            </span>
                          )}
                          {log.status === 'success' && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded font-semibold">
                              200 OK
                            </span>
                          )}

                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate hidden md:inline-block max-w-xs">
                            {log.endpoint}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-gray-400">{log.timestamp}</span>

                          {/* Quick details button to open in top inspector */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLogId(log.id);
                            }}
                            title="Открыть в инспекторе"
                            className="px-2 py-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                          >
                            Посмотреть
                          </button>

                          {/* Expand accordion button */}
                          <button
                            onClick={(e) => toggleRowExpanded(log.id, e)}
                            title={isExpanded ? 'Свернуть' : 'Раскрыть подробности'}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
                          >
                            <svg
                              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Accordion Detail View */}
                      {isExpanded && (
                        <div className="p-3 border-t border-gray-200 dark:border-[#38414e] bg-gray-50 dark:bg-[#1a1f26] space-y-3">
                          {log.errorMessage && (
                            <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg text-xs text-red-700 dark:text-red-300">
                              <span className="font-bold">Ошибка: </span>
                              {log.errorMessage}
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {/* Inner Payload */}
                            <div className="bg-white dark:bg-[#15191f] p-2.5 rounded-lg border border-gray-200 dark:border-[#38414e]">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                                  Payload:
                                </span>
                                <button
                                  onClick={() => handleCopy(formatJson(log.payload), `payload-${log.id}`)}
                                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  {copiedState === `payload-${log.id}` ? 'Скопировано' : 'Копировать'}
                                </button>
                              </div>
                              <pre className="text-[11px] font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-48 whitespace-pre-wrap break-all">
                                {formatJson(log.payload)}
                              </pre>
                            </div>

                            {/* Inner Response */}
                            <div className="bg-white dark:bg-[#15191f] p-2.5 rounded-lg border border-gray-200 dark:border-[#38414e]">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                                  Ответ:
                                </span>
                                <button
                                  onClick={() =>
                                    handleCopy(
                                      formatJson(log.response || log.errorMessage),
                                      `resp-${log.id}`
                                    )
                                  }
                                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  {copiedState === `resp-${log.id}` ? 'Скопировано' : 'Копировать'}
                                </button>
                              </div>
                              <pre className="text-[11px] font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-48 whitespace-pre-wrap break-all">
                                {log.response ? formatJson(log.response) : log.errorMessage || 'null'}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-[#38414e] bg-gray-50 dark:bg-[#252b35] flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div>
            <span>Подсказка: окно можно открыть или закрыть сочетанием клавиш </span>
            <kbd className="px-1.5 py-0.5 font-mono bg-gray-200 dark:bg-[#343d4b] rounded text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600">
              Ctrl + [
            </kbd>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#2a62ff] hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayloadInspectorModal;
