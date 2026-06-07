import { useNavigate } from 'react-router-dom';

export default function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col" style={{ paddingTop: 'var(--safe-top)' }}>
      <div className="px-6 pt-10">
        <h1 className="text-[44px] font-bold text-[#021024] leading-[1.05] tracking-[-0.02em]">
          Welcome to Arcus
        </h1>
        <p className="text-[#5483B3] text-[16px] mt-4">
          A premium student companion designed for quick campus actions.
        </p>
      </div>

      <div className="mt-10 px-6">
        <div className="rounded-[24px] border border-[#7DA0CA] bg-[#C1E8FF] p-6">
          <p className="text-[#021024] text-[18px] font-semibold">Find faculty cabins instantly</p>
          <p className="text-[#052659] text-[16px] mt-2">Search by name, department, and cabin in seconds.</p>
        </div>
      </div>

      <div className="mt-auto px-4 pb-4" style={{ paddingBottom: 'max(16px, calc(env(safe-area-inset-bottom, 0px) + 16px))' }}>
        <button className="btn-primary w-full" onClick={() => navigate('/signup')}>
          Continue
        </button>
      </div>
    </div>
  );
}
