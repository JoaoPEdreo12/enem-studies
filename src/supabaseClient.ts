import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nxhlznikfthzwzecafhd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54aGx6bmlrZnRoend6ZWNhZmhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NTA0ODQsImV4cCI6MjA2NzEyNjQ4NH0.6fyT4Kb34tRgmJKatdIAoHFUzTFR71aHwco0_fwHhBg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 