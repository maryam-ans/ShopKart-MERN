import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-white/10 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="ShopKart home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-lg font-black">
              S
            </span>
            <span className="text-xl font-bold tracking-tight">ShopKart</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a className="transition hover:text-white" href="#features">Features</a>
            <a className="transition hover:text-white" href="#about">About</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:bg-violet-500"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute left-1/2 top-0 -z-0 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:px-8 lg:py-32">
            <div>
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-violet-300">
                Your better shopping experience
              </p>
              <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight sm:text-6xl">
                Everything you love, in one place.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                Welcome to ShopKart, a simple and secure way to manage your
                shopping account and discover what is next.
              </p>
              <div className="mt-9 flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-500"
                >
                  Create your account
                </Link>
                <Link
                  to="/login"
                  className="rounded-xl border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  Sign in
                </Link>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative flex h-80 w-80 items-center justify-center rounded-[2rem] border border-violet-300/20 bg-violet-500/10 shadow-2xl shadow-violet-950/60 sm:h-96 sm:w-96">
                <div className="absolute inset-8 rounded-full bg-violet-500/20 blur-2xl" />
                <span className="relative text-8xl sm:text-9xl" role="img" aria-label="ShopKart shopping illustration">
                  🛒
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="border-y border-white/10 bg-slate-900/60">
          <div className="mx-auto grid max-w-7xl gap-6 px-6 py-20 md:grid-cols-3 lg:px-8">
            <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-2xl">🔒</p>
              <h2 className="mt-4 text-xl font-bold">Secure by design</h2>
              <p className="mt-3 leading-7 text-slate-400">
                Your account is protected with secure authentication and
                HttpOnly cookies.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-2xl">⚡</p>
              <h2 className="mt-4 text-xl font-bold">Simple and fast</h2>
              <p className="mt-3 leading-7 text-slate-400">
                Register, sign in, and access your account with a smooth,
                focused experience.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-2xl">🛍️</p>
              <h2 className="mt-4 text-xl font-bold">Made for shoppers</h2>
              <p className="mt-3 leading-7 text-slate-400">
                ShopKart gives you a clear home for your customer profile and
                future shopping journey.
              </p>
            </article>
          </div>
        </section>

        <section id="about" className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-300">
            Get started today
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to make shopping simpler?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Create your ShopKart account or sign in to continue.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-block rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            Join ShopKart
          </Link>
        </section>
      </main>

      <footer className="border-t border-white/10 px-6 py-6 text-center text-sm text-slate-500">
        ©️ 2026 ShopKart. Built for a better shopping experience.
      </footer>
    </div>
  );
}

export default Landing