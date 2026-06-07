import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function SetPasswordPage() {
  const navigate = useNavigate();
  const setHardPassword = useAuthStore(s => s.setHardPassword);
  const signOut = useAuthStore(s => s.signOut);
  const isLoading = useAuthStore(s => s.isLoading);
  const error = useAuthStore(s => s.error);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return;

    await Haptics.impact({ style: ImpactStyle.Medium });
    const res = await setHardPassword(password);
    if (res.success) {
      navigate('/complete-profile', { replace: true });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col" style={{ paddingTop: 'var(--safe-top)' }}>
      <div className="px-6 pt-10 flex-1 flex flex-col">
        <h1 className="text-[32px] font-bold text-[#021024] leading-[1.1] tracking-[-0.02em]">
          Create a Password
        </h1>
        <p className="text-[#5483B3] text-[16px] mt-3">
          Since you signed in with Google, you need to create a password to complete your account registration and allow email logins.
        </p>

        <form onSubmit={handleSetPassword} className="space-y-6 mt-8 flex-1">
          <div>
            <label className="text-[#5483B3] text-[14px] font-medium">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field mt-2"
              required
              minLength={6}
              placeholder="Min. 6 characters"
            />
          </div>
          <div>
            <label className="text-[#5483B3] text-[14px] font-medium">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field mt-2"
              required
              minLength={6}
              placeholder="Min. 6 characters"
            />
          </div>

          {password && confirmPassword && password !== confirmPassword && (
            <p className="text-red-500 text-[13px]">Passwords do not match.</p>
          )}

          {error && (
            <div className="rounded-2xl border border-[#7DA0CA] bg-[#F2F2F7] p-4">
              <p className="text-[#021024] text-[14px] font-medium">{error}</p>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="btn-primary w-full disabled:opacity-60"
              disabled={isLoading || !password || password !== confirmPassword}
            >
              {isLoading ? 'Saving...' : 'Set Password'}
            </button>
          </div>
          
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-[#5483B3] text-[14px] font-medium mt-4 text-center"
          >
            Cancel and Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
