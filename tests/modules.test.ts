import { describe, expect, test } from "bun:test";
import { moduleEnabled, moduleForPath, modules } from "../src/lib/modules";

describe("module visibility", () => {
  test("turning a module off hides it", () => { expect(moduleEnabled({ clients: false }, "clients")).toBe(false); });
  test("turning a module on restores it", () => { expect(moduleEnabled({ clients: true }, "clients")).toBe(true); });
  test("settings remains accessible when other modules are off", () => { expect(moduleEnabled(Object.fromEntries(modules.map(m => [m.key, false])), "settings")).toBe(true); });
  test("nested employee pages use the employee visibility rule", () => { expect(moduleForPath("/employees/123/details")).toBe("employees"); });
  test("SMS broadcasting has its own visibility control", () => { expect(moduleEnabled({ sms: false, announcements: true }, "sms")).toBe(false); expect(moduleEnabled({ sms: false, announcements: true }, "announcements")).toBe(true); });
});