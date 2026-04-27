import { StarIcon, TrashIcon } from "@/components/icons";
import { ReviewStatus } from "@/types/admin";

export interface AdminReviewItem {
  id: string;
  author: string;
  email: string;
  city: string;
  clientId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: ReviewStatus;
}

interface AdminReviewsPanelProps {
  reviews: AdminReviewItem[];
  onChangeStatus: (reviewId: string, status: ReviewStatus) => void;
}

const toxicPattern = /(arnaque|escroc|nul|haine|raciste|insulte|fraude|vol|spam|merde|fuck|shit)/i;

export function AdminReviewsPanel({ reviews, onChangeStatus }: AdminReviewsPanelProps) {
  const publishedCount = reviews.filter((review) => review.status === "published").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text)]">Avis clients</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Modère, publie ou supprime les avis avant affichage sur le site.
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.1em] text-[var(--text-muted)]">Publiés</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--text)]">{publishedCount}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-6 text-sm text-[var(--text-muted)] md:col-span-2 xl:col-span-3">
            Aucun avis disponible.
          </div>
        ) : null}

        {reviews.map((review) => {
          const isFlagged = toxicPattern.test(review.comment);
          const statusLabel = review.status === "published" ? "Publié" : review.status === "removed" ? "Supprimé" : "Masqué";

          return (
            <article
              key={review.id}
              className={`rounded-3xl border p-5 shadow-[var(--card-shadow)] transition ${
                review.status === "removed"
                  ? "border-red-300 bg-red-50/60"
                  : isFlagged
                    ? "border-amber-300 bg-amber-50/70"
                    : "border-[var(--border)] bg-[var(--surface)]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[var(--text)]">{review.author}</p>
                  <p className="text-xs text-[var(--text-muted)]">{review.email}</p>
                  <p className="text-xs text-[var(--text-muted)]">{review.city}</p>
                </div>
                <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  {statusLabel}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <StarIcon
                    key={`${review.id}-${index}`}
                    className={`h-4 w-4 ${index < review.rating ? "text-amber-400" : "text-[var(--border)]"}`}
                  />
                ))}
              </div>

              <p className="mt-4 text-sm leading-6 text-[var(--text)]">{review.comment}</p>

              {isFlagged ? (
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
                  Contenu potentiellement sensible
                </p>
              ) : null}

              <p className="mt-3 text-xs text-[var(--text-muted)]">{review.createdAt}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onChangeStatus(review.id, "published")}
                  className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white"
                >
                  Publier
                </button>
                <button
                  type="button"
                  onClick={() => onChangeStatus(review.id, "pending")}
                  className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text)]"
                >
                  Masquer
                </button>
                <button
                  type="button"
                  onClick={() => onChangeStatus(review.id, "removed")}
                  className="inline-flex items-center gap-2 rounded-full border border-red-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-red-600"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  Supprimer
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
