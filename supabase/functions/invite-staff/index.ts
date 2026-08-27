import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle browser CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  try {
    // Create a client using the user's JWT
    const authHeader = req.headers.get('Authorization');

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const userClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      },
    );

    // Verify the person making the request is logged in
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    // Check that the logged-in user is an admin
    const { data: profile, error: profileError } =
      await userClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profileError || profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({
          error: 'Only administrators can invite staff.',
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    // Get staff details from the request
    const { email, fullName, phone, role } = await req.json();

    if (!email || !fullName || !role) {
      return new Response(
        JSON.stringify({
          error: 'Email, full name and role are required.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    if (!['therapist', 'admin'].includes(role)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid staff role.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    // Create the admin client using the service-role key.
    // This key stays inside the Edge Function and is NEVER exposed
    // to the browser.
    const adminClient = createClient(
      supabaseUrl,
      serviceRoleKey,
    );

    // Invite the staff member
  const {
  data: invitedUser,
  error: inviteError,
} = await adminClient.auth.admin.inviteUserByEmail(email, {
  redirectTo: 'http://localhost:5173/invite',
});

    if (inviteError) {
      return new Response(
        JSON.stringify({
          error: inviteError.message,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    if (!invitedUser.user) {
      throw new Error('Staff account could not be created.');
    }

    // Create their profile
    const { error: insertError } = await adminClient
      .from('profiles')
      .insert({
        id: invitedUser.user.id,
        full_name: fullName,
        email,
        phone: phone || null,
        role,
      });

    if (insertError) {
      // If profile creation fails, remove the Auth user so
      // we don't leave behind an incomplete staff account.
      await adminClient.auth.admin.deleteUser(
        invitedUser.user.id,
      );

      return new Response(
        JSON.stringify({
          error: insertError.message,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${fullName} has been invited as ${role}.`,
        userId: invitedUser.user.id,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : 'Something went wrong.',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});