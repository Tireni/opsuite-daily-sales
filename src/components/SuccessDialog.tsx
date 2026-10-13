import { useEffect, useRef } from 'react';

export function SuccessDialog({ open, onClose }: { open: boolean; onClose(): void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
  }, [open]);

  return <dialog ref={dialog} className="success-dialog" aria-labelledby="success-title" onClose={onClose}>
    {open && <>
      <svg className="success-check" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="56" height="56" rx="14"/><path d="m19 32 9 9 18-19"/>
      </svg>
      <h2 id="success-title">Submitted successfully</h2>
      <p>Your sale has been recorded.</p>
      <button className="primary" autoFocus onClick={() => dialog.current?.close()}>Add another sale</button>
    </>}
  </dialog>;
}
