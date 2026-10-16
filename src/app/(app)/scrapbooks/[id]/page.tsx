import { notFound, redirect } from "next/navigation";
import Board from "@/components/board/Board";
import ScrapbookHeader from "@/components/board/ScrapbookHeader";
import { requireProfile } from "@/lib/profile";
import type { BoardItem, PageInfo, SourceRef } from "@/components/board/types";

export default async function ScrapbookPage({ params, searchParams }: PageProps<"/scrapbooks/[id]">) {
  const { supabase, profile } = await requireProfile();
  const { id } = await params;
  const sp = await searchParams;

  const { data: book } = await supabase.from("scrapbooks").select("id, title, theme, owner").eq("id", id).maybeSingle();
  if (!book) notFound();

  const { data: members } = await supabase.from("scrapbook_members").select("user_id, role").eq("scrapbook_id", id);
  const isOwner = book.owner === profile.id;
  const canEdit = isOwner || (members ?? []).some((m) => m.user_id === profile.id && m.role === "editor");

  let { data: pages } = await supabase.from("scrapbook_pages").select("*").eq("scrapbook_id", id).order("position");
  if (!pages?.length && canEdit) {
    await supabase.from("scrapbook_pages").insert({ scrapbook_id: id, title: "Page 1", position: 0 });
    ({ data: pages } = await supabase.from("scrapbook_pages").select("*").eq("scrapbook_id", id).order("position"));
  }
  const pageList = (pages ?? []) as PageInfo[];
  const current = pageList.find((p) => p.id === sp.page) ?? pageList[0];
  if (!current) notFound();
  if (sp.page && sp.page !== current.id) redirect(`/scrapbooks/${id}?page=${current.id}`);

  const { data: items } = await supabase.from("board_items").select("*").eq("page_id", current.id);
  const { data: mine } = await supabase.from("sources").select("id, title, theme, author").eq("owner", profile.id).order("title");

  // Linked sources from collaborators' shelves are readable through the board-member policy.
  const linkedIds = [...new Set((items ?? []).map((i) => i.link_source_id).filter(Boolean))] as string[];
  const mineIds = new Set((mine ?? []).map((s) => s.id));
  const missing = linkedIds.filter((x) => !mineIds.has(x));
  let others: SourceRef[] = [];
  if (missing.length) {
    const { data } = await supabase.from("sources").select("id, title, theme, author").in("id", missing);
    others = (data ?? []) as SourceRef[];
  }

  return (
    <div>
      <ScrapbookHeader
        id={book.id}
        title={book.title}
        theme={book.theme}
        pages={pageList}
        currentPage={current.id}
        isOwner={isOwner}
        canEdit={canEdit}
        sharedWith={null}
      />
      <Board
        key={current.id}
        page={current}
        initialItems={(items ?? []) as BoardItem[]}
        sources={[...((mine ?? []) as SourceRef[]), ...others]}
        canEdit={canEdit}
        userId={profile.id}
      />
    </div>
  );
}
