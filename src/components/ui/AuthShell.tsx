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
        <div className="relative w-full md:w-3/5 flex items-center justify-center bg-white px-4 py-6 md:px-8 md:py-10">
          <Image
            src="/images/auth-hero.png"
            alt="手書きの請求書、もう卒業"
            width={900}
            height={520}
            className="w-full h-auto object-contain"
            priority
          />
          <div
            className="hidden md:block absolute inset-y-0 right-0 w-20 pointer-events-none"
            style={{
              background: 'linear-gradient(to right, rgba(255,255,255,0), #ffffff)',
            }}
            aria-hidden="true"
          />
        </div>
        <div className="w-full md:w-2/5 flex flex-col justify-center bg-white p-6 md:p-10 md:pl-6">
          {children}
        </div>
      </div>
    </div>
  )
}
