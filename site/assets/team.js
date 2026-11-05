// Team page data. Edit this file only; the page updates itself.
//
// institutions: one entry per institution. The key (e.g. "lmu") is what people refer to.
//   name   full name shown in the filter row
//   mark   marker shape shown on each person: ring, plus, diamond, square, cross, tri, grid, bar
//
// people: one entry per person, in the order they should appear.
//   name          full name
//   role          optional, e.g. "PhD student", "Postdoc", "Professor"; null hides it
//   affiliations  list of institution keys; the first one is the primary affiliation
//   url           optional personal page (https://...)
//   photo         optional image path, e.g. "assets/team/gengyuan.webp" (square, at least 160px).
//                 Leave null to show a dot-matrix monogram of the initials.
window.VITAGENT_TEAM = {
  institutions: {
    lmu:         { name: "LMU Munich",                     mark: "ring" },
    tum:         { name: "Technical University of Munich", mark: "plus" },
    oxford:      { name: "University of Oxford",           mark: "diamond" },
    zeiss:       { name: "Carl Zeiss AG",                  mark: "square" },
    independent: { name: "Independent",                    mark: "cross" }
  },

  people: [
    { name: "Gengyuan Zhang",   role: null, affiliations: ["lmu", "oxford"],  url: null, photo: null },
    { name: "Shijie Zhou",      role: null, affiliations: ["tum"],            url: null, photo: null },
    { name: "Xinling Xie",      role: null, affiliations: ["lmu"],            url: null, photo: null },
    { name: "Xiao Han",         role: null, affiliations: ["lmu"],            url: null, photo: null },
    { name: "Abdullah Koukash", role: null, affiliations: ["lmu"],            url: null, photo: null },
    { name: "Krishna Kanth",    role: null, affiliations: ["independent"],    url: null, photo: null },
    { name: "Ghazal Ghazaei",   role: null, affiliations: ["zeiss", "tum"],   url: null, photo: null }
  ]
};
