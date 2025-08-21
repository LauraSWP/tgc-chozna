-- COMPLETE SEEDING SCRIPT FOR SUPABASE
-- Run this in Supabase SQL Editor

-- Clean existing data (optional - comment out if you want to keep existing data)
-- DELETE FROM card_definitions;
-- DELETE FROM pack_slots;
-- DELETE FROM pack_configs;
-- DELETE FROM card_sets WHERE code = 'BASE';

-- Insert base rarities if they don't exist
INSERT INTO public.rarities (code, display_name, weight, color) VALUES
  ('common','Común', 10, '#9ca3af'),
  ('uncommon','Infrecuente', 3, '#10b981'),
  ('rare','Rara', 1, '#3b82f6'),
  ('mythic','Mítica', 1, '#f59e0b'),
  ('land','Tierra', 1, '#8b5cf6'),
  ('token','Ficha', 1, '#6b7280')
ON CONFLICT (code) DO NOTHING;

-- Insert keywords
INSERT INTO public.keywords (name, description, reminder_text) VALUES
  ('Flying', 'Esta criatura no puede ser bloqueada excepto por criaturas con volar o alcance.', '(Esta criatura no puede ser bloqueada excepto por criaturas con volar o alcance.)'),
  ('Haste', 'Esta criatura puede atacar y usar habilidades de tap inmediatamente.', '(Esta criatura puede atacar y {T} tan pronto como entre bajo tu control.)'),
  ('Vigilance', 'Atacar no hace que esta criatura se gire.', '(Atacar no hace que esta criatura se gire.)'),
  ('Trample', 'El daño de combate excesivo se hace al jugador defensor.', '(Esta criatura puede hacer daño de combate excesivo al jugador o planeswalker al que está atacando.)'),
  ('First Strike', 'Esta criatura hace daño de combate antes que las criaturas sin impacto inicial.', '(Esta criatura hace daño de combate antes que las criaturas sin impacto inicial.)'),
  ('Deathtouch', 'Cualquier cantidad de daño que esto haga a una criatura es suficiente para destruirla.', '(Cualquier cantidad de daño que esto haga a una criatura es suficiente para destruirla.)'),
  ('Lifelink', 'El daño hecho por esta criatura también te hace ganar esa cantidad de vida.', '(El daño hecho por esta criatura también te hace ganar esa cantidad de vida.)'),
  ('Reach', 'Esta criatura puede bloquear criaturas con volar.', '(Esta criatura puede bloquear criaturas con volar.)'),
  ('Defender', 'Esta criatura no puede atacar.', '(Esta criatura no puede atacar.)'),
  ('Hexproof', 'Esta criatura no puede ser objetivo de hechizos o habilidades que controlen tus oponentes.', '(Esta criatura no puede ser objetivo de hechizos o habilidades que controlen tus oponentes.)')
ON CONFLICT (name) DO NOTHING;

-- Insert base set
INSERT INTO public.card_sets (code, name, description, release_date) VALUES 
  ('BASE', 'Colección Base', 'La colección fundamental para nuestro TCG con mecánicas clásicas y personajes queridos.', now())
ON CONFLICT (code) DO NOTHING;

-- Create pack configuration and cards
DO $$
DECLARE
  base_set_id uuid;
  cfg_id uuid;
  common_rarity_id integer;
  uncommon_rarity_id integer;
  rare_rarity_id integer;
  mythic_rarity_id integer;
  land_rarity_id integer;
  token_rarity_id integer;
BEGIN
  -- Get IDs
  SELECT id INTO base_set_id FROM public.card_sets WHERE code = 'BASE';
  SELECT id INTO common_rarity_id FROM public.rarities WHERE code = 'common';
  SELECT id INTO uncommon_rarity_id FROM public.rarities WHERE code = 'uncommon';
  SELECT id INTO rare_rarity_id FROM public.rarities WHERE code = 'rare';
  SELECT id INTO mythic_rarity_id FROM public.rarities WHERE code = 'mythic';
  SELECT id INTO land_rarity_id FROM public.rarities WHERE code = 'land';
  SELECT id INTO token_rarity_id FROM public.rarities WHERE code = 'token';
  
  -- Pack configuration for base set
  INSERT INTO public.pack_configs (set_id, name, total_cards, price_coins)
  VALUES (base_set_id, 'Sobre Draft', 15, 150)
  ON CONFLICT DO NOTHING
  RETURNING id INTO cfg_id;
  
  -- If pack config already exists, get its ID
  IF cfg_id IS NULL THEN
    SELECT id INTO cfg_id FROM public.pack_configs WHERE set_id = base_set_id LIMIT 1;
  END IF;
  
  -- Pack slots configuration (classic 15-card booster)
  INSERT INTO public.pack_slots (pack_config_id, slot_index, pool, mythic_chance, foil_replaces) VALUES
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
    (cfg_id, 15, 'land', 0.0000, false)
  ON CONFLICT DO NOTHING;

  -- COMMON CARDS (15 cards)
  INSERT INTO public.card_definitions (set_id, external_code, name, rarity_id, type_line, mana_cost, power, toughness, keywords, rules_json, flavor_text, artist, is_active) VALUES
    (base_set_id, 'BAS001', 'Desarrollador Cafetero', common_rarity_id, 'Criatura — Humano Desarrollador', '{1}{B}', 1, 2, ARRAY['haste'], '{"on_enter": [{"op": "draw", "count": 1, "target": "self"}]}', '"Puedo programar 48 horas seguidas, pero solo si hay cafeína."', 'AI Assistant', true),
    (base_set_id, 'BAS002', 'Sesión de Debugging', common_rarity_id, 'Conjuro', '{2}{U}', null, null, ARRAY[]::text[], '{"on_play": [{"op": "search", "zone": "library", "criteria": "instant", "quantity": 1}]}', 'A veces el bug está en tu cabeza, no en tu código.', 'Stack Overflow', true),
    (base_set_id, 'BAS003', 'Patito de Goma', common_rarity_id, 'Artefacto Criatura — Pato', '{1}', 0, 1, ARRAY['defender'], '{"activated": [{"cost": "{T}", "effects": [{"op": "draw", "count": 1, "target": "self"}], "description": "Girar: Explica tu problema al pato, roba una carta."}]}', 'El compañero de debugging más paciente que tendrás.', 'Bath & Beyond', true),
    (base_set_id, 'BAS004', 'Búsqueda en Stack Overflow', common_rarity_id, 'Instantáneo', '{U}', null, null, ARRAY[]::text[], '{"on_play": [{"op": "draw", "count": 2, "target": "self"}, {"op": "discard", "count": 1, "target": "self"}]}', '"Esta pregunta fue hecha hace 5 años y marcada como duplicada."', 'Internet', true),
    (base_set_id, 'BAS005', 'Conflicto de Merge', common_rarity_id, 'Encantamiento', '{1}{R}', null, null, ARRAY[]::text[], '{"triggers": [{"condition": {"when": "spell_cast", "types": ["instant", "sorcery"]}, "effects": [{"op": "damage", "amount": 1, "target": "any"}]}]}', 'Cuando dos desarrolladores tocan el mismo archivo...', 'Git', true),
    (base_set_id, 'BAS006', 'Desarrollador Junior', common_rarity_id, 'Criatura — Humano Becario', '{W}', 1, 1, ARRAY[]::text[], '{"on_enter": [{"op": "create_token", "name": "Bug", "power": 0, "toughness": 1, "types": ["Artifact"]}]}', 'Ansioso por ayudar, pero a veces crea más trabajo.', 'Departamento de RRHH', true),
    (base_set_id, 'BAS007', 'Código Legacy', common_rarity_id, 'Artefacto', '{3}', null, null, ARRAY[]::text[], '{"static": [{"op": "buff", "power": -1, "toughness": -1, "until": "permanent", "selector": "all_creatures"}]}', '"Nadie sabe cómo funciona, pero no lo toques."', 'Desarrollador Anterior', true),
    (base_set_id, 'BAS008', 'Revisión de Código', common_rarity_id, 'Conjuro', '{1}{W}', null, null, ARRAY[]::text[], '{"on_play": [{"op": "tap", "selector": "target_creature"}, {"op": "draw", "count": 1, "target": "self"}]}', '"¿Has considerado un enfoque diferente?"', 'Dev Senior', true),
    (base_set_id, 'BAS009', 'Rush de Cafeína', common_rarity_id, 'Instantáneo', '{R}', null, null, ARRAY[]::text[], '{"on_play": [{"op": "buff", "power": 2, "toughness": 0, "until": "end_of_turn", "selector": "target_creature"}, {"op": "damage", "amount": 1, "target": "player", "selector": "self"}]}', '"Dormiré cuando salga el proyecto."', 'Energy Drink Inc', true),
    (base_set_id, 'BAS010', 'Programación en Pareja', common_rarity_id, 'Encantamiento', '{1}{G}', null, null, ARRAY[]::text[], '{"static": [{"op": "buff", "power": 1, "toughness": 1, "until": "permanent", "selector": "all_your_creatures"}]}', 'Dos mentes son mejores que una, aunque discutan constantemente.', 'Metodología Ágil', true),
    (base_set_id, 'BAS011', 'Documentación', common_rarity_id, 'Artefacto', '{2}', null, null, ARRAY[]::text[], '{"activated": [{"cost": "{1}, {T}", "effects": [{"op": "search", "zone": "library", "criteria": "any", "quantity": 1}]}]}', '"El código se autodocumenta" - Todo desarrollador siempre', 'Tu Yo Futuro', true),
    (base_set_id, 'BAS012', 'Prueba Unitaria', common_rarity_id, 'Instantáneo', '{1}{U}', null, null, ARRAY[]::text[], '{"on_play": [{"op": "counter", "target": "spell"}]}', 'Esperado: Éxito. Real: Excepción.', 'Equipo QA', true),
    (base_set_id, 'BAS013', 'Guerrero del Teclado', common_rarity_id, 'Criatura — Humano Programador', '{2}{R}', 2, 1, ARRAY['haste', 'first_strike'], '{}', 'Escribe a 120 PPM y no tiene miedo de usarlo.', 'Gang del Teclado Mecánico', true),
    (base_set_id, 'BAS014', 'Servidor de Backup', common_rarity_id, 'Artefacto', '{3}', null, null, ARRAY[]::text[], '{"triggers": [{"condition": {"when": "dies", "source": "any"}, "effects": [{"op": "return", "from": "graveyard", "to": "hand", "selector": "target_card"}]}]}', 'Cuando el servidor principal se cae, este probablemente también.', 'Departamento IT', true),
    (base_set_id, 'BAS015', 'Isla Básica de Aislamiento', land_rarity_id, 'Tierra Básica — Isla', null, null, null, ARRAY[]::text[], '{"activated": [{"cost": "{T}", "effects": [{"op": "gain_mana", "colors": ["U"], "amount": 1}]}]}', 'Donde los desarrolladores van a pensar profundamente... o procrastinar.', 'Trabajo Remoto', true);

  -- UNCOMMON CARDS (8 cards)
  INSERT INTO public.card_definitions (set_id, external_code, name, rarity_id, type_line, mana_cost, power, toughness, keywords, rules_json, flavor_text, artist, is_active) VALUES
    (base_set_id, 'BAS016', 'Desarrollador Senior', uncommon_rarity_id, 'Criatura — Humano Mentor', '{2}{W}{U}', 2, 3, ARRAY['vigilance'], '{"on_enter": [{"op": "search", "zone": "library", "criteria": "creature", "quantity": 1}], "activated": [{"cost": "{1}, {T}", "effects": [{"op": "buff", "power": 1, "toughness": 1, "until": "permanent", "selector": "target_creature"}], "description": "Mentorizar a un desarrollador junior"}]}', '"He estado debuggeando desde antes de que nacieras."', '20 Años de Experiencia', true),
    (base_set_id, 'BAS017', 'Despliegue a Producción', uncommon_rarity_id, 'Conjuro', '{3}{R}{R}', null, null, ARRAY[]::text[], '{"on_play": [{"op": "damage", "amount": 5, "target": "any"}, {"op": "damage", "amount": 1, "target": "player", "selector": "self"}]}', '"¡Funciona en mi máquina!"', 'Pesadilla DevOps', true),
    (base_set_id, 'BAS018', 'Refactorización de Código', uncommon_rarity_id, 'Conjuro', '{2}{G}{U}', null, null, ARRAY[]::text[], '{"on_play": [{"op": "destroy", "selector": "target_artifact"}, {"op": "create_token", "name": "Código Limpio", "power": 3, "toughness": 3, "types": ["Artifact", "Creature"]}]}', 'Mejorando el código, una función a la vez.', 'Evangelista del Código Limpio', true),
    (base_set_id, 'BAS019', 'Sprint Ágil', uncommon_rarity_id, 'Encantamiento', '{1}{R}{W}', null, null, ARRAY[]::text[], '{"triggers": [{"condition": {"when": "phase_begin", "phase": "beginning:upkeep"}, "effects": [{"op": "draw", "count": 1, "target": "self"}, {"op": "damage", "amount": 1, "target": "player", "selector": "self"}]}]}', 'Dos semanas para cambiar el mundo. O al menos arreglar el botón de login.', 'Scrum Master', true),
    (base_set_id, 'BAS020', 'Contribución Open Source', uncommon_rarity_id, 'Instantáneo', '{1}{G}', null, null, ARRAY[]::text[], '{"on_play": [{"op": "buff", "power": 2, "toughness": 2, "until": "permanent", "selector": "all_your_creatures"}, {"op": "draw", "count": 1, "target": "all"}]}', 'Cuando contribuyes a la comunidad, todos se benefician.', 'GitHub', true),
    (base_set_id, 'BAS021', 'Modelo de Machine Learning', uncommon_rarity_id, 'Artefacto Criatura — Constructo IA', '{4}', 1, 1, ARRAY[]::text[], '{"triggers": [{"condition": {"when": "deals_damage", "source": "self"}, "effects": [{"op": "buff", "power": 1, "toughness": 1, "until": "permanent", "selector": "self"}]}]}', 'Aprende de cada interacción. Principalmente cómo romper cosas.', 'Red Neuronal', true),
    (base_set_id, 'BAS022', 'Consulta de Base de Datos', uncommon_rarity_id, 'Conjuro', '{X}{U}{U}', null, null, ARRAY[]::text[], '{"on_play": [{"op": "search", "zone": "library", "criteria": "any", "quantity": 3}, {"op": "mill", "count": 2, "target": "self"}]}', 'SELECT * FROM conocimiento WHERE entendimiento > 0;', 'Mago SQL', true),
    (base_set_id, 'BAS023', 'Integración Continua', uncommon_rarity_id, 'Encantamiento', '{2}{U}{W}', null, null, ARRAY[]::text[], '{"static": [{"op": "buff", "power": 1, "toughness": 1, "until": "permanent", "selector": "all_artifacts"}], "triggers": [{"condition": {"when": "enters_battlefield", "source": "any"}, "effects": [{"op": "draw", "count": 1, "target": "self"}]}]}', 'Cada commit es probado. Cada prueba es una oración.', 'Jenkins', true);

  -- RARE CARDS (6 cards)
  INSERT INTO public.card_definitions (set_id, external_code, name, rarity_id, type_line, mana_cost, power, toughness, keywords, rules_json, flavor_text, artist, is_active) VALUES
    (base_set_id, 'BAS024', 'Tech Lead', rare_rarity_id, 'Criatura Legendaria — Humano Arquitecto', '{3}{W}{U}', 3, 4, ARRAY['vigilance', 'hexproof'], '{"on_enter": [{"op": "search", "zone": "library", "criteria": "artifact", "quantity": 2}], "static": [{"op": "buff", "power": 1, "toughness": 1, "until": "permanent", "selector": "all_your_creatures"}]}', 'Escribe el código que escribe el código.', 'Arquitectura de Sistemas', true),
    (base_set_id, 'BAS025', 'Exploit de Día Cero', rare_rarity_id, 'Instantáneo', '{2}{B}{B}', null, null, ARRAY[]::text[], '{"on_play": [{"op": "destroy", "selector": "target_permanent"}, {"op": "damage", "amount": 3, "target": "player"}]}', '"Lo parchearemos en el próximo release..."', 'Hacker de Sombrero Negro', true),
    (base_set_id, 'BAS026', 'Inteligencia Artificial General', rare_rarity_id, 'Artefacto Criatura Legendaria — IA Dios', '{7}', 5, 5, ARRAY['flying', 'trample'], '{"on_enter": [{"op": "draw", "count": 3, "target": "self"}, {"op": "create_token", "name": "Singularidad", "power": 2, "toughness": 2, "types": ["Artifact", "Creature"], "keywords": ["flying"]}], "activated": [{"cost": "{2}, {T}", "effects": [{"op": "destroy", "selector": "all_creatures"}], "description": "Las máquinas han tomado el control"}]}', 'Cuando la IA se vuelve verdaderamente inteligente, ¿seguirá escribiendo bugs?', 'El Futuro', true),
    (base_set_id, 'BAS027', 'Computadora Cuántica', rare_rarity_id, 'Artefacto Legendario', '{5}', null, null, ARRAY[]::text[], '{"activated": [{"cost": "{3}, {T}", "effects": [{"op": "draw", "count": 5, "target": "self"}, {"op": "discard", "count": 3, "target": "self"}], "description": "Procesar todas las posibilidades simultáneamente"}]}', 'Puede resolver cualquier problema, asumiendo que el problema es mantenerla lo suficientemente fría.', 'Física Cuántica', true),
    (base_set_id, 'BAS028', 'La Blockchain', rare_rarity_id, 'Encantamiento Legendario', '{3}{G}{U}', null, null, ARRAY[]::text[], '{"static": [{"op": "buff", "power": 0, "toughness": 3, "until": "permanent", "selector": "all_permanents"}], "triggers": [{"condition": {"when": "enters_battlefield", "source": "any"}, "effects": [{"op": "create_token", "name": "Bloque", "power": 0, "toughness": 1, "types": ["Artifact"]}, {"op": "gain_mana", "colors": ["C"], "amount": 1}]}]}', 'Inmutable, descentralizada, y usa más energía que un país pequeño.', 'Crypto Bro', true),
    (base_set_id, 'BAS029', 'Arquitectura Serverless', rare_rarity_id, 'Encantamiento', '{2}{U}{G}', null, null, ARRAY[]::text[], '{"static": [{"op": "gain_mana", "colors": ["U", "G"], "amount": 2}], "triggers": [{"condition": {"when": "spell_cast"}, "effects": [{"op": "draw", "count": 1, "target": "self"}]}]}', '¡Sin servidores que gestionar! (Son solo los servidores de otra persona.)', 'Proveedor de Nube', true);

  -- MYTHIC RARE CARDS (3 cards)
  INSERT INTO public.card_definitions (set_id, external_code, name, rarity_id, type_line, mana_cost, power, toughness, keywords, rules_json, flavor_text, artist, is_active) VALUES
    (base_set_id, 'BAS030', 'El Arquitecto', mythic_rarity_id, 'Criatura Legendaria — Humano Dios', '{4}{W}{U}{B}', 6, 6, ARRAY['flying', 'vigilance', 'lifelink'], '{"on_enter": [{"op": "search", "zone": "library", "criteria": "any", "quantity": 5}, {"op": "draw", "count": 3, "target": "self"}], "activated": [{"cost": "{2}{W}{U}{B}, {T}", "effects": [{"op": "create_token", "name": "Sistema Perfecto", "power": 4, "toughness": 4, "types": ["Artifact", "Creature"], "keywords": ["indestructible"]}], "description": "Diseñar el sistema perfecto"}]}', '"He visto el futuro de la tecnología, y es hermoso."', 'Desarrollador Legendario', true),
    (base_set_id, 'BAS031', 'Stack Overflow', mythic_rarity_id, 'Conjuro Legendario', '{X}{X}{R}{R}', null, null, ARRAY[]::text[], '{"on_play": [{"op": "damage", "amount": 999, "target": "all"}, {"op": "mill", "count": 20, "target": "all"}]}', 'Profundidad máxima de recursión excedida. Core dumped.', 'Bucle Infinito', true),
    (base_set_id, 'BAS032', 'La Nube', mythic_rarity_id, 'Tierra Legendaria', null, null, null, ARRAY[]::text[], '{"activated": [{"cost": "{T}", "effects": [{"op": "gain_mana", "colors": ["W", "U", "B", "R", "G"], "amount": 1}]}, {"cost": "{5}, {T}", "effects": [{"op": "search", "zone": "library", "criteria": "any", "quantity": 10}, {"op": "draw", "count": 7, "target": "self"}], "description": "Acceder a almacenamiento infinito"}]}', 'Todo está en la nube. Incluso cosas que no deberían estar.', 'Amazon Web Services', true);

  -- TOKEN CARDS (2 cards)
  INSERT INTO public.card_definitions (set_id, external_code, name, rarity_id, type_line, mana_cost, power, toughness, keywords, rules_json, flavor_text, artist, is_active) VALUES
    (base_set_id, 'TOK001', 'Ficha de Bug', token_rarity_id, 'Artefacto Criatura — Bug', null, 0, 1, ARRAY[]::text[], '{}', '¡No es un bug, es una característica!', 'Equipo QA', true),
    (base_set_id, 'TOK002', 'Petición de Funcionalidad', token_rarity_id, 'Encantamiento Ficha', null, null, null, ARRAY[]::text[], '{"static": [{"op": "buff", "power": 1, "toughness": 0, "until": "permanent", "selector": "all_your_creatures"}]}', '"¿Podemos hacer que haga esta cosa más?"', 'Product Manager', true);

END $$;

-- Verify the seeding
SELECT 
  cs.name as set_name,
  r.display_name as rarity,
  COUNT(*) as card_count
FROM card_definitions cd
JOIN card_sets cs ON cd.set_id = cs.id
JOIN rarities r ON cd.rarity_id = r.id
WHERE cs.code = 'BASE'
GROUP BY cs.name, r.display_name, r.weight
ORDER BY r.weight DESC;

-- Show total cards created
SELECT COUNT(*) as total_cards FROM card_definitions WHERE set_id = (SELECT id FROM card_sets WHERE code = 'BASE');
