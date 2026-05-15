interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
}

export function PageHeader({title, description, eyebrow = 'Workspace'}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-2">
      <div className="flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        {eyebrow}
      </div>
      <h1 className="text-3xl font-semibold text-foreground">{title}</h1>
      {description && (
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
