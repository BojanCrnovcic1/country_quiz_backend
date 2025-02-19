import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KAY = process.env.SUPABASE_ANON_KAY;

console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_ANON_KAY:", process.env.SUPABASE_ANON_KAY);


export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KAY);