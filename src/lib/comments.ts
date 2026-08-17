// ---------------------------------------------------------------------------
// Weekly-report commentary ("nhận định tuần") — the one part of the report
// that isn't tabular rows: per week, per brand, a free-text evaluation, a
// proposals block, and one note per report category.
//
// Shape: { [week]: { [brand]: { evaluation, proposals, categories: {...} } } }
//
// Lives in src/lib (not src/server) because both sides need the exact same
// merge semantics: the client merges when a sync request can't reach the
// server (App.tsx's offline fallback), the server merges in POST
// /api/sync-data. Same reason backupMailer.ts already reuses src/lib/export.ts
// server-side — these are pure functions with no browser or Node APIs.
// ---------------------------------------------------------------------------

export interface BrandCommentsLike {
  evaluation?: string;
  proposals?: string;
  categories?: Record<string, string>;
}

export type CommentsTree = Record<string, Record<string, BrandCommentsLike>>;

// One row per field, as written by buildFullDatabaseWorkbook's "comments"
// sheet: field is "evaluation", "proposals", or "category_<id>".
export interface CommentSheetRow {
  week?: unknown;
  brand?: unknown;
  field?: unknown;
  value?: unknown;
}

const CATEGORY_FIELD_PREFIX = "category_";

// Rebuilds the nested tree from the flat sheet the full-database export
// writes, so that export doubles as an upload template — the round trip was
// previously one-way (exported, but silently ignored on upload, leaving the
// weekly commentary to be retyped by hand).
export function commentRowsToTree(rows: CommentSheetRow[]): CommentsTree {
  const tree: CommentsTree = {};

  for (const row of rows || []) {
    const week = String(row?.week ?? "").trim();
    const brand = String(row?.brand ?? "").trim();
    const field = String(row?.field ?? "").trim();
    // Blank cells come back as null from sheet_to_json; an empty note is a
    // legitimate value (it clears the field), so only the addressing columns
    // are required here.
    if (!week || !brand || !field) continue;
    const value = row?.value == null ? "" : String(row.value);

    const byBrand = (tree[week] ||= {});
    const comments = (byBrand[brand] ||= {});

    if (field === "evaluation" || field === "proposals") {
      comments[field] = value;
    } else if (field.startsWith(CATEGORY_FIELD_PREFIX)) {
      const category = field.slice(CATEGORY_FIELD_PREFIX.length);
      if (category) (comments.categories ||= {})[category] = value;
    }
    // Anything else is a column the export never wrote — ignored rather than
    // guessed at, same policy as unknown sheets in parseSpreadsheetFile.
  }

  return tree;
}

// Deep merge, incoming wins per field. Deliberately merges three levels down
// (week → brand → field, and inside `categories`) rather than replacing a
// week's or a brand's object wholesale: an upload that only carries this
// week's evaluation for one brand must not wipe that brand's proposals and
// per-category notes, nor the other brand's entire block.
export function mergeCommentTrees(base: CommentsTree | undefined, incoming: CommentsTree | undefined): CommentsTree {
  const merged: CommentsTree = {};
  for (const [week, byBrand] of Object.entries(base || {})) {
    merged[week] = { ...(byBrand || {}) };
  }

  for (const [week, incomingByBrand] of Object.entries(incoming || {})) {
    const existingByBrand = merged[week] || {};
    const nextByBrand: Record<string, BrandCommentsLike> = { ...existingByBrand };

    for (const [brand, incomingComments] of Object.entries(incomingByBrand || {})) {
      const existing = existingByBrand[brand] || {};
      nextByBrand[brand] = {
        ...existing,
        ...(incomingComments || {}),
        categories: { ...(existing.categories || {}), ...((incomingComments || {}).categories || {}) },
      };
    }

    merged[week] = nextByBrand;
  }

  return merged;
}
