import BudgetSummary from "@/components/BudgetSummary";
import VendorSummary from "@/components/VendorSummary";

const WEDDING_DATE = new Date(2027, 2, 15);

function getDaysUntilWedding(today: Date, weddingDate: Date): number {
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const startOfWeddingDay = new Date(
    weddingDate.getFullYear(),
    weddingDate.getMonth(),
    weddingDate.getDate(),
  );

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const difference = startOfWeddingDay.getTime() - startOfToday.getTime();

  return Math.round(difference / millisecondsPerDay);
}

export default function Home() {
  const today = new Date();
  const daysRemaining = getDaysUntilWedding(today, WEDDING_DATE);

  const todayFormatted = today.toLocaleDateString("en-AU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const weddingFormatted = WEDDING_DATE.toLocaleDateString("en-AU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-1 items-center justify-center bg-rose-50 px-6 py-16">
      <main className="w-full max-w-2xl rounded-2xl bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-medium uppercase tracking-widest text-rose-400">
          The Big Day
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-zinc-900">
          The Best Wedding Planner
        </h1>

        <section className="mt-10 space-y-2">
          <p className="text-sm text-zinc-500"> This Day</p>
          <p className="text-lg text-zinc-800">{todayFormatted}</p>
        </section>

        <section className="mt-10 rounded-xl bg-rose-100 px-6 py-8">
          <p className="text-sm text-rose-700">Countdown to {weddingFormatted}</p>
          <p className="mt-2 text-5xl font-bold text-rose-900">
            {daysRemaining}
          </p>
          <p className="mt-2 text-rose-700">
            {daysRemaining === 1 ? "day remaining" : "days remaining"}
          </p>
        </section>

        <BudgetSummary />
        <VendorSummary />
      </main>
    </div>
  );
}
