import Image from 'next/image'
import { Logo } from '@/components/ui/Logo'

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4">
      <div className="mb-6 flex flex-col items-center gap-2">
        <Logo />
        <p className="text-sm md:text-lg text-gray-500 text-center">
          手書きの請求書を、もっとカンタンに。
        </p>
      </div>

      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-[0_16px_50px_rgba(15,23,42,0.08)] flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-3/5 flex items-center justify-center bg-[#f6f1ea] p-6 md:p-10">
          <Image
            src="/images/auth-hero.png"
            alt="手書きの請求書、もう卒業"
            width={900}
            height={520}
            className="w-full h-auto object-contain"
            priority
          />
        </div>
        <div className="w-full md:w-2/5 flex flex-col justify-center p-6 md:p-10">
          {children}
        </div>
      </div>
    </div>
  )
}
