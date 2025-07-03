import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xbejyffhreryaknxbudu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZWp5ZmZocmVyeWFrbnhidWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NzAzMDMsImV4cCI6MjA2NzA0NjMwM30.RHlAu8Ghg1UVKLtYPkDRDVOWAx4dNIoBalvIhKxYuao'
export const supabase = createClient(supabaseUrl, supabaseKey) 