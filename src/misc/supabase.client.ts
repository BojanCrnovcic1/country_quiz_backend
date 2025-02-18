import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = 'https://xzfbzeucuacmhxegnpir.supabase.co';
const SUPABASE_ANON_KAY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6ZmJ6ZXVjdWFjbWh4ZWducGlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1NTU1MjEsImV4cCI6MjA1NTEzMTUyMX0.N1_ojpA7Ieza6WM9oglo7BMPMbySWnXVhQ0KEAl6-LY';

console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_ANON_KAY:", process.env.SUPABASE_ANON_KAY);


export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KAY);