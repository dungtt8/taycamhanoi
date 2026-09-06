import Link from "next/link";
import Image from "next/image";
import { HeartIcon, UserIcon } from "./icons";
import Nav, { type NavActive } from "./Nav";
import CartButton from "./CartButton";
import SearchBar from "./SearchBar";

export type HeaderVariant = "full" | "compact" | "minimal";
export type CheckoutStep = "cart" | "checkout" | "success";

interface HeaderProps {
  variant: HeaderVariant;
  showNav?: boolean;
  navActive?: NavActive;
  checkoutStep?: CheckoutStep;
}

function Logo({ compact }: { compact: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      <Image
        src="/logo.png"
        alt="TAYCAMHANOI"
        width={320}
        height={320}
        className="h-14 w-14 object-contain"
        priority
      />
      {!compact && (
        <p className="text-[10px] text-gray-500 tracking-widest hidden sm:block">
          CHUYÊN TAY CẦM
          <br />
          &amp; PHỤ KIỆN GAMING
        </p>
      )}
    </Link>
  );
}

function StepIndicator({ step }: { step: CheckoutStep }) {
  const steps: { key: CheckoutStep; label: string }[] = [
    { key: "cart", label: "Giỏ hàng" },
    { key: "checkout", label: "Thanh toán" },
    { key: "success", label: "Hoàn tất" },
  ];
  const activeIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      {steps.map((s, i) => (
        <span key={s.key} className="flex items-center gap-2">
          {i > 0 && <span className="text-gray-300">→</span>}
          <span className={i === activeIndex ? "text-blue-700 font-bold" : "text-gray-400"}>
            {s.label}
          </span>
        </span>
      ))}
    </div>
  );
}

export default function Header({ variant, showNav, navActive, checkoutStep }: HeaderProps) {
  if (variant === "minimal") {
    return (
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Logo compact={false} />
          <StepIndicator step={checkoutStep ?? "checkout"} />
          <div className="w-12" />
        </div>
      </header>
    );
  }

  const compact = variant === "compact";

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Logo compact={false} />

        <div className="flex-1 max-w-xl mx-4 lg:mx-8 hidden md:block">
          <SearchBar />
        </div>

        <div className="flex items-center gap-4 lg:gap-5">
          <button className="hidden sm:flex flex-col items-center text-gray-600 hover:text-blue-700 transition">
            <HeartIcon />
            <span className="text-[10px] mt-0.5">Yêu thích</span>
          </button>
          <CartButton />
          {!compact && (
            <button className="hidden sm:flex flex-col items-center text-gray-600 hover:text-blue-700 transition">
              <UserIcon />
              <span className="text-[10px] mt-0.5">Tài khoản</span>
            </button>
          )}
        </div>
      </div>

      {showNav && <Nav active={navActive} />}
    </header>
  );
}
