interface PriceInputProps {
  value: string;
  disabled: boolean;
  onChange(value: string): void;
}

/** Reject invalid edits rather than silently changing a pasted price. */
export function PriceInput({ value, disabled, onChange }: PriceInputProps) {
  return <>
    <label htmlFor="amount">Sale amount</label>
    <div className="amount-input"><span>₦</span>
      <input id="amount" name="amount" inputMode="numeric" pattern="[0-9]*" maxLength={8} placeholder="0" value={value} disabled={disabled}
        onKeyDown={event => {
          if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key.length === 1 && !/^[0-9]$/.test(event.key)) event.preventDefault();
        }}
        onBeforeInput={event => {
          const data = (event.nativeEvent as InputEvent).data;
          if (data && /[^0-9]/.test(data)) event.preventDefault();
        }}
        onPaste={event => { if (!/^[0-9]*$/.test(event.clipboardData.getData('text'))) event.preventDefault(); }}
        onChange={event => { if (/^[0-9]*$/.test(event.target.value)) onChange(event.target.value); }}/>
    </div>
  </>;
}
