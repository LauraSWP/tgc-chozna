-- Give Test Cards Script
-- Run this AFTER running the reset_and_populate_database.sql script
-- This will give the current user some test cards to see in their collection

-- Replace 'your-email@example.com' with your actual email address
DO $$
DECLARE
  user_id uuid;
  card_def_ids uuid[];
  base_set_id uuid;
BEGIN
  -- Get your user ID (replace with your email)
  SELECT id INTO user_id FROM auth.users WHERE email = 'bkgumiho@gmail.com';
  
  -- Get the base set ID
  SELECT id INTO base_set_id FROM public.card_sets WHERE code = 'BASE';
  
  -- Get some card definition IDs to give to the user
  SELECT array_agg(id) INTO card_def_ids 
  FROM public.card_definitions 
  WHERE set_id = base_set_id 
  LIMIT 10;
  
  -- Insert user cards
  INSERT INTO public.user_cards (owner, card_def_id, foil)
  SELECT 
    user_id,
    unnest(card_def_ids),
    false
  FROM unnest(card_def_ids);
  
  -- Give some foil versions too
  INSERT INTO public.user_cards (owner, card_def_id, foil)
  SELECT 
    user_id,
    unnest(card_def_ids[1:3]), -- First 3 cards as foil
    true
  FROM unnest(card_def_ids[1:3]);
  
  RAISE NOTICE 'Gave test cards to user %', user_id;
END $$;

-- Verify the cards were given
SELECT 
  u.email,
  COUNT(uc.id) as total_cards,
  COUNT(CASE WHEN uc.foil THEN 1 END) as foil_cards,
  COUNT(DISTINCT uc.card_def_id) as unique_cards
FROM auth.users u
LEFT JOIN public.user_cards uc ON u.id = uc.owner
WHERE u.email = 'bkgumiho@gmail.com'
GROUP BY u.email;
