const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

router.post('/:id/respond', async (req, res) => {
  try {
    const dilemmaId = req.params.id.toString(); // Ensure string
    const { body } = req;
    
    console.log(`Looking for dilemma with ID: ${dilemmaId}`);
    
    // Query using 'id' column (assuming it's the UUID primary key)
    const { data: dilemmaDataArray, error } = await supabase
      .from("Dilemmas")
      .select("prompt, id")
      .eq("id", dilemmaId)
      .limit(1);
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(404).json({ 
        error: "Dilemma not found",
        details: error.message,
        searchedId: dilemmaId
      });
    }
    
    // Handle the array response
    const dilemmaData = dilemmaDataArray?.[0];
    
    if (!dilemmaData) {
      return res.status(404).json({ 
        error: "Dilemma not found",
        searchedId: dilemmaId
      });
    }
    
    console.log('Found dilemma:', dilemmaData);
    
    // Insert response with temporary user_id (or null if allowed)
    const { data: responseData, error: insertError } = await supabase
      .from("DebateResponses") // or whatever your responses table is called
      .insert({
        dilemma_id: dilemmaId,
        response: body.response || "No response provided",
        user_id: null, // Temporary - will be replaced with actual user_id when auth is implemented
        created_at: new Date().toISOString()
      })
      .select();
    
    if (insertError) {
      console.error('Insert error:', insertError);
      return res.status(500).json({ 
        error: "Failed to save response",
        details: insertError.message
      });
    }
    
    res.json({
      success: true,
      dilemmaId: dilemmaId,
      dilemmaPrompt: dilemmaData.prompt,
      response: responseData,
      message: 'Response processed successfully'
    });
    
  } catch (error) {
    console.error('Error in debate respond:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

module.exports = router; 