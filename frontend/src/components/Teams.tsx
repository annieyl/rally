import { useEffect, useState, useRef } from 'react';
import { Users, Plus, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const TEAMS = [
  { name: 'Frontend', color: 'indigo' },
  { name: 'Backend', color: 'purple' },
  { name: 'Design', color: 'pink' },
  { name: 'Business', color: 'blue' },
  { name: 'DevOps', color: 'green' },
  { name: 'QA', color: 'amber' },
] as const;

type TeamName = (typeof TEAMS)[number]['name'];

interface Member {
  id: number;
  team: TeamName;
  name: string;
  role: string;
  email: string;
}

interface EditingMember {
  name: string;
  role: string;
  email: string;
}

const BLANK_FORM: EditingMember = { name: '', role: '', email: '' };

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// AddMemberRow – inline form appended to a team table
// ---------------------------------------------------------------------------

interface AddMemberRowProps {
  team: TeamName;
  onSaved: (member: Member) => void;
  onCancel: () => void;
}

function AddMemberRow({ team, onSaved, onCancel }: AddMemberRowProps) {
  const [form, setForm] = useState<EditingMember>(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    setError(null);
    try {
      const member = await apiFetch<Member>('/teams/members', {
        method: 'POST',
        body: JSON.stringify({ team, ...form }),
      });
      onSaved(member);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add member');
    } finally {
      setSaving(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onCancel();
  };

  return (
    <>
      <tr className="bg-blue-50">
        <td className="px-4 py-2">
          <input
            ref={nameRef}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            onKeyDown={handleKey}
            placeholder="Name *"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </td>
        <td className="px-4 py-2">
          <input
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            onKeyDown={handleKey}
            placeholder="Role"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </td>
        <td className="px-4 py-2">
          <input
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            onKeyDown={handleKey}
            placeholder="Email"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </td>
        <td className="px-4 py-2">
          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center w-7 h-7 rounded bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition-colors"
              title="Save"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onCancel}
              className="flex items-center justify-center w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>
      {error && (
        <tr className="bg-red-50">
          <td colSpan={4} className="px-4 py-1 text-xs text-red-600">{error}</td>
        </tr>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// MemberRow – single row, switches to inline edit mode
// ---------------------------------------------------------------------------

interface MemberRowProps {
  member: Member;
  onUpdated: (member: Member) => void;
  onDeleted: (id: number) => void;
}

function MemberRow({ member, onUpdated, onDeleted }: MemberRowProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditingMember>({ name: member.name, role: member.role, email: member.email });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) nameRef.current?.focus(); }, [editing]);

  const cancelEdit = () => {
    setEditing(false);
    setError(null);
    setForm({ name: member.name, role: member.role, email: member.email });
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    setError(null);
    try {
      const updated = await apiFetch<Member>(`/teams/members/${member.id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      onUpdated(updated);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update member');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Remove ${member.name} from the team?`)) return;
    setDeleting(true);
    try {
      await apiFetch(`/teams/members/${member.id}`, { method: 'DELETE' });
      onDeleted(member.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete member');
      setDeleting(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') cancelEdit();
  };

  if (editing) {
    return (
      <>
        <tr className="bg-yellow-50">
          <td className="px-4 py-2">
            <input
              ref={nameRef}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              onKeyDown={handleKey}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </td>
          <td className="px-4 py-2">
            <input
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              onKeyDown={handleKey}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </td>
          <td className="px-4 py-2">
            <input
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              onKeyDown={handleKey}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </td>
          <td className="px-4 py-2">
            <div className="flex items-center gap-1">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center w-7 h-7 rounded bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition-colors"
                title="Save"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center justify-center w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </td>
        </tr>
        {error && (
          <tr className="bg-red-50">
            <td colSpan={4} className="px-4 py-1 text-xs text-red-600">{error}</td>
          </tr>
        )}
      </>
    );
  }

  return (
    <tr className="hover:bg-gray-50 transition-colors group">
      <td className="px-4 py-3 text-sm font-medium text-gray-900">{member.name}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{member.role || <span className="text-gray-400 italic">—</span>}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{member.email || <span className="text-gray-400 italic">—</span>}</td>
      <td className="px-4 py-3">
        {error && <p className="text-xs text-red-500 mb-1">{error}</p>}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditing(true)}
            className="flex items-center justify-center w-7 h-7 rounded hover:bg-indigo-100 text-indigo-600 transition-colors"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center justify-center w-7 h-7 rounded hover:bg-red-100 text-red-500 transition-colors disabled:opacity-40"
            title="Delete"
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// TeamSection – card per team
// ---------------------------------------------------------------------------

interface TeamSectionProps {
  teamName: TeamName;
  color: string;
  members: Member[];
  onMemberAdded: (member: Member) => void;
  onMemberUpdated: (member: Member) => void;
  onMemberDeleted: (id: number) => void;
}

function TeamSection({ teamName, color, members, onMemberAdded, onMemberUpdated, onMemberDeleted }: TeamSectionProps) {
  const [adding, setAdding] = useState(false);

  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-600',
    purple: 'bg-purple-100 text-purple-600',
    pink:   'bg-pink-100 text-pink-600',
    blue:   'bg-blue-100 text-blue-600',
    green:  'bg-green-100 text-green-600',
    amber:  'bg-amber-100 text-amber-600',
  };
  const iconClass = colorMap[color] ?? 'bg-gray-100 text-gray-600';

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconClass}`}>
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">{teamName}</h3>
            <p className="text-xs text-gray-500">{members.length} member{members.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={() => setAdding(true)}
          disabled={adding}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Member
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Name</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Role</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-2.5 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.length === 0 && !adding && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-400 italic">
                  No members yet — click Add Member to get started.
                </td>
              </tr>
            )}
            {members.map((m) => (
              <MemberRow
                key={m.id}
                member={m}
                onUpdated={onMemberUpdated}
                onDeleted={onMemberDeleted}
              />
            ))}
            {adding && (
              <AddMemberRow
                team={teamName}
                onSaved={(m) => { onMemberAdded(m); setAdding(false); }}
                onCancel={() => setAdding(false)}
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Teams page
// ---------------------------------------------------------------------------

export function Teams() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Member[]>('/teams/members')
      .then((data) => setMembers(data))
      .catch((e) => setFetchError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const membersForTeam = (team: TeamName) => members.filter((m) => m.team === team);

  const handleAdded   = (m: Member) => setMembers((prev) => [...prev, m]);
  const handleUpdated = (updated: Member) => setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  const handleDeleted = (id: number) => setMembers((prev) => prev.filter((m) => m.id !== id));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Teams</h1>
        <p className="text-gray-600">Manage departments and team members</p>
      </div>

      {fetchError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          Failed to load team members: {fetchError}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24 gap-3 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading teams…</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {TEAMS.map(({ name, color }) => (
            <TeamSection
              key={name}
              teamName={name}
              color={color}
              members={membersForTeam(name)}
              onMemberAdded={handleAdded}
              onMemberUpdated={handleUpdated}
              onMemberDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
