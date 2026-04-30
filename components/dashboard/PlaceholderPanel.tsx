type PlaceholderPanelProps = {
  title: string;
  description: string;
  items: string[];
};

export function PlaceholderPanel({ title, description, items }: PlaceholderPanelProps) {
  return (
    <section className="rounded-3xl border border-black/[0.04] bg-white p-6 shadow-sm">
      <h3 className="text-[13px] font-black uppercase tracking-wider text-[#111]">{title}</h3>
      <p className="mt-2 text-[12px] font-semibold leading-6 text-[#111]/45">{description}</p>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <div key={item} className="rounded-2xl bg-[#FAF9F5] p-4 text-[12px] font-bold text-[#111]/60">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
