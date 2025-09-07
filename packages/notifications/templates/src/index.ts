import Handlebars from 'handlebars';

export function render(body: string, data: Record<string, unknown>): string {
  const tpl = Handlebars.compile(body, { noEscape: true });
  return tpl(data);
}

export function renderEmail(body: string, data: Record<string, unknown>): string {
  return render(body, data);
}

