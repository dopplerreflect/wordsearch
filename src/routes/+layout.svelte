<script>
  let { children } = $props();
</script>

{@render children()}

<style>
  :global {
    :root {
      --dark: oklch(0 0.1 300);
      --medium: oklch(0.25 50% 300);
      --light: oklch(0.95 10% 300);
      --green: oklch(0.95 100% 150);
      --blue: oklch(0.75 100% 210);
    }
    body {
      background-color: var(--dark);
      color: var(--light);
    }
  }
</style>
