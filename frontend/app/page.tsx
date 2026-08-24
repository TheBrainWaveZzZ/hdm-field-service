"use client";

import { FormEvent, useState } from "react";


type Customer = {
  id: string;
  number: string;
  name: string;
  address: string;
  address2: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
};


type CustomerResponse = {
  count: number;
  customers: Customer[];
};


export default function Home() {
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");



  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanQuery = query.trim();

    if (!cleanQuery) {
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const response = await fetch(
        `/api/customers?q=${encodeURIComponent(cleanQuery)}`
      );

      if (!response.ok) {
        throw new Error(
          `API returned ${response.status}`
        );
      }

      const data: CustomerResponse = await response.json();

      setCustomers(data.customers);
    } catch (err) {
      console.error(err);

      setCustomers([]);
      setError(
        "Kon de klanten niet ophalen uit Business Central."
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-medium text-slate-500">
              HDM
            </p>

            <h1 className="text-2xl font-semibold text-slate-900">
              Field Service
            </h1>
          </div>

          <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
            Business Central connected
          </div>
        </div>
      </header>


      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-slate-900">
            Nieuwe interventie
          </h2>

          <p className="mt-2 text-slate-600">
            Zoek eerst de klant waarvoor je een interventie wilt aanmaken.
          </p>
        </div>


        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            Klant
          </h3>

          <form
            onSubmit={handleSearch}
            className="mt-4 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Zoek klant..."
              className="min-h-12 flex-1 rounded-xl border border-slate-300 px-4 text-base text-slate-900 outline-none transition focus:border-slate-500"
            />

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="min-h-12 rounded-xl bg-slate-900 px-6 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? "Zoeken..." : "Zoeken"}
            </button>
          </form>


          {error && (
            <div className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}


          {!loading &&
            searched &&
            !error &&
            customers.length === 0 && (
              <div className="mt-5 rounded-xl bg-slate-50 p-4 text-slate-600">
                Geen klanten gevonden.
              </div>
            )}


          {customers.length > 0 && (
            <div className="mt-6 space-y-3">
              {customers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  className="w-full rounded-xl border border-slate-200 p-5 text-left transition hover:border-slate-400 hover:bg-slate-50"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <div>
                      <div className="text-lg font-semibold text-slate-900">
                        {customer.name}
                      </div>

                      <div className="mt-1 text-sm font-medium text-slate-500">
                        {customer.number}
                      </div>

                      <div className="mt-3 text-slate-700">
                        {customer.address}
                        {customer.address2 && (
                          <>
                            <br />
                            {customer.address2}
                          </>
                        )}

                        <br />

                        {customer.postalCode} {customer.city}

                        {customer.country && (
                          <>
                            <br />
                            {customer.country}
                          </>
                        )}
                      </div>
                    </div>


                    <div className="text-sm text-slate-600 sm:text-right">
                      {customer.phone && (
                        <div>{customer.phone}</div>
                      )}

                      {customer.email && (
                        <div>{customer.email}</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}