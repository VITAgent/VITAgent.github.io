// Team page data. Edit this file only; the page updates itself.
//
// institutions: one entry per institution. The key (e.g. "lmu") is what people refer to.
//   name   full name shown in the filter row
//   short  short label shown on each person (keep it to a few letters)
//
// people: one entry per person, in the order they should appear.
//   name          full name
//   role          optional, e.g. "PhD student", "Postdoc", "Professor"
//   affiliations  list of institution keys; the first one is the primary affiliation
//   url           optional personal page (https://...)
//   photo         optional image path, e.g. "assets/team/gengyuan.webp" (square, at least 160px).
//                 Leave null to show a dot-matrix monogram of the initials.
window.VITAGENT_TEAM = {
  institutions: {
    lmu:    { name: "LMU Munich",                     short: "LMU" },
    tum:    { name: "Technical University of Munich", short: "TUM" },
    oxford: { name: "University of Oxford",           short: "Oxford" },
    zeiss:  { name: "Carl Zeiss AG",                  short: "ZEISS" }
  },

  people: [
    { name: "Gengyuan Zhang", role: "PhD student", affiliations: ["lmu", "oxford"], url: null, photo: null },
    { name: "Team member",    role: "Role",        affiliations: ["tum"],           url: null, photo: null },
    { name: "Team member",    role: "Role",        affiliations: ["zeiss"],         url: null, photo: null },
    { name: "Team member",    role: "Role",        affiliations: ["lmu"],           url: null, photo: null }
  ]
};
