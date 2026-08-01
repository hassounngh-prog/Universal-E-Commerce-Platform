import { Prisma, prisma } from "@/shared/lib/prisma";
import type {
  SearchDocument,
  SearchHit,
  SearchProvider,
  SearchQuery,
  SearchResult,
} from "../../core/search/search-provider.interface";
import type { SearchProviderSettings } from "../../shared/types/provider-settings";

interface SearchDocumentRow {
  id: string;
  index: string;
  fields: unknown;
}

export class PostgresSearchProvider implements SearchProvider {
  readonly id = "postgres";
  readonly name = "Postgres Full-Text Search";

  private readonly settings: SearchProviderSettings;

  constructor(settings: SearchProviderSettings) {
    this.settings = settings;
  }

  async indexDocument(document: SearchDocument): Promise<void> {
    await prisma.searchDocument.upsert({
      where: { id: document.id },
      create: {
        id: document.id,
        index: document.index,
        fields: document.fields as Prisma.InputJsonValue,
      },
      update: {
        index: document.index,
        fields: document.fields as Prisma.InputJsonValue,
      },
    });
  }

  async bulkIndexDocuments(documents: SearchDocument[]): Promise<void> {
    await prisma.$transaction(
      documents.map((document) =>
        prisma.searchDocument.upsert({
          where: { id: document.id },
          create: {
            id: document.id,
            index: document.index,
            fields: document.fields as Prisma.InputJsonValue,
          },
          update: {
            index: document.index,
            fields: document.fields as Prisma.InputJsonValue,
          },
        }),
      ),
    );
  }

  async deleteDocument(index: string, id: string): Promise<void> {
    await prisma.searchDocument.deleteMany({
      where: { id, index },
    });
  }

  async search(query: SearchQuery): Promise<SearchResult> {
    const startedAt = performance.now();
    const index = query.index ?? this.settings.defaultIndex;
    const text = query.text?.trim();
    const from = query.from ?? 0;
    const size = query.size ?? 20;

    if (!text) {
      const rows = await prisma.searchDocument.findMany({
        where: { index },
        orderBy: { updatedAt: "desc" },
        skip: from,
        take: size,
      });
      const total = await prisma.searchDocument.count({ where: { index } });

      return {
        hits: rows.map((row) => this.toHit(row)),
        total,
        tookMs: Math.round(performance.now() - startedAt),
      };
    }

    const tsquery = Prisma.sql`websearch_to_tsquery('simple', ${text})`;

    const rows = await prisma.$queryRaw<SearchDocumentRow[]>`
      SELECT id, index, fields
      FROM search_documents
      WHERE index = ${index}
        AND searchable @@ ${tsquery}
      ORDER BY ts_rank_cd(searchable, ${tsquery}) DESC
      LIMIT ${size} OFFSET ${from}
    `;

    const countRows = await prisma.$queryRaw<{ total: bigint }[]>`
      SELECT COUNT(*)::bigint AS total
      FROM search_documents
      WHERE index = ${index}
        AND searchable @@ ${tsquery}
    `;

    const total = Number(countRows[0]?.total ?? BigInt(0));

    return {
      hits: rows.map((row) => this.toHit(row)),
      total,
      tookMs: Math.round(performance.now() - startedAt),
    };
  }

  async createIndex(index: string, mapping?: Record<string, unknown>): Promise<void> {
    void index;
    void mapping;
  }

  async deleteIndex(index: string): Promise<void> {
    await prisma.searchDocument.deleteMany({ where: { index } });
  }

  private toHit(row: SearchDocumentRow): SearchHit {
    return {
      id: row.id,
      score: 1,
      fields: (row.fields as Record<string, unknown>) ?? {},
    };
  }
}
