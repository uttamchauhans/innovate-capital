export default function Home() {
  return (
    <section className="w-full px-6 py-10 space-y-10">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-brand-700">
          Innovate Capital
        </h1>
        <p className="mt-4 text-gray-700 text-lg">
          Professional investment tracking with automated monthly interest reminders.
          Secure, fast, and mobile-friendly.
        </p>
      </div>

      {/* Full width Highlights */}
      <div className="bg-white shadow-lg rounded-lg p-8 w-full">
        <h2 className="text-2xl font-semibold mb-4">Highlights</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Client & investment records</li>
          <li>Monthly interest per investment</li>
          <li>Paid/unpaid tracking</li>
          <li>Email reminders (IST 09:00)</li>
        </ul>
      </div>
    </section>
  );
}
