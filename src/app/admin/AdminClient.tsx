"use client";

import { useState, useEffect, useCallback } from "react";

type Tab = "events" | "signalements" | "entraide" | "trouvailles";

const TABS: { key: Tab; label: string }[] = [
  { key: "events", label: "Événements" },
  { key: "signalements", label: "Signalements" },
  { key: "entraide", label: "Entraide" },
  { key: "trouvailles", label: "Trouvailles" },
];

const EVENT_CATS = ["musique", "sport", "marche", "culture", "bar", "autre"];

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", year: "numeric",
  });
}
function toLocal(iso: string) {
  return iso ? iso.slice(0, 16) : "";
}

// ── Icônes ──────────────────────────────────────────────────────────────────

function IconEdit() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

// ── API helpers ─────────────────────────────────────────────────────────────

async function apiFetch(password: string, table: Tab) {
  const r = await fetch(`/api/admin?table=${table}`, {
    headers: { authorization: `Bearer ${password}` },
  });
  if (!r.ok) throw new Error("Non autorisé");
  return (await r.json()).data as Record<string, unknown>[];
}

async function apiDelete(password: string, table: Tab, id: string) {
  const r = await fetch(`/api/admin?table=${table}&id=${id}`, {
    method: "DELETE",
    headers: { authorization: `Bearer ${password}` },
  });
  if (!r.ok) throw new Error("Erreur suppression");
}

async function apiPatch(password: string, table: Tab, id: string, body: Record<string, unknown>) {
  const r = await fetch(`/api/admin?table=${table}&id=${id}`, {
    method: "PATCH",
    headers: { authorization: `Bearer ${password}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("Erreur modification");
}

// ── Composant principal ──────────────────────────────────────────────────────

export default function AdminClient() {
  const [password, setPassword] = useState("");
  const [input, setInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [tab, setTab] = useState<Tab>("events");
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, unknown>>({});

  const authenticated = !!password;

  // Connexion
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    try {
      await apiFetch(input, "events");
      setPassword(input);
      sessionStorage.setItem("admin_pw", input);
    } catch {
      setAuthError("Mot de passe incorrect.");
    }
  }

  // Restaure depuis sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem("admin_pw");
    if (saved) setPassword(saved);
  }, []);

  const load = useCallback(async () => {
    if (!password) return;
    setLoading(true);
    try {
      const data = await apiFetch(password, tab);
      setRows(data);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [password, tab]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer définitivement ?")) return;
    await apiDelete(password, tab, id);
    setRows((r) => r.filter((x) => x.id !== id));
  }

  async function handleToggle(id: string, field: string, current: unknown) {
    await apiPatch(password, tab, id, { [field]: !current });
    setRows((r) => r.map((x) => x.id === id ? { ...x, [field]: !current } : x));
  }

  function startEdit(row: Record<string, unknown>) {
    setEditingId(row.id as string);
    setEditForm({
      titre: row.titre ?? "",
      categorie: row.categorie ?? "autre",
      date_debut: toLocal(row.date_debut as string),
      date_fin: row.date_fin ? toLocal(row.date_fin as string) : "",
      lieu_nom: row.lieu_nom ?? "",
      valide: row.valide ?? false,
    });
  }

  async function handleSave(id: string) {
    const body: Record<string, unknown> = {
      titre: editForm.titre,
      categorie: editForm.categorie,
      date_debut: editForm.date_debut ? new Date(editForm.date_debut as string).toISOString() : undefined,
      date_fin: editForm.date_fin ? new Date(editForm.date_fin as string).toISOString() : null,
      lieu_nom: editForm.lieu_nom || null,
      valide: editForm.valide,
    };
    await apiPatch(password, "events", id, body);
    setRows((r) => r.map((x) => x.id === id ? { ...x, ...body } : x));
    setEditingId(null);
  }

  // ── Vue : Login ─────────────────────────────────────────────────────────

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="mb-1 text-xl font-bold text-slate-900">Administration</h1>
          <p className="mb-6 text-sm text-slate-500">Yonne+ — accès restreint</p>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Mot de passe"
            className="mb-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            autoFocus
          />
          {authError && <p className="mb-3 text-sm text-red-500">{authError}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Connexion
          </button>
        </form>
      </div>
    );
  }

  // ── Vue : Dashboard ─────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-lg font-bold text-slate-900">Yonne+ Admin</h1>
          <button
            onClick={() => { sessionStorage.removeItem("admin_pw"); setPassword(""); }}
            className="text-sm text-slate-400 hover:text-slate-600"
          >
            Déconnexion
          </button>
        </div>
        {/* Tabs */}
        <div className="mx-auto mt-3 flex max-w-5xl gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={[
                "rounded-lg px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                tab === t.key ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-slate-500">{rows.length} entrée{rows.length !== 1 ? "s" : ""}</p>
          <button onClick={load} className="text-sm text-blue-600 hover:underline">Actualiser</button>
        </div>

        {loading && <p className="text-center text-sm text-slate-400 py-12">Chargement…</p>}

        {!loading && rows.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-12">Aucun élément.</p>
        )}

        {!loading && rows.length > 0 && (
          <div className="space-y-2">
            {tab === "events" && rows.map((row) => <EventRow key={row.id as string} row={row} editing={editingId === (row.id as string)} editForm={editForm} setEditForm={setEditForm} onEdit={startEdit} onSave={handleSave} onCancel={() => setEditingId(null)} onDelete={handleDelete} onToggle={handleToggle} />)}
            {tab === "signalements" && rows.map((row) => <SignalRow key={row.id as string} row={row} onDelete={handleDelete} onToggle={handleToggle} />)}
            {tab === "entraide" && rows.map((row) => <EntraideRow key={row.id as string} row={row} onDelete={handleDelete} onToggle={handleToggle} />)}
            {tab === "trouvailles" && rows.map((row) => <TrouvailleRow key={row.id as string} row={row} onDelete={handleDelete} onToggle={handleToggle} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Rows ─────────────────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4">{children}</div>;
}

function Badge({ label, color }: { label: string; color: "green" | "red" | "amber" | "slate" }) {
  const cls = {
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-700",
    slate: "bg-slate-100 text-slate-500",
  }[color];
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>{label}</span>;
}

function ActionBtn({ onClick, danger, title, children }: { onClick: () => void; danger?: boolean; title?: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={[
        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
        danger ? "text-red-400 hover:bg-red-50 hover:text-red-600" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function EventRow({
  row, editing, editForm, setEditForm, onEdit, onSave, onCancel, onDelete, onToggle,
}: {
  row: Record<string, unknown>;
  editing: boolean;
  editForm: Record<string, unknown>;
  setEditForm: (f: Record<string, unknown>) => void;
  onEdit: (r: Record<string, unknown>) => void;
  onSave: (id: string) => Promise<void>;
  onCancel: () => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, field: string, current: unknown) => void;
}) {
  const id = row.id as string;
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-900 text-sm">{row.titre as string}</span>
            <Badge label={row.categorie as string} color="slate" />
            <Badge label={row.valide ? "Validé" : "En attente"} color={row.valide ? "green" : "amber"} />
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {row.lieu_nom as string} · {fmt(row.date_debut as string)}
            {row.date_fin ? ` → ${fmt(row.date_fin as string)}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <ActionBtn onClick={() => onToggle(id, "valide", row.valide)} title={row.valide ? "Invalider" : "Valider"}>
            <IconCheck />
          </ActionBtn>
          <ActionBtn onClick={() => editing ? onCancel() : onEdit(row)} title="Modifier">
            <IconEdit />
          </ActionBtn>
          <ActionBtn onClick={() => onDelete(id)} danger title="Supprimer">
            <IconTrash />
          </ActionBtn>
        </div>
      </div>

      {editing && (
        <div className="mt-4 border-t border-slate-100 pt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Titre</label>
            <input
              value={editForm.titre as string}
              onChange={(e) => setEditForm({ ...editForm, titre: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Catégorie</label>
            <select
              value={editForm.categorie as string}
              onChange={(e) => setEditForm({ ...editForm, categorie: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              {EVENT_CATS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Date début</label>
            <input
              type="datetime-local"
              value={editForm.date_debut as string}
              onChange={(e) => setEditForm({ ...editForm, date_debut: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Date fin (optionnel)</label>
            <input
              type="datetime-local"
              value={editForm.date_fin as string}
              onChange={(e) => setEditForm({ ...editForm, date_fin: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Lieu</label>
            <input
              value={editForm.lieu_nom as string}
              onChange={(e) => setEditForm({ ...editForm, lieu_nom: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={editForm.valide as boolean}
                onChange={(e) => setEditForm({ ...editForm, valide: e.target.checked })}
                className="h-4 w-4 accent-blue-600"
              />
              Validé
            </label>
          </div>
          <div className="sm:col-span-2 flex gap-2 justify-end">
            <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:bg-slate-100">Annuler</button>
            <button onClick={() => onSave(id)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Enregistrer</button>
          </div>
        </div>
      )}
    </Card>
  );
}

function SignalRow({ row, onDelete, onToggle }: { row: Record<string, unknown>; onDelete: (id: string) => void; onToggle: (id: string, f: string, v: unknown) => void }) {
  const id = row.id as string;
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge label={row.type as string} color={row.type === "probleme" ? "red" : "amber"} />
            <Badge label={row.categorie as string} color="slate" />
            {!!row.masque && <Badge label="Masqué" color="slate" />}
            <span className="text-xs text-slate-400">{row.votes as number} vote{(row.votes as number) > 1 ? "s" : ""}</span>
          </div>
          <p className="mt-1 text-sm text-slate-700 line-clamp-2">{row.description as string}</p>
          <p className="mt-0.5 text-xs text-slate-400">{fmt(row.created_at as string)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <ActionBtn onClick={() => onToggle(id, "masque", row.masque)} title={row.masque ? "Afficher" : "Masquer"}>
            <IconCheck />
          </ActionBtn>
          <ActionBtn onClick={() => onDelete(id)} danger title="Supprimer">
            <IconTrash />
          </ActionBtn>
        </div>
      </div>
    </Card>
  );
}

function EntraideRow({ row, onDelete, onToggle }: { row: Record<string, unknown>; onDelete: (id: string) => void; onToggle: (id: string, f: string, v: unknown) => void }) {
  const id = row.id as string;
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge label={row.type_aide as string} color="slate" />
            <Badge label={row.actif ? "Actif" : "Inactif"} color={row.actif ? "green" : "slate"} />
            <span className="text-xs text-slate-400">{row.remuneration as string}</span>
          </div>
          <p className="mt-1 text-sm text-slate-700 line-clamp-2">{row.description as string}</p>
          <p className="mt-0.5 text-xs text-slate-400">{fmt(row.created_at as string)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <ActionBtn onClick={() => onToggle(id, "actif", row.actif)} title={row.actif ? "Désactiver" : "Activer"}>
            <IconCheck />
          </ActionBtn>
          <ActionBtn onClick={() => onDelete(id)} danger title="Supprimer">
            <IconTrash />
          </ActionBtn>
        </div>
      </div>
    </Card>
  );
}

function TrouvailleRow({ row, onDelete, onToggle }: { row: Record<string, unknown>; onDelete: (id: string) => void; onToggle: (id: string, f: string, v: unknown) => void }) {
  const id = row.id as string;
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge label={row.categorie as string} color="slate" />
            <Badge label={row.statut as string} color={row.statut === "trouve" ? "green" : "amber"} />
            {!!row.resolu && <Badge label="Résolu" color="green" />}
          </div>
          <p className="mt-1 text-sm text-slate-700 line-clamp-2">{row.description as string}</p>
          <p className="mt-0.5 text-xs text-slate-400">{fmt(row.created_at as string)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <ActionBtn onClick={() => onToggle(id, "resolu", row.resolu)} title={row.resolu ? "Rouvrir" : "Marquer résolu"}>
            <IconCheck />
          </ActionBtn>
          <ActionBtn onClick={() => onDelete(id)} danger title="Supprimer">
            <IconTrash />
          </ActionBtn>
        </div>
      </div>
    </Card>
  );
}
