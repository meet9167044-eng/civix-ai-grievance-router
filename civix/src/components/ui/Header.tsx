"use client";
// components/ui/Header.tsx — public header with Login modal and role toggle

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, Menu, X, ChevronDown } from "lucide-react";

type Role = "citizen" | "admin" | null;

function LoginModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  function choose(role: Role) {
    if (role) {
      localStorage.setItem("civix_role", role);
      window.dispatchEvent(new Event("civix_role_change"));
    }
    onClose();
    if (role === "admin") router.push("/admin");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[var(--radius-card)] shadow-2xl p-8 w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-ink">Demo access</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Demo mode: no account needed.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => choose("citizen")}
            className="h-12 px-6 rounded-[var(--radius-control)] bg-brand-700 text-white font-semibold hover:bg-brand-800 active:scale-[.98] transition-all"
          >
            Continue as Citizen
          </button>
          <button
            onClick={() => choose("admin")}
            className="h-12 px-6 rounded-[var(--radius-control)] border border-brand-600 text-brand-700 font-semibold bg-white hover:bg-brand-50 active:scale-[.98] transition-all"
          >
            Continue as Admin
          </button>
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const router = useRouter();
  const [role, setRole] = useState<Role>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("civix_role") as Role;
  });
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Sync role if it was set in another tab or before mount
    const handler = () => {
      setRole(localStorage.getItem("civix_role") as Role);
    };
    window.addEventListener("civix_role_change", handler);
    return () => window.removeEventListener("civix_role_change", handler);
  }, []);

  function switchRole(newRole: Role) {
    if (newRole) {
      localStorage.setItem("civix_role", newRole);
      setRole(newRole);
      window.dispatchEvent(new Event("civix_role_change"));
      if (newRole === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
    setShowDropdown(false);
  }

  function goToAdmin() {
    setShowDropdown(false);
    router.push("/admin");
  }

  return (
    <>
      <header className="h-[72px] bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto h-full flex items-center justify-between px-4 md:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-ink hover:text-brand-700 transition-colors">
            <Leaf size={26} className="text-brand-600 fill-brand-600" />
            <span>Civix</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#how-it-works" className="text-sm text-gray-700 hover:text-brand-700 transition-colors">
              How It Works
            </Link>
            <Link href="/#about" className="text-sm text-gray-700 hover:text-brand-700 transition-colors">
              About
            </Link>
            {role === "admin" && (
              <Link href="/admin" className="text-sm font-semibold text-brand-700 hover:text-brand-800 transition-colors flex items-center gap-1.5 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                Admin Dashboard
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {role ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 h-10 px-3 rounded-[var(--radius-control)] border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-ink"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-800 text-xs font-bold flex items-center justify-center">
                    {role === "admin" ? "A" : "C"}
                  </div>
                  <span className="hidden sm:inline capitalize font-semibold">{role}</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-[var(--radius-card)] shadow-xl border border-gray-100 overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95">
                    {role === "admin" ? (
                      <>
                        <button
                          onClick={goToAdmin}
                          className="w-full text-left px-4 py-2.5 text-sm font-semibold text-brand-800 bg-brand-50/70 hover:bg-brand-100 transition-colors flex items-center justify-between"
                        >
                          <span>Open Admin Dashboard</span>
                          <span className="text-xs bg-brand-600 text-white px-2 py-0.5 rounded font-mono">/admin</span>
                        </button>
                        <div className="h-px bg-gray-100 my-1" />
                        <button
                          onClick={() => switchRole("citizen")}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                          Switch to Citizen
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => switchRole("admin")}
                          className="w-full text-left px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition-colors flex items-center justify-between"
                        >
                          <span>Switch to Admin</span>
                          <span className="text-xs bg-brand-100 text-brand-800 px-1.5 py-0.5 rounded font-mono">Console</span>
                        </button>
                        <div className="h-px bg-gray-100 my-1" />
                        <Link
                          href="/report"
                          onClick={() => setShowDropdown(false)}
                          className="w-full block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                          Report an Issue
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="h-10 px-4 rounded-[var(--radius-control)] border border-brand-600 text-brand-700 text-sm font-semibold hover:bg-brand-50 transition-colors"
              >
                Login
              </button>
            )}
            <Link
              href="/report"
              className="hidden sm:flex h-10 px-4 rounded-[var(--radius-control)] bg-brand-700 text-white text-sm font-semibold items-center hover:bg-brand-800 active:scale-[.98] transition-all"
            >
              Report Issue
            </Link>
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
            <Link href="/#how-it-works" className="text-sm text-gray-700 hover:text-brand-700 py-2" onClick={() => setMobileOpen(false)}>
              How It Works
            </Link>
            <Link href="/#about" className="text-sm text-gray-700 hover:text-brand-700 py-2" onClick={() => setMobileOpen(false)}>
              About
            </Link>
            {role === "admin" && (
              <Link
                href="/admin"
                className="h-11 flex items-center justify-center gap-2 rounded-[var(--radius-control)] border border-brand-600 bg-brand-50 text-brand-800 text-sm font-semibold hover:bg-brand-100"
                onClick={() => setMobileOpen(false)}
              >
                Admin Dashboard (/admin)
              </Link>
            )}
            <Link
              href="/report"
              className="h-11 flex items-center justify-center rounded-[var(--radius-control)] bg-brand-700 text-white text-sm font-semibold hover:bg-brand-800"
              onClick={() => setMobileOpen(false)}
            >
              Report an Issue
            </Link>
          </div>
        )}
      </header>

      {showModal && <LoginModal onClose={() => setShowModal(false)} />}
      {showDropdown && (
        <div className="fixed inset-0 z-30" onClick={() => setShowDropdown(false)} />
      )}
    </>
  );
}
