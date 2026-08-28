function hash(n: number): number {
  let h = (n * 374761393) ^ ((n >> 13) * 1274126177)
  h = (h ^ (h >> 15)) >>> 0
  return h
}

export function waveBars(seed: number, count = 24): number[] {
  let s = hash(seed)
  const out: number[] = []
  for (let i = 0; i < count; i++) {
    s = hash(s + i + 1)
    out.push(0.16 + ((s % 100) / 100) * 0.84)
  }
  return out
}