"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";

function value(formData: FormData, key: string) {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry.trim() : "";
}

function positiveNumber(formData: FormData, key: string) {
  const parsed = Number(value(formData, key));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseStops(raw: string): Prisma.InputJsonValue {
  const stops = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = "", km = "0", minutes = "0", note = ""] = line.split("|").map((item) => item.trim());

      return {
        name,
        km: Number(km) || 0,
        minutes: Number(minutes) || 0,
        note
      };
    })
    .filter((stop) => stop.name);

  return stops;
}

function routeData(formData: FormData) {
  const from = value(formData, "from");
  const to = value(formData, "to");
  const via = value(formData, "via");
  const slug = value(formData, "slug") || slugify(`${from}-${to}-${via}`);
  const durationMin = positiveNumber(formData, "durationMin");
  const price = positiveNumber(formData, "price");

  if (!from || !to || !via || !slug || !durationMin || !price) {
    throw new Error("Completá origen, destino, vía, duración y precio.");
  }

  return {
    slug,
    from,
    to,
    via,
    durationMin,
    priceCents: Math.round(price * 100),
    currency: value(formData, "currency") || "ARS",
    category: value(formData, "category") || "Argentina",
    description: value(formData, "description"),
    featured: formData.get("featured") === "on",
    isActive: formData.get("isActive") === "on",
    stops: parseStops(value(formData, "stops"))
  };
}

function revalidateRoutePaths(slug?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/rutas");
  revalidatePath("/admin/salidas");
  revalidatePath("/rutas");

  if (slug) {
    revalidatePath(`/rutas/${slug}`);
    revalidatePath(`/reservar/${slug}`);
  }
}

export async function createRouteAction(formData: FormData) {
  await getCurrentAdminOrRedirect();

  const data = routeData(formData);
  await prisma.travelRoute.create({ data });
  revalidateRoutePaths(data.slug);
}

export async function updateRouteAction(formData: FormData) {
  await getCurrentAdminOrRedirect();

  const id = value(formData, "id");
  if (!id) {
    throw new Error("Falta la ruta a editar.");
  }

  const current = await prisma.travelRoute.findUnique({ where: { id }, select: { slug: true } });
  const data = routeData(formData);
  await prisma.travelRoute.update({ where: { id }, data });
  revalidateRoutePaths(current?.slug);
  revalidateRoutePaths(data.slug);
}

export async function setRouteActiveAction(formData: FormData) {
  await getCurrentAdminOrRedirect();

  const id = value(formData, "id");
  const isActive = value(formData, "isActive") === "true";
  const route = await prisma.travelRoute.update({
    where: { id },
    data: { isActive },
    select: { slug: true }
  });
  revalidateRoutePaths(route.slug);
}

export async function deleteRouteAction(formData: FormData) {
  await getCurrentAdminOrRedirect();

  const id = value(formData, "id");
  const route = await prisma.travelRoute.findUnique({ where: { id }, select: { slug: true } });
  if (!route) {
    return;
  }

  const reservations = await prisma.reservation.count({
    where: {
      schedule: {
        routeId: id
      }
    }
  });

  if (reservations > 0) {
    await prisma.$transaction([
      prisma.travelRoute.update({ where: { id }, data: { isActive: false } }),
      prisma.schedule.updateMany({ where: { routeId: id }, data: { status: "CLOSED" } })
    ]);
  } else {
    await prisma.travelRoute.delete({ where: { id } });
  }

  revalidateRoutePaths(route.slug);
}
