"use client";

import { FileClock } from "lucide-react";

type AuditLog = {
  id: number;
  userEmail?: string;
  method: string;
  path: string;
  changedData: unknown;
  occurredAt: string;
};

export function AuditLogList() {
  const logs = mockLogs;

  return (
    <div>
      <header className="border-b pb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#eb0907]">
          Rastreabilidade
        </p>
        <h1 className="mt-2 font-heading text-4xl font-semibold">Auditoria</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Operações de escrita, usuário responsável e dados alterados.
        </p>
      </header>
      <section className="mt-6 overflow-hidden rounded border bg-white shadow-sm">
        {logs.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-sm text-muted-foreground">
            <FileClock className="mb-3 size-6" />
            Nenhuma operação registrada nesta execução.
          </div>
        ) : (
          <div className="divide-y">
            {logs.map((log) => (
              <article
                key={log.id}
                className="grid gap-3 p-5 lg:grid-cols-[160px_1fr_240px]"
              >
                <div>
                  <strong className="rounded bg-[#0f0000] px-2 py-1 text-[10px] text-white">
                    {log.method}
                  </strong>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(log.occurredAt).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">{log.path}</p>
                  <pre className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
                    {JSON.stringify(log.changedData, null, 2)}
                  </pre>
                </div>
                <p className="text-xs text-muted-foreground">
                  {log.userEmail ?? "Usuário não identificado"}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const mockLogs: AuditLog[] = [
  {
    id: 1,
    userEmail: "admin@libra.com.br",
    method: "PUT",
    path: "/clientes/1",
    changedData: { nome: "Henry Townshend", operacao: "Dados atualizados" },
    occurredAt: "2026-08-25T16:20:00.000Z",
  },
  {
    id: 2,
    userEmail: "admin@libra.com.br",
    method: "POST",
    path: "/pedidos/VEN-000004/status",
    changedData: { de: "EM PROCESSAMENTO", para: "PAGAMENTO REALIZADO" },
    occurredAt: "2026-08-25T17:05:00.000Z",
  },
];
