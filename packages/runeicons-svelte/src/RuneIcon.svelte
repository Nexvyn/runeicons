<script lang="ts">
  import { getIconById, type IconType } from "./icons";

  interface Props {
    name: string;
    type?: IconType;
    size?: number;
  }

  let { name, type = "normal", size = 24 }: Props = $props();

  const variant = $derived(getIconById(name)?.variants[type]);
</script>

{#if variant}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox={variant.viewBox}>{@html variant.markup}</svg>
{/if}
