import { classifyIntent } from "./classifier";

const questions = [
  "Berapa saldo saya sekarang?",
  "Keuangan saya bulan ini bagaimana?",
  "Pengeluaran terbesar saya apa?",
  "Budget makanan saya masih berapa?",
  "Apakah saya bisa mencapai target laptop?",
  "Bulan ini ada tagihan apa?",
  "Saya bisa beli headset 500 ribu?",
  "Apa yang sebaiknya saya lakukan dengan uang saya?",
];

for (const question of questions) {
  const result = classifyIntent(question);

  console.log("\nQUESTION:", question);
  console.log("INTENT:", result.intent);
  console.log("CONFIDENCE:", result.confidence);
  console.log("CONTEXT:", result.requiredContext);
  console.log("REASONS:", result.reasons);
}