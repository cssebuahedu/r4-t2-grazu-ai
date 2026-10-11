import { describe, expect, it } from "vitest";
import { filterUseCases, useUseCases } from "@/lib/use-cases";
import { renderHook } from "@testing-library/react";
describe("use case filters", () => {
  const list = renderHook(() => useUseCases()).result.current;
  it("has 8 mock use cases", () => expect(list).toHaveLength(8));
  it("searches by organization", () => expect(filterUseCases(list, "bank", "", "", "").map((u) => u.id)).toEqual(["UC-002"]));
  it("filters by risk and sector", () => expect(filterUseCases(list, "", "Kesehatan", "Tinggi", "").map((u) => u.id)).toEqual(["UC-003"]));
});
