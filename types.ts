
import type React from 'react';

export interface Message {
  id: string;
  text: string | React.ReactNode;
  sender: 'user' | 'bot' | 'system';
}

export interface BotSettings {
  bot_name?: string;
  bot_position?: string;
  company?: string;
  greeting?: string;
  purpose?: string;
  role?: string;
  behavior?: string;
  communication_type?: 'Жду обращения' | 'Начинает диалог';
  channel?: 'WhatsApp' | 'Telegram' | 'Website';
  knowledge_bases?: string[]; // Array of record_ids
  messages_log?: boolean;
  api_server?: string[]; // Array of record_ids for API Node
  external_promt_url?: string;
  ai_modal_image?: boolean;
  ai_modal_video?: boolean;
  ai_modal_audio?: boolean;
  ai_modal_doc?: boolean;
  [key: string]: any;
}

export interface User {
  ruid: string;
  email: string;
}

export interface Bot {
  ai_model: string;
  api_host: string;
  avatar: string;
  bot_id: number;
  bot_record_id: string;
  bot_token: string;
  edit_record_id: string;
  favorite: boolean;
  hello: string;
  name: string;
  tarif: string;
}

export interface ProTalkFunction {
  id: string;
  fields: {
    ID: number;
    Название: string;
    Описание?: string;
    Фото2?: {
      thumbnails: {
        small: { url: string };
      };
    }[];
  };
}

export interface KnowledgeBaseFile {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
  thumbnails?: {
    small: { url: string };
    large: { url: string };
  };
}

export interface KnowledgeBase {
  id: number;
  record_id: string;
  name: string;
  quality: string;
  files: KnowledgeBaseFile[];
}

export interface Trigger {
  id: string;
  createdTime: string;
  fields: {
    ID: number;
    Name: string;
    Messages: string;
    Mode: 'Регулярный' | string;
    Type: 'Диалог с ботом' | string;
    RegularType: 'Ежедневно' | 'Еженедельно' | string;
    RegularWeekDay?: string[];
    StartDate: string;
    StartTime: number;
    StopDate: string;
    StopTime: number;
    Bots: string[]; // record_ids of bots
    BotsRealIDs: number[]; // bot_ids
    BotsNames: string[];
    Email: string;
    record_id: string;
    [key: string]: any;
  };
}