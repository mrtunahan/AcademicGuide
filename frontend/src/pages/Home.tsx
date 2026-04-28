import { Link } from "react-router-dom";

import { useAuth } from "../lib/auth";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Akıllı 2209-Mentor Portalı
        </h1>
        <p className="mt-3 text-slate-600 max-w-2xl">
          TÜBİTAK 2209 başvurularınızı yapay zeka destekli rehberlikle güçlendirin.
          Öğrenciler taslaklarını analiz ettirir, danışmanlar süreci merkezi bir
          dashboard üzerinden yönetir.
        </p>
        <div className="mt-6 flex gap-3">
          {!user && (
            <>
              <Link
                to="/register"
                className="px-4 py-2 rounded-md bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"
              >
                Hemen Kayıt Ol
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 rounded-md bg-slate-100 text-slate-800 text-sm font-medium hover:bg-slate-200"
              >
                Giriş Yap
              </Link>
            </>
          )}
          {user?.role === "student" && (
            <Link
              to="/projects"
              className="px-4 py-2 rounded-md bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"
            >
              Projelerime Git
            </Link>
          )}
          {user?.role === "advisor" && (
            <Link
              to="/advisor"
              className="px-4 py-2 rounded-md bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"
            >
              Danışman Paneline Git
            </Link>
          )}
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        {[
          {
            title: "Semantik Denetim",
            body: "Özgün değer bölümünü literatürle kıyaslar, özgünlük düzeyini puanlar.",
          },
          {
            title: "Kriter Bazlı Geri Bildirim",
            body: "İş paketleri, yaygın etki ve risk yönetimi başlıklarını TÜBİTAK rehberine göre değerlendirir.",
          },
          {
            title: "Akademik Dil Düzeltici",
            body: "Pasif yapı, nesnellik ve akademik üslup açısından metni optimize eder.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <h3 className="font-semibold text-slate-900">{f.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
