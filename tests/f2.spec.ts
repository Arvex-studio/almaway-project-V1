import { test, expect } from "@playwright/test";
test.beforeEach(({}, info) => test.skip(info.project.name === "missing-key"));
test("search finds real catalogue places, no-result and clear recover", async ({
  page,
}) => {
  await page.goto("/explore");
  await page.getByRole("searchbox", { name: "Найти место" }).fill("  МЕДЕО  ");
  await expect(
    page.getByRole("heading", { name: "Медео", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Большое Алматинское озеро",
      exact: true,
    }),
  ).toHaveCount(0);
  await page.getByRole("searchbox").fill("несуществующее");
  await expect(page.getByText("Место не найдено")).toBeVisible();
  await page.getByRole("button", { name: "Очистить поиск" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Большое Алматинское озеро",
      exact: true,
    }),
  ).toBeVisible();
});
test("mobile first screen exposes place identity and save without scroll", async ({
  page,
}) => {
  await page.goto("/explore");
  const title = page.getByRole("heading", {
    name: "Большое Алматинское озеро",
    exact: true,
  });
  const box = await title.boundingBox();
  expect(box!.y + box!.height).toBeLessThan(750);
  await expect(
    page.getByRole("navigation").getByRole("link", { name: "Журнал" }),
  ).toBeVisible();
});
test("journal demo reactions, comment and draft stay local across navigation", async ({
  page,
}) => {
  await page.goto("/journal");
  await expect(page.getByText("Демо-журнал", { exact: true })).toBeVisible();
  const like = page.getByRole("button", { name: "Нравится", exact: true });
  await like.click();
  await expect(like).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Комментарии", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Комментарий" })
    .fill("Хочу сохранить это место");
  await page.getByRole("button", { name: "Добавить комментарий" }).click();
  await expect(page.getByText("Хочу сохранить это место")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Создать запись" }).click();
  await expect(
    page.getByRole("button", { name: "Сохранить черновик" }),
  ).toBeDisabled();
  await page
    .getByRole("textbox", { name: "Заметка" })
    .fill("Мой первый план поездки");
  await page.getByRole("button", { name: "Сохранить черновик" }).click();
  await expect(page.getByText("Мой первый план поездки")).toBeVisible();
  await expect(
    page.getByText("Черновик · только в этой вкладке"),
  ).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Профиль" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Твой путь начинается здесь" }),
  ).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Журнал" })
    .click();
  await expect(page.getByText("Мой первый план поездки")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Нравится", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});
test("journal reactions are above mobile navigation without scrolling", async ({
  page,
}) => {
  await page.goto("/journal");
  const action = await page
    .getByRole("button", { name: "Нравится", exact: true })
    .boundingBox();
  const nav = await page.getByRole("navigation").boundingBox();
  expect(action!.y + action!.height).toBeLessThan(nav!.y);
});
test("saved places can be removed directly", async ({ page }) => {
  await page.goto("/saved");
  await page
    .getByRole("button", {
      name: "Убрать из сохранённого: Большое Алматинское озеро",
    })
    .click();
  await expect(page.getByText("Здесь появятся места")).toBeVisible();
});
test("composer guards invalid file and preserves text when cancelling discard", async ({
  page,
}) => {
  await page.goto("/journal");
  await page.getByRole("button", { name: "Создать запись" }).click();
  await page.getByLabel(/Твоя фотография/).setInputFiles({
    name: "bad.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from("<svg/>"),
  });
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "до 8 МБ",
  );
  await page
    .getByLabel("Заметка", { exact: true })
    .fill("Незаконченная запись");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("heading", { name: "Закрыть без сохранения?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Продолжить запись" }).click();
  await expect(page.getByLabel("Заметка", { exact: true })).toHaveValue(
    "Незаконченная запись",
  );
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Удалить изменения" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Создать запись" }),
  ).toBeFocused();
});

test("saved card actions fit inside their card at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/saved");
  const card = page.getByRole("article").first();
  const box = (await card.boundingBox())!;
  for (const control of await card.locator("a,button,.saved-image").all()) {
    const item = (await control.boundingBox())!;
    expect(item.x + item.width).toBeLessThanOrEqual(box.x + box.width);
  }
  await card.getByRole("link", { name: "На карте" }).click();
  await expect(page).toHaveURL(/place=bolshoe-almatinskoe-ozero/);
});
test("invalid first photo can recover to a text-only draft", async ({
  page,
}) => {
  await page.goto("/journal");
  await page.getByRole("button", { name: "Создать запись" }).click();
  await page
    .getByLabel(/Твоя фотография/)
    .setInputFiles({
      name: "bad.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from("<svg/>"),
    });
  await page
    .getByLabel("Заметка", { exact: true })
    .fill("Текст без фотографии");
  await page.getByRole("button", { name: "Продолжить без фото" }).click();
  await page.getByRole("button", { name: "Сохранить черновик" }).click();
  await expect(
    page.getByText("Текст без фотографии", { exact: true }),
  ).toBeVisible();
});
test("removed photo can be selected again and saved without upload", async ({
  page,
}) => {
  const uploads: string[] = [];
  page.on("request", (r) => {
    if (r.method() === "POST") uploads.push(r.url());
  });
  await page.goto("/journal");
  await page.getByRole("button", { name: "Создать запись" }).click();
  const input = page.getByLabel(/Твоя фотография/);
  await input.setInputFiles("public/images/bao.webp");
  await expect(
    page.getByAltText("Предпросмотр выбранной фотографии"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Убрать фото" }).click();
  await input.setInputFiles("public/images/bao.webp");
  await expect(
    page.getByAltText("Предпросмотр выбранной фотографии"),
  ).toBeVisible();
  await page
    .getByLabel("Заметка", { exact: true })
    .fill("Фото в моём черновике");
  await page.getByRole("button", { name: "Сохранить черновик" }).click();
  await expect(
    page.getByAltText("Фотография из твоего черновика"),
  ).toBeVisible();
  expect(uploads).toEqual([]);
});
test("global Journal navigation resets a place-specific feed", async ({
  page,
}) => {
  await page.goto("/journal?place=medeo");
  await expect(page.getByText("Место: Медео")).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Журнал" })
    .click();
  await expect(page).toHaveURL(/\/journal$/);
  await expect(
    page.getByRole("heading", { name: /Тишина между/ }),
  ).toBeVisible();
  await expect(page.getByText("Место: Медео")).toHaveCount(0);
});
