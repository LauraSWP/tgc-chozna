-- Add actual card definitions to the database
-- Run this in Supabase SQL Editor

DO $$
DECLARE
  base_set_id uuid;
  common_rarity_id integer;
  uncommon_rarity_id integer;
  rare_rarity_id integer;
  mythic_rarity_id integer;
  land_rarity_id integer;
BEGIN
  -- Get the base set ID
  SELECT id INTO base_set_id FROM public.card_sets WHERE code = 'BASE';
  
  -- Get rarity IDs
  SELECT id INTO common_rarity_id FROM public.rarities WHERE code = 'common';
  SELECT id INTO uncommon_rarity_id FROM public.rarities WHERE code = 'uncommon';
  SELECT id INTO rare_rarity_id FROM public.rarities WHERE code = 'rare';
  SELECT id INTO mythic_rarity_id FROM public.rarities WHERE code = 'mythic';
  SELECT id INTO land_rarity_id FROM public.rarities WHERE code = 'land';
  
  -- Insert card definitions for the base set
  INSERT INTO public.card_definitions (set_id, external_code, name, rarity_id, type_line, mana_cost, power, toughness, keywords, rules_json, flavor_text, artist, is_active) VALUES
    -- COMMON CARDS
    (base_set_id, 'BAS001', 'Desarrollador Cafetero', common_rarity_id, 'Criatura — Humano Desarrollador', '{1}{B}', 1, 2, ARRAY['haste'], '{"on_enter": [{"op": "draw", "count": 1, "target": "self"}]}', '"Puedo programar 48 horas seguidas, pero solo si hay cafeína."', 'AI Assistant', true),
    (base_set_id, 'BAS002', 'Sesión de Debugging', common_rarity_id, 'Conjuro', '{2}{U}', null, null, ARRAY[]::text[], '{"on_play": [{"op": "search", "zone": "library", "criteria": "instant", "quantity": 1}]}', 'A veces el bug está en tu cabeza, no en tu código.', 'Stack Overflow', true),
    (base_set_id, 'BAS003', 'Patito de Goma', common_rarity_id, 'Artefacto Criatura — Pato', '{1}', 0, 1, ARRAY['defender'], '{"activated": [{"cost": "{T}", "effects": [{"op": "draw", "count": 1, "target": "self"}], "description": "Girar: Explica tu problema al pato, roba una carta."}]}', 'El compañero de debugging más paciente que tendrás.', 'Bath & Beyond', true),
    (base_set_id, 'BAS004', 'Búsqueda en Stack Overflow', common_rarity_id, 'Instantáneo', '{U}', null, null, ARRAY[]::text[], '{"on_play": [{"op": "draw", "count": 2, "target": "self"}, {"op": "discard", "count": 1, "target": "self"}]}', '"Esta pregunta fue hecha hace 5 años y marcada como duplicada."', 'Internet', true),
    (base_set_id, 'BAS005', 'Conflicto de Merge', common_rarity_id, 'Encantamiento', '{1}{R}', null, null, ARRAY[]::text[], '{"triggers": [{"condition": {"when": "spell_cast", "types": ["instant", "sorcery"]}, "effects": [{"op": "damage", "amount": 1, "target": "any"}]}]}', 'Cuando dos desarrolladores tocan el mismo archivo...', 'Git', true),
    (base_set_id, 'BAS006', 'Desarrollador Junior', common_rarity_id, 'Criatura — Humano Becario', '{W}', 1, 1, ARRAY[]::text[], '{"on_enter": [{"op": "create_token", "name": "Bug", "power": 0, "toughness": 1, "types": ["Artifact"]}]}', 'Ansioso por ayudar, pero a veces crea más trabajo.', 'Departamento de RRHH', true),
    (base_set_id, 'BAS007', 'Código Legacy', common_rarity_id, 'Artefacto', '{3}', null, null, ARRAY[]::text[], '{"static": [{"op": "buff", "power": -1, "toughness": -1, "until": "permanent", "selector": "all_creatures"}]}', '"Nadie sabe cómo funciona, pero no lo toques."', 'Desarrollador Anterior', true),
    (base_set_id, 'BAS008', 'Revisión de Código', common_rarity_id, 'Conjuro', '{1}{W}', null, null, ARRAY[]::text[], '{"on_play": [{"op": "tap", "selector": "target_creature"}, {"op": "draw", "count": 1, "target": "self"}]}', '"¿Has considerado un enfoque diferente?"', 'Dev Senior', true),
    (base_set_id, 'BAS009', 'Rush de Cafeína', common_rarity_id, 'Instantáneo', '{R}', null, null, ARRAY[]::text[], '{"on_play": [{"op": "buff", "power": 2, "toughness": 0, "until": "end_of_turn", "selector": "target_creature"}, {"op": "damage", "amount": 1, "target": "player", "selector": "self"}]}', '"Dormiré cuando salga el proyecto."', 'Energy Drink Inc', true),
    (base_set_id, 'BAS010', 'Bug Crítico', common_rarity_id, 'Criatura — Error', '{2}{B}', 2, 2, ARRAY['deathtouch'], '{"on_enter": [{"op": "damage", "amount": 1, "target": "player", "selector": "opponent"}]}', 'Aparece siempre en el momento más inoportuno.', 'QA Team', true),
    (base_set_id, 'BAS011', 'Refactorización', common_rarity_id, 'Conjuro', '{2}{G}', null, null, ARRAY[]::text[], '{"on_play": [{"op": "search", "zone": "library", "criteria": "creature", "quantity": 1}]}', 'Mejorar el código existente sin romper la funcionalidad.', 'Clean Code', true),
    (base_set_id, 'BAS012', 'Despliegue Nocturno', common_rarity_id, 'Instantáneo', '{1}{B}', null, null, ARRAY[]::text[], '{"on_play": [{"op": "destroy", "selector": "target_creature"}]}', 'El mejor momento para desplegar es cuando nadie está mirando.', 'DevOps', true),
    (base_set_id, 'BAS013', 'Documentación', common_rarity_id, 'Encantamiento', '{1}{W}', null, null, ARRAY[]::text[], '{"static": [{"op": "buff", "power": 1, "toughness": 1, "until": "permanent", "selector": "all_creatures", "filter": "controlled_by_self"}]}', 'La documentación es como el sexo: cuando es buena, es muy buena.', 'Technical Writer', true),
    (base_set_id, 'BAS014', 'Test Unitario', common_rarity_id, 'Instantáneo', '{W}', null, null, ARRAY[]::text[], '{"on_play": [{"op": "prevent_damage", "amount": 3, "until": "end_of_turn"}]}', 'Pequeño pero poderoso.', 'TDD Advocate', true),
    (base_set_id, 'BAS015', 'Variable Global', common_rarity_id, 'Artefacto', '{2}', null, null, ARRAY[]::text[], '{"static": [{"op": "buff", "power": 1, "toughness": 1, "until": "permanent", "selector": "all_creatures"}]}', 'Todos la usan, nadie la entiende.', 'Legacy Code', true),
    
    -- UNCOMMON CARDS
    (base_set_id, 'BAS016', 'Arquitecto de Software', uncommon_rarity_id, 'Criatura — Humano Arquitecto', '{2}{U}{U}', 2, 3, ARRAY['flying'], '{"on_enter": [{"op": "draw", "count": 2, "target": "self"}]}', 'Diseña sistemas que otros construirán.', 'System Design', true),
    (base_set_id, 'BAS017', 'Code Review', uncommon_rarity_id, 'Conjuro', '{1}{U}{U}', null, null, ARRAY[]::text[], '{"on_play": [{"op": "counter", "target": "spell"}, {"op": "draw", "count": 1, "target": "self"}]}', '"Este código necesita más comentarios."', 'Senior Dev', true),
    (base_set_id, 'BAS018', 'Microservicio', uncommon_rarity_id, 'Artefacto Criatura — Servicio', '{3}{U}', 1, 4, ARRAY['hexproof'], '{"on_enter": [{"op": "create_token", "name": "API Endpoint", "power": 1, "toughness": 1, "types": ["Artifact"]}]}', 'Pequeño, independiente y difícil de debuggear.', 'Cloud Native', true),
    (base_set_id, 'BAS019', 'Refactoring Mayor', uncommon_rarity_id, 'Conjuro', '{3}{G}{G}', null, null, ARRAY[]::text[], '{"on_play": [{"op": "destroy", "selector": "all_artifacts"}, {"op": "search", "zone": "library", "criteria": "creature", "quantity": 2}]}', 'A veces hay que romper para arreglar.', 'Clean Architecture', true),
    (base_set_id, 'BAS020', 'Desarrollador Senior', uncommon_rarity_id, 'Criatura — Humano Mentor', '{2}{W}{W}', 2, 4, ARRAY['vigilance'], '{"on_enter": [{"op": "buff", "power": 1, "toughness": 1, "until": "permanent", "selector": "all_creatures", "filter": "controlled_by_self"}]}', 'Experiencia que se comparte, no se vende.', 'Tech Lead', true),
    
    -- RARE CARDS
    (base_set_id, 'BAS021', 'CTO', rare_rarity_id, 'Criatura Legendaria — Humano Ejecutivo', '{3}{U}{U}{U}', 3, 5, ARRAY['flying', 'hexproof'], '{"on_enter": [{"op": "draw", "count": 3, "target": "self"}], "static": [{"op": "buff", "power": 1, "toughness": 1, "until": "permanent", "selector": "all_creatures", "filter": "controlled_by_self"}]}', 'El que toma las decisiones importantes.', 'Board Room', true),
    (base_set_id, 'BAS022', 'Reescritura Completa', rare_rarity_id, 'Conjuro', '{4}{G}{G}{G}', null, null, ARRAY[]::text[], '{"on_play": [{"op": "destroy", "selector": "all_permanents"}, {"op": "search", "zone": "library", "criteria": "any", "quantity": 5}]}', 'Empezar de cero es a veces la mejor opción.', 'Greenfield Project', true),
    (base_set_id, 'BAS023', 'Sistema Distribuido', rare_rarity_id, 'Artefacto Legendario', '{5}{U}{U}', null, null, ARRAY[]::text[], '{"static": [{"op": "buff", "power": 2, "toughness": 2, "until": "permanent", "selector": "all_creatures", "filter": "controlled_by_self"}], "activated": [{"cost": "{T}", "effects": [{"op": "draw", "count": 2, "target": "self"}], "description": "Girar: Roba dos cartas."}]}', 'Complejo pero escalable.', 'Distributed Systems', true),
    
    -- MYTHIC CARDS
    (base_set_id, 'BAS024', 'CEO', mythic_rarity_id, 'Criatura Legendaria — Humano Visionario', '{4}{W}{W}{W}{W}', 5, 7, ARRAY['flying', 'hexproof', 'vigilance'], '{"on_enter": [{"op": "draw", "count": 5, "target": "self"}], "static": [{"op": "buff", "power": 2, "toughness": 2, "until": "permanent", "selector": "all_creatures", "filter": "controlled_by_self"}], "activated": [{"cost": "{T}", "effects": [{"op": "create_token", "name": "Innovation", "power": 3, "toughness": 3, "types": ["Artifact", "Creature"]}], "description": "Girar: Crea una ficha de Innovación 3/3."}]}', 'El visionario que cambia el mundo.', 'Silicon Valley', true),
    
    -- LANDS
    (base_set_id, 'BAS025', 'Oficina de Desarrollo', land_rarity_id, 'Tierra', null, null, null, ARRAY[]::text[], '{"activated": [{"cost": "{T}", "effects": [{"op": "add_mana", "color": "any", "amount": 1}], "description": "Girar: Añade un maná de cualquier color."}]}', 'El lugar donde las ideas cobran vida.', 'Architecture', true),
    (base_set_id, 'BAS026', 'Servidor de Producción', land_rarity_id, 'Tierra', null, null, null, ARRAY[]::text[], '{"activated": [{"cost": "{T}", "effects": [{"op": "add_mana", "color": "any", "amount": 1}], "description": "Girar: Añade un maná de cualquier color."}]}', 'No tocar sin autorización.', 'Data Center', true),
    (base_set_id, 'BAS027', 'Entorno de Testing', land_rarity_id, 'Tierra', null, null, null, ARRAY[]::text[], '{"activated": [{"cost": "{T}", "effects": [{"op": "add_mana", "color": "any", "amount": 1}], "description": "Girar: Añade un maná de cualquier color."}]}', 'Aquí todo vale.', 'QA Lab', true),
    (base_set_id, 'BAS028', 'Repositorio Git', land_rarity_id, 'Tierra', null, null, null, ARRAY[]::text[], '{"activated": [{"cost": "{T}", "effects": [{"op": "add_mana", "color": "any", "amount": 1}], "description": "Girar: Añade un maná de cualquier color."}]}', 'El lugar donde vive el código.', 'Version Control', true),
    (base_set_id, 'BAS029', 'Base de Datos', land_rarity_id, 'Tierra', null, null, null, ARRAY[]::text[], '{"activated": [{"cost": "{T}", "effects": [{"op": "add_mana", "color": "any", "amount": 1}], "description": "Girar: Añade un maná de cualquier color."}]}', 'Donde se guardan todos los secretos.', 'Data Warehouse', true),
    (base_set_id, 'BAS030', 'Cloud Platform', land_rarity_id, 'Tierra', null, null, null, ARRAY[]::text[], '{"activated": [{"cost": "{T}", "effects": [{"op": "add_mana", "color": "any", "amount": 1}], "description": "Girar: Añade un maná de cualquier color."}]}', 'El futuro está en la nube.', 'Cloud Provider', true)
  ON CONFLICT (external_code) DO NOTHING;
  
  RAISE NOTICE 'Inserted card definitions for base set';
END $$;
