import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const NORMAL_LIMIT = 1;
const JUDGE_LIMIT = 5;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { voter_nic, candidate_nic, category } = await req.json();

    if (!voter_nic || !candidate_nic || !category) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["kumara", "kumariya"].includes(category)) {
      return new Response(
        JSON.stringify({ error: "Invalid category" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Cannot vote for yourself
    if (voter_nic === candidate_nic) {
      return new Response(
        JSON.stringify({ error: "You cannot vote for yourself" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if voter is a judge
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_judge")
      .eq("nic", voter_nic)
      .maybeSingle();

    const isJudge = profile?.is_judge === true;
    const voteLimit = isJudge ? JUDGE_LIMIT : NORMAL_LIMIT;

    // Count existing votes in this category
    const { count } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("voter_nic", voter_nic)
      .eq("category", category);

    if ((count ?? 0) >= voteLimit) {
      return new Response(
        JSON.stringify({ error: `You have already used all ${voteLimit} vote(s) in this category` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check duplicate vote for same candidate
    const { data: existing } = await supabase
      .from("votes")
      .select("id")
      .eq("voter_nic", voter_nic)
      .eq("candidate_nic", candidate_nic)
      .eq("category", category)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ error: "You have already voted for this contestant" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert vote
    const { error: insertError } = await supabase
      .from("votes")
      .insert({ voter_nic, candidate_nic, category });

    if (insertError) {
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, votes_cast: (count ?? 0) + 1, vote_limit: voteLimit }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
