import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserProfile } from '@/lib/auth';
import { createClient } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await getUserProfile(user.id);
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = await createClient();
    const { data: users, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_currencies(coins, gems),
        user_cards(count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await getUserProfile(user.id);
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, action, ...data } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'User ID and action required' }, { status: 400 });
    }

    const supabase = await createClient();

    switch (action) {
      case 'update_role':
        const { role } = data;
        if (!['player', 'admin', 'moderator'].includes(role)) {
          return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        const { error: roleError } = await supabase
          .from('profiles')
          .update({ role })
          .eq('id', userId);

        if (roleError) throw roleError;
        break;

      case 'give_currency':
        const { coins = 0, gems = 0 } = data;
        
        // Get current currency
        const { data: currentCurrency } = await supabase
          .from('user_currencies')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (currentCurrency) {
          const { error: currencyError } = await supabase
            .from('user_currencies')
            .update({
              coins: currentCurrency.coins + coins,
              gems: currentCurrency.gems + gems
            })
            .eq('user_id', userId);

          if (currencyError) throw currencyError;
        } else {
          const { error: createError } = await supabase
            .from('user_currencies')
            .insert({
              user_id: userId,
              coins: 1000 + coins,
              gems: 0 + gems
            });

          if (createError) throw createError;
        }

        // Log transaction
        await supabase
          .from('transactions')
          .insert({
            user_id: userId,
            type: 'admin_grant',
            amount_coins: coins,
            amount_gems: gems,
            description: `Admin granted ${coins} coins and ${gems} gems`
          });
        break;

      case 'give_cards':
        const { cardIds = [] } = data;
        
        const cardInserts = cardIds.map((cardDefId: string) => ({
          owner: userId,
          card_def_id: cardDefId,
          foil: false
        }));

        const { error: cardsError } = await supabase
          .from('user_cards')
          .insert(cardInserts);

        if (cardsError) throw cardsError;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
