import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("Function invoked. Method:", req.method);

  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request.");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Parsing request body...");
    const payload = await req.json();
    console.log("Payload received:", payload);

    if (!payload || typeof payload.image_url !== "string") {
      throw new Error(
        "Invalid payload: 'image_url' is required."
      );
    }

    console.log("Creating Supabase client...");
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            Authorization:
              req.headers.get("Authorization")!,
          },
        },
      }
    );
    console.log("Supabase client created.");

    console.log("Calling RPC 'create_new_post'...");
    const { data, error } = await supabaseClient.rpc(
      "create_new_post",
      {
        image_url: payload.image_url,
        caption: payload.caption,
      }
    );

    if (error) {
      console.error("RPC Error:", error);
      throw error; // Re-throw the error to be caught by the outer block
    }

    console.log("RPC call successful. Data:", data);
    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    console.error(
      "Caught an error in the main try/catch block:",
      error.message
    );
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});
