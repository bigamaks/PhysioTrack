import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AddStaff() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('therapist');

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();

    setLoading(true);
    setMessage(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setMessage({
          type: 'error',
          text: 'You must be logged in as an administrator.',
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        'invite-staff',
        {
          body: {
            email,
            fullName,
            phone,
            role,
          },
        },
      );

      if (error) {
        console.error('Invite staff error:', error);

        let errorMessage =
          'Something went wrong while inviting the staff member.';

        if (error.context) {
          try {
            const responseBody = await error.context.json();

            if (responseBody?.error) {
              errorMessage = responseBody.error;
            }
          } catch {
            // Keep the default error message
          }
        }

        const lowerError = errorMessage.toLowerCase();

        if (
          lowerError.includes('already') ||
          lowerError.includes('registered') ||
          lowerError.includes('exists')
        ) {
          errorMessage =
            'This email already has a PhysioTrack account. Use a different email address.';
        }

        setMessage({
          type: 'error',
          text: errorMessage,
        });

        return;
      }

      if (data?.success) {
        setMessage({
          type: 'success',
          text: `${fullName} has been invited as ${role}.`,
        });

        setEmail('');
        setFullName('');
        setPhone('');
        setRole('therapist');
      } else {
        setMessage({
          type: 'error',
          text:
            data?.error ||
            'The invitation could not be sent.',
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);

      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Something went wrong while sending the invitation.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md">
      <div className="mb-5">
        <h1 className="font-display font-semibold text-xl text-ink">
          Add staff member
        </h1>

        <p className="text-sm text-muted mt-1">
          Invite a therapist or administrator to join PhysioTrack.
        </p>
      </div>

      <form
        onSubmit={handleAdd}
        className="bg-white p-6 rounded-xl border border-[#E4E9E8] flex flex-col gap-4"
      >
        {message && (
          <div
            className="text-sm rounded-lg px-3 py-2.5"
            style={{
              background:
                message.type === 'error'
                  ? '#FDEDEC'
                  : '#E1F0EA',
              color:
                message.type === 'error'
                  ? '#D96B54'
                  : '#1F4E4A',
            }}
          >
            {message.text}
          </div>
        )}

        <div>
          <label className="text-xs mb-1.5 block text-muted">
            Full name
          </label>

          <input
            type="text"
            placeholder="e.g. Jane Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9E8] text-sm outline-none"
            required
          />
        </div>

        <div>
          <label className="text-xs mb-1.5 block text-muted">
            Email
          </label>

          <input
            type="email"
            placeholder="staff@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9E8] text-sm outline-none"
            required
          />
        </div>

        <div>
          <label className="text-xs mb-1.5 block text-muted">
            Phone number
          </label>

          <input
            type="tel"
            placeholder="e.g. 08012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9E8] text-sm outline-none"
          />
        </div>

        <div>
          <label className="text-xs mb-1.5 block text-muted">
            Role
          </label>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9E8] text-sm bg-white outline-none"
          >
            <option value="therapist">Therapist</option>
            <option value="admin">Administrator</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {loading
            ? 'Sending invitation...'
            : 'Invite staff member'}
        </button>
      </form>
    </div>
  );
}

