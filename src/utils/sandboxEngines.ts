// Real In-Browser Execution Engines for Aksh Code Sandbox:
// 1. Sandboxed Web Worker JavaScript Runner (with infinite-loop timeout guard)
// 2. Deterministic Relational SQL Engine (CREATE, INSERT, SELECT, JOIN, WHERE, ORDER BY, LIMIT, Aggregates)
// 3. Lazy Pyodide WebAssembly CPython 3.12 Runtime

export interface JsExecutionResult {
  logs: Array<{ level: 'log' | 'warn' | 'error' | 'result'; text: string }>;
  error?: string;
  durationMs: number;
}

export async function executeJsInWorker(code: string, timeoutMs = 3500): Promise<JsExecutionResult> {
  const start = performance.now();

  const workerBootstrap = `
    self.onmessage = async function(ev) {
      const src = ev.data.code;
      const logs = [];
      const formatVal = (v) => {
        if (v === undefined) return 'undefined';
        if (v === null) return 'null';
        if (typeof v === 'string') return v;
        if (typeof v === 'function') return '[Function ' + (v.name || 'anonymous') + ']';
        try { return JSON.stringify(v, null, 2); } catch { return String(v); }
      };
      const origConsole = {
        log: (...args) => logs.push({ level: 'log', text: args.map(formatVal).join(' ') }),
        info: (...args) => logs.push({ level: 'log', text: args.map(formatVal).join(' ') }),
        warn: (...args) => logs.push({ level: 'warn', text: args.map(formatVal).join(' ') }),
        error: (...args) => logs.push({ level: 'error', text: args.map(formatVal).join(' ') }),
        table: (data) => logs.push({ level: 'log', text: formatVal(data) }),
      };
      const console = origConsole;
      try {
        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        const fn = new AsyncFunction('console', src);
        const returnVal = await fn(console);
        if (returnVal !== undefined) {
          logs.push({ level: 'result', text: '=> ' + formatVal(returnVal) });
        }
        self.postMessage({ ok: true, logs });
      } catch (err) {
        self.postMessage({
          ok: false,
          logs,
          error: (err && err.name ? err.name + ': ' : '') + (err && err.message ? err.message : String(err))
        });
      }
    };
  `;

  return new Promise((resolve) => {
    const blob = new Blob([workerBootstrap], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

    let finished = false;
    const timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        worker.terminate();
        URL.revokeObjectURL(workerUrl);
        resolve({
          logs: [],
          error: `Execution timed out after ${timeoutMs}ms (infinite loop protection triggered).`,
          durationMs: Math.round(performance.now() - start),
        });
      }
    }, timeoutMs);

    worker.onmessage = (e) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      resolve({
        logs: e.data.logs || [],
        error: e.data.error,
        durationMs: Math.round((performance.now() - start) * 100) / 100,
      });
    };

    worker.onerror = (err) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      resolve({
        logs: [],
        error: err.message || 'Worker syntax or runtime error',
        durationMs: Math.round((performance.now() - start) * 100) / 100,
      });
    };

    worker.postMessage({ code });
  });
}

// ---------- IN-MEMORY RELATIONAL SQL ENGINE ----------

export interface SqlResultSet {
  statement: string;
  columns: string[];
  rows: Record<string, any>[];
}

export interface SqlExecutionOutput {
  results: SqlResultSet[];
  logs: string[];
  error?: string;
  durationMs: number;
}

function splitSqlStatements(sql: string): string[] {
  // Strip block comments and line comments outside single quotes
  let cleaned = '';
  let inSingle = false;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const next = sql[i + 1];
    if (!inSingle && ch === '-' && next === '-') {
      while (i < sql.length && sql[i] !== '\n') i++;
      cleaned += '\n';
      continue;
    }
    if (!inSingle && ch === '/' && next === '*') {
      i += 2;
      while (i < sql.length && !(sql[i] === '*' && sql[i + 1] === '/')) i++;
      i++;
      continue;
    }
    if (ch === "'" && sql[i - 1] !== '\\') {
      inSingle = !inSingle;
    }
    cleaned += ch;
  }

  const stmts: string[] = [];
  let buf = '';
  inSingle = false;
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (ch === "'" && cleaned[i - 1] !== '\\') inSingle = !inSingle;
    if (ch === ';' && !inSingle) {
      if (buf.trim()) stmts.push(buf.trim());
      buf = '';
    } else {
      buf += ch;
    }
  }
  if (buf.trim()) stmts.push(buf.trim());
  return stmts;
}

function splitTopLevelCommas(input: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let inSingle = false;
  let buf = '';
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "'" && input[i - 1] !== '\\') inSingle = !inSingle;
    if (!inSingle) {
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
    }
    if (ch === ',' && depth === 0 && !inSingle) {
      parts.push(buf.trim());
      buf = '';
    } else {
      buf += ch;
    }
  }
  if (buf.trim()) parts.push(buf.trim());
  return parts;
}

function parseSqlLiteral(token: string): any {
  const t = token.trim();
  if (/^NULL$/i.test(t)) return null;
  if (/^TRUE$/i.test(t)) return true;
  if (/^FALSE$/i.test(t)) return false;
  if (/^CURRENT_TIMESTAMP$/i.test(t)) return new Date().toISOString();
  if (t.startsWith("'") && t.endsWith("'")) {
    return t.slice(1, -1).replace(/''/g, "'");
  }
  if (!Number.isNaN(Number(t)) && t !== '') {
    return Number(t);
  }
  return t;
}

function evalWhereClause(row: Record<string, any>, whereExpr: string): boolean {
  const orParts = whereExpr.split(/\s+OR\s+/i);
  return orParts.some((orPart) => {
    const andParts = orPart.split(/\s+AND\s+/i);
    return andParts.every((cond) => {
      const m = cond.trim().match(/^([a-zA-Z0-9_.]+)\s*(=|!=|<>|>=|<=|>|<|LIKE)\s*(.+)$/i);
      if (!m) return true;
      const [, rawCol, op, rawVal] = m;
      const colKey = rawCol.includes('.') && !(rawCol in row) ? rawCol.split('.').pop()! : rawCol;
      const rowVal = rawCol in row ? row[rawCol] : row[colKey];
      const target = parseSqlLiteral(rawVal);

      switch (op.toUpperCase()) {
        case '=':
          return String(rowVal ?? '') === String(target ?? '');
        case '!=':
        case '<>':
          return String(rowVal ?? '') !== String(target ?? '');
        case '>':
          return Number(rowVal) > Number(target);
        case '<':
          return Number(rowVal) < Number(target);
        case '>=':
          return Number(rowVal) >= Number(target);
        case '<=':
          return Number(rowVal) <= Number(target);
        case 'LIKE': {
          const pattern = String(target).replace(/%/g, '.*').replace(/_/g, '.');
          return new RegExp(`^${pattern}$`, 'i').test(String(rowVal ?? ''));
        }
        default:
          return true;
      }
    });
  });
}

export function executeSqlStatements(sql: string): SqlExecutionOutput {
  const start = performance.now();
  const tables: Record<string, { columns: string[]; rows: Record<string, any>[]; autoId: number }> = {};
  const results: SqlResultSet[] = [];
  const logs: string[] = [];

  try {
    const statements = splitSqlStatements(sql);
    if (statements.length === 0) {
      return {
        results: [],
        logs: ['No SQL statements found to execute.'],
        durationMs: 0,
      };
    }

    for (const stmt of statements) {
      const upper = stmt.toUpperCase();

      // CREATE TABLE
      if (upper.startsWith('CREATE TABLE')) {
        const m = stmt.match(/^CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s*\(([\s\S]+)\)$/i);
        if (!m) throw new Error(`Syntax error near CREATE TABLE: "${stmt.slice(0, 60)}"`);
        const tableName = m[1];
        const colDefs = splitTopLevelCommas(m[2]).filter(
          (d) => !/^(?:PRIMARY|FOREIGN|UNIQUE|CHECK|CONSTRAINT)\b/i.test(d)
        );
        const columns = colDefs.map((d) => d.trim().split(/\s+/)[0].replace(/["`]/g, ''));
        if (!tables[tableName]) {
          tables[tableName] = { columns, rows: [], autoId: 1 };
          logs.push(`CREATE TABLE ${tableName} (${columns.join(', ')})`);
        } else {
          logs.push(`Table ${tableName} already exists.`);
        }
        continue;
      }

      // INSERT INTO
      if (upper.startsWith('INSERT INTO')) {
        const m = stmt.match(
          /^INSERT\s+INTO\s+([a-zA-Z0-9_]+)\s*(?:\(([^)]+)\))?\s*VALUES\s*([\s\S]+)$/i
        );
        if (!m) throw new Error(`Syntax error in INSERT INTO: "${stmt.slice(0, 60)}"`);
        const tableName = m[1];
        const tbl = tables[tableName];
        if (!tbl) throw new Error(`Table "${tableName}" does not exist.`);

        const targetCols = m[2]
          ? m[2].split(',').map((c) => c.trim().replace(/["`]/g, ''))
          : tbl.columns;

        // Parse multiple (...), (...) tuples
        const tuples: string[] = [];
        let depth = 0;
        let inSingle = false;
        let buf = '';
        for (let i = 0; i < m[3].length; i++) {
          const ch = m[3][i];
          if (ch === "'" && m[3][i - 1] !== '\\') inSingle = !inSingle;
          if (!inSingle) {
            if (ch === '(') {
              if (depth === 0) buf = '';
              else buf += ch;
              depth++;
              continue;
            }
            if (ch === ')') {
              depth--;
              if (depth === 0) {
                tuples.push(buf);
                continue;
              }
            }
          }
          if (depth > 0) buf += ch;
        }

        tuples.forEach((tupleStr) => {
          const vals = splitTopLevelCommas(tupleStr).map(parseSqlLiteral);
          const rowObj: Record<string, any> = {};
          tbl.columns.forEach((c) => {
            rowObj[c] = c === 'id' ? tbl.autoId : null;
          });
          targetCols.forEach((col, idx) => {
            rowObj[col] = vals[idx] !== undefined ? vals[idx] : null;
          });
          tbl.autoId++;
          tbl.rows.push(rowObj);
        });

        logs.push(`INSERT INTO ${tableName}: ${tuples.length} row(s) inserted.`);
        continue;
      }

      // DELETE FROM
      if (upper.startsWith('DELETE FROM')) {
        const m = stmt.match(/^DELETE\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+([\s\S]+))?$/i);
        if (!m) throw new Error(`Syntax error in DELETE: "${stmt.slice(0, 60)}"`);
        const tbl = tables[m[1]];
        if (!tbl) throw new Error(`Table "${m[1]}" does not exist.`);
        const before = tbl.rows.length;
        tbl.rows = m[2] ? tbl.rows.filter((r) => !evalWhereClause(r, m[2])) : [];
        logs.push(`DELETE FROM ${m[1]}: ${before - tbl.rows.length} row(s) deleted.`);
        continue;
      }

      // UPDATE
      if (upper.startsWith('UPDATE')) {
        const m = stmt.match(
          /^UPDATE\s+([a-zA-Z0-9_]+)\s+SET\s+([\s\S]+?)(?:\s+WHERE\s+([\s\S]+))?$/i
        );
        if (!m) throw new Error(`Syntax error in UPDATE: "${stmt.slice(0, 60)}"`);
        const tbl = tables[m[1]];
        if (!tbl) throw new Error(`Table "${m[1]}" does not exist.`);
        const assignments = splitTopLevelCommas(m[2]).map((a) => {
          const eq = a.indexOf('=');
          return {
            col: a.slice(0, eq).trim(),
            val: parseSqlLiteral(a.slice(eq + 1)),
          };
        });
        let updated = 0;
        tbl.rows = tbl.rows.map((r) => {
          if (!m[3] || evalWhereClause(r, m[3])) {
            updated++;
            const copy = { ...r };
            assignments.forEach((a) => {
              copy[a.col] = a.val;
            });
            return copy;
          }
          return r;
        });
        logs.push(`UPDATE ${m[1]}: ${updated} row(s) updated.`);
        continue;
      }

      // SELECT
      if (upper.startsWith('SELECT')) {
        const selectMatch = stmt.match(
          /^SELECT\s+([\s\S]+?)\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+(?:AS\s+)?([a-zA-Z0-9_]+))?([\s\S]*)$/i
        );
        if (!selectMatch) throw new Error(`Syntax error in SELECT: "${stmt.slice(0, 60)}"`);

        const [, selectColsRaw, baseTableName, rawAlias, tail] = selectMatch;
        const baseTbl = tables[baseTableName];
        if (!baseTbl) throw new Error(`Table "${baseTableName}" does not exist.`);

        const baseAlias =
          rawAlias && !/^(?:INNER|LEFT|JOIN|WHERE|ORDER|LIMIT|GROUP)$/i.test(rawAlias)
            ? rawAlias
            : baseTableName;
        const remainder =
          rawAlias && baseAlias === baseTableName ? `${rawAlias} ${tail}`.trim() : tail.trim();

        // Build prefixed working rows
        let workingRows: Record<string, any>[] = baseTbl.rows.map((r) => {
          const prefixed: Record<string, any> = { ...r };
          Object.keys(r).forEach((k) => {
            prefixed[`${baseAlias}.${k}`] = r[k];
            prefixed[`${baseTableName}.${k}`] = r[k];
          });
          return prefixed;
        });

        // Parse optional JOINs
        let rest = remainder;
        const joinRegex =
          /^(?:(INNER|LEFT)\s+)?JOIN\s+([a-zA-Z0-9_]+)(?:\s+(?:AS\s+)?([a-zA-Z0-9_]+))?\s+ON\s+([a-zA-Z0-9_.]+)\s*=\s*([a-zA-Z0-9_.]+)\s*([\s\S]*)$/i;
        let jm: RegExpMatchArray | null;
        while ((jm = rest.match(joinRegex)) !== null) {
          const [, joinType, joinTableName, joinAliasRaw, leftKey, rightKey, afterJoin] = jm;
          const jTbl = tables[joinTableName];
          if (!jTbl) throw new Error(`Joined table "${joinTableName}" does not exist.`);
          const jAlias = joinAliasRaw || joinTableName;

          const nextRows: Record<string, any>[] = [];
          for (const lRow of workingRows) {
            let matchedAny = false;
            for (const rRow of jTbl.rows) {
              const rPrefixed: Record<string, any> = {};
              Object.keys(rRow).forEach((k) => {
                rPrefixed[`${jAlias}.${k}`] = rRow[k];
                rPrefixed[`${joinTableName}.${k}`] = rRow[k];
                if (!(k in lRow)) rPrefixed[k] = rRow[k];
              });

              const candidate = { ...lRow, ...rPrefixed };
              const lVal = candidate[leftKey] ?? lRow[leftKey.split('.').pop()!];
              const rVal = candidate[rightKey] ?? rRow[rightKey.split('.').pop()!];
              if (lVal !== undefined && rVal !== undefined && String(lVal) === String(rVal)) {
                matchedAny = true;
                nextRows.push(candidate);
              }
            }
            if (!matchedAny && joinType?.toUpperCase() === 'LEFT') {
              nextRows.push({ ...lRow });
            }
          }
          workingRows = nextRows;
          rest = afterJoin.trim();
        }

        // Parse WHERE / ORDER BY / LIMIT
        const whereMatch = rest.match(/\bWHERE\s+([\s\S]+?)(?=\bORDER\s+BY\b|\bLIMIT\b|$)/i);
        if (whereMatch) {
          workingRows = workingRows.filter((r) => evalWhereClause(r, whereMatch[1].trim()));
        }

        const orderMatch = rest.match(/\bORDER\s+BY\s+([a-zA-Z0-9_.]+)(?:\s+(ASC|DESC))?/i);
        if (orderMatch) {
          const [, orderCol, dir] = orderMatch;
          const desc = dir?.toUpperCase() === 'DESC';
          const fallbackKey = orderCol.split('.').pop()!;
          workingRows.sort((a, b) => {
            const av = a[orderCol] ?? a[fallbackKey];
            const bv = b[orderCol] ?? b[fallbackKey];
            if (typeof av === 'number' && typeof bv === 'number') {
              return desc ? bv - av : av - bv;
            }
            return desc
              ? String(bv ?? '').localeCompare(String(av ?? ''))
              : String(av ?? '').localeCompare(String(bv ?? ''));
          });
        }

        const limitMatch = rest.match(/\bLIMIT\s+(\d+)/i);
        if (limitMatch) {
          workingRows = workingRows.slice(0, parseInt(limitMatch[1], 10));
        }

        // Projection & Aggregates
        const rawProj = splitTopLevelCommas(selectColsRaw);
        const hasAgg = rawProj.some((p) => /^(?:COUNT|SUM|AVG|MIN|MAX)\s*\(/i.test(p));

        let outputCols: string[] = [];
        let outputRows: Record<string, any>[] = [];

        if (hasAgg) {
          const aggRow: Record<string, any> = {};
          rawProj.forEach((expr) => {
            const aliasMatch = expr.match(/^([\s\S]+?)\s+AS\s+([a-zA-Z0-9_]+)$/i);
            const cleanExpr = aliasMatch ? aliasMatch[1].trim() : expr.trim();
            const label = aliasMatch ? aliasMatch[2] : cleanExpr;
            outputCols.push(label);

            const aggM = cleanExpr.match(/^(COUNT|SUM|AVG|MIN|MAX)\s*\(\s*([a-zA-Z0-9_.*]+)\s*\)$/i);
            if (aggM) {
              const fn = aggM[1].toUpperCase();
              const targetCol = aggM[2];
              if (fn === 'COUNT') {
                aggRow[label] =
                  targetCol === '*'
                    ? workingRows.length
                    : workingRows.filter((r) => (r[targetCol] ?? r[targetCol.split('.').pop()!]) != null).length;
              } else {
                const nums = workingRows
                  .map((r) => Number(r[targetCol] ?? r[targetCol.split('.').pop()!]))
                  .filter((n) => !Number.isNaN(n));
                if (fn === 'SUM') aggRow[label] = nums.reduce((a, b) => a + b, 0);
                else if (fn === 'AVG')
                  aggRow[label] = nums.length
                    ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 1000) / 1000
                    : null;
                else if (fn === 'MIN') aggRow[label] = nums.length ? Math.min(...nums) : null;
                else if (fn === 'MAX') aggRow[label] = nums.length ? Math.max(...nums) : null;
              }
            }
          });
          outputRows = [aggRow];
        } else if (rawProj.length === 1 && rawProj[0] === '*') {
          // Use unprefixed columns from base & joined rows cleanly
          const keySet = new Set<string>();
          workingRows.forEach((r) => {
            Object.keys(r).forEach((k) => {
              if (!k.includes('.')) keySet.add(k);
            });
          });
          outputCols = keySet.size > 0 ? Array.from(keySet) : baseTbl.columns;
          outputRows = workingRows.map((r) => {
            const clean: Record<string, any> = {};
            outputCols.forEach((c) => {
              clean[c] = r[c] ?? null;
            });
            return clean;
          });
        } else {
          const projDefs = rawProj.map((p) => {
            const aliasMatch = p.match(/^([\s\S]+?)\s+AS\s+([a-zA-Z0-9_]+)$/i);
            const expr = aliasMatch ? aliasMatch[1].trim() : p.trim();
            const label = aliasMatch ? aliasMatch[2] : expr.includes('.') ? expr.split('.').pop()! : expr;
            return { expr, label };
          });
          outputCols = projDefs.map((d) => d.label);
          outputRows = workingRows.map((r) => {
            const obj: Record<string, any> = {};
            projDefs.forEach((d) => {
              obj[d.label] =
                r[d.expr] !== undefined ? r[d.expr] : r[d.expr.split('.').pop()!] ?? null;
            });
            return obj;
          });
        }

        results.push({ statement: stmt, columns: outputCols, rows: outputRows });
        logs.push(`SELECT returned ${outputRows.length} row(s).`);
        continue;
      }

      logs.push(`Executed: ${stmt.slice(0, 60)}`);
    }

    return {
      results,
      logs,
      durationMs: Math.round((performance.now() - start) * 100) / 100,
    };
  } catch (err: any) {
    return {
      results,
      logs,
      error: err?.message || 'SQL execution error',
      durationMs: Math.round((performance.now() - start) * 100) / 100,
    };
  }
}

// ---------- LAZY PYODIDE WEBASSEMBLY PYTHON RUNTIME ----------

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<any>;
    __akshPyodidePromise?: Promise<any>;
  }
}

async function getPyodideRuntime(): Promise<any> {
  if (!window.__akshPyodidePromise) {
    window.__akshPyodidePromise = (async () => {
      if (!window.loadPyodide) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () =>
            reject(new Error('Unable to load WebAssembly Python runtime (Pyodide CDN unreachable).'));
          document.head.appendChild(script);
        });
      }
      return await window.loadPyodide!({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/',
      });
    })();
  }
  return window.__akshPyodidePromise;
}

export async function executePythonInPyodide(code: string): Promise<{
  stdout: string;
  stderr?: string;
  durationMs: number;
}> {
  const start = performance.now();
  const pyodide = await getPyodideRuntime();

  await pyodide.runPythonAsync(`
import sys, io
_aksh_stdout = io.StringIO()
_aksh_stderr = io.StringIO()
sys.stdout = _aksh_stdout
sys.stderr = _aksh_stderr
`);

  let execError: string | undefined;
  try {
    await pyodide.runPythonAsync(code);
  } catch (err: any) {
    execError = err?.message || String(err);
  }

  const stdout = pyodide.runPython('_aksh_stdout.getvalue()') as string;
  const stderr = pyodide.runPython('_aksh_stderr.getvalue()') as string;

  return {
    stdout: stdout || '',
    stderr: execError || (stderr ? stderr : undefined),
    durationMs: Math.round((performance.now() - start) * 100) / 100,
  };
}
