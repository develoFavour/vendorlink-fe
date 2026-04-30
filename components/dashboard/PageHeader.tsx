type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#111]/30">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-black tracking-tight text-[#111]">{title}</h2>
      <p className="mt-1 max-w-2xl text-[13px] font-semibold leading-6 text-[#111]/40">{description}</p>
    </div>
  );
}
