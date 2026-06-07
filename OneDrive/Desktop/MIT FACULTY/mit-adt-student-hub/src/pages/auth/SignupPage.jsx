import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useState } from 'react';
import arcusLogo from '../../assets/arcus_logo.png';

export default function SignupPage() {
  const navigate = useNavigate();
  const signInWithGoogle = useAuthStore(s => s.signInWithGoogle);
  const requestSignupOtp = useAuthStore(s => s.requestSignupOtp);
  const verifySignupOtp = useAuthStore(s => s.verifySignupOtp);
  const isLoading = useAuthStore(s => s.isLoading);
  const error = useAuthStore(s => s.error);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);

  const handleGoogleSignup = async () => {
    await Haptics.impact({ style: ImpactStyle.Medium });
    const res = await signInWithGoogle();
    if (res.success) navigate('/complete-profile');
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return;
    await Haptics.impact({ style: ImpactStyle.Medium });
    const res = await requestSignupOtp({ email, password, displayName });
    if (res.success) setOtpRequested(true);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    await Haptics.impact({ style: ImpactStyle.Medium });
    const res = await verifySignupOtp({ email, otp });
    if (res.success) navigate('/complete-profile');
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side brand/gradient */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 p-12 text-white flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90 z-0"></div>
        <div className="relative z-10 flex items-center gap-3">
          <img src={arcusLogo} alt="Arcus" className="w-8 h-8 filter brightness-0 invert" />
          <span className="text-2xl font-bold tracking-tight">Arcus</span>
        </div>
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold tracking-tight leading-tight mb-4">Join your campus community.</h1>
          <p className="text-indigo-100 text-lg">Create an account to access the hub, find faculty, and manage your tasks.</p>
        </div>
        <div className="relative z-10">
          <p className="text-sm text-indigo-200">© {new Date().getFullYear()} Arcus University</p>
        </div>
      </div>

      {/* Right side form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white overflow-y-auto py-12">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Create account
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Email signup uses a 6-digit verification code. Google signup skips OTP.
          </p>

          <div className="mt-8 space-y-6">
            {!otpRequested ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" required placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" required placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" required minLength={6} placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" required minLength={6} placeholder="••••••••" />
                </div>
                {password && confirmPassword && password !== confirmPassword && (
                  <p className="text-red-500 text-sm">Passwords do not match.</p>
                )}
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 mt-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                  disabled={isLoading || (password !== confirmPassword)}
                >
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
                  <p className="text-indigo-900 text-sm font-semibold">OTP verification</p>
                  <p className="text-indigo-700 text-sm mt-1">We sent a 6-digit code to {email}.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">6-digit OTP</label>
                  <input value={otp} onChange={(e) => setOtp(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-center tracking-widest font-mono text-lg" required maxLength={6} placeholder="000000" />
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                  disabled={isLoading || otp.trim().length !== 6}
                >
                  {isLoading ? 'Verifying...' : 'Verify OTP and Create Account'}
                </button>
                <button
                  type="button"
                  onClick={() => setOtpRequested(false)}
                  className="w-full py-3 px-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Change Email/Password
                </button>
              </form>
            )}

            {error && (
              <div className="w-full p-4 mt-6 bg-red-50 rounded-lg border border-red-100">
                <p className="text-red-600 text-sm font-medium text-center">{error}</p>
              </div>
            )}
          </div>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                onClick={handleGoogleSignup}
                disabled={isLoading}
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                {isLoading ? 'Creating account...' : 'Google'}
              </button>
            </div>
            
            <p className="text-gray-500 text-sm text-center mt-8">
              Already have an account? <button onClick={() => navigate('/login')} className="text-indigo-600 font-semibold hover:text-indigo-500">Log in</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
