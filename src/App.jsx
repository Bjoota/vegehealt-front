import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export default function App() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  // carrinho: { [id]: { produto, qtd } }
  const [cart, setCart] = useState({});

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setErro("");
        const resp = await fetch(`${API_URL}/produtos`);
        if (!resp.ok) throw new Error(`Erro HTTP ${resp.status}`);
        const data = await resp.json();
        setProdutos(data);
      } catch (e) {
        setErro(String(e.message || e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function add(produto) {
    setCart((prev) => {
      const cur = prev[produto.id];
      const qtd = (cur?.qtd || 0) + 1;
      return { ...prev, [produto.id]: { produto, qtd } };
    });
  }

  function removeOne(produtoId) {
    setCart((prev) => {
      const cur = prev[produtoId];
      if (!cur) return prev;
      const qtd = cur.qtd - 1;
      if (qtd <= 0) {
        const copy = { ...prev };
        delete copy[produtoId];
        return copy;
      }
      return { ...prev, [produtoId]: { ...cur, qtd } };
    });
  }

  function clearCart() {
    setCart({});
  }

  const items = Object.values(cart);

  const total = useMemo(() => {
    return items.reduce((acc, it) => acc + Number(it.produto.preco) * it.qtd, 0);
  }, [cart]);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1>VegeHealt</h1>
        <small style={{ opacity: 0.8 }}>API: {API_URL}</small>
      </header>

      {loading && <p>Carregando produtos...</p>}
      {erro && (
        <p style={{ color: "tomato" }}>
          Erro ao buscar produtos: {erro}
        </p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, alignItems: "start" }}>
        <section>
          <h2>Produtos</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {produtos.map((p) => (
              <div key={p.id} style={{ border: "1px solid #333", borderRadius: 8, padding: 12 }}>
                <strong>{p.nome}</strong>
                <div>R$ {Number(p.preco).toFixed(2)}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  {p.categoria} • {p.unidade} • estoque: {p.estoque}
                </div>
                <button style={{ marginTop: 10 }} onClick={() => add(p)}>
                  Adicionar
                </button>
              </div>
            ))}
          </div>
        </section>

        <aside style={{ border: "1px solid #333", borderRadius: 8, padding: 12 }}>
          <h2>Carrinho</h2>

          {items.length === 0 ? (
            <p>Vazio</p>
          ) : (
            <>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
                {items.map(({ produto, qtd }) => (
                  <li key={produto.id} style={{ display: "grid", gap: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <span>
                        {produto.nome} <small style={{ opacity: 0.8 }}>x{qtd}</small>
                      </span>
                      <span>R$ {(Number(produto.preco) * qtd).toFixed(2)}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => removeOne(produto.id)}>-</button>
                      <button onClick={() => add(produto)}>+</button>
                    </div>
                  </li>
                ))}
              </ul>

              <hr style={{ margin: "12px 0" }} />
              <p>
                <strong>Total:</strong> R$ {total.toFixed(2)}
              </p>
              <button onClick={clearCart}>Limpar carrinho</button>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}