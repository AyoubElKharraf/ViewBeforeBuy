import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center rounded-2xl border p-8 space-y-4">
        <div className="text-5xl">✅</div>
        <h1 className="text-2xl font-semibold">Paiement réussi</h1>
        <p className="text-sm opacity-80">
          Votre acompte de réservation a bien été enregistré. Merci pour votre confiance.
        </p>
        <Link
          href="/client"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[color:var(--brand)] text-white text-sm hover:brightness-110"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
