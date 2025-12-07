import { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { updateBoardSettings } from '../services/boardService';

export interface BoardSettings {
  isCondensed: boolean;
}

const DEFAULT_SETTINGS: BoardSettings = {
  isCondensed: false,
};

const STORAGE_KEY = 'genjira_board_settings';

export const useBoardSettings = () => {
  const [settings, setSettings] = useState<BoardSettings>(DEFAULT_SETTINGS);
  const [boardId, setBoardId] = useState<string | null>(null);
  const isInitialized = useRef(false);

  // Load from DB on mount
  useEffect(() => {
    const loadSettings = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: boards } = await supabase
            .from('boards')
            .select('id, settings')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle();
        
        if (boards) {
            setBoardId(boards.id);
            if (boards.settings) {
                setSettings(prev => ({ ...prev, ...boards.settings }));
            }
        }
        isInitialized.current = true;
    };
    loadSettings();
  }, []);

  // Sync to DB when settings change
  useEffect(() => {
    if (!isInitialized.current || !boardId) return;

    const timeoutId = setTimeout(() => {
        updateBoardSettings(boardId, settings);
    }, 500); // Debounce updates

    return () => clearTimeout(timeoutId);
  }, [settings, boardId]);

  const updateSetting = <K extends keyof BoardSettings>(key: K, value: BoardSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return { settings, updateSetting };
};
