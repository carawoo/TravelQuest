import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kmbjffwrroopmkxjkcmt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttYmpmZndycm9vcG1reGprY210Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NzY4MjEsImV4cCI6MjA4MDM1MjgyMX0.O0RZbAt3koUVbPnk4aK7bcH5p7rGt3tP90o3I8Ou68w';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
