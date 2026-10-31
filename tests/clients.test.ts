import { describe, it, expect } from "bun:test";
import {
  clientSchema,
  emptyClient,
  membershipPlans,
  workingHours,
  normalizePhone,
  toClientPayload,
} from "../src/lib/clients";
const valid = {
  ...emptyClient(),
  full_name: "Test Client",
  phone: "0700000001",
  email: "test@example.com",
  residential_address: "Test address",
  company_name: "Test company",
  industry: "Services",
  membership_plans: ["Daily"],
  working_hours: ["Morning"],
  emergency_name: "Test Contact",
  emergency_relationship: "Colleague",
  emergency_phone: "0700000002",
  signature: "Test Client",
};
const minimal = {
  full_name: "Test Client",
  phone: "0700000001",
  email: "test@example.com",
  privacy_agreed: true,
  signature_confirmed: true,
};
describe("Kazini biodata rules", () => {
  it("accepts the five document membership options", () => {
    expect(membershipPlans).toEqual([
      "Daily",
      "Weekly",
      "Monthly",
      "Dedicated Desk",
      "Meeting room",
    ]);
    for (const plan of membershipPlans)
      expect(
        clientSchema.safeParse({ ...valid, membership_plans: [plan] }).success,
      ).toBe(true);
    expect(
      clientSchema.safeParse({ ...valid, membership_plans: ["Annual"] })
        .success,
    ).toBe(false);
  });
  it("accepts the four document working hours", () => {
    expect(workingHours).toEqual([
      "Morning",
      "Afternoon",
      "Evening",
      "Flexible",
    ]);
    expect(
      clientSchema.safeParse({ ...valid, working_hours: ["Night"] }).success,
    ).toBe(false);
  });
  it("accepts a record carrying only name, phone and email", () => {
    const parsed = clientSchema.safeParse(minimal);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.residential_address).toBe("");
      expect(parsed.data.company_name).toBe("");
      expect(parsed.data.membership_plans).toEqual([]);
      expect(parsed.data.working_hours).toEqual([]);
      expect(parsed.data.emergency_name).toBe("");
      expect(parsed.data.emergency_phone).toBe("");
      expect(parsed.data.signature).toBe("");
    }
  });
  it("rejects a record missing name, phone or email", () => {
    expect(clientSchema.safeParse({ ...minimal, full_name: "" }).success).toBe(
      false,
    );
    expect(clientSchema.safeParse({ ...minimal, phone: "" }).success).toBe(
      false,
    );
    expect(clientSchema.safeParse({ ...minimal, email: "" }).success).toBe(
      false,
    );
    expect(
      clientSchema.safeParse({
        ...minimal,
        phone: "0700000001",
        email: "test@example.com",
      }).success,
    ).toBe(true);
  });
  it("accepts blank membership plans and working hours", () => {
    expect(
      clientSchema.safeParse({
        ...valid,
        membership_plans: [],
        working_hours: [],
      }).success,
    ).toBe(true);
  });
  it("normalizes Kenyan contact numbers", () => {
    expect(normalizePhone("0700 000 001")).toBe("+254700000001");
    expect(normalizePhone("254700000001")).toBe("+254700000001");
    expect(
      clientSchema.safeParse({ ...valid, phone: "not-a-phone" }).success,
    ).toBe(false);
  });
  it("requires privacy and signature acknowledgements", () => {
    expect(
      clientSchema.safeParse({ ...minimal, privacy_agreed: false }).success,
    ).toBe(false);
    expect(
      clientSchema.safeParse({ ...minimal, signature_confirmed: false }).success,
    ).toBe(false);
  });
  it("accepts a blank emergency contact but rejects an invalid emergency phone", () => {
    expect(
      clientSchema.safeParse({
        ...valid,
        emergency_name: "",
        emergency_relationship: "",
        emergency_phone: "",
      }).success,
    ).toBe(true);
    expect(
      clientSchema.safeParse({ ...valid, emergency_phone: "abc" }).success,
    ).toBe(false);
  });
  it("rejects invalid dates but accepts a cleared date", () => {
    expect(
      clientSchema.safeParse({ ...valid, coworking_date: "2026-02-30" })
        .success,
    ).toBe(false);
    expect(
      clientSchema.safeParse({ ...valid, coworking_date: "" }).success,
    ).toBe(true);
  });
  it("drops cleared dates from the stored payload", () => {
    const parsed = clientSchema.parse({
      ...valid,
      coworking_date: "",
      signature_date: "",
    });
    const payload = toClientPayload(parsed);
    expect("coworking_date" in payload).toBe(false);
    expect("signature_date" in payload).toBe(false);
    expect(payload.full_name).toBe("Test Client");
  });
  it("accepts a complete record while rejecting invalid email and unsafe website schemes", () => {
    expect(clientSchema.safeParse(valid).success).toBe(true);
    expect(clientSchema.safeParse({ ...valid, email: "broken" }).success).toBe(
      false,
    );
    expect(
      clientSchema.safeParse({ ...valid, website: "javascript:alert(1)" })
        .success,
    ).toBe(false);
  });
});
