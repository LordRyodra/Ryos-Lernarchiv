/*
  Ryos Lernarchiv v0.1
  Daten zuerst simpel halten. Später kann diese Datei durch echte Prüfungsdaten ersetzt werden.
*/
window.LEARNING_ARCHIVE_DATA = {
  app: {
    title: "Ryos Lernarchiv",
    version: "0.1",
    motto: "Nicht sammeln, um zu sammeln. Sammeln, verknüpfen, beweisen."
  },

  startModes: [
    {
      id: "rescue",
      title: "Prüfung retten",
      shortTitle: "Retten",
      description: "Starte bei dem Gebiet mit hoher Prüfungsrelevanz und wenig Beweisen.",
      rule: "Wähle eine Gefahrenzone und produziere einen kleinen Beweis."
    },
    {
      id: "map",
      title: "Landkarte erkunden",
      shortTitle: "Erkunden",
      description: "Baue Überblick auf: Was gehört wohin, was hängt zusammen?",
      rule: "Öffne einen Knoten und formuliere seine Nachbarn."
    },
    {
      id: "stabilize",
      title: "Stabilisieren",
      shortTitle: "Stabilisieren",
      description: "Verwandle unsicheres Wissen in prüfbare Erklärungen.",
      rule: "Erkläre ein Thema ohne Unterlagen und speichere den Beweis."
    },
    {
      id: "book",
      title: "Forschungsbuch",
      shortTitle: "Buch",
      description: "Sammle offene Fragen, Merksätze und eigene Erklärungen.",
      rule: "Ergänze eine Notiz erst, wenn sie beim Lernen wirklich geholfen hat."
    }
  ],

  mapNodes: [
    {
      id: "cell-biology",
      area: "Biologie",
      exam: "Bio Grundlagen",
      title: "Zellbiologie",
      summary: "Organellen, Membranen, Kompartimente und Zellprozesse als zusammenhängendes System.",
      importance: 5,
      initialConfidence: 2,
      requiredProofs: 3,
      connections: ["genetics", "biochemistry", "physiology"],
      tags: ["Grundlage", "Systemdenken"]
    },
    {
      id: "genetics",
      area: "Biologie",
      exam: "Bio Grundlagen",
      title: "Genetik",
      summary: "DNA, Transkription, Translation, Mutationen und Vererbung.",
      importance: 5,
      initialConfidence: 2,
      requiredProofs: 3,
      connections: ["cell-biology", "biochemistry"],
      tags: ["Abläufe", "Begriffe"]
    },
    {
      id: "botany",
      area: "Biologie",
      exam: "Bio Grundlagen",
      title: "Botanik",
      summary: "Pflanzenaufbau, Gewebe, Transport, Photosynthese und Reproduktion.",
      importance: 4,
      initialConfidence: 1,
      requiredProofs: 2,
      connections: ["cell-biology", "biochemistry"],
      tags: ["Struktur", "Vergleich"]
    },
    {
      id: "physiology",
      area: "Biologie",
      exam: "Bio Grundlagen",
      title: "Physiologie",
      summary: "Funktionelle Zusammenhänge: Regulation, Organsysteme und Homöostase.",
      importance: 4,
      initialConfidence: 2,
      requiredProofs: 2,
      connections: ["cell-biology", "biochemistry"],
      tags: ["Mechanismen", "Anwendung"]
    },
    {
      id: "biochemistry",
      area: "Chemie/Bio",
      exam: "Chemie für Bio",
      title: "Biochemische Grundlagen",
      summary: "Proteine, Enzyme, Stoffwechselwege und Energieumwandlung.",
      importance: 5,
      initialConfidence: 1,
      requiredProofs: 3,
      connections: ["cell-biology", "genetics", "redox"],
      tags: ["Energie", "Moleküle"]
    },
    {
      id: "redox",
      area: "Chemie",
      exam: "Chemie für Bio",
      title: "Redox & Reaktionsgleichungen",
      summary: "Oxidation, Reduktion, Elektronenbilanz und saubere Reaktionsgleichungen.",
      importance: 5,
      initialConfidence: 1,
      requiredProofs: 3,
      connections: ["biochemistry", "acid-base"],
      tags: ["Rechnen", "Fehlerquelle"]
    },
    {
      id: "acid-base",
      area: "Chemie",
      exam: "Chemie für Bio",
      title: "Säure/Base & Puffer",
      summary: "pH, pKs, Henderson-Hasselbalch, Titration und Puffersysteme.",
      importance: 4,
      initialConfidence: 2,
      requiredProofs: 3,
      connections: ["redox", "biochemistry"],
      tags: ["Rechnen", "Labor"]
    },
    {
      id: "lab-protocols",
      area: "Labor",
      exam: "Praktikum",
      title: "Protokolle & Auswertung",
      summary: "Reaktionsgleichungen, Beobachtungen, Auswertung, Sicherheit und Entsorgung knapp und prüfbar festhalten.",
      importance: 4,
      initialConfidence: 3,
      requiredProofs: 2,
      connections: ["redox", "acid-base"],
      tags: ["Schreiben", "Beleg"]
    }
  ],

  dangerZones: [
    {
      id: "dz-redox",
      title: "Reaktionsgleichungen kippen schnell",
      nodeIds: ["redox", "acid-base", "lab-protocols"],
      reason: "Wenn Oxidationszahlen oder Stoffmengen nicht sitzen, werden Auswertung und Protokoll instabil.",
      suggestedAction: "Eine Gleichung vollständig aufstellen, ausgleichen und in eigenen Worten erklären."
    },
    {
      id: "dz-bio-overview",
      title: "Biologie braucht Verbindung statt Listen",
      nodeIds: ["cell-biology", "genetics", "biochemistry"],
      reason: "Einzelfakten helfen wenig, wenn Zellprozesse, DNA und Proteine nicht als System sichtbar sind.",
      suggestedAction: "Drei Knoten verbinden und die Kausalkette laut erklären."
    },
    {
      id: "dz-botany",
      title: "Botanik wird leicht zu Begriffssuppe",
      nodeIds: ["botany"],
      reason: "Viele Begriffe sehen ähnlich aus; stabile Bilder und Vergleiche sind wichtiger als stures Lesen.",
      suggestedAction: "Eine Pflanze als Systemskizze mit Transportwegen beschreiben."
    }
  ],

  quests: [
    {
      id: "q-redox-proof",
      nodeId: "redox",
      title: "Redoxgleichung beweisen",
      modeHint: "rescue",
      type: "Lernbeweis",
      estimatedMinutes: 25,
      objective: "Eine Redoxreaktion nicht nur lösen, sondern erklären, warum jeder Schritt stimmt.",
      steps: [
        "Wähle eine konkrete Redoxreaktion aus deinen Unterlagen.",
        "Bestimme Oxidation, Reduktion und Elektronenübergang.",
        "Gleiche die Gleichung sauber aus.",
        "Erkläre in 5–8 Sätzen, warum die Bilanz stimmt."
      ],
      proofPrompt: "Erkläre die Redoxreaktion so, dass dein zukünftiges Ich sie ohne Skript nachvollziehen kann.",
      doneDefinition: "Gespeicherter Lernbeweis mit Reaktion, Bilanz und eigener Erklärung."
    },
    {
      id: "q-cell-system",
      nodeId: "cell-biology",
      title: "Zelle als Systemkarte",
      modeHint: "map",
      type: "Verknüpfung",
      estimatedMinutes: 20,
      objective: "Organellen nicht isoliert lernen, sondern als Ablaufkette verstehen.",
      steps: [
        "Notiere 5 zentrale Organellen.",
        "Verbinde sie mit einem gemeinsamen Prozess, z. B. Proteinproduktion.",
        "Beschreibe den Prozess ohne Stichwortliste.",
        "Markiere eine Stelle, die noch unsicher ist."
      ],
      proofPrompt: "Beschreibe einen Zellprozess als zusammenhängende Kette. Welche Organellen sind beteiligt und warum?",
      doneDefinition: "Eine eigene Systemerklärung, nicht nur eine Liste."
    },
    {
      id: "q-genetics-flow",
      nodeId: "genetics",
      title: "Vom Gen zum Protein",
      modeHint: "stabilize",
      type: "Ablauf",
      estimatedMinutes: 25,
      objective: "Transkription und Translation als gerichteten Ablauf erklären.",
      steps: [
        "Schreibe den Weg DNA → mRNA → Protein auf.",
        "Erkläre die Rolle von Codons und Ribosomen.",
        "Nenne eine Mutation und ihre mögliche Folge.",
        "Formuliere eine Mini-Prüfungsantwort."
      ],
      proofPrompt: "Erkläre den Weg vom Gen zum Protein mit einer Mutation als Beispiel.",
      doneDefinition: "Eine frei formulierte Antwort mit Ursache-Folge-Bezug."
    },
    {
      id: "q-buffer-example",
      nodeId: "acid-base",
      title: "Pufferrechnung entzaubern",
      modeHint: "rescue",
      type: "Rechnen + Erklärung",
      estimatedMinutes: 30,
      objective: "Eine Pufferaufgabe rechnen und den Sinn der Formel erklären.",
      steps: [
        "Wähle eine Aufgabe mit pH/pKs oder Pufferbereich.",
        "Notiere bekannte Größen und gesuchte Größe.",
        "Rechne sauber mit Einheiten.",
        "Erkläre, was das Ergebnis chemisch bedeutet."
      ],
      proofPrompt: "Dokumentiere eine Pufferrechnung: Ansatz, Rechnung, Ergebnis und Bedeutung.",
      doneDefinition: "Rechenweg plus kurze chemische Deutung."
    },
    {
      id: "q-botany-visual",
      nodeId: "botany",
      title: "Botanik visualisieren",
      modeHint: "map",
      type: "Bildliches Verstehen",
      estimatedMinutes: 20,
      objective: "Pflanzenstruktur als räumliches Modell statt Begriffsliste speichern.",
      steps: [
        "Wähle ein Pflanzensystem: Blatt, Sprossachse, Wurzel oder Blüte.",
        "Skizziere es grob auf Papier oder mental.",
        "Beschreibe Funktion und Aufbau zusammen.",
        "Speichere hier, was an der Skizze prüfungsrelevant war."
      ],
      proofPrompt: "Beschreibe deine Pflanzenskizze: Welche Struktur erfüllt welche Funktion?",
      doneDefinition: "Eine bildhafte Erklärung mit Funktionsbezug."
    },
    {
      id: "q-protocol-mini",
      nodeId: "lab-protocols",
      title: "Mini-Protokoll als Beweis",
      modeHint: "book",
      type: "Schreibbeweis",
      estimatedMinutes: 30,
      objective: "Ein Protokollfragment so schreiben, dass es knapp, passiv und auswertbar ist.",
      steps: [
        "Wähle einen Versuch oder Teilversuch.",
        "Formuliere eine kurze Theorie mit Reaktionsgleichung.",
        "Schreibe Durchführung/Beobachtung im Passiv.",
        "Notiere eine Mini-Auswertung."
      ],
      proofPrompt: "Füge ein kurzes Protokollfragment ein: Theorie, Gleichung, Beobachtung, Auswertung.",
      doneDefinition: "Ein verwendbarer Textbaustein, nicht nur eine Erinnerung."
    }
  ],

  researchBook: [
    {
      id: "rb-proof-rule",
      nodeId: "meta",
      title: "Regel: Fortschritt braucht Beweis",
      type: "Systemregel",
      summary: "Ein Thema gilt erst als stabiler, wenn du etwas Eigenes erzeugt hast: Erklärung, Rechnung, Skizze, Vergleich oder Prüfungsantwort.",
      questions: ["Kann ich es ohne Vorlage erklären?", "Wo wäre ein typischer Prüfungsfehler?"]
    },
    {
      id: "rb-redox-errors",
      nodeId: "redox",
      title: "Typische Redox-Fehler",
      type: "Fehlerarchiv",
      summary: "Oxidationszahlen vergessen, Ladungen nicht prüfen, Atome ausgeglichen aber Elektronenbilanz ignoriert.",
      questions: ["Welche Spezies wird oxidiert?", "Sind Masse und Ladung beide ausgeglichen?"]
    },
    {
      id: "rb-cell-chain",
      nodeId: "cell-biology",
      title: "Proteinproduktion als Kette",
      type: "Verknüpfungsnotiz",
      summary: "Nucleus, Ribosom, ER, Golgi und Membran lassen sich als Produktions- und Transportsystem erklären.",
      questions: ["Was passiert zuerst?", "Welche Station verändert das Produkt?"]
    },
    {
      id: "rb-buffer-meaning",
      nodeId: "acid-base",
      title: "Puffer nicht nur rechnen",
      type: "Deutungsnotiz",
      summary: "Eine Pufferrechnung ist stabiler, wenn klar ist, welches Verhältnis von Säure/Base hinter dem pH steht.",
      questions: ["Was bedeutet pH = pKs?", "Warum ist der Pufferbereich begrenzt?"]
    }
  ]
};
