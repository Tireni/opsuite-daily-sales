export function AppNavigation({ recording }: { recording: boolean }) {
  return <nav className="page-nav" aria-label="Sales pages">
    <a href="/dashboard" aria-current={!recording ? 'page' : undefined}>Dashboard</a>
    <a href="/record" aria-current={recording ? 'page' : undefined}>Record sale</a>
  </nav>;
}
