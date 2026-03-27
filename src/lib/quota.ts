import { prisma } from "./prisma";

export async function getUrlaubQuota(userId: string, year: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const resturlaub = await prisma.resturlaub.findUnique({
    where: { userId_jahr: { userId, jahr: year - 1 } },
  });
  const resturlaubTage = resturlaub?.tage ?? 0;
  const anspruchGesamt = user.urlaubsanspruchJahr + resturlaubTage;

  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59);

  const urlaubTypen = ["bezahlter_urlaub", "freizeitausgleich", "sonderurlaub", "unbezahlter_urlaub"];

  const abwesenheiten = await prisma.abwesenheit.findMany({
    where: {
      userId,
      typ: { in: urlaubTypen },
      beginn: { gte: startOfYear },
      ende: { lte: endOfYear },
    },
  });

  let genommen = 0;
  let beantragt = 0;
  let geplant = 0;

  for (const a of abwesenheiten) {
    if (a.status === "genehmigt") genommen += a.tage;
    else if (a.status === "beantragt") beantragt += a.tage;
    else if (a.status === "geplant") geplant += a.tage;
  }

  const rest = anspruchGesamt - genommen - beantragt - geplant;

  return {
    anspruchGesamt,
    resturlaubTage,
    genommen,
    beantragt,
    geplant,
    rest,
  };
}

export async function getKinderkrankQuota(userId: string, year: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59);

  const abwesenheiten = await prisma.abwesenheit.findMany({
    where: {
      userId,
      typ: "kindkrank",
      beginn: { gte: startOfYear },
      ende: { lte: endOfYear },
      status: { in: ["genehmigt", "beantragt"] },
    },
  });

  const genommen = abwesenheiten.reduce((sum, a) => sum + a.tage, 0);

  return {
    anspruchGesamt: user.kinderkrankentageJahr,
    genommen,
    rest: user.kinderkrankentageJahr - genommen,
  };
}

export async function getMailTemplateData(userId: string, absenceId: string, year: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const absence = await prisma.abwesenheit.findUnique({ where: { id: absenceId } });
  if (!absence) throw new Error("Absence not found");

  const resturlaub = await prisma.resturlaub.findUnique({
    where: { userId_jahr: { userId, jahr: year - 1 } },
  });
  const resturlaubTage = resturlaub?.tage ?? 0;
  const urlaubsanspruch = user.urlaubsanspruchJahr + resturlaubTage;

  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59);

  const urlaubTypen = ["bezahlter_urlaub", "freizeitausgleich", "sonderurlaub", "unbezahlter_urlaub"];

  const genehmigtBeantragt = await prisma.abwesenheit.findMany({
    where: {
      userId,
      typ: { in: urlaubTypen },
      beginn: { gte: startOfYear },
      ende: { lte: endOfYear },
      status: { in: ["genehmigt", "beantragt"] },
      id: { not: absenceId },
    },
  });

  const bereits_genommen = genehmigtBeantragt.reduce((sum, a) => sum + a.tage, 0);
  const neu_beantragt = absence.tage;
  const restUrlaub = urlaubsanspruch - bereits_genommen - neu_beantragt;

  const kinderkrankAbwesenheiten = await prisma.abwesenheit.findMany({
    where: {
      userId,
      typ: "kindkrank",
      beginn: { gte: startOfYear },
      ende: { lte: endOfYear },
      status: { in: ["genehmigt", "beantragt"] },
    },
  });
  const kinderkrankentage_genommen = kinderkrankAbwesenheiten.reduce((sum, a) => sum + a.tage, 0);

  return {
    urlaubsanspruch,
    bereits_genommen,
    neu_beantragt,
    resturlaub: restUrlaub,
    kinderkrankentage_gesamt: user.kinderkrankentageJahr,
    kinderkrankentage_genommen,
  };
}
