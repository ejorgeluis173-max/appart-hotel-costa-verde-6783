import { z } from "zod";
import { eq } from "drizzle-orm";
import { base } from "../__core/app";
import { db } from "../database";
import { reviews, reservations } from "../database/schema";
import { rooms } from "../../shared/hotel";

const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (v) => !isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v,
    "Fecha inválida",
  );
export const hotel = {
  reviews: base.handler(async () => {
    const result = await db.select().from(reviews).where(eq(reviews.status, "approved"));
    return result.map(({ id, name, rating, comment, photo, createdAt }) => ({
      id,
      name,
      rating,
      comment,
      photo,
      createdAt,
    }));
  }),
  review: base
    .input(
      z.object({
        name: z.string().trim().min(2).max(100),
        rating: z.number().int().min(1).max(5),
        comment: z.string().trim().min(10).max(2000),
        photo: z
          .string()
          .max(1500000)
          .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/)
          .nullable(),
        website: z.string().max(0),
      }),
    )
    .handler(async ({ input }) => {
      const [saved] = await db
        .insert(reviews)
        .values({
          name: input.name,
          rating: input.rating,
          comment: input.comment,
          photo: input.photo,
          status: "pending",
        })
        .returning({ id: reviews.id });
      return { id: saved.id, status: "pending" };
    }),
  reserve: base
    .input(
      z
        .object({
          name: z.string().trim().min(2).max(100),
          contact: z.string().trim().min(6).max(150),
          room: z.string().max(100),
          arrival: date,
          departure: date,
          guests: z.number().int().min(1).max(99),
          message: z.string().max(2000),
          website: z.string().max(0),
        })
        .refine((v) => v.departure > v.arrival, "La salida debe ser posterior a la entrada")
        .refine(
          (v) =>
            v.arrival >=
            new Date().toLocaleDateString("en-CA", { timeZone: "America/Santo_Domingo" }),
          "La entrada no puede ser una fecha pasada",
        )
        .refine(
          (v) => v.room === "Por confirmar" || rooms.some((r) => r.id === v.room),
          "Habitación inválida",
        ),
    )
    .handler(async ({ input }) => {
      const { website: _, ...values } = input;
      const [saved] = await db
        .insert(reservations)
        .values(values)
        .returning({ id: reservations.id });
      return { id: saved.id, status: "requested" };
    }),
};
