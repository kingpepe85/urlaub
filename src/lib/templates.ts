export interface DefaultTemplate {
  typ: string;
  betreff: string;
  inhalt: string;
}

export function getDefaultTemplates(): DefaultTemplate[] {
  return [
    {
      typ: "urlaub",
      betreff: "Urlaubsantrag",
      inhalt: `Hallo,
hiermit beantrage ich:

{{urlaubsart}}

Beginn: {{beginn}}
Ende: {{ende}}

Urlaubsanspruch insgesamt: {{urlaubsanspruch}} Tage
davon bereits genommen: {{bereits_genommen}} Tage
neu beantragter Urlaub: {{neu_beantragt}} Tage
verbleibender Resturlaub: {{resturlaub}} Tage`,
    },
    {
      typ: "krank",
      betreff: "Krankmeldung",
      inhalt: `Hallo,
ich bin leider heute krank und kann daher nicht zur Arbeit kommen.

Die voraussichtliche Krankheitsdauer habe ich unten angegeben. Falls mir dies nicht möglich ist, werde ich umgehend einen Arzt aufsuchen und anschließend mitteilen, wie lange ich krankgeschrieben bin.

Beginn: {{beginn}}
Ende (letzter Tag der Krankheit): {{ende}}`,
    },
    {
      typ: "kindkrank",
      betreff: "Kinderkrankmeldung",
      inhalt: `Hallo,

mein Kind ist krank und ich kann daher nicht zur Arbeit kommen.
Die voraussichtliche Krankheitsdauer habe ich unten angegeben.

Beginn: {{beginn}}
Ende (letzter Tag der Krankheit): {{ende}}

Kinderkrankentage im Kalenderjahr: {{kinderkrankentage_gesamt}} Tage
Davon bereits genommen: {{kinderkrankentage_genommen}} Tage`,
    },
  ];
}

export interface TemplateFillData {
  beginn: string;
  ende: string;
  urlaubsanspruch: number;
  bereits_genommen: number;
  neu_beantragt: number;
  resturlaub: number;
  urlaubsart: string;
  kinderkrankentage_gesamt: number;
  kinderkrankentage_genommen: number;
}

export function buildUrlaubsartCheckbox(typ: string): string {
  const arten = [
    { key: "bezahlter_urlaub", label: "bezahlten Urlaub" },
    { key: "freizeitausgleich", label: "Freizeitausgleich" },
    { key: "sonderurlaub", label: "Sonderurlaub" },
    { key: "unbezahlter_urlaub", label: "unbezahlten Urlaub" },
  ];
  return arten
    .map((a) => (a.key === typ ? `[x] ${a.label}` : `[] ${a.label}`))
    .join("\n");
}

export function fillTemplate(template: string, data: TemplateFillData): string {
  return template
    .replace(/\{\{beginn\}\}/g, data.beginn)
    .replace(/\{\{ende\}\}/g, data.ende)
    .replace(/\{\{urlaubsanspruch\}\}/g, String(data.urlaubsanspruch))
    .replace(/\{\{bereits_genommen\}\}/g, String(data.bereits_genommen))
    .replace(/\{\{neu_beantragt\}\}/g, String(data.neu_beantragt))
    .replace(/\{\{resturlaub\}\}/g, String(data.resturlaub))
    .replace(/\{\{urlaubsart\}\}/g, data.urlaubsart)
    .replace(/\{\{kinderkrankentage_gesamt\}\}/g, String(data.kinderkrankentage_gesamt))
    .replace(/\{\{kinderkrankentage_genommen\}\}/g, String(data.kinderkrankentage_genommen));
}

export const PLACEHOLDER_REFERENCE = [
  { placeholder: "{{beginn}}", description: "Startdatum (TT.MM.JJJJ)" },
  { placeholder: "{{ende}}", description: "Enddatum (TT.MM.JJJJ)" },
  { placeholder: "{{urlaubsanspruch}}", description: "Urlaubsanspruch gesamt (inkl. Resturlaub)" },
  { placeholder: "{{bereits_genommen}}", description: "Bereits genommene/beantragte Urlaubstage" },
  { placeholder: "{{neu_beantragt}}", description: "Tage der aktuellen Abwesenheit" },
  { placeholder: "{{resturlaub}}", description: "Verbleibender Resturlaub" },
  { placeholder: "{{urlaubsart}}", description: "Checkbox-Darstellung der Urlaubsart" },
  { placeholder: "{{kinderkrankentage_gesamt}}", description: "Kinderkrankentage pro Jahr" },
  { placeholder: "{{kinderkrankentage_genommen}}", description: "Bereits genommene Kinderkrankentage" },
];
