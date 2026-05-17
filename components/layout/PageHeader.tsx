interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
}

export function PageHeader({title, description, eyebrow = 'Workspace'}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3">
      <div className="eyebrow-label">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        {eyebrow}
      </div>
      <h1 className="font-display max-w-3xl text-4xl font-semibold leading-[0.98] text-foreground md:text-5xl">
        {title}
      </h1>
      <div className="ink-rule h-px w-28" />
      {description && (
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
