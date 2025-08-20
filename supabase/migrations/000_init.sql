-- TCG Database Schema
-- Tipos y enums
create type rarity_code as enum ('common','uncommon','rare','mythic','land','token');
create type zone_code as enum ('library','hand','battlefield','graveyard','exile','stack');
create type match_status as enum ('lobby','playing','finished');
create type player_role as enum ('player','admin','moderator');

-- Perfiles (auth.users provisto por Supabase)
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  role player_role not null default 'player',
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Sets/colecciones
create table public.card_sets (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  release_date date,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Rarities
create table public.rarities (
  id smallserial primary key,
  code rarity_code unique not null,
  display_name text not null,
  weight int not null default 1, -- utilidad para pools
  color text not null default '#9ca3af' -- hex color for UI
);

-- Definición de cartas (no propiedad)
create table public.card_definitions (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null references public.card_sets(id) on delete cascade,
  external_code text,      -- opcional: código visible (ej: "BAS001")
  name text not null,
  rarity_id smallint not null references public.rarities(id),
  type_line text not null, -- p. ej. "Criatura — Amigo"
  mana_cost text,          -- formato estilo {1}{R}{G} o tu propio coste
  power int,               -- si aplica
  toughness int,           -- si aplica
  keywords text[] default '{}',
  rules_json jsonb not null default '{}'::jsonb, -- DSL de efectos
  flavor_text text,
  artist text,
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index on public.card_definitions (set_id);
create index on public.card_definitions (rarity_id);
create index on public.card_definitions (name);
create index on public.card_definitions using gin (keywords);

-- Config de sobres por set (flexible)
create table public.pack_configs (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null references public.card_sets(id) on delete cascade,
  name text not null default 'Draft Booster',
  total_cards int not null default 15,
  price_coins int default 100, -- precio en moneda virtual
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Slots de un sobre (orden y pool)
create table public.pack_slots (
  id uuid primary key default gen_random_uuid(),
  pack_config_id uuid not null references public.pack_configs(id) on delete cascade,
  slot_index int not null,
  pool rarity_code not null,     -- de dónde sacar cartas
  mythic_chance numeric(5,4) default 0.0000,         -- si pool=rare, prob de mythic (0.1250 = 1/8)
  foil_replaces boolean default false -- si este slot puede ser sustituido por foil wildcard
);

create index on public.pack_slots (pack_config_id, slot_index);

-- Propiedad de cartas de usuario
create table public.user_cards (
  id bigserial primary key,
  owner uuid not null references public.profiles(id) on delete cascade,
  card_def_id uuid not null references public.card_definitions(id) on delete cascade,
  foil boolean default false,
  acquired_at timestamptz default now()
);

create index on public.user_cards (owner);
create index on public.user_cards (card_def_id);
create index on public.user_cards (owner, card_def_id);

-- Mazos
create table public.decks (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  is_legal boolean default false, -- si cumple reglas de formato
  format text default 'casual', -- formato del mazo
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.deck_cards (
  deck_id uuid references public.decks(id) on delete cascade,
  user_card_id bigint references public.user_cards(id) on delete cascade,
  qty int not null default 1 check (qty > 0),
  is_sideboard boolean default false,
  primary key (deck_id, user_card_id, is_sideboard)
);

-- Partidas / estado
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  status match_status not null default 'lobby',
  created_by uuid references public.profiles(id) on delete set null,
  winner_id uuid references public.profiles(id) on delete set null,
  max_players int default 2,
  current_turn int default 1,
  created_at timestamptz default now(),
  started_at timestamptz,
  finished_at timestamptz,
  state jsonb not null default '{"players":[],"phase":"beginning","stack":[],"log":[]}'::jsonb
);

create table public.match_players (
  match_id uuid references public.matches(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  seat int not null,
  deck_id uuid references public.decks(id) on delete set null,
  joined_at timestamptz default now(),
  primary key (match_id, user_id)
);

create index on public.matches (status);
create index on public.matches (created_by);
create index on public.match_players (user_id);

-- Moneda virtual y transacciones
create table public.user_currencies (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  coins int not null default 1000, -- moneda base
  gems int not null default 0,     -- moneda premium
  updated_at timestamptz default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null, -- 'pack_purchase', 'daily_reward', 'match_win', etc.
  amount_coins int default 0,
  amount_gems int default 0,
  description text,
  created_at timestamptz default now()
);

create index on public.transactions (user_id, created_at);

-- Trades/Intercambios entre usuarios
create table public.trades (
  id uuid primary key default gen_random_uuid(),
  initiator_id uuid not null references public.profiles(id) on delete cascade,
  target_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending', -- 'pending', 'accepted', 'declined', 'cancelled'
  expires_at timestamptz default (now() + interval '7 days'),
  created_at timestamptz default now(),
  completed_at timestamptz
);

create table public.trade_items (
  id uuid primary key default gen_random_uuid(),
  trade_id uuid not null references public.trades(id) on delete cascade,
  user_card_id bigint not null references public.user_cards(id) on delete cascade,
  is_from_initiator boolean not null,
  created_at timestamptz default now()
);

-- Keywords/Habilidades predefinidas
create table public.keywords (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text not null,
  rules_text text,
  reminder_text text,
  created_at timestamptz default now()
);

-- RLS (Row Level Security)
alter table public.profiles enable row level security;
alter table public.user_cards enable row level security;
alter table public.decks enable row level security;
alter table public.deck_cards enable row level security;
alter table public.matches enable row level security;
alter table public.match_players enable row level security;
alter table public.user_currencies enable row level security;
alter table public.transactions enable row level security;
alter table public.trades enable row level security;
alter table public.trade_items enable row level security;

-- Políticas RLS básicas
create policy "public_read_profiles" on public.profiles
  for select using (true);

create policy "own_profile_update" on public.profiles
  for update using (auth.uid() = id);

create policy "own_cards" on public.user_cards
  for all using (owner = auth.uid());

create policy "own_decks" on public.decks
  for all using (owner = auth.uid());

create policy "own_deck_cards" on public.deck_cards
  for all using (
    exists(select 1 from public.decks d where d.id = deck_id and d.owner = auth.uid())
  );

create policy "match_visibility" on public.matches
  for select using (
    status = 'lobby' or 
    exists(select 1 from public.match_players mp where mp.match_id = id and mp.user_id = auth.uid())
  );

create policy "match_player_visibility" on public.match_players
  for select using (
    exists(select 1 from public.matches m where m.id = match_id and (
      m.status = 'lobby' or 
      exists(select 1 from public.match_players mp2 where mp2.match_id = m.id and mp2.user_id = auth.uid())
    ))
  );

create policy "own_currency" on public.user_currencies
  for all using (user_id = auth.uid());

create policy "own_transactions" on public.transactions
  for select using (user_id = auth.uid());

create policy "trade_participants" on public.trades
  for all using (initiator_id = auth.uid() or target_id = auth.uid());

create policy "trade_items_access" on public.trade_items
  for all using (
    exists(
      select 1 from public.trades t 
      where t.id = trade_id 
      and (t.initiator_id = auth.uid() or t.target_id = auth.uid())
    )
  );

-- Funciones auxiliares
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.email);
  
  insert into public.user_currencies (user_id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger para crear perfil automáticamente
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Función para actualizar updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers para updated_at
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger update_card_definitions_updated_at
  before update on public.card_definitions
  for each row execute procedure public.handle_updated_at();

create trigger update_decks_updated_at
  before update on public.decks
  for each row execute procedure public.handle_updated_at();

-- Índices adicionales para performance
create index on public.matches (created_at desc);
create index on public.user_cards (acquired_at desc);
create index on public.trades (status, created_at desc);

-- Vistas útiles
create view public.deck_summary as
select 
  d.id,
  d.name,
  d.owner,
  d.format,
  d.is_legal,
  count(dc.user_card_id) as total_cards,
  count(case when not dc.is_sideboard then 1 end) as mainboard_cards,
  count(case when dc.is_sideboard then 1 end) as sideboard_cards,
  d.created_at,
  d.updated_at
from public.decks d
left join public.deck_cards dc on d.id = dc.deck_id
group by d.id;

create view public.user_collection_summary as
select 
  uc.owner,
  cd.rarity_id,
  r.code as rarity,
  count(*) as total_cards,
  count(case when uc.foil then 1 end) as foil_cards
from public.user_cards uc
join public.card_definitions cd on uc.card_def_id = cd.id
join public.rarities r on cd.rarity_id = r.id
group by uc.owner, cd.rarity_id, r.code;
