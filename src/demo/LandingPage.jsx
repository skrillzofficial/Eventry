import React from "react";

function LandingPage() {
  return (
    <div className="bg-gray-900 text-white font-sans min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="text-2xl font-bold">Eventry</div>
        <nav className="space-x-6 hidden md:flex">
          <a href="#features" className="hover:text-cyan-400">Features</a>
          <a href="#stages" className="hover:text-cyan-400">Stages</a>
          <a href="#contact" className="hover:text-cyan-400">Contact</a>
        </nav>
        <button className="md:hidden px-3 py-2 bg-cyan-500 rounded-lg text-black">Menu</button>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center py-20 px-6">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          One tap. Your ticket. <span className="text-cyan-400">On-chain.</span>
        </h1>
        <p className="mt-4 max-w-xl text-gray-300">
          Fraud-proof, low-fee ticketing on Solana — faster payouts for organizers, secure access for attendees.
        </p>
        <div className="mt-6">
          <button className="px-6 py-3 bg-cyan-500 rounded-full text-black font-medium hover:bg-cyan-400 transition">
            Get Started
          </button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-6 bg-gray-800">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-center">
          <div className="p-6 bg-gray-900 rounded-2xl">
            <h3 className="text-xl font-semibold mb-2">Crypto Payments</h3>
            <p className="text-gray-400">
              Receive ticket revenue instantly in USDC with low fees via Solana Pay.
            </p>
          </div>
          <div className="p-6 bg-gray-900 rounded-2xl">
            <h3 className="text-xl font-semibold mb-2">NFT Tickets</h3>
            <p className="text-gray-400">
              Mint fraud-proof tickets as NFTs directly to attendee wallets.
            </p>
          </div>
          <div className="p-6 bg-gray-900 rounded-2xl">
            <h3 className="text-xl font-semibold mb-2">Vendor Marketplace</h3>
            <p className="text-gray-400">
              Verified vendors, escrow payments, and seamless concierge services.
            </p>
          </div>
        </div>
      </section>

      {/* Stages */}
      <section id="stages" className="py-20 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Stage 1 — Foundation</h2>
            <p className="text-gray-400">
              Feature-complete ticketing platform leveraging Solana for superior payments and NFT ticketing.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-2">Stage 2 — Expansion</h2>
            <p className="text-gray-400">
              Vendor marketplace and event-planning concierge layered on Stage 1 user base.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-2">Stage 3 — Ticket-as-Wallet</h2>
            <p className="text-gray-400">
              Prepaid pass for purchases and trips, unlocking on-site micro-economy and perks.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-8 px-6 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Eventry. Built on Solana.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
