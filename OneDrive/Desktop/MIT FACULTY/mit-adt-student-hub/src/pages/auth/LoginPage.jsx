import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useState } from 'react';
import arcusLogo from '../../assets/arcus_logo.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const signInWithGoogle = useAuthStore(s => s.signInWithGoogle);
  const isLoading = useAuthStore(s => s.isLoading);
  const error = useAuthStore(s => s.error);

  const handleGoogleLogin = async () => {
    await Haptics.impact({ style: ImpactStyle.Medium });
    const res = await signInWithGoogle();
    if (res.success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side brand/gradient (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 p-12 text-white flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90 z-0"></div>
        <div className="relative z-10 flex items-center gap-3">
          <img src={arcusLogo} alt="Arcus" className="w-8 h-8 filter brightness-0 invert" />
          <span className="text-2xl font-bold tracking-tight">Arcus</span>
        </div>
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold tracking-tight leading-tight mb-4">Welcome back to Arcus.</h1>
          <p className="text-indigo-100 text-lg">Log in to access your dashboard, find faculty, and manage your campus tasks.</p>
        </div>
        <div className="relative z-10">
          <p className="text-sm text-indigo-200">© {new Date().getFullYear()} Arcus University</p>
        </div>
      </div>

      {/* Right side form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm relative pb-8">
          <div className="pt-8 pb-4 lg:absolute lg:-top-16 lg:left-0 lg:pt-0">
            <button
              onClick={() => navigate('/onboarding')}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-900 font-medium text-sm transition-colors"
            >
              <ChevronLeft size={16} /> Back
            </button>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mt-6 lg:mt-0">
            Sign in
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Continue with Google to access your account.
          </p>



          <div className="mt-8">
            {error && (
              <div className="w-full p-4 mb-6 bg-red-50 rounded-lg border border-red-100">
                <p className="text-red-600 text-sm font-medium text-center">{error}</p>
              </div>
            )}
            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                {isLoading ? 'Signing in...' : 'Sign in with Google'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
