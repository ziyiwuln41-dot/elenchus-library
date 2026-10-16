import ThemeChips from "@/components/ThemeChips";
import QuestionList, { type Question } from "@/components/questions/QuestionList";
import { requireProfile } from "@/lib/profile";
import { THEMES } from "@/lib/style";

export default async function QuestionsPage({ searchParams }: PageProps<"/questions">) {
  const { supabase, profile } = await requireProfile();
  const sp = await searchParams;
  const theme = THEMES.find((t) => t.slug === sp.theme)?.slug ?? THEMES[0].slug;

  const { data } = await supabase
    .from("questions")
    .select("id, text, year, exam, school, theme, source_url, paraphrased, added_by")
    .eq("theme", theme)
    .order("year", { ascending: false })
    .order("created_at");
  const questions = (data ?? []) as Question[];

  // Scrapbooks already started from these questions, so the button reopens them.
  const existing: Record<string, string> = {};
  if (questions.length) {
    const { data: sb } = await supabase.from("scrapbooks").select("id, question_id").eq("owner", profile.id).in("question_id", questions.map((q) => q.id));
    for (const s of sb ?? []) if (s.question_id) existing[s.question_id] = s.id;
  }

  return (
    <div>
      <ThemeChips current={theme} basePath="/questions" />
      <QuestionList questions={questions} theme={theme} me={profile.id} isAdmin={profile.is_admin} existing={existing} />
    </div>
  );
}
