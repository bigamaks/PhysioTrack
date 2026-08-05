import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cnxvcixrmipowhgswmtm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNueHZjaXhybWlwb3doZ3N3bXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1Nzc0MDcsImV4cCI6MjEwMTE1MzQwN30.uwqwSZlsT0k1lLmpjJNYIaV80Eti3pfT3ipJmlkkzL8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);