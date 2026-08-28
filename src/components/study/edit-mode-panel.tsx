'use client';

import { useState } from 'react';
import { Check, FileCode2, LoaderCircle, ShieldAlert } from 'lucide-react';

type Proposal = { id: string; path: string; explanation: string; diff: string };

export function EditModePanel() {
  const [token, setToken] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [filePath, setFilePath] = useState('content/docs/lessons/13.mdx');
  const [instruction, setInstruction] = useState('');
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function callApi(url: string, body: unknown) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Edit-Token': token },
      body: JSON.stringify(body),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) throw new Error(payload?.error || 'Operacja nie powiodła się.');
    return payload as Record<string, unknown>;
  }

  async function unlock() {
    setLoading(true);
    setError('');
    try {
      const payload = await callApi('/api/edit/repo', { action: 'list' });
      const listed = Array.isArray(payload.files) ? payload.files.filter((item): item is string => typeof item === 'string') : [];
      setFiles(listed);
      if (listed.length && !listed.includes(filePath)) setFilePath(listed[0]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Nie udało się odblokować Edit Mode.');
    } finally {
      setLoading(false);
    }
  }

  async function propose() {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const payload = await callApi('/api/edit/propose', { path: filePath, instruction });
      setProposal(payload.proposal as Proposal);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Nie udało się utworzyć propozycji.');
    } finally {
      setLoading(false);
    }
  }

  async function decide(action: 'apply' | 'cancel') {
    if (!proposal) return;
    setLoading(true);
    setError('');
    try {
      const payload = await callApi('/api/edit/apply', { proposalId: proposal.id, action });
      if (action === 'apply') {
        const applied = payload.applied as { backupPath?: string } | undefined;
        setMessage(`Zastosowano zmianę.${applied?.backupPath ? ` Kopia: ${applied.backupPath}` : ''}`);
      } else {
        setMessage('Propozycja została odrzucona.');
      }
      setProposal(null);
      setInstruction('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Nie udało się zakończyć operacji.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="border-l-2 border-amber-500/70 pl-3">
        <p className="flex items-center gap-2 text-xs font-semibold">
          <ShieldAlert className="size-4 text-amber-600" aria-hidden="true" /> Tryb deweloperski
        </p>
        <p className="mt-2 text-xs leading-5 text-fd-muted-foreground">
          Działa tylko lokalnie, po włączeniu zmiennych środowiskowych. Study Mode nigdy nie wywołuje tych endpointów.
        </p>
      </div>

      {files.length === 0 ? (
        <form
          className="mt-6"
          onSubmit={(event) => {
            event.preventDefault();
            unlock();
          }}
        >
          <label htmlFor="edit-token" className="text-xs font-medium">Token Edit Mode</label>
          <input
            id="edit-token"
            type="password"
            value={token}
            onChange={(event) => {
              setToken(event.target.value);
              setFiles([]);
              setProposal(null);
              setMessage('');
              setError('');
            }}
            autoComplete="off"
            className="mt-2 min-h-11 w-full rounded-md border border-fd-border bg-fd-background px-3 text-sm outline-none focus:border-fd-primary"
            placeholder="EDIT_MODE_TOKEN"
          />
          <button
            type="submit"
            disabled={!token.trim() || loading}
            className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-md bg-fd-primary px-3 text-xs font-medium text-fd-primary-foreground disabled:opacity-45"
          >
            {loading ? <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" /> : null}
            Odblokuj
          </button>
        </form>
      ) : proposal ? (
        <div className="mt-6">
          <p className="flex items-center gap-2 text-xs font-semibold"><FileCode2 className="size-4" aria-hidden="true" /> {proposal.path}</p>
          <p className="mt-3 text-xs leading-5 text-fd-muted-foreground">{proposal.explanation}</p>
          <div className="mt-4 max-h-[50vh] overflow-auto rounded-md border border-fd-border bg-fd-muted/35">
            <pre className="min-w-max p-3 text-[11px] leading-5"><code>{proposal.diff}</code></pre>
          </div>
          <p className="mt-3 text-[11px] leading-5 text-fd-muted-foreground">
            Zapis nastąpi dopiero po kliknięciu „Zastosuj”. Serwer ponownie sprawdzi plik i token.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => decide('apply')}
              disabled={loading}
              className="min-h-10 rounded-md bg-fd-primary px-3 text-xs font-medium text-fd-primary-foreground disabled:opacity-45"
            >
              Zastosuj
            </button>
            <button
              type="button"
              onClick={() => decide('cancel')}
              disabled={loading}
              className="min-h-10 rounded-md border border-fd-border px-3 text-xs font-medium hover:bg-fd-muted disabled:opacity-45"
            >
              Anuluj
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <label htmlFor="edit-file" className="text-xs font-medium">Dozwolony plik</label>
          <select
            id="edit-file"
            value={filePath}
            onChange={(event) => setFilePath(event.target.value)}
            className="mt-2 min-h-11 w-full rounded-md border border-fd-border bg-fd-background px-3 text-xs outline-none focus:border-fd-primary"
          >
            {files.map((file) => <option key={file} value={file}>{file}</option>)}
          </select>
          <label htmlFor="edit-instruction" className="mt-5 block text-xs font-medium">Co zmienić?</label>
          <textarea
            id="edit-instruction"
            rows={6}
            value={instruction}
            onChange={(event) => setInstruction(event.target.value)}
            className="mt-2 w-full resize-none rounded-md border border-fd-border bg-fd-background p-3 text-sm leading-6 outline-none focus:border-fd-primary"
            placeholder="Np. uprość wyjaśnienie mit + Dativ, nie zmieniając przykładów."
          />
          <button
            type="button"
            onClick={propose}
            disabled={instruction.trim().length < 3 || loading}
            className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-md bg-fd-primary px-3 text-xs font-medium text-fd-primary-foreground disabled:opacity-45"
          >
            {loading ? <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" /> : null}
            Przygotuj diff
          </button>
        </div>
      )}

      {message ? <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-emerald-700 dark:text-emerald-400"><Check className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" /> {message}</p> : null}
      {error ? <p className="mt-5 text-xs leading-5 text-red-700 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
