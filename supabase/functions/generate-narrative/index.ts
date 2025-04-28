import { createClient } from "npm:@supabase/supabase-js@2.39.7";

interface Memory {
  id: string;
  content: string;
  relationship?: string;
  timePeriod?: string;
  emotion?: string;
  contributorName?: string;
}

interface Memorial {
  id: string;
  fullName: string;
  birthDate: string;
  passedDate: string;
  tone?: string;
  style?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Initialize Supabase client using environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const openaiApiKey = Deno.env.get("OPENAI_API_KEY") || "";

console.log("Edge function starting, API Key exists:", !!openaiApiKey);

const supabase = createClient(supabaseUrl, supabaseKey);

// Rate limit settings - 1 minute in milliseconds (reduced for testing)
const RATE_LIMIT_MS = 1 * 60 * 1000;
const RATE_LIMIT_TABLE = "rate_limits";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Allow POST (generate narrative) and DELETE (delete memory) requests
    if (req.method === "DELETE") {
      // --- DELETE MEMORY HANDLER ---
      // Parse memoryId from query string
      const url = new URL(req.url);
      const memoryId = url.searchParams.get("memoryId");
      if (!memoryId) {
        return new Response(
          JSON.stringify({ error: "Missing memoryId in query string" }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }
      // Verify authentication
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: "Missing authorization header" }),
          {
            status: 401,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: "Unauthorized", details: authError }),
          {
            status: 401,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }
      // Fetch the memory and verify ownership
      const { data: memory, error: memoryError } = await supabase
        .from("memories")
        .select("id, user_id")
        .eq("id", memoryId)
        .single();
      if (memoryError || !memory) {
        return new Response(
          JSON.stringify({ error: "Memory not found or already deleted", details: memoryError }),
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }
      // Check if the memory belongs to the user
      if (memory.user_id !== user.id) {
        return new Response(
          JSON.stringify({ error: "Forbidden: You do not own this memory." }),
          {
            status: 403,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }
      // Delete the memory
      const { error: deleteError } = await supabase
        .from("memories")
        .delete()
        .eq("id", memoryId);
      if (deleteError) {
        return new Response(
          JSON.stringify({ error: "Failed to delete memory", details: deleteError }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }
      return new Response(
        JSON.stringify({ success: true, message: "Memory deleted successfully." }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
    // Only accept POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Extract the token
    const token = authHeader.replace("Bearer ", "");

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: authError }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    console.log("User authenticated:", user.id);

    // Check rate limit for this user
    const isRateLimited = await checkRateLimit(user.id);
    if (isRateLimited.limited) {
      return new Response(
        JSON.stringify({ 
          error: `Rate limit exceeded. Please wait ${isRateLimited.remainingMinutes} minute(s) before trying again.`,
          rateLimited: true,
          timeRemaining: isRateLimited.remainingSeconds
        }),
        {
          status: 429, // Too Many Requests
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Parse request body
    const requestBody = await req.json();
    const { memorialId, memories: providedMemories } = requestBody;

    console.log("Request received for memorialId:", memorialId);
    console.log("Pre-provided memories:", providedMemories ? providedMemories.length : "none");

    if (!memorialId) {
      return new Response(
        JSON.stringify({ error: "Missing memorial ID" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Fetch memorial data
    const { data: memorialData, error: memorialError } = await supabase
      .from("memorials")
      .select("*")
      .eq("id", memorialId)
      .single();

    if (memorialError || !memorialData) {
      console.error("Error fetching memorial:", memorialError);
      return new Response(
        JSON.stringify({ error: "Memorial not found", details: memorialError }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    console.log("Memorial found:", memorialData.fullname);

    const memorial = {
      id: memorialData.id,
      fullName: memorialData.fullname,
      birthDate: memorialData.birthdate,
      passedDate: memorialData.passeddate,
      tone: memorialData.tone || 'warm',
      style: memorialData.style || 'conversational'
    } as Memorial;

    // Fetch memories for this memorial
    let memories: Memory[] = [];
    
    if (providedMemories && providedMemories.length > 0) {
      console.log("Using provided memories");
      memories = providedMemories;
    } else {
      console.log("Fetching memories from database");
      const { data: memoriesData, error: memoriesError } = await supabase
        .from("memories")
        .select("*")
        .eq("memorialid", memorialId);  

      if (memoriesError) {
        console.error("Error fetching memories:", memoriesError);
        return new Response(
          JSON.stringify({ error: "Error fetching memories", details: memoriesError }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }

      // Type for raw DB row
      type MemoryRow = {
        id: string;
        content: string;
        relationship?: string;
        timeperiod?: string;
        emotion?: string;
        contributorname?: string;
      };
      memories = (memoriesData as MemoryRow[]).map((item) => ({
        id: item.id,
        content: item.content,
        relationship: item.relationship,
        timePeriod: item.timeperiod,
        emotion: item.emotion,
        contributorName: item.contributorname
      }));
    }

    console.log(`Found ${memories.length} memories for processing`);
    
    // Log the first few memories for debugging
    if (memories.length > 0) {
      console.log("Sample memory:", {
        content: memories[0].content.substring(0, 50) + "...",
        relationship: memories[0].relationship,
        emotion: memories[0].emotion,
        contributorName: memories[0].contributorName
      });
    }

    if (memories.length === 0) {
      return new Response(
        JSON.stringify({ error: "No memories found for this memorial", details: "Please add memories before generating a narrative" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Prepare the prompt for OpenAI
    const prompt = generatePrompt(memorial, memories);
    console.log("Generated prompt length:", prompt.length);

    // Call OpenAI API
    console.log("Calling OpenAI API...");
    try {
      const narrative = await generateNarrativeWithOpenAI(prompt);
      console.log("Narrative generated, length:", narrative.length);
      console.log("First 100 chars of narrative:", narrative.substring(0, 100));

      // Update rate limit record for this user
      await updateRateLimit(user.id);

      // Update the memorial with the new narrative
      console.log("Updating memorial with narrative in database");
      const { error: updateError } = await supabase
        .from("memorials")
        .update({ ainarrative: narrative })
        .eq("id", memorialId);

      if (updateError) {
        console.error("Error updating memorial:", updateError);
        console.error("Error details:", {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });
        
        return new Response(
          JSON.stringify({ error: "Error updating memorial", details: updateError }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }

      console.log("Memorial updated successfully");

      // Return the generated narrative
      return new Response(
        JSON.stringify({ 
          success: true, 
          narrative,
          message: "Narrative generated successfully" 
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    } catch (aiError) {
      console.error("OpenAI API error:", aiError);
      
      // Create a simple first-person narrative based on the available memories
      const fallbackNarrative = generateFallbackNarrative(memorial, memories);
      
      // Update the memorial with the fallback narrative
      await supabase
        .from("memorials")
        .update({ ainarrative: fallbackNarrative })
        .eq("id", memorialId);
      
      // Return the fallback narrative
      return new Response(
        JSON.stringify({ 
          success: true, 
          narrative: fallbackNarrative,
          message: "Generated a simplified narrative due to API limitations" 
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    let details = "Unknown error";
    if (error instanceof Error) {
      details = error.message;
    } else if (typeof error === "string") {
      details = error;
    }
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});

// Check if a user has hit the rate limit
async function checkRateLimit(userId: string) {
  try {
    // Check if we have a rate_limits table, create it if not
    const { error: tableExistsError } = await supabase
      .from(RATE_LIMIT_TABLE)
      .select('user_id')
      .limit(1);

    if (tableExistsError) {
      // Table might not exist, try to create it
      try {
        await supabase.rpc('create_rate_limits_table_if_not_exists');
      } catch (createError) {
        console.error("Error creating rate limits table:", createError);
        // If we can't create the table, we'll skip rate limiting
        return { limited: false };
      }
    }

    // Get the most recent rate limit record for this user
    const { data, error } = await supabase
      .from(RATE_LIMIT_TABLE)
      .select("timestamp")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error checking rate limit:", error);
      // If we can't check the rate limit, allow the request
      return { limited: false };
    }

    if (!data || data.length === 0) {
      // No previous requests, not rate limited
      return { limited: false };
    }

    const lastTimestamp = new Date(data[0].timestamp).getTime();
    const currentTime = Date.now();
    const elapsedTime = currentTime - lastTimestamp;

    if (elapsedTime < RATE_LIMIT_MS) {
      const remainingMs = RATE_LIMIT_MS - elapsedTime;
      const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      
      return { 
        limited: true, 
        remainingMinutes, 
        remainingSeconds 
      };
    }

    return { limited: false };
  } catch (error) {
    console.error("Error in checkRateLimit:", error);
    // If there's an error, allow the request to proceed
    return { limited: false };
  }
}

// Update the rate limit timestamp for a user
async function updateRateLimit(userId: string) {
  try {
    const { error } = await supabase
      .from(RATE_LIMIT_TABLE)
      .insert([
        { user_id: userId, timestamp: new Date().toISOString() }
      ]);

    if (error) {
      console.error("Error updating rate limit:", error);
    }
  } catch (error) {
    console.error("Error in updateRateLimit:", error);
  }
}

// Function to generate a simple fallback narrative based on memories
function generateFallbackNarrative(memorial: Memorial, memories: Memory[]): string {
  // Removed 'name' variable (was: const name = memorial.fullName.split(' ')[0] || "I";)
  // To personalize the narrative with the first name, integrate it into the returned text.
  
  // Extract key details from memories
  const relationships = memories
    .filter(m => m.relationship)
    .map(m => m.relationship)
    .filter((value, index, self) => self.indexOf(value) === index); // unique values
  
  const emotions = memories
    .filter(m => m.emotion)
    .map(m => m.emotion);
  
  const hasJoyful = emotions.includes("joyful") || emotions.includes("funny");
  const hasThoughtful = emotions.includes("thoughtful");
  const hasBittersweet = emotions.includes("bittersweet") || emotions.includes("sad");
  
  // Extract meaningful memory snippets to include directly in the narrative
  const significantMemories = memories
    .filter(m => m.content.length > 50) // Only use substantial memories
    .slice(0, 5); // Take up to 5 significant memories
  
  // Incorporate tone and style into the narrative
  const tone = memorial.tone || 'warm';
  const style = memorial.style || 'conversational';
  
  let narrativeOpening = "";
  
  // Adjust opening based on tone and style
  if (tone === 'warm' && style === 'conversational') {
    narrativeOpening = `I was born with a spirit of adventure and a heart full of love. Throughout my life, I cherished the moments shared with family and friends, creating memories that would last beyond my time.`;
  } else if (tone === 'reflective' && style === 'conversational') {
    narrativeOpening = `Looking back on my journey through life, I find myself reflecting on the moments that shaped who I became. The tapestry of my existence was woven with threads of connection, each person in my life contributing their own unique color.`;
  } else if (tone === 'humorous' && style === 'conversational') {
    narrativeOpening = `Well, let me tell you about this wild ride I called life! I never was one to take things too seriously - what's the fun in that? Life's too short not to find the humor in everyday moments.`;
  } else if (tone === 'respectful' && style === 'conversational') {
    narrativeOpening = `With gratitude for the life I was blessed to live, I share these memories. Each day was a gift, and I strived to honor that gift through my actions and relationships with others.`;
  } else if (style === 'poetic') {
    narrativeOpening = `Like leaves carried on autumn winds, my days flowed one into another, each leaving its imprint on my soul. The symphony of my existence played in both major and minor keys, its melody echoing beyond my earthly journey.`;
  } else if (style === 'storytelling') {
    narrativeOpening = `Once upon a time, there was a person named ${memorial.fullName}. My story began with the usual hopes and dreams, but as with all good tales, it was the unexpected twists and cherished characters that made it truly worth telling.`;
  } else if (style === 'formal') {
    narrativeOpening = `I, ${memorial.fullName}, was privileged to experience a life marked by meaningful connections and purposeful endeavors. Throughout the course of my existence, I encountered numerous individuals who significantly impacted my personal development.`;
  } else {
    // Default
    narrativeOpening = `I was born with a spirit of adventure and a heart full of love. Throughout my life, I cherished the moments shared with family and friends, creating memories that would last beyond my time.`;
  }
  
  let narrative = narrativeOpening + "\n\n";
  
  // Add personalized paragraphs incorporating direct memory content
  if (significantMemories.length > 0) {
    // Create paragraphs for each significant memory
    significantMemories.forEach(memory => {
      // Use contributor name if available, otherwise use relationship
      let attributionName = "";
      if (memory.contributorName) {
        attributionName = memory.contributorName;
      } else if (memory.relationship) {
        attributionName = `my ${memory.relationship.toLowerCase()}`;
      } else {
        attributionName = "someone close to me";
      }
      
      const timePeriod = memory.timePeriod ? ` during ${memory.timePeriod}` : "";
      
      let emotionText = "";
      // Adjust emotion text based on tone
      if (memory.emotion === "joyful") {
        emotionText = tone === 'humorous' 
          ? " It was absolutely hilarious!" 
          : tone === 'reflective' 
          ? " It brought me such profound joy that still warms my heart." 
          : " It brought me such joy.";
      } else if (memory.emotion === "funny") {
        emotionText = tone === 'humorous' 
          ? " We laughed until our sides hurt!" 
          : " We had such a good laugh about it.";
      } else if (memory.emotion === "thoughtful") {
        emotionText = tone === 'reflective' 
          ? " It led me to profound contemplation about the nature of our connections." 
          : " It gave me much to reflect on.";
      } else if (memory.emotion === "bittersweet") {
        emotionText = tone === 'reflective' 
          ? " Looking back, it fills me with a complex tapestry of emotions - joy intertwined with gentle sorrow." 
          : " Looking back, it fills me with a sense of bittersweet nostalgia.";
      } else if (memory.emotion === "sad") {
        emotionText = tone === 'reflective' 
          ? " It was during this difficult time that I truly understood the depth of human resilience." 
          : " It was a challenging time, but it shaped who I became.";
      }
      
      // Style the attribution based on selected style
      let memoryAttribution = "";
      if (style === 'storytelling') {
        memoryAttribution = `I remember a chapter of my story that ${attributionName} still tells: `;
      } else if (style === 'poetic') {
        memoryAttribution = `In the garden of memories, ${attributionName} preserved this moment: `;
      } else if (style === 'formal') {
        memoryAttribution = `As recounted by ${attributionName}, an incident of significance occurred: `;
      } else {
        memoryAttribution = `${attributionName} once remembered: `;
      }
      
      // Full memory content (not truncated)
      const memoryContent = `"${memory.content}"`;
      
      narrative += `${memoryAttribution}${memoryContent}${timePeriod}${emotionText}\n\n`;
    });
  }
  
  if (relationships.length > 0) {
    let relationshipText = "";
    if (style === 'poetic') {
      relationshipText = `The constellation of my ${relationships.join(", ")} formed the heavens under which I lived my days, their light guiding me through both shadow and sunshine.`;
    } else if (style === 'formal') {
      relationshipText = `My associations with my ${relationships.join(", ")} constituted the fundamental social structure that supported my existence and facilitated my personal development.`;
    } else if (style === 'storytelling') {
      relationshipText = `The characters who shaped my story most deeply were my ${relationships.join(", ")}. They were the heroes and companions of my tale, each playing their unique and irreplaceable role.`;
    } else {
      relationshipText = `My relationships with my ${relationships.join(", ")} were the cornerstones of my life. They brought me joy, taught me valuable lessons, and supported me through both celebrations and challenges.`;
    }
    narrative += relationshipText + "\n\n";
  }
  
  if (hasJoyful) {
    let joyText = "";
    if (tone === 'humorous') {
      joyText = `Boy, did I love a good laugh! Finding the funny side of life was my specialty. Whether it was cracking jokes at family gatherings or finding humor in everyday mishaps, I believed life's too short not to have a chuckle.`;
    } else if (style === 'poetic') {
      joyText = `Joy danced through my days like sunlight on water, catching and reflecting in unexpected moments of delight - in the simple pleasures of fishing trips, the harmony of family gatherings, and the peaceful solitude of quiet evenings.`;
    } else if (style === 'formal') {
      joyText = `I derived considerable pleasure from moments of levity and familial congregation. The pursuit of happiness through simple recreational activities was a consistent theme throughout my existence.`;
    } else {
      joyText = `I loved to laugh and find happiness in the simple moments of life. Whether it was fishing trips, family gatherings, or quiet evenings at home, I treasured these joyful times.`;
    }
    narrative += joyText + "\n\n";
  }
  
  if (hasThoughtful) {
    let thoughtfulText = "";
    if (style === 'poetic') {
      thoughtfulText = `In quiet moments of contemplation, I would ponder the ripples of my actions spreading outward, touching shores I might never see. The weight of a kind word, the legacy of a thoughtful deed - these were the currencies I valued most.`;
    } else if (style === 'storytelling') {
      thoughtfulText = `The chapters of my life were not only about what happened, but what those events meant. I was the kind of character who would pause the action to consider the deeper themes unfolding in my story.`;
    } else {
      thoughtfulText = `I often reflected on the deeper meaning of life, considering how my actions and words might impact those around me. I believed in living thoughtfully and with purpose.`;
    }
    narrative += thoughtfulText + "\n\n";
  }
  
  if (hasBittersweet) {
    let bittersweetText = "";
    if (tone === 'reflective') {
      bittersweetText = `The valleys of my life were as formative as the peaks. In those shadowed moments, I discovered strengths I never knew I possessed and learned to appreciate the dawn that inevitably follows even the longest night.`;
    } else if (style === 'poetic') {
      bittersweetText = `Even in sorrow, I found strange beauty - the way grief carves rivers of gratitude through the bedrock of being. These darker chapters wrote themselves in invisible ink upon my soul, revealed only in the light of retrospection.`;
    } else {
      bittersweetText = `Like everyone, I faced challenges and difficult times. These moments shaped me just as much as the happy ones, teaching me resilience and appreciation for life's precious moments.`;
    }
    narrative += bittersweetText + "\n\n";
  }

  // Craft the closing based on tone and style
  let closing = "";
  if (style === 'poetic') {
    closing = `Though the book of my physical presence has closed, the stories continue to be told, each memory a thread in the continuing tapestry of connection. In being remembered, I remain - a whisper in laughter, a lesson in struggle, a presence in love.`;
  } else if (tone === 'reflective') {
    closing = `Though I may no longer walk among you, I find a certain peace in knowing that the moments we shared continue to resonate. Each story shared is another moment of connection, transcending the boundaries between then and now, between here and there.`;
  } else if (style === 'storytelling') {
    closing = `And so my story continues, not on pages I write myself, but in the chapters added by those who knew me. With each memory shared, my narrative grows richer, adding new dimensions to the character I was and continue to be.`;
  } else if (style === 'formal') {
    closing = `Despite the conclusion of my physical existence, my legacy persists through the recollections preserved by those with whom I formed meaningful connections. Each contributed memory serves to further develop the comprehensive understanding of my identity and influence.`;
  } else {
    closing = `Though I may no longer be physically present, my spirit lives on through the memories shared by those who knew me. Each story, each recollection adds another brushstroke to the portrait of who I was.`;
  }
  
  narrative += closing;
  
  return narrative;
}

// Function to generate the prompt for OpenAI
function generatePrompt(memorial: Memorial, memories: Memory[]): string {
  // Create detailed memory descriptions with clear attribution
  const memoryTexts = memories.map(memory => {
    let memoryText = `MEMORY CONTENT: "${memory.content}"\n`;
    if (memory.contributorName) memoryText += `SHARED BY: ${memory.contributorName}\n`;
    if (memory.relationship) memoryText += `RELATIONSHIP: ${memory.relationship}\n`;
    if (memory.timePeriod) memoryText += `TIME PERIOD: ${memory.timePeriod}\n`;
    if (memory.emotion) memoryText += `EMOTIONAL CONTEXT: ${memory.emotion}\n`;
    return memoryText;
  }).join("\n---\n");

  return `
  You are a skilled and compassionate writer crafting a first-person life narrative for ${memorial.fullName} (${memorial.birthDate || 'unknown'} - ${memorial.passedDate || 'unknown'}). Your goal is to create a warm, reflective, and authentic story that captures the essence of the individual's life based on memories shared by their loved ones.

  The tone of the narrative should be ${memorial.tone || 'warm and reflective'}. The writing style should be ${memorial.style || 'authentic and personal'}.

  **Key Principles:**

  *   **First-Person Perspective:** Write in the first person, as if ${memorial.fullName} is telling their own story, using "I" and "my."
  *   **Seamless, Artful Integration:** Paraphrase and weave the memories naturally into the narrative, never quoting them verbatim or isolating them as blocks. Use contributor names and relationships in a varied, organic way—never start multiple sentences or paragraphs the same way.
  *   **Authentic, Distinctive Voice:** Let the unique personality, quirks, and emotional tone of ${memorial.fullName} shine through, based on the details and style of the memories. Avoid generic or formal language—write as if the person is reminiscing in their own words.
  *   **Thematic & Chronological Flow:** Group memories by theme, relationship, or period of life. Use smooth transitions and personal reflections to connect memories, creating a cohesive story that flows naturally from one paragraph to the next.
  *   **Varied Attribution & Sentence Structure:** Attribute memories using a wide range of phrases and structures (see examples below). Avoid all repetition. Sometimes refer to contributors by name, sometimes by relationship, sometimes by both, and sometimes simply by context.
  *   **No Fabrication:** Do not invent information or embellish beyond the details provided in the memories.
  *   **Balanced, Emotional Arc:** Balance joyful, humorous, and poignant moments to create a rich, multidimensional portrait. Each paragraph should explore a theme, relationship, or period, integrating multiple memories where possible.
  *   **Length:** Aim for 5–7 paragraphs, each with a clear theme or period, and a meaningful connection to the next. Begin with an introduction about early life; end with reflective thoughts on legacy and how the person lives on through memories.

  **Example Attributions & Integration (Vary these and use your own):**

  *   "Chris, my cousin, always loved to tell the story of..."
  *   "According to my friend Jack, I once..."
  *   "One of my favorite memories, shared by my sister..."
  *   "I'll never forget the day that my friend described..."
  *   "Laughter was a constant, as my family often recalled..."

  **Example Paragraphs:**

  Growing up, I was always surrounded by laughter and mischief. Chris, my cousin, loved to remind everyone of the time I convinced the family I was a falconer, only for a seagull to steal the show. Jack, my lifelong friend, would often recall my knack for turning even a simple gathering into an adventure—like the infamous elevator self-rescue. These moments, full of spontaneity, defined my younger years and the joy I found in life’s surprises.

  Later on, I discovered happiness in the little things—fishing trips, tinkering with household repairs, and sharing stories over dinner. My friends and family were always by my side, each adding their own color to my story. According to Chris, my unique approach to plumbing once turned a leaky sink into a comedy of errors, a memory that still brings a smile to those who hear it. These everyday adventures, big and small, made my life uniquely mine.

  **Memory Integration Techniques:**

  *   **Direct, Natural Integration:** Paraphrase and blend memory content into the narrative flow, never as isolated quotes.
  *   **Thematic or Chronological Grouping:** Organize memories by theme or period for each paragraph.
  *   **Transitional Phrases & Reflections:** Use smooth transitions and personal reflections to connect memories and paragraphs.

  **Avoiding Common Issues:**

  *   **DO NOT** use repetitive phrases or sentence structures.
  *   **DO NOT** quote memories verbatim or block them out.
  *   **DO NOT** just list memories one after another with minimal connection.
  *   **DO NOT** overuse contributor names—vary how you refer to people and their memories.
  *   **DO NOT** use generic phrases like "I had a good life" without connecting to specific memories.

  **MEMORIES TO INCORPORATE:**

  ${memoryTexts}

  Begin the narrative with an introduction about early life and end with reflective thoughts about legacy and how the person lives on through memories. Make each paragraph meaningful and connected to the next, creating a smooth narrative flow that captures the essence of this person's life.
  `;
}

// Function to call OpenAI API
async function generateNarrativeWithOpenAI(prompt: string): Promise<string> {
  if (!openaiApiKey) {
    throw new Error("OpenAI API key is missing from environment variables");
  }
  
  console.log("Sending request to OpenAI");
  
  const requestBody = {
    model: "gpt-4.1-nano",
    messages: [
      {
        role: "system",
        content: "You are a compassionate writer creating meaningful first-person life narratives for memorial services. Your task is to craft a warm, respectful narrative that captures the essence of a person's life based on memories shared by their loved ones. You must directly incorporate the content from the shared memories, using exact quotes and details when appropriate. ALWAYS use the contributor's actual name when attributing memories, not their relationship to the person (unless no name is provided)."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 2000
  };
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openaiApiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  const responseStatus = response.status;
  console.log("OpenAI response status:", responseStatus);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI API error response:", errorText);
    
    try {
      const errorData = JSON.parse(errorText);
      console.error("Parsed error:", errorData);
      
      throw new Error(`OpenAI API error: ${errorData.error?.message || errorData.message || "Unknown error"}`);
    } catch {
      throw new Error(`OpenAI API error (${response.status}): ${errorText.substring(0, 200)}`);
    }
  }
  
  const data = await response.json();
  
  console.log("OpenAI response received");
  
  if (!data.choices || data.choices.length === 0) {
    console.error("No choices in OpenAI response:", data);
    throw new Error("No content generated by OpenAI");
  }
  
  const generatedContent = data.choices[0].message.content;
  console.log("Generated narrative length:", generatedContent.length);
  console.log("Generated narrative preview:", generatedContent.substring(0, 100) + "...");
  
  if (!generatedContent || generatedContent.trim().length === 0) {
    throw new Error("Empty content returned from OpenAI");
  }
  
  return generatedContent;
}