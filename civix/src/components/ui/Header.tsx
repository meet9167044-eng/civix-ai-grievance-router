"use client";
// components/ui/Header.tsx — public header with Email/Password Login modal, My Reports drawer, and role switcher

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Leaf,
  Menu,
  X,
  ChevronDown,
  Mail,
  Lock,
  FileText,
  LogOut,
  ExternalLink,
  Shield,
  Sparkles,
} from "lucide-react";

type Role = "citizen" | "admin" | null;

interface LoginModalProps {
  onClose: () => void;
}

function LoginModal({ onClose }: LoginModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleCitizenLogin(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const userEmail = email.trim() || "citizen@civix.io";
    localStorage.setItem("civix_role", "citizen");
    localStorage.setItem("civix_user_email", userEmail);
    window.dispatchEvent(new Event("civix_role_change"));
    onClose();
  }

  function handleAdminLogin() {
    const adminEmail = email.trim() || "admin@civix.gov";
    localStorage.setItem("civix_role", "admin");
    localStorage.setItem("civix_user_email", adminEmail);
    window.dispatchEvent(new Event("civix_role_change"));
    onClose();
    router.push("/admin");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700">
              <Leaf size={20} className="fill-brand-600 text-brand-600" />
            </div>
            <h2 className="text-xl font-bold text-ink">Sign In to Civix</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-gray-500 mb-6">
          Sign in to track your reported civic issues or manage municipal dispatches.
        </p>

        <form onSubmit={handleCitizenLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@example.com"
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-brand-700 text-white text-sm font-semibold hover:bg-brand-800 transition-all active:scale-[.99] shadow-xs"
            >
              Sign In as Citizen (Track My Reports)
            </button>

            <button
              type="button"
              onClick={handleAdminLogin}
              className="w-full h-11 rounded-xl border border-brand-600 text-brand-700 bg-white hover:bg-brand-50 text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Shield size={16} />
              Sign In as Municipal Admin
            </button>
          </div>
        </form>

        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span>Demo mode active</span>
          <button
            type="button"
            onClick={() => {
              setEmail("citizen.demo@civix.io");
              setPassword("demo123");
            }}
            className="text-brand-700 font-semibold hover:underline flex items-center gap-1"
          >
            <Sparkles size={12} />
            Quick Demo Fill
          </button>
        </div>
      </div>
    </div>
  );
}

// ── My Reports Modal ─────────────────────────────────────────────────────────
function MyReportsModal({
  tickets,
  onClose,
}: {
  tickets: string[];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-lg border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">My Submitted Reports</h2>
              <p className="text-xs text-gray-500">Track resolution progress in real time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close reports"
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {tickets.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-500 mb-4">
              You haven&apos;t filed any reports on this device yet.
            </p>
            <Link
              href="/report"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-700 text-white text-xs font-semibold hover:bg-brand-800"
            >
              Report an Issue Now
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 my-4">
            {tickets.map((tNo) => (
              <Link
                key={tNo}
                href={`/track/${tNo}`}
                onClick={onClose}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 hover:bg-brand-50 border border-gray-100 transition-colors group"
              >
                <div>
                  <div className="font-mono text-sm font-bold text-brand-800 group-hover:text-brand-900">
                    {tNo}
                  </div>
                  <div className="text-[11px] text-gray-500">Click to view live status timeline</div>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-brand-700 group-hover:translate-x-0.5 transition-transform">
                  <span>Track</span>
                  <ExternalLink size={13} />
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Header ─────────────────────────────────────────────────────────────
export function Header() {
  const router = useRouter();
  const [role, setRole] = useState<Role>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [myTickets, setMyTickets] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function syncState() {
      if (typeof window !== "undefined") {
        setRole(localStorage.getItem("civix_role") as Role);
        setUserEmail(localStorage.getItem("civix_user_email") || "");
        try {
          const raw = localStorage.getItem("civix_my_tickets");
          if (raw) setMyTickets(JSON.parse(raw));
        } catch {
          setMyTickets([]);
        }
      }
    }
    syncState();

    window.addEventListener("civix_role_change", syncState);
    window.addEventListener("civix_my_tickets_change", syncState);
    return () => {
      window.removeEventListener("civix_role_change", syncState);
      window.removeEventListener("civix_my_tickets_change", syncState);
    };
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

  function handleSignOut() {
    localStorage.removeItem("civix_role");
    localStorage.removeItem("civix_user_email");
    setRole(null);
    setUserEmail("");
    setShowDropdown(false);
    window.dispatchEvent(new Event("civix_role_change"));
    router.push("/");
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
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-ink hover:text-brand-700 transition-colors"
          >
            <Leaf size={26} className="text-brand-600 fill-brand-600" />
            <span>Civix</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/#how-it-works"
              className="text-sm text-gray-700 hover:text-brand-700 transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/#about"
              className="text-sm text-gray-700 hover:text-brand-700 transition-colors"
            >
              About
            </Link>

            {/* My Reports Quick Nav */}
            <button
              onClick={() => setShowReportsModal(true)}
              className="text-sm text-gray-700 hover:text-brand-700 transition-colors flex items-center gap-1.5"
            >
              <FileText size={15} className="text-brand-600" />
              <span>My Reports</span>
              {myTickets.length > 0 && (
                <span className="bg-brand-100 text-brand-800 text-[11px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                  {myTickets.length}
                </span>
              )}
            </button>

            {role === "admin" && (
              <Link
                href="/admin"
                className="text-sm font-semibold text-brand-700 hover:text-brand-800 transition-colors flex items-center gap-1.5 bg-brand-50 px-3 py-1 rounded-full border border-brand-200"
              >
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
                  className="flex items-center gap-2 h-10 px-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-ink shadow-2xs"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-800 text-xs font-bold flex items-center justify-center">
                    {role === "admin" ? "A" : "C"}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="capitalize font-semibold text-xs leading-none">
                      {role}
                    </div>
                    {userEmail && (
                      <div className="text-[10px] text-gray-400 max-w-[110px] truncate leading-none mt-0.5">
                        {userEmail}
                      </div>
                    )}
                  </div>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95">
                    {userEmail && (
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs">
                        <span className="text-gray-400 text-[10px]">Signed in as</span>
                        <div className="font-semibold text-gray-800 truncate">{userEmail}</div>
                      </div>
                    )}

                    {role === "admin" ? (
                      <>
                        <button
                          onClick={goToAdmin}
                          className="w-full text-left px-4 py-2.5 text-sm font-semibold text-brand-800 bg-brand-50/70 hover:bg-brand-100 transition-colors flex items-center justify-between"
                        >
                          <span>Admin Dashboard</span>
                          <span className="text-[10px] bg-brand-600 text-white px-1.5 py-0.5 rounded font-mono">
                            /admin
                          </span>
                        </button>
                        <div className="h-px bg-gray-100 my-1" />
                        <button
                          onClick={() => switchRole("citizen")}
                          className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Switch to Citizen
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            setShowReportsModal(true);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm font-semibold text-brand-800 hover:bg-brand-50 transition-colors flex items-center justify-between"
                        >
                          <span>My Submitted Reports</span>
                          {myTickets.length > 0 && (
                            <span className="text-[10px] bg-brand-100 text-brand-800 px-1.5 py-0.5 rounded font-bold font-mono">
                              {myTickets.length}
                            </span>
                          )}
                        </button>
                        <div className="h-px bg-gray-100 my-1" />
                        <button
                          onClick={() => switchRole("admin")}
                          className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between"
                        >
                          <span>Switch to Admin</span>
                          <span className="text-[10px] text-gray-400 font-mono">Console</span>
                        </button>
                      </>
                    )}

                    <div className="h-px bg-gray-100 my-1" />
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1.5"
                    >
                      <LogOut size={13} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="h-10 px-4 rounded-xl border border-brand-600 text-brand-700 text-sm font-semibold hover:bg-brand-50 transition-colors"
              >
                Sign In
              </button>
            )}

            <Link
              href="/report"
              className="hidden sm:flex h-10 px-4 rounded-xl bg-brand-700 text-white text-sm font-semibold items-center hover:bg-brand-800 active:scale-[.98] transition-all shadow-xs"
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
            <Link
              href="/#how-it-works"
              className="text-sm text-gray-700 hover:text-brand-700 py-1"
              onClick={() => setMobileOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/#about"
              className="text-sm text-gray-700 hover:text-brand-700 py-1"
              onClick={() => setMobileOpen(false)}
            >
              About
            </Link>
            <button
              onClick={() => {
                setMobileOpen(false);
                setShowReportsModal(true);
              }}
              className="text-left text-sm text-gray-700 hover:text-brand-700 py-1 flex items-center justify-between"
            >
              <span>My Reports</span>
              {myTickets.length > 0 && (
                <span className="bg-brand-100 text-brand-800 text-xs px-2 py-0.5 rounded-full font-mono">
                  {myTickets.length}
                </span>
              )}
            </button>

            {role === "admin" && (
              <Link
                href="/admin"
                className="h-11 flex items-center justify-center gap-2 rounded-xl border border-brand-600 bg-brand-50 text-brand-800 text-sm font-semibold hover:bg-brand-100"
                onClick={() => setMobileOpen(false)}
              >
                Admin Dashboard (/admin)
              </Link>
            )}

            <Link
              href="/report"
              className="h-11 flex items-center justify-center rounded-xl bg-brand-700 text-white text-sm font-semibold hover:bg-brand-800"
              onClick={() => setMobileOpen(false)}
            >
              Report an Issue
            </Link>
          </div>
        )}
      </header>

      {showModal && <LoginModal onClose={() => setShowModal(false)} />}
      {showReportsModal && (
        <MyReportsModal
          tickets={myTickets}
          onClose={() => setShowReportsModal(false)}
        />
      )}
      {showDropdown && (
        <div className="fixed inset-0 z-30" onClick={() => setShowDropdown(false)} />
      )}
    </>
  );
}
