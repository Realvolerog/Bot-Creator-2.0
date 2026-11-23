
import React, { useMemo } from 'react';
import { ReactFlow, Background, Controls, Edge, Node, ReactFlowProvider } from 'reactflow';
import type { Bot, BotSettings } from '../types';

interface WorkflowViewProps {
  bot: Bot;
  botDetails: BotSettings | null;
  onEditSection: (section: string) => void;
  isLoading: boolean;
}

const WorkflowView: React.FC<WorkflowViewProps> = ({ bot, botDetails, onEditSection, isLoading }) => {
  
  const { nodes, edges } = useMemo(() => {
    if (!botDetails) return { nodes: [], edges: [] };

    const generatedNodes: Node[] = [];
    const generatedEdges: Edge[] = [];
    let yPos = 50;
    const xPos = 250;

    // Helper to ensure we always return a string for labels
    // This is the critical fix for "Minified React error #31"
    const safeStr = (val: any) => {
        if (val === null || val === undefined) return '';
        if (typeof val === 'object') return ''; // Explicitly block objects and arrays (including React Elements)
        return String(val);
    };

    // 1. Identity Node (Start)
    generatedNodes.push({
      id: 'identity',
      type: 'input',
      data: { 
        // Wrap bot.name in safeStr too, just in case bot object from API is malformed
        label: `👤 ${safeStr(botDetails.bot_name || safeStr(bot.name))}\n${safeStr(botDetails.bot_position || 'Бот')}\n${safeStr(botDetails.bot_gender || '')}`
      },
      position: { x: xPos, y: yPos },
      style: { 
        background: '#1f2937', 
        border: '2px solid #3b82f6', 
        borderRadius: '12px', 
        padding: '10px', 
        minWidth: '180px', 
        color: 'white', 
        whiteSpace: 'pre-wrap', 
        textAlign: 'center',
        fontSize: '12px',
        fontFamily: 'sans-serif'
      },
    });
    yPos += 150;

    // 2. Brain/Intellect Node
    generatedNodes.push({
      id: 'intellect',
      data: { 
        label: `🧠 Интеллект\n${safeStr(botDetails.ai_model || 'Standard')}\nКреатив: ${safeStr(botDetails.creativity ?? 0)}`
      },
      position: { x: xPos, y: yPos },
      style: { 
        background: '#1f2937', 
        border: '1px solid #8b5cf6', 
        borderRadius: '12px', 
        padding: '10px', 
        minWidth: '180px', 
        color: 'white', 
        whiteSpace: 'pre-wrap', 
        textAlign: 'center',
        fontSize: '12px', 
        fontFamily: 'sans-serif'
      },
    });
    generatedEdges.push({ id: 'e1-2', source: 'identity', target: 'intellect', animated: true, style: { stroke: '#4b5563' } });
    yPos += 150;

    // 3. System Prompt (Hidden Logic)
    generatedNodes.push({
      id: 'role',
      data: { 
        label: `📜 Системный Промпт\n${botDetails.role ? 'Настроен' : 'Пусто'}`
      },
      position: { x: xPos, y: yPos },
      style: { 
        background: '#1f2937', 
        border: '1px solid #10b981', 
        borderRadius: '12px', 
        padding: '10px', 
        minWidth: '180px', 
        color: 'white', 
        whiteSpace: 'pre-wrap', 
        textAlign: 'center',
        fontSize: '12px', 
        fontFamily: 'sans-serif'
      },
    });
    generatedEdges.push({ id: 'e2-3', source: 'intellect', target: 'role', animated: true, style: { stroke: '#4b5563' } });
    yPos += 150;

    // 4. Split: Functions (Left) & Knowledge (Right)
    const functionsCount = botDetails.functions?.length || 0;
    const kbCount = botDetails.knowledge_bases?.length || 0;

    generatedNodes.push({
      id: 'functions',
      data: { 
        label: `🛠 Функции\nПодключено: ${safeStr(functionsCount)}`
      },
      position: { x: xPos - 120, y: yPos },
      style: { 
        background: '#1f2937', 
        border: '1px solid #f59e0b', 
        borderRadius: '12px', 
        padding: '10px', 
        width: '140px', 
        color: 'white', 
        whiteSpace: 'pre-wrap', 
        textAlign: 'center',
        fontSize: '12px', 
        fontFamily: 'sans-serif'
      },
    });

    generatedNodes.push({
      id: 'knowledge',
      data: { 
        label: `📚 База Знаний\nБаз: ${safeStr(kbCount)}`
      },
      position: { x: xPos + 120, y: yPos },
      style: { 
        background: '#1f2937', 
        border: '1px solid #ef4444', 
        borderRadius: '12px', 
        padding: '10px', 
        width: '140px', 
        color: 'white', 
        whiteSpace: 'pre-wrap', 
        textAlign: 'center',
        fontSize: '12px', 
        fontFamily: 'sans-serif'
      },
    });

    generatedEdges.push({ id: 'e3-4a', source: 'role', target: 'functions', type: 'smoothstep', style: { stroke: '#4b5563' } });
    generatedEdges.push({ id: 'e3-4b', source: 'role', target: 'knowledge', type: 'smoothstep', style: { stroke: '#4b5563' } });
    yPos += 150;

    // 5. Converge: Dialog Settings
    generatedNodes.push({
      id: 'dialog',
      data: { 
        label: `💬 Диалог\nЛимиты, История, Логи`
      },
      position: { x: xPos, y: yPos },
      style: { 
        background: '#1f2937', 
        border: '1px solid #06b6d4', 
        borderRadius: '12px', 
        padding: '10px', 
        minWidth: '180px', 
        color: 'white', 
        whiteSpace: 'pre-wrap', 
        textAlign: 'center',
        fontSize: '12px', 
        fontFamily: 'sans-serif'
      },
    });
    
    generatedEdges.push({ id: 'e4a-5', source: 'functions', target: 'dialog', type: 'smoothstep', style: { stroke: '#4b5563' } });
    generatedEdges.push({ id: 'e4b-5', source: 'knowledge', target: 'dialog', type: 'smoothstep', style: { stroke: '#4b5563' } });
    yPos += 150;

    // 6. Output: Channels
    const channels = [];
    if (botDetails.telegram_bot_token) channels.push('Telegram Bot');
    if (botDetails.whatsapp_number) channels.push('WhatsApp');
    if (!channels.length) channels.push('Веб-виджет');

    generatedNodes.push({
      id: 'channels',
      type: 'output',
      data: { 
        label: `📡 Каналы\n${safeStr(channels.join(', '))}`
      },
      position: { x: xPos, y: yPos },
      style: { 
        background: '#1f2937', 
        border: '1px dashed #3b82f6', 
        borderRadius: '12px', 
        padding: '10px', 
        minWidth: '180px', 
        color: 'white', 
        whiteSpace: 'pre-wrap', 
        textAlign: 'center',
        fontSize: '12px', 
        fontFamily: 'sans-serif'
      },
    });
    generatedEdges.push({ id: 'e5-6', source: 'dialog', target: 'channels', animated: true, style: { stroke: '#4b5563' } });

    return { nodes: generatedNodes, edges: generatedEdges };
  }, [bot, botDetails]);

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
      switch(node.id) {
          case 'identity': onEditSection('Общие'); break;
          case 'intellect': onEditSection('Интеллект'); break;
          case 'role': onEditSection('Интеллект'); break;
          case 'functions': onEditSection('Функции'); break;
          case 'knowledge': onEditSection('База знаний'); break;
          case 'dialog': onEditSection('Диалог'); break;
          case 'channels': onEditSection('Telegram'); break;
          default: break;
      }
  };

  if (isLoading) {
      return (
          <div className="flex items-center justify-center h-full bg-gray-900 text-gray-400">
              <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-3">Загрузка схемы...</span>
          </div>
      );
  }

  if (!botDetails) {
      return (
          <div className="flex items-center justify-center h-full bg-gray-900 text-gray-500">
              Нет данных для отображения схемы.
          </div>
      );
  }

  return (
    <div className="w-full h-full bg-gray-900">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-right"
        >
          <Background color="#374151" gap={16} />
          <Controls style={{ backgroundColor: '#1f2937', borderColor: '#4b5563', fill: 'white' }} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default WorkflowView;
