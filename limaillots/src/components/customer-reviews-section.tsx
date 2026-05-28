"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRightIcon, StarIcon, UserIcon } from "@/components/icons";

export interface CustomerReviewEntry {
  id: string;
  author: string;
  city: string;
  rating: number;
  comment: string;
  photos?: string[];
  createdAt: string;
}

interface CustomerReviewsSectionProps {
  reviews: CustomerReviewEntry[];
  onSubmitted: () => void;
}

interface ClientSessionResponse {
  authenticated?: boolean;
  user?: {
    email?: string;
    fullName?: string;
  };
}

export function CustomerReviewsSection({ reviews, onSubmitted }: CustomerReviewsSectionProps) {
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch("/api/client/session", { cache: "no-store" });
        const payload = (await response.json()) as ClientSessionResponse;

        if (response.ok && payload.authenticated && payload.user) {
          setIsConnected(true);
          setFullName(payload.user.fullName ?? "");
          setEmail(payload.user.email ?? "");
        }
      } catch {
        // Anonymous fallback.
      } finally {
        setIsLoadingSession(false);
      }
    }

    void loadSession();
  }, []);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;
  }, [reviews]);

  function fileToPreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => reject(reader.error ?? new Error("Impossible de lire l'image."));
      reader.readAsDataURL(file);
    });
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, 4);

    setSelectedPhotos(files);
    event.target.value = "";
    setSubmitMessage("");
    setPhotoPreviews(await Promise.all(files.map((file) => fileToPreview(file))));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitMessage("");

    if (!comment.trim()) {
      setSubmitMessage("Ajoute un commentaire avant d'envoyer ton avis.");
      return;
    }

    if (!isConnected && (!fullName.trim() || !email.trim())) {
      setSubmitMessage("Indique ton nom et ton email pour publier l'avis.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("fullName", fullName);
      formData.set("email", email);
      formData.set("rating", rating);
      formData.set("comment", comment);
      selectedPhotos.forEach((file) => formData.append("photos", file));

      const response = await fetch("/api/store/reviews", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !payload.ok) {
        setSubmitMessage(payload.message ?? "Impossible d'envoyer l'avis.");
        return;
      }

      setComment("");
      setSelectedPhotos([]);
      setPhotoPreviews([]);
      setSubmitMessage(payload.message ?? "Avis envoyé.");
      onSubmitted();
    } catch {
      setSubmitMessage("Impossible d'envoyer l'avis pour le moment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--card-shadow)] md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Avis de nos clients
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-3xl font-semibold text-[var(--text)]">Ils nous ont fait confiance</h2>
              <p className="mt-2 max-w-xl text-sm text-[var(--text-muted)] md:text-base">
                Des retours vrais, publies apres validation pour garder une boutique propre et credible.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Note moyenne</p>
              <p className="mt-1 text-2xl font-semibold text-[var(--text)]">
                {averageRating ? averageRating.toFixed(1) : "0.0"}/5
              </p>
              <p className="text-xs text-[var(--text-muted)]">{reviews.length} avis publies</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {reviews.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-6 text-sm text-[var(--text-muted)] md:col-span-2">
                Aucun avis publie pour le moment.
              </div>
            ) : (
              reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)] p-5 transition hover:-translate-y-1"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--accent)]">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[var(--text)]">{review.author}</p>
                          <p className="text-xs text-[var(--text-muted)]">{review.city || "Client LIMAILLOTS"}</p>
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">{review.createdAt}</p>
                      </div>
                      <div className="mt-3 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <StarIcon
                            key={`${review.id}-star-${index}`}
                            className={`h-4 w-4 ${index < review.rating ? "text-amber-400" : "text-[var(--surface-muted)]"}`}
                          />
                        ))}
                        <span className="ml-2 rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--accent)]">
                          Avis verifie
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[var(--text)]">{review.comment}</p>
                  {review.photos?.length ? (
                    <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {review.photos.map((src, index) => (
                        <div
                          key={`${review.id}-photo-${index}`}
                          className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
                        >
                          <Image
                            src={src}
                            alt={`${review.author} photo ${index + 1}`}
                            width={160}
                            height={160}
                            unoptimized
                            className="h-24 w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--card-shadow)] md:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Laisser un avis
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-[var(--text)]">
            Partage ton experience avec LIMAILLOTS
          </h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Ton avis sera envoye en moderation avant publication.
          </p>

          <div className="mt-6 space-y-4">
            <Input
              label="Nom complet"
              value={fullName}
              onChange={setFullName}
              placeholder="Ton nom"
              disabled={isConnected}
              helper={isConnected ? "Compte connecte" : undefined}
            />
            <Input
              label="Email"
              value={email}
              onChange={setEmail}
              placeholder="ton@email.com"
              type="email"
              disabled={isConnected}
              helper={isConnected ? "Adresse liee au compte" : undefined}
            />

            <div className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
              <span>Note</span>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1;
                  const active = value <= Number(rating);

                  return (
                    <button
                      key={`rating-${value}`}
                      type="button"
                      onClick={() => setRating(String(value))}
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition ${active ? "border-amber-300 bg-amber-50" : "border-[var(--border)] bg-[var(--surface-muted)]"}`}
                      aria-label={`${value} etoile${value > 1 ? "s" : ""}`}
                    >
                      <StarIcon className={`h-5 w-5 ${active ? "text-amber-400" : "text-[var(--border)]"}`} />
                    </button>
                  );
                })}
                <span className="ml-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
                  {rating}/5
                </span>
              </div>
            </div>

            <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
              Ton avis
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Decris ton experience avec la boutique"
                className="min-h-32 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-3 text-[var(--text)] outline-none"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
              Photos dans le maillot
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-3 py-3 text-sm text-[var(--text)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--accent)] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
              />
            </label>

            {photoPreviews.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {photoPreviews.map((src, index) => (
                  <div
                    key={`${src}-${index}`}
                    className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]"
                  >
                    <Image
                      src={src}
                      alt={`Photo selectionnee ${index + 1}`}
                      width={160}
                      height={160}
                      unoptimized
                      className="h-28 w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}

            {submitMessage ? <p className="text-sm text-[var(--text-muted)]">{submitMessage}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting || isLoadingSession}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Envoi..." : "Laisser un avis"}
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  helper?: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
      <div className="flex items-center justify-between gap-3">
        <span>{label}</span>
        {helper ? <span className="text-xs uppercase tracking-[0.12em] text-[var(--accent)]">{helper}</span> : null}
      </div>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-[var(--text)] outline-none disabled:cursor-not-allowed disabled:opacity-80"
      />
    </label>
  );
}
