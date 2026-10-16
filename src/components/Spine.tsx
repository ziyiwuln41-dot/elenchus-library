"use client";

import s from "./Spine.module.css";

export type SpineKind = "classic" | "modern" | "journal" | "mag";

export type SpineProps = {
  title: string;
  author?: string | null;
  bg: string;
  fg: string;
  font: string;
  height: number;
  width: number;
  kind: SpineKind;
  lean?: number;
  picked?: boolean;
  href?: string | null; // when set, clicking the spine opens this link (current affairs)
  onOpen?: () => void; // opens the source card
};

export default function Spine({ title, author, bg, fg, font, height, width, kind, lean = 0, picked, href, onOpen }: SpineProps) {
  const fontSize = kind === "journal" ? 10 : kind === "mag" ? Math.min(13, width / 2) : Math.max(11, Math.min(22, width / 2.4));
  const style = {
    height, width, backgroundColor: bg, color: fg, transform: `rotate(${lean}deg)`,
  } as const;
  const inner = (
    <>
      <span className={s.band} />
      <span className={s.title} style={{ fontFamily: font, fontSize }}>{title}</span>
      {author ? <span className={s.author}>{author}</span> : <span />}
    </>
  );
  const cls = `${s.book} ${s[kind]} ${picked ? s.picked : ""}`;

  if (href) {
    return (
      <div className={s.wrap}>
        <button type="button" className={s.notesTab} onClick={onOpen} aria-label={`Notes for ${title}`} title="Your notes">✎</button>
        <a className={cls} style={style} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${title} (opens the article)`}>
          {inner}
        </a>
      </div>
    );
  }
  return (
    <button type="button" className={cls} style={style} onClick={onOpen} aria-label={title}>
      {inner}
    </button>
  );
}
