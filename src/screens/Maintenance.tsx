import { Settings2 } from 'lucide-react';

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center selection:bg-black/10">
      <div className="w-16 h-16 bg-[#F3F3F5] rounded-full flex items-center justify-center mb-8 shadow-sm border border-black/[0.04]">
        <Settings2 className="w-8 h-8 text-[#1D1D1F] animate-[spin_4s_linear_infinite]" strokeWidth={1.5} />
      </div>
      
      <h1 
        className="text-[#1D1D1F] text-[32px] sm:text-[40px] leading-tight mb-4"
        style={{ fontWeight: 600, letterSpacing: '-0.04em' }}
      >
        We'll be right back.
      </h1>
      
      <p 
        className="text-[#6E6E73] text-[17px] max-w-[400px] leading-[1.5]"
        style={{ fontWeight: 400, letterSpacing: '-0.01em' }}
      >
        ShareRoom is currently undergoing maintenance to improve your experience. Please check back shortly.
      </p>
    </div>
  );
};

export default Maintenance;
