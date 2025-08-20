-- Seed data for TCG database
-- Insert rarities with colors
insert into public.rarities (code, display_name, weight, color) values
  ('common','Common', 10, '#9ca3af'),
  ('uncommon','Uncommon', 3, '#10b981'),
  ('rare','Rare', 1, '#3b82f6'),
  ('mythic','Mythic', 1, '#f59e0b'),
  ('land','Land', 1, '#8b5cf6'),
  ('token','Token', 1, '#6b7280')
  on conflict do nothing;

-- Keywords básicos
insert into public.keywords (name, description, reminder_text) values
  ('Flying', 'This creature can''t be blocked except by creatures with flying or reach.', '(This creature can''t be blocked except by creatures with flying or reach.)'),
  ('Haste', 'This creature can attack and use tap abilities immediately.', '(This creature can attack and {T} as soon as it comes under your control.)'),
  ('Vigilance', 'Attacking doesn''t cause this creature to tap.', '(Attacking doesn''t cause this creature to tap.)'),
  ('Trample', 'Excess combat damage is dealt to the defending player.', '(This creature can deal excess combat damage to the player or planeswalker it''s attacking.)'),
  ('First Strike', 'This creature deals combat damage before creatures without first strike.', '(This creature deals combat damage before creatures without first strike.)'),
  ('Deathtouch', 'Any amount of damage this deals to a creature is enough to destroy it.', '(Any amount of damage this deals to a creature is enough to destroy it.)'),
  ('Lifelink', 'Damage dealt by this creature also causes you to gain that much life.', '(Damage dealt by this creature also causes you to gain that much life.)'),
  ('Reach', 'This creature can block creatures with flying.', '(This creature can block creatures with flying.)'),
  ('Defender', 'This creature can''t attack.', '(This creature can''t attack.)'),
  ('Hexproof', 'This creature can''t be the target of spells or abilities your opponents control.', '(This creature can''t be the target of spells or abilities your opponents control.)')
  on conflict do nothing;

-- Un set de ejemplo - Base Set
insert into public.card_sets (code, name, description, release_date) values 
  ('BASE', 'Base Set', 'The foundational set for our TCG with classic mechanics and beloved characters.', now())
  on conflict do nothing;

-- Get the base set ID for reference
do $$
declare
  base_set_id uuid;
  cfg_id uuid;
begin
  select id into base_set_id from public.card_sets where code = 'BASE';
  
  -- Pack configuration for base set
  insert into public.pack_configs (set_id, name, total_cards, price_coins)
  values (base_set_id, 'Draft Booster', 15, 150)
  returning id into cfg_id;
  
  -- Pack slots configuration (classic 15-card booster)
  insert into public.pack_slots (pack_config_id, slot_index, pool, mythic_chance, foil_replaces)
  values
    (cfg_id, 1, 'common', 0.0000, true),
    (cfg_id, 2, 'common', 0.0000, true),
    (cfg_id, 3, 'common', 0.0000, true),
    (cfg_id, 4, 'common', 0.0000, true),
    (cfg_id, 5, 'common', 0.0000, true),
    (cfg_id, 6, 'common', 0.0000, true),
    (cfg_id, 7, 'common', 0.0000, true),
    (cfg_id, 8, 'common', 0.0000, true),
    (cfg_id, 9, 'common', 0.0000, true),
    (cfg_id, 10, 'common', 0.0000, true),
    (cfg_id, 11, 'uncommon', 0.0000, false),
    (cfg_id, 12, 'uncommon', 0.0000, false),
    (cfg_id, 13, 'uncommon', 0.0000, false),
    (cfg_id, 14, 'rare', 0.1250, false), -- 1/8 chance for mythic
    (cfg_id, 15, 'land', 0.0000, false);
end $$;
